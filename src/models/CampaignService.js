const pool = require('../config/db');
const CampaignRepository = require('./CampaignRepository');
const CommunicationRepository = require('./CommunicationRepository');
const CommunicationService = require('./CommunicationService');
const {
    CampaignResponseDTO,
    CampaignRecipientResponseDTO,
    BroadcastScheduleResponseDTO,
    CampaignAnalyticsSummaryDTO
} = require('./CampaignDTO');

class CampaignService {
    // ==========================================
    // 1. Campaigns Management
    // ==========================================
    async createCampaign(data, context) {
        const campaign = await CampaignRepository.createCampaign({
            ...data,
            company_id: context.companyId,
            branch_id: context.branchId,
            status: 'Draft'
        });
        return new CampaignResponseDTO(campaign);
    }

    async updateCampaign(id, data, context) {
        const campaign = await CampaignRepository.findCampaignById(id, context.companyId);
        if (!campaign) {
            const error = new Error('Campaign not found');
            error.status = 404;
            throw error;
        }

        const updated = await CampaignRepository.updateCampaign(id, context.companyId, data);
        return new CampaignResponseDTO(updated);
    }

    async listCampaigns(queryParams, context) {
        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const search = queryParams.search;
        const channel = queryParams.channel;
        const status = queryParams.status;

        const [items, total] = await Promise.all([
            CampaignRepository.findAllCampaigns(context.companyId, { page, limit, search, channel, status }),
            CampaignRepository.countCampaigns(context.companyId, { search, channel, status })
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: items.map(item => new CampaignResponseDTO(item))
        };
    }

    async getCampaignById(id, context) {
        const campaign = await CampaignRepository.findCampaignById(id, context.companyId);
        if (!campaign) {
            const error = new Error('Campaign not found');
            error.status = 404;
            throw error;
        }
        return new CampaignResponseDTO(campaign);
    }

    // ==========================================
    // 2. Broadcast Scheduling & Publishing
    // ==========================================
    async scheduleCampaign(campaignId, data, context) {
        const campaign = await CampaignRepository.findCampaignById(campaignId, context.companyId);
        if (!campaign) {
            const error = new Error('Campaign not found');
            error.status = 404;
            throw error;
        }

        if (campaign.status !== 'Draft') {
            const error = new Error('Only Draft campaigns can be scheduled');
            error.status = 400;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update campaign status
            await CampaignRepository.updateCampaign(campaignId, context.companyId, { status: 'Scheduled' }, client);

            // Create broadcast schedule
            const schedule = await CampaignRepository.createSchedule({
                campaign_id: campaignId,
                scheduled_time: data.scheduled_time
            }, client);

            await client.query('COMMIT');
            return new BroadcastScheduleResponseDTO(schedule);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async publishCampaign(campaignId, context) {
        const campaign = await CampaignRepository.findCampaignById(campaignId, context.companyId);
        if (!campaign) {
            const error = new Error('Campaign not found');
            error.status = 404;
            throw error;
        }

        if (['Sending', 'Completed'].includes(campaign.status)) {
            const error = new Error('Campaign has already been executed');
            error.status = 400;
            throw error;
        }

        if (!campaign.template_id || !campaign.segment_id) {
            const error = new Error('Campaign requires both template and audience segment to be set before publishing');
            error.status = 400;
            throw error;
        }

        // Fetch template
        const template = await CommunicationRepository.findTemplateById(campaign.template_id, context.companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }

        // Fetch segment
        const segment = await CommunicationRepository.findSegmentById(campaign.segment_id, context.companyId);
        if (!segment) {
            const error = new Error('Audience segment not found');
            error.status = 404;
            throw error;
        }

        // Dynamically resolve target guests
        const guests = await CommunicationRepository.resolveGuestsBySegmentCriteria(context.companyId, segment.rules);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Clear and cache segment members in segment_members
            await CommunicationRepository.clearSegmentMembers(campaign.segment_id, client);
            for (const guest of guests) {
                await CommunicationRepository.addSegmentMember(campaign.segment_id, guest.guest_id, client);
            }

            // 2. Set campaign status to Sending
            await CampaignRepository.updateCampaign(campaignId, context.companyId, { status: 'Sending' }, client);

            // Helper to compile placeholders
            const compileText = (text, g) => {
                if (!text) return '';
                return text
                    .replace(/\{\{guest_name\}\}/g, g.name || '')
                    .replace(/\{\{company\}\}/g, g.company || '')
                    .replace(/\{\{job_title\}\}/g, g.job_title || '')
                    .replace(/\{\{email\}\}/g, g.email || '')
                    .replace(/\{\{phone\}\}/g, g.phone || '');
            };

            // 3. Process guests (enqueue notifications & create recipients)
            for (const guest of guests) {
                const isOptedOut = await CommunicationRepository.checkOptOut(context.companyId, guest.guest_id, campaign.channel);

                if (isOptedOut) {
                    // Record opted out failure immediately
                    const recipientQuery = `
                        INSERT INTO campaign_recipients (campaign_id, guest_id, delivery_status, error_message, sent_at)
                        VALUES ($1, $2, 'Failed', 'Guest opted out of this channel', NOW())
                        RETURNING *;
                    `;
                    await client.query(recipientQuery, [campaignId, guest.guest_id]);
                    
                    // Increment failed analytics
                    await CommunicationRepository.incrementChannelAnalytics(context.companyId, campaign.channel, 'total_failed', 1, client);
                } else {
                    // Create Campaign Recipient record in Pending
                    const recipient = await CampaignRepository.addCampaignRecipient({
                        campaign_id: campaignId,
                        guest_id: guest.guest_id
                    }, client);

                    const compiledSubject = template.subject ? compileText(template.subject, guest) : null;
                    const compiledBody = compileText(template.content, guest);
                    const recipientAddress = campaign.channel === 'Email' ? guest.email : guest.phone;

                    if (!recipientAddress) {
                        // Mark as failed if destination address is missing
                        await CampaignRepository.updateRecipientStatusById(recipient.id, 'Failed', 'Missing email or phone number address context', client);
                        await CommunicationRepository.incrementChannelAnalytics(context.companyId, campaign.channel, 'total_failed', 1, client);
                        continue;
                    }

                    // Enqueue to Notification Queue buffer
                    await CampaignRepository.enqueueNotification({
                        company_id: context.companyId,
                        campaign_id: campaignId,
                        guest_id: guest.guest_id,
                        channel: campaign.channel,
                        recipient_address: recipientAddress,
                        subject: compiledSubject,
                        body: compiledBody,
                        priority: 1
                    }, client);
                }
            }

            // Update campaign status to Completed after successful queue buffering
            const updatedCampaign = await CampaignRepository.updateCampaign(campaignId, context.companyId, { status: 'Completed' }, client);

            await client.query('COMMIT');
            return new CampaignResponseDTO(updatedCampaign);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==========================================
    // 3. Interactions & Webhooks
    // ==========================================
    async trackInteraction(recipientId, action, context) {
        const recipient = await CampaignRepository.findRecipientById(recipientId);
        if (!recipient) {
            const error = new Error('Recipient not found');
            error.status = 404;
            throw error;
        }

        const campaign = await CampaignRepository.findCampaignById(recipient.campaign_id, context.companyId);
        if (!campaign) {
            const error = new Error('Campaign context not matched for recipient');
            error.status = 404;
            throw error;
        }

        const updatedRecipient = await CampaignRepository.updateRecipientStatusById(recipientId, action);
        
        // Log interaction metric updates
        const analyticsMetric = action === 'Opened' ? 'total_opened' : 'total_clicked';
        await CommunicationRepository.incrementChannelAnalytics(context.companyId, campaign.channel, analyticsMetric);

        return new CampaignRecipientResponseDTO(updatedRecipient);
    }

    async listCampaignRecipients(campaignId, queryParams, context) {
        const campaign = await CampaignRepository.findCampaignById(campaignId, context.companyId);
        if (!campaign) {
            const error = new Error('Campaign not found');
            error.status = 404;
            throw error;
        }

        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);

        const [items, total] = await Promise.all([
            CampaignRepository.findAllRecipients(campaignId, { page, limit }),
            CampaignRepository.countRecipients(campaignId)
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: items.map(item => new CampaignRecipientResponseDTO(item))
        };
    }

    // ==========================================
    // 4. Analytics Summary
    // ==========================================
    async getCampaignAnalytics(campaignId, context) {
        const campaign = await CampaignRepository.findCampaignById(campaignId, context.companyId);
        if (!campaign) {
            const error = new Error('Campaign not found');
            error.status = 404;
            throw error;
        }

        const stats = await CampaignRepository.getCampaignDeliveryRates(campaignId);
        const total = stats.total || 0;
        
        const rates = {
            campaign_id: campaignId,
            channel: campaign.channel,
            total_recipients: total,
            sent: stats.sent || 0,
            delivered: stats.delivered || 0,
            opened: stats.opened || 0,
            clicked: stats.clicked || 0,
            failed: stats.failed || 0,
            bounce_rate: total > 0 ? Number(((stats.failed / total) * 100).toFixed(2)) : 0.0,
            open_rate: total > 0 ? Number(((stats.opened / total) * 100).toFixed(2)) : 0.0,
            click_rate: total > 0 ? Number(((stats.clicked / total) * 100).toFixed(2)) : 0.0
        };

        return new CampaignAnalyticsSummaryDTO(rates);
    }

    // ==========================================
    // 5. Background Process Handlers (Simulations)
    // ==========================================
    async processScheduledCampaigns() {
        const schedules = await CampaignRepository.getPendingSchedules();
        let executedCount = 0;

        for (const schedule of schedules) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                
                // Update schedule to Executed
                await CampaignRepository.updateScheduleStatus(schedule.id, 'Executed', client);

                // Build context for publishCampaign simulation
                const context = {
                    companyId: schedule.company_id || 1, // fallback multi-tenant context mapping
                    branch_id: null,
                    userId: 1
                };

                // Retrieve campaign details to assert existance
                const campaign = await CampaignRepository.findCampaignById(schedule.campaign_id, context.companyId);
                if (campaign && campaign.status === 'Scheduled') {
                    // Call the publication dispatch directly
                    await this.publishCampaign(schedule.campaign_id, context);
                    executedCount++;
                }

                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Scheduled broadcast execution error for campaign ID ${schedule.campaign_id}:`, err);
            } finally {
                client.release();
            }
        }

        return { count: executedCount, message: `Successfully executed ${executedCount} scheduled broadcast campaigns` };
    }

    async processNotificationQueue(limit = 10) {
        const client = await pool.connect();
        let processedCount = 0;
        try {
            const pendingList = await CampaignRepository.getPendingNotifications(limit, client);
            
            for (const item of pendingList) {
                const subClient = await pool.connect();
                try {
                    await subClient.query('BEGIN');

                    // Set notification status to completed
                    await CampaignRepository.updateNotificationStatus(item.id, 'Completed', subClient);

                    // If campaign_id context exists, update recipient status to Sent/Delivered
                    if (item.campaign_id) {
                        await CampaignRepository.updateRecipientStatus(item.campaign_id, item.guest_id, 'Delivered', null, subClient);
                        
                        // Increment sent and delivered counts in analytics table
                        await CommunicationRepository.incrementChannelAnalytics(item.company_id, item.channel, 'total_sent', 1, subClient);
                        await CommunicationRepository.incrementChannelAnalytics(item.company_id, item.channel, 'total_delivered', 1, subClient);
                    }

                    // Create permanent historical Communication Log record
                    await CommunicationRepository.createLog({
                        company_id: item.company_id,
                        campaign_id: item.campaign_id,
                        guest_id: item.guest_id,
                        channel: item.channel,
                        recipient_address: item.recipient_address,
                        status: 'Delivered'
                    }, subClient);

                    await subClient.query('COMMIT');
                    processedCount++;
                } catch (e) {
                    await subClient.query('ROLLBACK');
                    console.error(`Failed processing single enqueued notification ID ${item.id}:`, e);
                    
                    // Mark notification queue record as failed
                    await pool.query(`UPDATE notification_queues SET status = 'Failed' WHERE id = $1;`, [item.id]);
                    
                    if (item.campaign_id) {
                        await CampaignRepository.updateRecipientStatus(item.campaign_id, item.guest_id, 'Failed', e.message);
                        await CommunicationRepository.incrementChannelAnalytics(item.company_id, item.channel, 'total_failed', 1);
                    }
                } finally {
                    subClient.release();
                }
            }
        } catch (error) {
            console.error('Error fetching notification queue items:', error);
        } finally {
            client.release();
        }

        return { count: processedCount, message: `Processed ${processedCount} notification dispatches from queue` };
    }
}

module.exports = new CampaignService();
