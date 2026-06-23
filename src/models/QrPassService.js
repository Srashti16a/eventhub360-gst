const crypto = require('crypto');
const QrPassRepository = require('./QrPassRepository');
const {
    QrPassDashboardDTO,
    QrPassRegistryResponseDTO,
    QrPassPreviewDTO,
    QrPassDeliveryTrackDTO,
    ScannerDeviceResponseDTO,
    BatchGenerationResponseDTO
} = require('./QrPassDTO');

class QrPassService {
    constructor() {
        this.securitySalt = 'EventHub360_Secure_Salt_2026';
    }

    /**
     * Get dashboard stats DTO
     */
    async getDashboardAnalytics(eventId, companyId) {
        const stats = await QrPassRepository.getQrPassStats(eventId, companyId);
        return new QrPassDashboardDTO(stats);
    }

    /**
     * Get registry passes paginated log
     */
    async getPassesRegistry(eventId, companyId, filters) {
        const list = await QrPassRepository.getPassesList(eventId, companyId, filters);
        const count = await QrPassRepository.getPassesCount(eventId, companyId, filters);
        
        return {
            pagination: {
                total: count,
                page: Number(filters.page || 1),
                limit: Number(filters.limit || 10),
                pages: Math.ceil(count / (filters.limit || 10))
            },
            data: list.map(pass => new QrPassRegistryResponseDTO(pass))
        };
    }

    /**
     * Read pass details, status verification and recent scans
     */
    async getPassPreview(passId, companyId) {
        const pass = await QrPassRepository.getPassById(passId, companyId);
        if (!pass) throw new Error(`Pass not found with ID ${passId}`);

        const scans = await QrPassRepository.getRecentScanLogs(companyId, 5);
        const passScans = scans.filter(s => s.pass_id === pass.pass_id);
        
        return new QrPassPreviewDTO(pass, passScans);
    }

    /**
     * Single QR Pass generation
     */
    async generateQrPass(data, companyId, userId) {
        // Formulate pass code context: EH-<TYPE>-<RANDOM>
        const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
        const passCode = `EH-${data.pass_type.substring(0, 3).toUpperCase()}-${rand}`;

        // Compute SHA-256 secure hash to prevent passport cloning
        const hashPayload = `${companyId}:${data.guest_id}:${passCode}:${this.securitySalt}`;
        const securityHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

        // Render QR server public API link
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${passCode}:${securityHash}`;

        return await QrPassRepository.createPass({
            company_id: companyId,
            guest_id: data.guest_id,
            pass_code: passCode,
            pass_type: data.pass_type,
            status: 'Active',
            qr_code_url: qrCodeUrl,
            security_hash: securityHash,
            expires_at: data.expires_at,
            created_by: userId,
            updated_by: userId
        });
    }

    /**
     * Bulk passes generation job
     */
    async generateBatchQrPasses(data, companyId, userId) {
        const client = await pool.connect();
        try {
            // Find guests linked to event that don't have passes generated yet
            const unpassedGuestsQuery = `
                SELECT eg.guest_id 
                FROM event_guest eg
                JOIN guest g ON eg.guest_id = g.guest_id
                LEFT JOIN qr_passes qp ON g.guest_id = qp.guest_id AND qp.company_id = $2
                WHERE eg.event_id = $1 AND qp.pass_id IS NULL;
            `;
            const unpassedGuestsRes = await pool.query(unpassedGuestsQuery, [data.event_id, companyId]);
            const guestsList = unpassedGuestsRes.rows;

            if (guestsList.length === 0) {
                throw new Error('All invited guests already have active passes generated');
            }

            // Create batch job registry
            const batchJob = await QrPassRepository.createBatchJob({
                company_id: companyId,
                event_id: data.event_id,
                pass_type: data.pass_type,
                total_passes: guestsList.length
            });

            // Asynchronous generator logic simulation (triggered in background)
            // Phase 1 processes synchronously for validation, but logs updates
            let generated = 0;
            for (const guest of guestsList) {
                const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
                const passCode = `EH-${data.pass_type.substring(0, 3).toUpperCase()}-${rand}`;

                const hashPayload = `${companyId}:${guest.guest_id}:${passCode}:${this.securitySalt}`;
                const securityHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${passCode}:${securityHash}`;

                await pool.query(
                    `INSERT INTO qr_passes (company_id, guest_id, pass_code, pass_type, status, qr_code_url, security_hash, expires_at, created_by)
                     VALUES ($1, $2, $3, $4, 'Active', $5, $6, $7, $8)
                     ON CONFLICT (company_id, guest_id) DO NOTHING;`,
                    [companyId, guest.guest_id, passCode, data.pass_type, qrCodeUrl, securityHash, data.expires_at, userId]
                );

                generated++;
                await QrPassRepository.updateBatchProgress(batchJob.batch_id, generated, 'Processing', null, companyId);
            }

            const finalBatch = await QrPassRepository.updateBatchProgress(batchJob.batch_id, generated, 'Completed', null, companyId);
            return new BatchGenerationResponseDTO(finalBatch);
        } finally {
            client.release();
        }
    }

    /**
     * Dispatch pass via Email/WhatsApp
     */
    async deliverQrPass(passId, data, companyId) {
        const pass = await QrPassRepository.getPassById(passId, companyId);
        if (!pass) throw new Error('Pass registry not found');

        const delivery = await QrPassRepository.createDeliveryLog({
            company_id: companyId,
            pass_id: passId,
            channel: data.channel,
            recipient_address: data.recipient_address,
            status: 'Pending'
        });

        try {
            // Simulated third-party integrations (e.g. Twilio / SendGrid)
            // Trigger successfully
            await QrPassRepository.updateDeliveryStatus(delivery.delivery_id, 'Sent', null, companyId);
            const successTrack = await QrPassRepository.updateDeliveryStatus(delivery.delivery_id, 'Delivered', null, companyId);
            return new QrPassDeliveryTrackDTO(successTrack);
        } catch (e) {
            const failedTrack = await QrPassRepository.updateDeliveryStatus(delivery.delivery_id, 'Failed', e.message, companyId);
            return new QrPassDeliveryTrackDTO(failedTrack);
        }
    }

    /**
     * Scanner verification and gate check-in logic
     */
    async verifyAndTrackPassScan(data, companyId, deviceToken, clientIp) {
        // Authenticate hardware scanner device
        const scanner = await QrPassRepository.getScannerByToken(deviceToken);
        if (!scanner) {
            throw new Error('Unauthorized scan: Valid scanner device registration required');
        }

        await QrPassRepository.updateScannerActivity(scanner.device_id);

        const pass = await QrPassRepository.getPassByCode(data.pass_code, companyId);
        if (!pass) {
            // Unregistered pass scans logged as Invalid
            return {
                verified: false,
                status: 'Invalid',
                message: 'Invalid Pass: This QR Code is not registered in the system registry.'
            };
        }

        // 1. Check cryptograhic hash integrity (tamper detection)
        const expectedPayload = `${companyId}:${pass.guest_id}:${pass.pass_code}:${this.securitySalt}`;
        const computedHash = crypto.createHash('sha256').update(expectedPayload).digest('hex');

        if (computedHash !== pass.security_hash) {
            await QrPassRepository.logSecurityAudit({
                company_id: companyId,
                pass_id: pass.pass_id,
                action_type: 'Tamper Detected',
                ip_address: clientIp,
                user_agent: 'EventHub360 Scanner Core',
                hash_verified: false,
                details: { computed: computedHash, stored: pass.security_hash }
            });
            await QrPassRepository.logPassScan({
                company_id: companyId,
                pass_id: pass.pass_id,
                device_id: scanner.device_id,
                scan_location: data.scan_location,
                scanned_by: data.scanned_by,
                scan_status: 'Invalid'
            });
            return {
                verified: false,
                status: 'Tampered',
                message: 'Security Alert: QR Pass signature invalid. Tampering detected.'
            };
        }

        await QrPassRepository.logSecurityAudit({
            company_id: companyId,
            pass_id: pass.pass_id,
            action_type: 'Validation Check',
            ip_address: clientIp,
            hash_verified: true
        });

        // 2. Check administrative revocations
        if (pass.status === 'Revoked') {
            await QrPassRepository.logPassScan({
                company_id: companyId,
                pass_id: pass.pass_id,
                device_id: scanner.device_id,
                scan_location: data.scan_location,
                scanned_by: data.scanned_by,
                scan_status: 'Revoked'
            });
            return {
                verified: false,
                status: 'Revoked',
                message: 'Access Denied: This QR Pass has been administratively revoked.'
            };
        }

        // 3. Check expiration limits
        if (new Date() > pass.expires_at) {
            if (pass.status !== 'Expired') {
                await QrPassRepository.updatePassStatus(pass.pass_id, 'Expired', companyId);
            }
            await QrPassRepository.logPassScan({
                company_id: companyId,
                pass_id: pass.pass_id,
                device_id: scanner.device_id,
                scan_location: data.scan_location,
                scanned_by: data.scanned_by,
                scan_status: 'Expired'
            });
            return {
                verified: false,
                status: 'Expired',
                message: 'Access Denied: This QR Pass has expired.'
            };
        }

        // 4. Check double scanning (Duplicate)
        if (pass.status === 'Scanned') {
            await QrPassRepository.logPassScan({
                company_id: companyId,
                pass_id: pass.pass_id,
                device_id: scanner.device_id,
                scan_location: data.scan_location,
                scanned_by: data.scanned_by,
                scan_status: 'Duplicate'
            });
            return {
                verified: true,
                status: 'Duplicate',
                message: `Warning: Pass already scanned. Re-entry logged at ${data.scan_location}.`
            };
        }

        // 5. Successful Scan validation
        await QrPassRepository.updatePassStatus(pass.pass_id, 'Scanned', companyId);
        await QrPassRepository.logPassScan({
            company_id: companyId,
            pass_id: pass.pass_id,
            device_id: scanner.device_id,
            scan_location: data.scan_location,
            scanned_by: data.scanned_by,
            scan_status: 'Valid'
        });

        return {
            verified: true,
            status: 'Valid',
            message: `Access Granted: ${pass.pass_type} pass code validation successful. Welcome ${pass.guest_name}.`
        };
    }

    /**
     * Administrative Revocation
     */
    async revokeQrPass(passId, data, companyId, userId) {
        const pass = await QrPassRepository.getPassById(passId, companyId);
        if (!pass) throw new Error('Pass not found');

        await QrPassRepository.updatePassStatus(passId, 'Revoked', companyId);
        await QrPassRepository.logRevocation({
            company_id: companyId,
            pass_id: passId,
            revoked_by: userId,
            revocation_reason: data.revocation_reason
        });

        return true;
    }

    /**
     * Device Registry
     */
    async registerDevice(data, companyId) {
        // Create secure access token for the device client
        const token = crypto.randomBytes(32).toString('hex');
        const device = await QrPassRepository.registerScanner({
            company_id: companyId,
            device_name: data.device_name,
            device_type: data.device_type,
            access_token: token,
            status: 'Active'
        });

        return {
            device_id: device.device_id,
            device_name: device.device_name,
            device_type: device.device_type,
            status: device.status,
            access_token: token // returned raw exactly once during setup
        };
    }

    /**
     * Export raw csv log structure
     */
    async exportScanLogsCsv(eventId, companyId, filters) {
        const logs = await QrPassRepository.getScanLogsList(eventId, companyId, filters);
        
        let csv = 'Scan ID,Pass Code,Guest Name,Location,Scanned By,Status,Timestamp\n';
        for (const log of logs) {
            csv += `"${log.scan_id}","${log.pass_code}","${log.guest_name}","${log.scan_location}","${log.scanned_by || 'Auto'}","${log.scan_status}","${log.scanned_at.toISOString()}"\n`;
        }
        return csv;
    }
}

module.exports = new QrPassService();
const pool = require('../config/db'); // require pool globally for batch transaction context queries
