/**
 * RoomConflict Entity Model
 */
class RoomConflict {
    /**
     * @param {Object} params
     * @param {number} [params.conflict_id]
     * @param {number} params.room_id
     * @param {number} params.guest_id
     * @param {'Double Booking' | 'Overlapping Stay' | 'Invalid Assignment'} params.conflict_type
     * @param {string} params.conflict_message
     * @param {boolean} [params.resolved]
     * @param {Date|string} [params.resolved_at]
     * @param {Date|string} [params.created_at]
     * 
     * // Optional joined fields
     * @param {string} [params.room_number]
     * @param {string} [params.guest_name]
     */
    constructor({
        conflict_id,
        room_id,
        guest_id,
        conflict_type,
        conflict_message,
        resolved = false,
        resolved_at = null,
        created_at,
        room_number = null,
        guest_name = null
    }) {
        this.conflict_id = conflict_id ? Number(conflict_id) : undefined;
        this.room_id = Number(room_id);
        this.guest_id = Number(guest_id);
        this.conflict_type = conflict_type;
        this.conflict_message = conflict_message;
        this.resolved = Boolean(resolved);
        this.resolved_at = resolved_at ? new Date(resolved_at) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.room_number = room_number;
        this.guest_name = guest_name;
    }

    /**
     * Map database row directly to RoomConflict Entity instance
     * @param {Object} row 
     * @returns {RoomConflict}
     */
    static fromRow(row) {
        if (!row) return null;
        return new RoomConflict({
            conflict_id: row.conflict_id,
            room_id: row.room_id,
            guest_id: row.guest_id,
            conflict_type: row.conflict_type,
            conflict_message: row.conflict_message,
            resolved: row.resolved,
            resolved_at: row.resolved_at,
            created_at: row.created_at,
            room_number: row.room_number,
            guest_name: row.guest_name
        });
    }
}

module.exports = RoomConflict;
