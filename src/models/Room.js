/**
 * Room Entity Model
 */
class Room {
    /**
     * @param {Object} params
     * @param {number} [params.room_id]
     * @param {number} params.hotel_id
     * @param {string} params.room_number
     * @param {string} params.room_type
     * @param {'Available' | 'Reserved' | 'Occupied' | 'Maintenance'} [params.room_status]
     * @param {number} [params.capacity]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Optional joined fields
     * @param {string} [params.hotel_name]
     */
    constructor({
        room_id,
        hotel_id,
        room_number,
        room_type,
        room_status = 'Available',
        capacity = 1,
        created_at,
        updated_at,
        hotel_name = null
    }) {
        this.room_id = room_id ? Number(room_id) : undefined;
        this.hotel_id = Number(hotel_id);
        this.room_number = room_number;
        this.room_type = room_type;
        this.room_status = room_status;
        this.capacity = Number(capacity);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined fields
        this.hotel_name = hotel_name;
    }

    /**
     * Map database row directly to Room Entity instance
     * @param {Object} row 
     * @returns {Room}
     */
    static fromRow(row) {
        if (!row) return null;
        return new Room({
            room_id: row.room_id,
            hotel_id: row.hotel_id,
            room_number: row.room_number,
            room_type: row.room_type,
            room_status: row.room_status,
            capacity: row.capacity,
            created_at: row.created_at,
            updated_at: row.updated_at,
            hotel_name: row.hotel_name
        });
    }
}

module.exports = Room;
