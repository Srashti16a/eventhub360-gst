/**
 * Kiosk Registration Data Transfer Objects (DTOs)
 */

class KioskDeviceResponseDTO {
    constructor(device) {
        if (!device) return;
        this.id = device.id;
        this.device_name = device.device_name;
        this.device_code = device.device_code;
        this.location = device.location;
        this.status = device.status;
        this.last_seen = device.last_seen ? device.last_seen.toISOString() : null;
        this.created_at = device.created_at ? device.created_at.toISOString() : null;
    }
}

class KioskSessionResponseDTO {
    constructor(session) {
        if (!session) return;
        this.id = session.id;
        this.kiosk_device_id = session.kiosk_device_id;
        this.guest_id = session.guest_id;
        this.session_start = session.session_start ? session.session_start.toISOString() : null;
        this.session_end = session.session_end ? session.session_end.toISOString() : null;
        this.status = session.status;
        
        // Joined details
        this.device_name = session.device_name || null;
        this.guest_name = session.guest_name || null;
    }
}

class OCRResultDTO {
    constructor({ first_name, last_name, email, company, job_title, phone }) {
        this.first_name = first_name || '';
        this.last_name = last_name || '';
        this.email = email || '';
        this.company = company || '';
        this.job_title = job_title || '';
        this.phone = phone || '';
    }
}

class BusinessCardScanResponseDTO {
    constructor(scan) {
        if (!scan) return;
        this.id = scan.id;
        this.guest_id = scan.guest_id;
        this.image_url = scan.image_url;
        this.ocr_data = new OCRResultDTO(scan.ocr_data || {});
        this.processing_status = scan.processing_status;
        this.created_at = scan.created_at ? scan.created_at.toISOString() : null;
    }
}

class GuestPhotoResponseDTO {
    constructor(photo) {
        if (!photo) return;
        this.id = photo.id;
        this.guest_id = photo.guest_id;
        this.photo_url = photo.photo_url;
        this.capture_source = photo.capture_source;
        this.created_at = photo.created_at ? photo.created_at.toISOString() : null;
    }
}

class RegistrationAuditLogResponseDTO {
    constructor(log) {
        if (!log) return;
        this.id = log.id;
        this.guest_id = log.guest_id;
        this.action = log.action;
        this.performed_by = log.performed_by;
        this.created_at = log.created_at ? log.created_at.toISOString() : null;
        this.guest_name = log.guest_name || null;
    }
}

class KioskLanguageResponseDTO {
    constructor(lang) {
        if (!lang) return;
        this.id = lang.id;
        this.language_code = lang.language_code;
        this.language_name = lang.language_name;
        this.is_active = lang.is_active;
    }
}

class RegistrationQueueResponseDTO {
    constructor(item) {
        if (!item) return;
        this.id = item.id;
        this.guest_id = item.guest_id;
        this.queue_status = item.queue_status;
        this.priority = item.priority;
        this.created_at = item.created_at ? item.created_at.toISOString() : null;
        
        // Joined details
        this.guest_name = item.guest_name || null;
        this.guest_email = item.guest_email || null;
        this.guest_company = item.guest_company || null;
        this.guest_category = item.guest_category || 'Attendee';
    }
}

class KioskHealthSummaryDTO {
    constructor({ online_count, offline_count, active_sessions, assistance_requests }) {
        this.online_kiosks_count = online_count || 0;
        this.offline_kiosks_count = offline_count || 0;
        this.active_sessions_count = active_sessions || 0;
        this.pending_assistance_alerts = assistance_requests || 0;
    }
}

module.exports = {
    KioskDeviceResponseDTO,
    KioskSessionResponseDTO,
    OCRResultDTO,
    BusinessCardScanResponseDTO,
    GuestPhotoResponseDTO,
    RegistrationAuditLogResponseDTO,
    KioskLanguageResponseDTO,
    RegistrationQueueResponseDTO,
    KioskHealthSummaryDTO
};
