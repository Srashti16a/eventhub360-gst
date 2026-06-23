/**
 * KioskSession Entity Model
 */
class KioskSession {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.kiosk_device_id
     * @param {number|null} [params.guest_id]
     * @param {Date|string} [params.session_start]
     * @param {Date|string|null} [params.session_end]
     * @param {'Active' | 'Completed' | 'Abandoned'} [params.status]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.device_name]
     * @param {string} [params.guest_name]
     */
    constructor({
        id,
        company_id,
        kiosk_device_id,
        guest_id = null,
        session_start,
        session_end = null,
        status = 'Active',
        created_at,
        device_name = null,
        guest_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.kiosk_device_id = Number(kiosk_device_id);
        this.guest_id = guest_id ? Number(guest_id) : null;
        this.session_start = session_start ? new Date(session_start) : new Date();
        this.session_end = session_end ? new Date(session_end) : null;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.device_name = device_name;
        this.guest_name = guest_name;
    }

    /**
     * Map database row directly to KioskSession Entity instance
     * @param {Object} row 
     * @returns {KioskSession}
     */
    static fromRow(row) {
        if (!row) return null;
        return new KioskSession({
            id: row.id,
            company_id: row.company_id,
            kiosk_device_id: row.kiosk_device_id,
            guest_id: row.guest_id,
            session_start: row.session_start,
            session_end: row.session_end,
            status: row.status,
            created_at: row.created_at,
            device_name: row.device_name,
            guest_name: row.guest_name
        });
    }
}

module.exports = KioskSession;
