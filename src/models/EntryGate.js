/**
 * EntryGate Entity Model
 */
class EntryGate {
    /**
     * @param {Object} params
     * @param {number} [params.entry_gate_id]
     * @param {number} params.event_id
     * @param {string} params.gate_name
     * @param {'Main Entrance' | 'VIP Gate' | 'Staff Entrance' | 'Ballroom Entrance'} params.gate_type
     * @param {number} [params.capacity_limit]
     * @param {'Clear Flow' | 'Queuing' | 'Slow Lane' | 'Fast Lane' | 'Closed'} [params.status]
     */
    constructor({
        entry_gate_id,
        event_id,
        gate_name,
        gate_type,
        capacity_limit = 500,
        status = 'Clear Flow'
    }) {
        this.entry_gate_id = entry_gate_id ? Number(entry_gate_id) : undefined;
        this.event_id = Number(event_id);
        this.gate_name = gate_name;
        this.gate_type = gate_type;
        this.capacity_limit = Number(capacity_limit);
        this.status = status;
    }

    /**
     * Map database row directly to EntryGate Entity instance
     * @param {Object} row 
     * @returns {EntryGate}
     */
    static fromRow(row) {
        if (!row) return null;
        return new EntryGate({
            entry_gate_id: row.entry_gate_id,
            event_id: row.event_id,
            gate_name: row.gate_name,
            gate_type: row.gate_type,
            capacity_limit: row.capacity_limit,
            status: row.status
        });
    }
}

module.exports = EntryGate;
