/**
 * QR Pass Center Data Transfer Objects (DTOs)
 */

class QrPassDashboardDTO {
    /**
     * @param {Object} params
     * @param {number} params.totalPasses
     * @param {number} params.scannedActiveCount
     * @param {number} params.pendingDeliveryCount
     * @param {number} params.totalAuditsCount
     * @param {number} params.failedAuditsCount
     */
    constructor({ totalPasses, scannedActiveCount, pendingDeliveryCount, totalAuditsCount, failedAuditsCount }) {
        this.totalPasses = {
            count: Number(totalPasses),
            label: 'Total Passes Generated',
            trend: '+12%'
        };
        this.scannedActive = {
            count: Number(scannedActiveCount),
            label: 'Scanned/Active',
            trend: '+8%'
        };
        this.pendingDelivery = {
            count: Number(pendingDeliveryCount),
            label: 'Pending Delivery',
            trend: 'Stable'
        };

        // Calculate security health ratio: (total audits - failed audits) / total audits
        const health = totalAuditsCount > 0 
            ? ((totalAuditsCount - failedAuditsCount) / totalAuditsCount) * 100 
            : 99.9; // defaults to 99.9% if no checks run yet
        
        this.securityHealth = {
            percentage: Number(health.toFixed(1)),
            label: 'Security Health',
            status: health >= 95 ? 'Optimal' : (health >= 85 ? 'Watchlist' : 'Critical')
        };
    }
}

class QrPassRegistryResponseDTO {
    /**
     * @param {import('./QrPass')} pass 
     */
    constructor(pass) {
        this.pass_id = pass.pass_id;
        this.guest_id = pass.guest_id;
        this.guest_name = pass.guest_name || 'Guest #' + pass.guest_id;
        this.guest_email = pass.guest_email || 'No email registered';
        this.pass_code = pass.pass_code;
        this.pass_type = pass.pass_type; // 'VIP' | 'Attendee' | 'Staff' | 'Media' | 'Vendor'
        this.status = pass.status; // 'Active' | 'Scanned' | 'Revoked' | 'Expired'
        this.expires_at = pass.expires_at ? pass.expires_at.toISOString().split('T')[0] : null;
        this.created_at = pass.created_at ? pass.created_at.toISOString() : null;
    }
}

class QrPassPreviewDTO {
    /**
     * @param {import('./QrPass')} pass 
     * @param {import('./PassScanLog')[]} recentScans 
     */
    constructor(pass, recentScans = []) {
        this.pass_id = pass.pass_id;
        this.guest_name = pass.guest_name || 'Guest #' + pass.guest_id;
        this.guest_email = pass.guest_email || 'No email registered';
        this.pass_code = pass.pass_code;
        this.pass_type = pass.pass_type;
        this.status = pass.status;
        this.qr_code_url = pass.qr_code_url;
        this.expires_at = pass.expires_at ? pass.expires_at.toISOString().split('T')[0] : null;
        
        // Security hashing validation details
        this.security = {
            verified: pass.status !== 'Revoked' && pass.status !== 'Expired',
            hash: pass.security_hash,
            label: pass.status === 'Revoked' ? 'REVOKED ACCESS' : (pass.status === 'Expired' ? 'EXPIRED PASS' : `${pass.pass_type} ACCESS GRANTED`)
        };

        this.recentScans = recentScans.map(s => ({
            scan_id: s.scan_id,
            scan_location: s.scan_location,
            scanned_by: s.scanned_by || 'Automatic Scanner',
            scan_status: s.scan_status,
            scanned_at: s.scanned_at ? s.scanned_at.toISOString() : null
        }));
    }
}

class QrPassDeliveryTrackDTO {
    /**
     * @param {import('./QrPassDelivery')} delivery 
     */
    constructor(delivery) {
        this.delivery_id = delivery.delivery_id;
        this.pass_id = delivery.pass_id;
        this.channel = delivery.channel;
        this.recipient_address = delivery.recipient_address;
        this.status = delivery.status; // 'Pending' | 'Sent' | 'Delivered' | 'Failed'
        this.sent_at = delivery.sent_at ? delivery.sent_at.toISOString() : null;
        this.delivered_at = delivery.delivered_at ? delivery.delivered_at.toISOString() : null;
        this.error_message = delivery.error_message;
    }
}

class ScannerDeviceResponseDTO {
    /**
     * @param {import('./ScannerDevice')} device 
     */
    constructor(device) {
        this.device_id = device.device_id;
        this.device_name = device.device_name;
        this.device_type = device.device_type;
        this.status = device.status;
        this.last_active = device.last_active ? device.last_active.toISOString() : null;
        
        // Truncate access token for security audits
        this.masked_token = device.access_token 
            ? `${device.access_token.substring(0, 8)}...${device.access_token.substring(device.access_token.length - 8)}`
            : null;
    }
}

class BatchGenerationResponseDTO {
    /**
     * @param {import('./BatchPassGeneration')} batch 
     */
    constructor(batch) {
        this.batch_id = batch.batch_id;
        this.event_id = batch.event_id;
        this.pass_type = batch.pass_type;
        this.total_passes = batch.total_passes;
        this.generated_count = batch.generated_count;
        this.status = batch.status;
        this.progress_percentage = batch.total_passes > 0 
            ? Math.round((batch.generated_count / batch.total_passes) * 100)
            : 0;
        this.error_log = batch.error_log;
        this.created_at = batch.created_at ? batch.created_at.toISOString() : null;
        this.completed_at = batch.completed_at ? batch.completed_at.toISOString() : null;
    }
}

module.exports = {
    QrPassDashboardDTO,
    QrPassRegistryResponseDTO,
    QrPassPreviewDTO,
    QrPassDeliveryTrackDTO,
    ScannerDeviceResponseDTO,
    BatchGenerationResponseDTO
};
