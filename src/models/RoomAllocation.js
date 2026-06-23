/**
 * RoomAllocation Entity Model
 */
class RoomAllocation {
    /**
     * @param {Object} params
     * @param {number} [params.allocation_id]
     * @param {number} params.room_id
     * @param {number} params.guest_id
     * @param {number} [params.reservation_id]
     * @param {'Assigned' | 'Reserved' | 'Checked In' | 'Checked Out'} [params.allocation_status]
     * @param {number} params.assigned_by
     * @param {Date|string} [params.assigned_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Optional joined fields for dashboard matrix elements
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     * @param {string} [params.guest_phone]
     * @param {string} [params.room_number]
     * @param {string} [params.room_type]
     * @param {string} [params.hotel_name]
     * @param {Date|string} [params.check_in_date]
     * @param {Date|string} [params.check_out_date]
     */
    constructor({
        allocation_id,
        room_id,
        guest_id,
        reservation_id = null,
        allocation_status = 'Assigned',
        assigned_by,
        assigned_at,
        updated_at,
        guest_name = null,
        guest_category = null,
        guest_phone = null,
        room_number = null,
        room_type = null,
        hotel_name = null,
        check_in_date = null,
        check_out_date = null
    }) {
        this.allocation_id = allocation_id ? Number(allocation_id) : undefined;
        this.room_id = Number(room_id);
        this.guest_id = Number(guest_id);
        this.reservation_id = reservation_id ? Number(reservation_id) : null;
        this.allocation_status = allocation_status;
        this.assigned_by = Number(assigned_by);
        this.assigned_at = assigned_at ? new Date(assigned_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_category = guest_category;
        this.guest_phone = guest_phone;
        this.room_number = room_number;
        this.room_type = room_type;
        this.hotel_name = hotel_name;
        this.check_in_date = check_in_date ? new Date(check_in_date) : null;
        this.check_out_date = check_out_date ? new Date(check_out_date) : null;
    }

    /**
     * Map database row directly to RoomAllocation Entity instance
     * @param {Object} row 
     * @returns {RoomAllocation}
     */
    static fromRow(row) {
        if (!row) return null;
        return new RoomAllocation({
            allocation_id: row.allocation_id,
            room_id: row.room_id,
            guest_id: row.guest_id,
            reservation_id: row.reservation_id,
            allocation_status: row.allocation_status,
            assigned_by: row.assigned_by,
            assigned_at: row.assigned_at,
            updated_at: row.updated_at,
            guest_name: row.guest_name,
            guest_category: row.guest_category,
            guest_phone: row.guest_phone,
            room_number: row.room_number,
            room_type: row.room_type,
            hotel_name: row.hotel_name,
            check_in_date: row.check_in_date,
            check_out_date: row.check_out_date
        });
    }
}

module.exports = RoomAllocation;
