/**
 * CheckInStaff Entity Model
 */
class CheckInStaff {
    /**
     * @param {Object} params
     * @param {number} [params.staff_id]
     * @param {number} params.user_id
     * @param {number} params.event_id
     * @param {number} [params.entry_gate_id]
     * @param {Date|string} params.shift_start
     * @param {Date|string} params.shift_end
     * 
     * // Joined parameters
     * @param {string} [params.staff_name]
     * @param {string} [params.gate_name]
     */
    constructor({
        staff_id,
        user_id,
        event_id,
        entry_gate_id = null,
        shift_start,
        shift_end,
        staff_name = null,
        gate_name = null
    }) {
        this.staff_id = staff_id ? Number(staff_id) : undefined;
        this.user_id = Number(user_id);
        this.event_id = Number(event_id);
        this.entry_gate_id = entry_gate_id ? Number(entry_gate_id) : null;
        this.shift_start = new Date(shift_start);
        this.shift_end = new Date(shift_end);

        // Joined properties
        this.staff_name = staff_name;
        this.gate_name = gate_name;
    }

    /**
     * Map database row directly to CheckInStaff Entity instance
     * @param {Object} row 
     * @returns {CheckInStaff}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CheckInStaff({
            staff_id: row.staff_id,
            user_id: row.user_id,
            event_id: row.event_id,
            entry_gate_id: row.entry_gate_id,
            shift_start: row.shift_start,
            shift_end: row.shift_end,
            staff_name: row.staff_name,
            gate_name: row.gate_name
        });
    }
}

module.exports = CheckInStaff;
