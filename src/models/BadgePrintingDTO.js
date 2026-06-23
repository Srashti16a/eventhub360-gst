/**
 * Badge Printing Data Transfer Objects (DTOs)
 */

class BadgePrinterResponseDTO {
    constructor(printer) {
        if (!printer) return;
        this.id = printer.id;
        this.printer_name = printer.printer_name;
        this.printer_code = printer.printer_code;
        this.location = printer.location;
        this.status = printer.status;
        this.paper_status = printer.paper_status;
        this.last_seen = printer.last_seen ? printer.last_seen.toISOString() : null;
        this.created_at = printer.created_at ? printer.created_at.toISOString() : null;
    }
}

class BadgeTemplateResponseDTO {
    constructor(template) {
        if (!template) return;
        this.id = template.id;
        this.event_id = template.event_id;
        this.template_name = template.template_name;
        this.orientation = template.orientation;
        this.card_size = template.card_size;
        this.include_qr = template.include_qr;
        this.include_logo = template.include_logo;
        this.show_job_title = template.show_job_title;
        this.center_alignment = template.center_alignment;
        this.created_at = template.created_at ? template.created_at.toISOString() : null;
    }
}

class BadgePrintJobResponseDTO {
    constructor(job) {
        if (!job) return;
        this.id = job.id;
        this.guest_id = job.guest_id;
        this.template_id = job.template_id;
        this.printer_id = job.printer_id;
        this.job_status = job.job_status;
        this.priority = job.priority;
        this.requested_at = job.requested_at ? job.requested_at.toISOString() : null;
        this.completed_at = job.completed_at ? job.completed_at.toISOString() : null;
        
        // Joined details
        this.guest_name = job.guest_name || null;
        this.guest_email = job.guest_email || null;
        this.guest_role = job.guest_role || 'Guest';
        this.printer_name = job.printer_name || null;
        this.template_name = job.template_name || null;
        this.queue_position = job.queue_position || null;
    }
}

class PrintQueueResponseDTO {
    constructor(queueItem) {
        if (!queueItem) return;
        this.id = queueItem.id;
        this.print_job_id = queueItem.print_job_id;
        this.queue_position = queueItem.queue_position;
        this.status = queueItem.status;
        this.created_at = queueItem.created_at ? queueItem.created_at.toISOString() : null;

        // Nested or flat job details if loaded
        if (queueItem.job) {
            this.job = new BadgePrintJobResponseDTO(queueItem.job);
        }
    }
}

class PrinterAlertResponseDTO {
    constructor(alert) {
        if (!alert) return;
        this.id = alert.id;
        this.printer_id = alert.printer_id;
        this.alert_type = alert.alert_type;
        this.severity = alert.severity;
        this.message = alert.message;
        this.status = alert.status;
        this.created_at = alert.created_at ? alert.created_at.toISOString() : null;
        this.printer_name = alert.printer_name || null;
    }
}

class BadgePrintLogResponseDTO {
    constructor(log) {
        if (!log) return;
        this.id = log.id;
        this.print_job_id = log.print_job_id;
        this.printer_id = log.printer_id;
        this.action = log.action;
        this.performed_by = log.performed_by;
        this.created_at = log.created_at ? log.created_at.toISOString() : null;
        this.printer_name = log.printer_name || null;
        this.guest_name = log.guest_name || null;
    }
}

class BadgeConfigurationResponseDTO {
    constructor(config) {
        if (!config) return;
        this.id = config.id;
        this.event_id = config.event_id;
        this.default_template_id = config.default_template_id;
        this.auto_generate_qr = config.auto_generate_qr;
        this.auto_print_on_checkin = config.auto_print_on_checkin;
        this.created_at = config.created_at ? config.created_at.toISOString() : null;
    }
}

class BadgeBatchResponseDTO {
    constructor(batch) {
        if (!batch) return;
        this.id = batch.id;
        this.event_id = batch.event_id;
        this.batch_name = batch.batch_name;
        this.total_badges = batch.total_badges;
        this.generated_count = batch.generated_count;
        this.status = batch.status;
        this.created_at = batch.created_at ? batch.created_at.toISOString() : null;
    }
}

class PrintPreviewResponseDTO {
    constructor({ guest, template, qrPass, renderingData }) {
        this.template = template ? new BadgeTemplateResponseDTO(template) : null;
        this.badge_data = {
            guest_id: guest ? guest.guest_id : null,
            name: guest ? guest.name : 'Sample Guest',
            company: guest ? guest.company || guest.organization || 'Global Hospitality Group' : 'Global Hospitality Group',
            role: guest ? guest.role || guest.guest_type || 'VIP' : 'VIP',
            job_title: guest ? guest.job_title || 'Hospitality Director' : 'Hospitality Director',
            qr_code_enabled: template ? template.include_qr : true,
            qr_code_value: qrPass ? qrPass.pass_code : 'SAMPLE-QR-123456',
            logo_enabled: template ? template.include_logo : true,
            center_aligned: template ? template.center_alignment : true,
            orientation: template ? template.orientation : 'Portrait',
            card_size: template ? template.card_size : '4x6'
        };
        this.rendering = renderingData || {
            width_px: template && template.orientation === 'Landscape' ? 600 : 400,
            height_px: template && template.orientation === 'Landscape' ? 400 : 600,
            font_family: 'Outfit, Inter, sans-serif',
            primary_color: '#8A2525' // Custom theme matching the preview
        };
    }
}

module.exports = {
    BadgePrinterResponseDTO,
    BadgeTemplateResponseDTO,
    BadgePrintJobResponseDTO,
    PrintQueueResponseDTO,
    PrinterAlertResponseDTO,
    BadgePrintLogResponseDTO,
    BadgeConfigurationResponseDTO,
    BadgeBatchResponseDTO,
    PrintPreviewResponseDTO
};
