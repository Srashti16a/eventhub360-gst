/**
 * ScannerDevice Entity Model
 */
class ScannerDevice {
    /**
     * @param {Object} params
     * @param {number} [params.device_id]
     * @param {number} params.company_id
     * @param {string} params.device_name
     * @param {'Handheld' | 'Automatic' | 'Kiosk'} [params.device_type]
     * @param {string} params.access_token
     * @param {'Active' | 'Inactive' | 'Offline'} [params.status]
     * @param {Date|string} [params.last_active]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        device_id,
        company_id,
        device_name,
        device_type = 'Handheld',
        access_token,
        status = 'Active',
        last_active = null,
        created_at,
        updated_at
    }) {
        this.device_id = device_id ? Number(device_id) : undefined;
        this.company_id = Number(company_id);
        this.device_name = device_name;
        this.device_type = device_type;
        this.access_token = access_token;
        this.status = status;
        this.last_active = last_active ? new Date(last_active) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to ScannerDevice Entity instance
     * @param {Object} row 
     * @returns {ScannerDevice}
     */
    static fromRow(row) {
        if (!row) return null;
        return new ScannerDevice({
            device_id: row.device_id,
            company_id: row.company_id,
            device_name: row.device_name,
            device_type: row.device_type,
            access_token: row.access_token,
            status: row.status,
            last_active: row.last_active,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = ScannerDevice;
