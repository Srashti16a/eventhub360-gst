/**
 * TransportConflict Entity Model
 */
class TransportConflict {
    /**
     * @param {Object} params
     * @param {number} [params.conflict_id]
     * @param {number} params.allocation_id
     * @param {'Capacity Conflict' | 'Timing Conflict' | 'Route Conflict'} params.conflict_type
     * @param {string} params.conflict_message
     * @param {'Unresolved' | 'Resolved'} [params.status]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined details
     * @param {string} [params.guest_name]
     * @param {string} [params.vehicle_name]
     */
    constructor({
        conflict_id,
        allocation_id,
        conflict_type,
        conflict_message,
        status = 'Unresolved',
        created_at,
        guest_name = null,
        vehicle_name = null
    }) {
        this.conflict_id = conflict_id ? Number(conflict_id) : undefined;
        this.allocation_id = Number(allocation_id);
        this.conflict_type = conflict_type;
        this.conflict_message = conflict_message;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.vehicle_name = vehicle_name;
    }

    /**
     * Map database row directly to TransportConflict instance
     * @param {Object} row 
     * @returns {TransportConflict}
     */
    static fromRow(row) {
        if (!row) return null;
        return new TransportConflict({
            conflict_id: row.conflict_id,
            allocation_id: row.allocation_id,
            conflict_type: row.conflict_type,
            conflict_message: row.conflict_message,
            status: row.status,
            created_at: row.created_at,
            guest_name: row.guest_name,
            vehicle_name: row.vehicle_name
        });
    }
}

module.exports = TransportConflict;
