/**
 * KioskDevice Entity Model
 */
class KioskDevice {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.branch_id]
     * @param {string} params.device_name
     * @param {string} params.device_code
     * @param {string|null} [params.location]
     * @param {'Active' | 'Offline' | 'Maintenance' | 'Assistance Required'} [params.status]
     * @param {Date|string} [params.last_seen]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        device_name,
        device_code,
        location = null,
        status = 'Active',
        last_seen,
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.device_name = device_name;
        this.device_code = device_code;
        this.location = location;
        this.status = status;
        this.last_seen = last_seen ? new Date(last_seen) : new Date();
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to KioskDevice Entity instance
     * @param {Object} row 
     * @returns {KioskDevice}
     */
    static fromRow(row) {
        if (!row) return null;
        return new KioskDevice({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            device_name: row.device_name,
            device_code: row.device_code,
            location: row.location,
            status: row.status,
            last_seen: row.last_seen,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = KioskDevice;
