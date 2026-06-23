/**
 * Campaign Data Transfer Objects (DTOs)
 */

class CampaignResponseDTO {
    constructor(campaign) {
        if (!campaign) return;
        this.id = campaign.id;
        this.company_id = campaign.company_id;
        this.branch_id = campaign.branch_id;
        this.event_id = campaign.event_id;
        this.name = campaign.name;
        this.channel = campaign.channel;
        this.template_id = campaign.template_id;
        this.segment_id = campaign.segment_id;
        this.status = campaign.status;
        this.created_at = campaign.created_at ? campaign.created_at.toISOString() : null;
        this.updated_at = campaign.updated_at ? campaign.updated_at.toISOString() : null;

        // Joined properties
        this.event_name = campaign.event_name || null;
        this.template_name = campaign.template_name || null;
        this.segment_name = campaign.segment_name || null;
    }
}

class CampaignRecipientResponseDTO {
    constructor(rec) {
        if (!rec) return;
        this.id = rec.id;
        this.campaign_id = rec.campaign_id;
        this.guest_id = rec.guest_id;
        this.delivery_status = rec.delivery_status;
        this.error_message = rec.error_message;
        this.sent_at = rec.sent_at ? rec.sent_at.toISOString() : null;
        this.opened_at = rec.opened_at ? rec.opened_at.toISOString() : null;
        this.clicked_at = rec.clicked_at ? rec.clicked_at.toISOString() : null;

        // Joined details
        this.guest_name = rec.guest_name || null;
        this.guest_email = rec.guest_email || null;
        this.guest_phone = rec.guest_phone || null;
    }
}

class BroadcastScheduleResponseDTO {
    constructor(sch) {
        if (!sch) return;
        this.id = sch.id;
        this.campaign_id = sch.campaign_id;
        this.scheduled_time = sch.scheduled_time ? sch.scheduled_time.toISOString() : null;
        this.status = sch.status;
        this.created_at = sch.created_at ? sch.created_at.toISOString() : null;

        // Joined details
        this.campaign_name = sch.campaign_name || null;
        this.channel = sch.channel || null;
    }
}

class CampaignAnalyticsSummaryDTO {
    constructor({ campaign_id, channel, total_recipients, sent, delivered, opened, clicked, failed, bounce_rate, open_rate, click_rate }) {
        this.campaign_id = campaign_id;
        this.channel = channel;
        this.total_recipients_count = total_recipients || 0;
        this.sent_count = sent || 0;
        this.delivered_count = delivered || 0;
        this.opened_count = opened || 0;
        this.clicked_count = clicked || 0;
        this.failed_count = failed || 0;

        // Rate calculations (float values/percentages formatted)
        this.bounce_rate = bounce_rate !== undefined ? Number(bounce_rate) : 0.0;
        this.open_rate = open_rate !== undefined ? Number(open_rate) : 0.0;
        this.click_rate = click_rate !== undefined ? Number(click_rate) : 0.0;
    }
}

module.exports = {
    CampaignResponseDTO,
    CampaignRecipientResponseDTO,
    BroadcastScheduleResponseDTO,
    CampaignAnalyticsSummaryDTO
};
