/**
 * Communication Data Transfer Objects (DTOs)
 */

class CommunicationTemplateResponseDTO {
    constructor(temp) {
        if (!temp) return;
        this.id = temp.id;
        this.company_id = temp.company_id;
        this.branch_id = temp.branch_id;
        this.name = temp.name;
        this.channel = temp.channel;
        this.subject = temp.subject;
        this.content = temp.content;
        this.variables = temp.variables;
        this.is_active = temp.is_active;
        this.created_at = temp.created_at ? temp.created_at.toISOString() : null;
    }
}

class AudienceSegmentResponseDTO {
    constructor(seg) {
        if (!seg) return;
        this.id = seg.id;
        this.company_id = seg.company_id;
        this.name = seg.name;
        this.description = seg.description;
        this.rules = seg.rules;
        this.created_at = seg.created_at ? seg.created_at.toISOString() : null;
    }
}

class SegmentMemberResponseDTO {
    constructor(mem) {
        if (!mem) return;
        this.id = mem.id;
        this.segment_id = mem.segment_id;
        this.guest_id = mem.guest_id;
        this.created_at = mem.created_at ? mem.created_at.toISOString() : null;

        // Joined details
        this.guest_name = mem.guest_name || null;
        this.guest_email = mem.guest_email || null;
        this.guest_phone = mem.guest_phone || null;
        this.guest_category = mem.guest_category || 'Attendee';
    }
}

class CommunicationLogResponseDTO {
    constructor(log) {
        if (!log) return;
        this.id = log.id;
        this.company_id = log.company_id;
        this.campaign_id = log.campaign_id;
        this.guest_id = log.guest_id;
        this.channel = log.channel;
        this.recipient_address = log.recipient_address;
        this.status = log.status;
        this.sent_at = log.sent_at ? log.sent_at.toISOString() : null;

        // Joined details
        this.campaign_name = log.campaign_name || null;
        this.guest_name = log.guest_name || null;
    }
}

class ChannelPerformanceAnalyticsDTO {
    constructor(perf) {
        if (!perf) return;
        this.id = perf.id;
        this.channel = perf.channel;
        this.total_sent = perf.total_sent;
        this.total_delivered = perf.total_delivered;
        this.total_opened = perf.total_opened;
        this.total_clicked = perf.total_clicked;
        this.total_failed = perf.total_failed;
        this.updated_at = perf.updated_at ? perf.updated_at.toISOString() : null;

        // Rate calculations
        const sent = perf.total_sent || 1; // avoid division by zero
        this.delivery_rate = Number(((perf.total_delivered / sent) * 100).toFixed(2));
        this.bounce_rate = Number(((perf.total_failed / sent) * 100).toFixed(2));
        this.open_rate = Number(((perf.total_opened / sent) * 100).toFixed(2));
        this.click_rate = Number(((perf.total_clicked / sent) * 100).toFixed(2));
    }
}

class OptOutPreferenceResponseDTO {
    constructor(opt) {
        if (!opt) return;
        this.id = opt.id;
        this.company_id = opt.company_id;
        this.guest_id = opt.guest_id;
        this.channel = opt.channel;
        this.opt_out = opt.opt_out;
        this.updated_at = opt.updated_at ? opt.updated_at.toISOString() : null;

        // Joined details
        this.guest_name = opt.guest_name || null;
        this.guest_email = opt.guest_email || null;
    }
}

module.exports = {
    CommunicationTemplateResponseDTO,
    AudienceSegmentResponseDTO,
    SegmentMemberResponseDTO,
    CommunicationLogResponseDTO,
    ChannelPerformanceAnalyticsDTO,
    OptOutPreferenceResponseDTO
};
