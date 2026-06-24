/**
 * VipAllocation Entity Model
 */
class VipAllocation {
    /**
     * @param {Object} params
     * @param {number} [params.allocation_id]
     * @param {number} params.guest_id
     * @param {number} params.hotel_id
     * @param {number} [params.room_id]
     * @param {'Assigned' | 'Pending'} [params.allocation_status]
     * @param {Date|string} [params.assigned_at]
     * 
     * // Optional joined fields
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_phone]
     * @param {string} [params.hotel_name]
     * @param {string} [params.room_number]
     * @param {string} [params.room_type]
     */
    constructor({
        allocation_id,
        guest_id,
        hotel_id,
        room_id = null,
        allocation_status = 'Pending',
        assigned_at,
        guest_name = null,
        guest_phone = null,
        hotel_name = null,
        room_number = null,
        room_type = null
    }) {
        this.allocation_id = allocation_id ? Number(allocation_id) : undefined;
        this.guest_id = Number(guest_id);
        this.hotel_id = Number(hotel_id);
        this.room_id = room_id ? Number(room_id) : null;
        this.allocation_status = allocation_status;
        this.assigned_at = assigned_at ? new Date(assigned_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_phone = guest_phone;
        this.hotel_name = hotel_name;
        this.room_number = room_number;
        this.room_type = room_type;
    }

    /**
     * Map database row directly to VipAllocation Entity instance
     * @param {Object} row 
     * @returns {VipAllocation}
     */
    static fromRow(row) {
        if (!row) return null;
        return new VipAllocation({
            allocation_id: row.allocation_id,
            guest_id: row.guest_id,
            hotel_id: row.hotel_id,
            room_id: row.room_id,
            allocation_status: row.allocation_status,
            assigned_at: row.assigned_at,
            guest_name: row.guest_name,
            guest_phone: row.guest_phone,
            hotel_name: row.hotel_name,
            room_number: row.room_number,
            room_type: row.room_type
        });
    }
}

module.exports = VipAllocation;
