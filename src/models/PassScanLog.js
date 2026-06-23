/**
 * PassScanLog Entity Model
 */
class PassScanLog {
    /**
     * @param {Object} params
     * @param {number} [params.scan_id]
     * @param {number} params.company_id
     * @param {number} params.pass_id
     * @param {number} [params.device_id]
     * @param {string} params.scan_location
     * @param {string} [params.scanned_by]
     * @param {'Valid' | 'Duplicate' | 'Invalid' | 'Revoked' | 'Expired'} params.scan_status
     * @param {Date|string} [params.scanned_at]
     * 
     * // Joined parameters
     * @param {string} [params.pass_code]
     * @param {string} [params.guest_name]
     * @param {string} [params.device_name]
     */
    constructor({
        scan_id,
        company_id,
        pass_id,
        device_id = null,
        scan_location,
        scanned_by = null,
        scan_status,
        scanned_at,
        pass_code = null,
        guest_name = null,
        device_name = null
    }) {
        this.scan_id = scan_id ? Number(scan_id) : undefined;
        this.company_id = Number(company_id);
        this.pass_id = Number(pass_id);
        this.device_id = device_id ? Number(device_id) : null;
        this.scan_location = scan_location;
        this.scanned_by = scanned_by;
        this.scan_status = scan_status;
        this.scanned_at = scanned_at ? new Date(scanned_at) : undefined;

        // Joined properties
        this.pass_code = pass_code;
        this.guest_name = guest_name;
        this.device_name = device_name;
    }

    /**
     * Map database row directly to PassScanLog Entity instance
     * @param {Object} row 
     * @returns {PassScanLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new PassScanLog({
            scan_id: row.scan_id,
            company_id: row.company_id,
            pass_id: row.pass_id,
            device_id: row.device_id,
            scan_location: row.scan_location,
            scanned_by: row.scanned_by,
            scan_status: row.scan_status,
            scanned_at: row.scanned_at,
            pass_code: row.pass_code,
            guest_name: row.guest_name,
            device_name: row.device_name
        });
    }
}

module.exports = PassScanLog;
