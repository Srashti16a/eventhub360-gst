const pool = require('./db');
const CampaignService = require('../models/CampaignService');
const CommunicationService = require('../models/CommunicationService');

async function runTest() {
    const context = {
        companyId: 1,
        branchId: null,
        userId: 999
    };

    console.log("=== STARTING INTEGRATION TEST ===");

    try {
        // 0. Seed test events and guests
        console.log("0. Seeding event and guests...");
        await pool.query("DELETE FROM event_guest");
        await pool.query("DELETE FROM guest");
        await pool.query("DELETE FROM events");
        
        const eventRes = await pool.query(`
            INSERT INTO events (event_id, event_name, venue, event_date)
            VALUES (1, 'Tech Summit 2026', 'Silicon Hall', '2026-06-30')
            RETURNING event_id;
        `);
        const eventId = eventRes.rows[0].event_id;

        const g1 = await pool.query(`
            INSERT INTO guest (company_id, name, email, phone, category, company, job_title)
            VALUES (1, 'Alice Smith', 'alice@company.com', '+15550101', 'VIP', 'Alpha Corp', 'CEO')
            RETURNING guest_id;
        `);
        const g2 = await pool.query(`
            INSERT INTO guest (company_id, name, email, phone, category, company, job_title)
            VALUES (1, 'Bob Jones', 'bob@company.com', '+15550102', 'Attendee', 'Beta LLC', 'Developer')
            RETURNING guest_id;
        `);
        
        await pool.query("INSERT INTO event_guest (event_id, guest_id) VALUES (1, $1), (1, $2)", [g1.rows[0].guest_id, g2.rows[0].guest_id]);
        console.log("Seeded event and 2 guests.");

        // 1. Create Template
        console.log("\n1. Creating Template...");
        const template = await CommunicationService.createTemplate({
            name: "VIP Welcome Email",
            channel: "Email",
            subject: "Welcome {{guest_name}} to Tech Summit!",
            content: "Hello {{guest_name}}, we are excited to have you join us at {{company}}.",
            variables: ["guest_name", "company"]
        }, context);
        console.log("Created Template:", template.name, "ID:", template.id);

        // 2. Create Audience Segment
        console.log("\n2. Creating Audience Segment...");
        const segment = await CommunicationService.createSegment({
            name: "VIP Guests Segment",
            description: "Filter VIP Category",
            rules: {
                category: "VIP"
            }
        }, context);
        console.log("Created Segment:", segment.name, "ID:", segment.id);

        // 3. Verify Segment Resolution
        console.log("\n3. Resolving Segment Members...");
        const members = await CommunicationService.getSegmentMembers(segment.id, context);
        console.log("Current cached members:", members.length);
        
        const resolvedMembers = await CommunicationService.resolveAndCacheSegmentMembers(segment.id, context);
        console.log("Resolved members count:", resolvedMembers.length);
        console.log("Resolved Guest Name:", resolvedMembers[0].guest_name, "Category:", resolvedMembers[0].guest_category);

        // 4. Create Campaign
        console.log("\n4. Creating Campaign...");
        const campaign = await CampaignService.createCampaign({
            event_id: eventId,
            name: "VIP Welcome Blast",
            channel: "Email",
            template_id: template.id,
            segment_id: segment.id
        }, context);
        console.log("Created Campaign:", campaign.name, "Status:", campaign.status, "ID:", campaign.id);

        // 5. Publish Campaign (Immediate dispatch)
        console.log("\n5. Publishing Campaign...");
        const publishedCampaign = await CampaignService.publishCampaign(campaign.id, context);
        console.log("Campaign Published. Status:", publishedCampaign.status);

        // 6. Check Campaign Recipients and Notification Queue
        console.log("\n6. Checking Recipients & Notification Queue...");
        const recipients = await CampaignService.listCampaignRecipients(campaign.id, { page: 1, limit: 10 }, context);
        console.log("Recipients found:", recipients.data.length);
        
        const queueRes = await pool.query("SELECT * FROM notification_queues WHERE campaign_id = $1", [campaign.id]);
        console.log("Queue size:", queueRes.rows.length);
        if (queueRes.rows.length > 0) {
            console.log("Queue Subject:", queueRes.rows[0].subject);
            console.log("Queue Body:", queueRes.rows[0].body);
        }

        // 7. Process Notification Queue
        console.log("\n7. Processing Notification Queue...");
        const processResult = await CampaignService.processNotificationQueue(10);
        console.log("Processed notifications:", processResult.count);

        // 8. Track Interaction (Open / Click Webhook simulation)
        console.log("\n8. Simulating Recipient Interaction webhook...");
        const rec = recipients.data[0];
        const updatedRec = await CampaignService.trackInteraction(rec.id, 'Opened', context);
        console.log("Interaction updated delivery status:", updatedRec.delivery_status, "Opened At:", updatedRec.opened_at);

        // 9. Fetch Campaign Analytics Summary
        console.log("\n9. Fetching Campaign Analytics...");
        const analytics = await CampaignService.getCampaignAnalytics(campaign.id, context);
        console.log("Analytics summary - Total:", analytics.total_recipients_count, "Sent:", analytics.sent_count, "Delivered:", analytics.delivered_count, "Opened:", analytics.opened_count, "Open Rate:", analytics.open_rate + "%");

        // 10. Check Opt-Out logic
        console.log("\n10. Testing Opt-Out preference...");
        await CommunicationService.saveOptOut({
            guest_id: g1.rows[0].guest_id,
            channel: "Email",
            opt_out: true
        }, context);
        const isOptedOut = await CommunicationService.checkOptOut(g1.rows[0].guest_id, "Email", context);
        console.log("Guest ID", g1.rows[0].guest_id, "Email opt out status:", isOptedOut);

        console.log("\n=== INTEGRATION TEST COMPLETED SUCCESSFULLY ===");
    } catch (err) {
        console.error("Integration test failed with error:", err);
    } finally {
        await pool.end();
    }
}

runTest();
