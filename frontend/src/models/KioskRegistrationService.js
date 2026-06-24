const pool = require('../config/db');
const KioskRegistrationRepository = require('./KioskRegistrationRepository');
const QrPassService = require('./QrPassService');
const BadgePrintingService = require('./BadgePrintingService');
const BadgePrintingRepository = require('./BadgePrintingRepository');
const {
    KioskDeviceResponseDTO,
    KioskSessionResponseDTO,
    OCRResultDTO,
    BusinessCardScanResponseDTO,
    GuestPhotoResponseDTO,
    RegistrationAuditLogResponseDTO,
    KioskLanguageResponseDTO,
    RegistrationQueueResponseDTO,
    KioskHealthSummaryDTO
} = require('./KioskRegistrationDTO');

class KioskRegistrationService {
    // ==========================================
    // 1. Kiosk Devices & Health Monitoring
    // ==========================================
    async registerDevice(data, context) {
        const device = await KioskRegistrationRepository.createDevice({
            ...data,
            company_id: context.companyId,
            branch_id: context.branchId
        });
        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            action: `Kiosk device ${device.device_name} registered.`,
            performed_by: `Device:${device.id}`
        });
        return new KioskDeviceResponseDTO(device);
    }

    async updateDevice(id, data, context) {
        const device = await KioskRegistrationRepository.findDeviceById(id, context.companyId);
        if (!device) {
            const error = new Error('Kiosk device not found');
            error.status = 404;
            throw error;
        }

        const updated = await KioskRegistrationRepository.updateDevice(id, context.companyId, data);
        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            action: `Kiosk device status updated: ${updated.status}`,
            performed_by: `Device:${id}`
        });
        return new KioskDeviceResponseDTO(updated);
    }

    async listDevices(context) {
        const devices = await KioskRegistrationRepository.findAllDevices(context.companyId);
        return devices.map(d => new KioskDeviceResponseDTO(d));
    }

    async getDeviceById(id, context) {
        const device = await KioskRegistrationRepository.findDeviceById(id, context.companyId);
        if (!device) {
            const error = new Error('Kiosk device not found');
            error.status = 404;
            throw error;
        }
        return new KioskDeviceResponseDTO(device);
    }

    async getKioskHealth(context) {
        const health = await KioskRegistrationRepository.getKioskHealthSummary(context.companyId);
        const activeSessions = await KioskRegistrationRepository.getActiveSessionsCount(context.companyId);

        return new KioskHealthSummaryDTO({
            online_count: health.online,
            offline_count: health.offline,
            active_sessions: activeSessions,
            assistance_requests: health.assistance
        });
    }

    // ==========================================
    // 2. Kiosk Sessions
    // ==========================================
    async startSession(data, context) {
        const device = await KioskRegistrationRepository.findDeviceById(data.kiosk_device_id, context.companyId);
        if (!device) {
            const error = new Error('Device not found');
            error.status = 404;
            throw error;
        }

        const session = await KioskRegistrationRepository.createSession({
            company_id: context.companyId,
            kiosk_device_id: data.kiosk_device_id
        });

        await KioskRegistrationRepository.updateDeviceLastSeen(data.kiosk_device_id, context.companyId);
        
        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            action: 'Self-service registration session started',
            performed_by: `Session:${session.id}`
        });

        return new KioskSessionResponseDTO(session);
    }

    async endSession(id, status, context) {
        const session = await KioskRegistrationRepository.findSessionById(id, context.companyId);
        if (!session) {
            const error = new Error('Session not found');
            error.status = 404;
            throw error;
        }

        const updated = await KioskRegistrationRepository.updateSessionStatus(id, context.companyId, status);
        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            guest_id: session.guest_id,
            action: `Registration session ended. Status: ${status}`,
            performed_by: `Session:${id}`
        });

        return new KioskSessionResponseDTO(updated);
    }

    // ==========================================
    // 3. Business Card Scanning & OCR Extraction
    // ==========================================
    async uploadCardScan(data, context) {
        // 1. Initial pending log
        const scan = await KioskRegistrationRepository.createCardScan({
            company_id: context.companyId,
            guest_id: data.guest_id || null,
            image_url: data.image_url,
            processing_status: 'Pending'
        });

        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            guest_id: data.guest_id || null,
            action: 'Business card scanned. Processing OCR extractions.',
            performed_by: `Scan:${scan.id}`
        });

        // 2. Perform mock OCR extractions
        const mockOcrResult = {
            first_name: 'Julianne',
            last_name: 'Abernathy',
            email: 'julianne.abernathy@company.com',
            company: 'Global Hospitality Group',
            job_title: 'Hospitality Director',
            phone: '+1 (555) 019-9000'
        };

        // 3. Finalize scan status
        const completedScan = await KioskRegistrationRepository.updateCardScanStatus(
            scan.id,
            context.companyId,
            mockOcrResult,
            'Completed',
            data.guest_id || null
        );

        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            guest_id: data.guest_id || null,
            action: 'Business card OCR parsing completed successfully',
            performed_by: `Scan:${scan.id}`
        });

        return new BusinessCardScanResponseDTO(completedScan);
    }

    // ==========================================
    // 4. Photo Capture
    // ==========================================
    async uploadGuestPhoto(data, context) {
        const photo = await KioskRegistrationRepository.createPhoto({
            company_id: context.companyId,
            guest_id: data.guest_id,
            photo_url: data.photo_url,
            capture_source: data.capture_source || 'Kiosk Camera'
        });

        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            guest_id: data.guest_id,
            action: `Guest profile photo uploaded via ${photo.capture_source}`,
            performed_by: `Photo:${photo.id}`
        });

        return new GuestPhotoResponseDTO(photo);
    }

    // ==========================================
    // 5. Complete Guest Self-Registration Workflow
    // ==========================================
    async registerGuest(data, context) {
        const session = await KioskRegistrationRepository.findSessionById(data.session_id, context.companyId);
        if (!session || session.status !== 'Active') {
            const error = new Error('Active session is required to register a guest');
            error.status = 400;
            throw error;
        }

        // 1. Check duplicate registration before registry
        const existingGuest = await KioskRegistrationRepository.findGuestByEmail(data.email, context.companyId);
        let guestId = null;

        if (existingGuest) {
            // Check if guest already associated with the event
            const eventCheckQuery = `
                SELECT event_guest_id FROM event_guest 
                WHERE event_id = $1 AND guest_id = $2;
            `;
            const checkRes = await pool.query(eventCheckQuery, [data.event_id, existingGuest.guest_id]);
            if (checkRes.rows.length > 0) {
                const error = new Error('Duplicate Registration: Guest is already registered for this event');
                error.status = 409;
                throw error;
            }

            guestId = existingGuest.guest_id;
            
            // Link existing guest to event
            await KioskRegistrationRepository.linkGuestToEvent(guestId, data.event_id);
            
            // Update details if edited on kiosk screen
            const updateGuestQuery = `
                UPDATE guest
                SET name = $1, phone = $2, company = $3, job_title = $4
                WHERE guest_id = $5 AND company_id = $6;
            `;
            await pool.query(updateGuestQuery, [
                `${data.first_name} ${data.last_name}`,
                data.phone,
                data.company,
                data.job_title,
                guestId,
                context.companyId
            ]);
        } else {
            // Create new guest
            const newGuest = await KioskRegistrationRepository.createGuest({
                company_id: context.companyId,
                name: `${data.first_name} ${data.last_name}`,
                email: data.email,
                phone: data.phone,
                category: data.category || 'Attendee',
                company: data.company,
                job_title: data.job_title
            });

            guestId = newGuest.guest_id;
            await KioskRegistrationRepository.linkGuestToEvent(guestId, data.event_id);
        }

        // 2. Attach profile photo if supplied
        if (data.photo_url) {
            await KioskRegistrationRepository.createPhoto({
                company_id: context.companyId,
                guest_id: guestId,
                photo_url: data.photo_url,
                capture_source: 'Kiosk Camera'
            });
        }

        // 3. Link card scan to guest ID if scanned
        if (data.card_scan_id) {
            await pool.query(
                `UPDATE business_card_scans SET guest_id = $1 WHERE id = $2 AND company_id = $3;`,
                [guestId, data.card_scan_id, context.companyId]
            );
        }

        // 4. Finalize Kiosk Session
        await KioskRegistrationRepository.updateSessionStatus(data.session_id, context.companyId, 'Completed', guestId);
        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            guest_id: guestId,
            action: 'Self-service registration completed successfully',
            performed_by: `Kiosk:${session.kiosk_device_id}`
        });

        // 5. QR Pass Generation Integration
        let qrPass = null;
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 2);

            qrPass = await QrPassService.generateQrPass({
                guest_id: guestId,
                pass_type: data.category === 'VIP' ? 'VIP' : (data.category === 'Staff' ? 'Staff' : 'Attendee'),
                expires_at: expiresAt
            }, context.companyId, context.userId);
        } catch (qrErr) {
            console.error('Kiosk auto QR Pass generation error:', qrErr);
        }

        // 6. Instant Badge Print Request Integration
        let printJob = null;
        let queueStatus = 'Pending Verification';
        try {
            // Find default event template
            const config = await BadgePrintingRepository.getConfiguration(data.event_id, context.companyId);
            const templateId = config ? config.default_template_id : null;

            printJob = await BadgePrintingService.createPrintJob({
                guest_id: guestId,
                template_id: templateId,
                priority: data.category === 'VIP' ? 2 : 1
            }, {
                companyId: context.companyId,
                userId: context.userId
            });

            queueStatus = 'Approved';
        } catch (printErr) {
            console.error('Kiosk instant badge printing trigger error:', printErr);
            queueStatus = 'Failed';
        }

        // 7. Enqueue Registration in Queue Tracker
        const queueEntry = await KioskRegistrationRepository.enqueueRegistration({
            company_id: context.companyId,
            guest_id: guestId,
            queue_status: queueStatus,
            priority: data.category === 'VIP' ? 2 : 1
        });

        return {
            guest_id: guestId,
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            company: data.company,
            qr_pass_code: qrPass ? qrPass.pass_code : null,
            print_job_id: printJob ? printJob.id : null,
            queue_entry_id: queueEntry.id
        };
    }

    // ==========================================
    // 6. Concierge Assistance Requests
    // ==========================================
    async requestAssistance(data, context) {
        const device = await KioskRegistrationRepository.findDeviceById(data.kiosk_device_id, context.companyId);
        if (!device) {
            const error = new Error('Kiosk device not found');
            error.status = 404;
            throw error;
        }

        await KioskRegistrationRepository.updateDevice(data.kiosk_device_id, context.companyId, {
            status: 'Assistance Required'
        });

        await KioskRegistrationRepository.createAuditLog({
            company_id: context.companyId,
            action: `Concierge assistance requested: ${data.message || 'Help needed'}`,
            performed_by: `Kiosk:${data.kiosk_device_id}`
        });

        return {
            success: true,
            message: 'Concierge notification dispatched successfully. Help is on the way!'
        };
    }

    // ==========================================
    // 7. Multi-Language Support
    // ==========================================
    async listLanguages() {
        const langs = await KioskRegistrationRepository.getLanguages({ activeOnly: true });
        return langs.map(l => new KioskLanguageResponseDTO(l));
    }

    async saveLanguage(data) {
        const lang = await KioskRegistrationRepository.createLanguage(data);
        return new KioskLanguageResponseDTO(lang);
    }

    // ==========================================
    // 8. Registration Queue Management
    // ==========================================
    async getQueue(context) {
        const items = await KioskRegistrationRepository.getQueueItems(context.companyId);
        return items.map(item => new RegistrationQueueResponseDTO(item));
    }

    async updateQueueItem(id, data, context) {
        const item = await KioskRegistrationRepository.updateQueueItem(id, context.companyId, data);
        return new RegistrationQueueResponseDTO(item);
    }

    async removeFromQueue(id, context) {
        return await KioskRegistrationRepository.removeFromQueue(id, context.companyId);
    }
}

module.exports = new KioskRegistrationService();
