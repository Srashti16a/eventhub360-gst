/**
 * CheckInRecord Entity Model
 */
class CheckInRecord {
    /**
     * @param {Object} params
     * @param {number} [params.checkin_record_id]
     * @param {number} params.guest_id
     * @param {number} params.event_id
     * @param {number} [params.pass_id]
     * @param {number} [params.scanner_device_id]
     * @param {number} [params.entry_gate_id]
     * @param {Date|string} [params.checkin_time]
     * @param {'QR Scan' | 'Manual'} params.checkin_method
     * @param {'Success' | 'Flagged' | 'Failed'} [params.status]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     * @param {string} [params.gate_name]
     * @param {string} [params.pass_code]
     */
    constructor({
        checkin_record_id,
        guest_id,
        event_id,
        pass_id = null,
        scanner_device_id = null,
        entry_gate_id = null,
        checkin_time,
        checkin_method,
        status = 'Success',
        created_at,
        guest_name = null,
        guest_category = null,
        gate_name = null,
        pass_code = null
    }) {
        this.checkin_record_id = checkin_record_id ? Number(checkin_record_id) : undefined;
        this.guest_id = Number(guest_id);
        this.event_id = Number(event_id);
        this.pass_id = pass_id ? Number(pass_id) : null;
        this.scanner_device_id = scanner_device_id ? Number(scanner_device_id) : null;
        this.entry_gate_id = entry_gate_id ? Number(entry_gate_id) : null;
        this.checkin_time = checkin_time ? new Date(checkin_time) : undefined;
        this.checkin_method = checkin_method;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_category = guest_category;
        this.gate_name = gate_name;
        this.pass_code = pass_code;
    }

    /**
     * Map database row directly to CheckInRecord Entity instance
     * @param {Object} row 
     * @returns {CheckInRecord}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CheckInRecord({
            checkin_record_id: row.checkin_record_id,
            guest_id: row.guest_id,
            event_id: row.event_id,
            pass_id: row.pass_id,
            scanner_device_id: row.scanner_device_id,
            entry_gate_id: row.entry_gate_id,
            checkin_time: row.checkin_time,
            checkin_method: row.checkin_method,
            status: row.status,
            created_at: row.created_at,
            guest_name: row.guest_name,
            guest_category: row.guest_category,
            gate_name: row.gate_name,
            pass_code: row.pass_code
        });
    }
}

module.exports = CheckInRecord;
