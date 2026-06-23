const pool = require('../config/db');
const CommunicationRepository = require('./CommunicationRepository');
const {
    CommunicationTemplateResponseDTO,
    AudienceSegmentResponseDTO,
    SegmentMemberResponseDTO,
    CommunicationLogResponseDTO,
    ChannelPerformanceAnalyticsDTO,
    OptOutPreferenceResponseDTO
} = require('./CommunicationDTO');

class CommunicationService {
    // ==========================================
    // 1. Templates
    // ==========================================
    async createTemplate(data, context) {
        const template = await CommunicationRepository.createTemplate({
            ...data,
            company_id: context.companyId,
            branch_id: context.branchId
        });
        return new CommunicationTemplateResponseDTO(template);
    }

    async updateTemplate(id, data, context) {
        const template = await CommunicationRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Communication template not found');
            error.status = 404;
            throw error;
        }
        const updated = await CommunicationRepository.updateTemplate(id, context.companyId, data);
        return new CommunicationTemplateResponseDTO(updated);
    }

    async listTemplates(queryParams, context) {
        const templates = await CommunicationRepository.findAllTemplates(context.companyId, {
            channel: queryParams.channel
        });
        return templates.map(t => new CommunicationTemplateResponseDTO(t));
    }

    async getTemplateById(id, context) {
        const template = await CommunicationRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Communication template not found');
            error.status = 404;
            throw error;
        }
        return new CommunicationTemplateResponseDTO(template);
    }

    async deleteTemplate(id, context) {
        const template = await CommunicationRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Communication template not found');
            error.status = 404;
            throw error;
        }
        return await CommunicationRepository.deleteTemplate(id, context.companyId);
    }

    // ==========================================
    // 2. Audience Segments
    // ==========================================
    async createSegment(data, context) {
        const segment = await CommunicationRepository.createSegment({
            ...data,
            company_id: context.companyId
        });
        // Auto resolve and cache the segment members upon creation
        await this.resolveAndCacheSegmentMembers(segment.id, context);
        return new AudienceSegmentResponseDTO(segment);
    }

    async getSegmentById(id, context) {
        const segment = await CommunicationRepository.findSegmentById(id, context.companyId);
        if (!segment) {
            const error = new Error('Audience segment not found');
            error.status = 404;
            throw error;
        }
        return new AudienceSegmentResponseDTO(segment);
    }

    async listSegments(context) {
        const segments = await CommunicationRepository.findAllSegments(context.companyId);
        return segments.map(s => new AudienceSegmentResponseDTO(s));
    }

    async deleteSegment(id, context) {
        const segment = await CommunicationRepository.findSegmentById(id, context.companyId);
        if (!segment) {
            const error = new Error('Audience segment not found');
            error.status = 404;
            throw error;
        }
        return await CommunicationRepository.deleteSegment(id, context.companyId);
    }

    async getSegmentMembers(segmentId, context) {
        const segment = await CommunicationRepository.findSegmentById(segmentId, context.companyId);
        if (!segment) {
            const error = new Error('Audience segment not found');
            error.status = 404;
            throw error;
        }
        const members = await CommunicationRepository.getSegmentMembers(segmentId);
        return members.map(m => new SegmentMemberResponseDTO(m));
    }

    async resolveAndCacheSegmentMembers(segmentId, context) {
        const segment = await CommunicationRepository.findSegmentById(segmentId, context.companyId);
        if (!segment) {
            const error = new Error('Audience segment not found');
            error.status = 404;
            throw error;
        }

        // Dynamically resolve guests by segment rules criteria
        const guests = await CommunicationRepository.resolveGuestsBySegmentCriteria(context.companyId, segment.rules);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Clear existing segment cache members
            await CommunicationRepository.clearSegmentMembers(segmentId, client);

            // Populate newly resolved segment members
            for (const guest of guests) {
                await CommunicationRepository.addSegmentMember(segmentId, guest.guest_id, client);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        const updatedMembers = await CommunicationRepository.getSegmentMembers(segmentId);
        return updatedMembers.map(m => new SegmentMemberResponseDTO(m));
    }

    // ==========================================
    // 3. Opt Out Preferences
    // ==========================================
    async saveOptOut(data, context) {
        const optOut = await CommunicationRepository.saveOptOutPreference({
            ...data,
            company_id: context.companyId
        });
        return new OptOutPreferenceResponseDTO(optOut);
    }

    async checkOptOut(guestId, channel, context) {
        return await CommunicationRepository.checkOptOut(context.companyId, guestId, channel);
    }

    // ==========================================
    // 4. Communication Logs
    // ==========================================
    async getCommunicationLogs(queryParams, context) {
        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const channel = queryParams.channel;
        const status = queryParams.status;

        const [logs, total] = await Promise.all([
            CommunicationRepository.getLogs(context.companyId, { page, limit, channel, status }),
            CommunicationRepository.countLogs(context.companyId, { channel, status })
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: logs.map(l => new CommunicationLogResponseDTO(l))
        };
    }

    // ==========================================
    // 5. Channel Performance Analytics & Health
    // ==========================================
    async getChannelAnalytics(context) {
        const list = await CommunicationRepository.getChannelAnalyticsList(context.companyId);
        return list.map(a => new ChannelPerformanceAnalyticsDTO(a));
    }

    async getChannelHealthCheck(context) {
        const list = await CommunicationRepository.getChannelAnalyticsList(context.companyId);
        
        // Define default metrics if no records exist yet for Email/WhatsApp/SMS channels
        const channels = ['Email', 'WhatsApp', 'SMS'];
        const results = [];

        for (const channel of channels) {
            const found = list.find(a => a.channel === channel);
            if (found) {
                results.push(new ChannelPerformanceAnalyticsDTO(found));
            } else {
                results.push(new ChannelPerformanceAnalyticsDTO({
                    company_id: context.companyId,
                    channel: channel,
                    total_sent: 0,
                    total_delivered: 0,
                    total_opened: 0,
                    total_clicked: 0,
                    total_failed: 0
                }));
            }
        }
        return results;
    }
}

module.exports = new CommunicationService();
