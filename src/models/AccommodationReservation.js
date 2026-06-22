/**
 * AccommodationReservation Entity Model
 */
class AccommodationReservation {
    /**
     * @param {Object} params
     * @param {number} [params.reservation_id]
     * @param {number} params.guest_id
     * @param {number} params.hotel_id
     * @param {number} [params.room_id]
     * @param {Date|string} params.check_in_date
     * @param {Date|string} params.check_out_date
     * @param {'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'} [params.reservation_status]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Optional joined fields for lists and detailed view responses
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_phone]
     * @param {string} [params.hotel_name]
     * @param {string} [params.room_number]
     */
    constructor({
        reservation_id,
        guest_id,
        hotel_id,
        room_id = null,
        check_in_date,
        check_out_date,
        reservation_status = 'Pending',
        created_at,
        updated_at,
        guest_name = null,
        guest_phone = null,
        hotel_name = null,
        room_number = null
    }) {
        this.reservation_id = reservation_id ? Number(reservation_id) : undefined;
        this.guest_id = Number(guest_id);
        this.hotel_id = Number(hotel_id);
        this.room_id = room_id ? Number(room_id) : null;
        this.check_in_date = check_in_date ? new Date(check_in_date) : undefined;
        this.check_out_date = check_out_date ? new Date(check_out_date) : undefined;
        this.reservation_status = reservation_status;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_phone = guest_phone;
        this.hotel_name = hotel_name;
        this.room_number = room_number;
    }

    /**
     * Map database row directly to AccommodationReservation Entity instance
     * @param {Object} row 
     * @returns {AccommodationReservation}
     */
    static fromRow(row) {
        if (!row) return null;
        return new AccommodationReservation({
            reservation_id: row.reservation_id,
            guest_id: row.guest_id,
            hotel_id: row.hotel_id,
            room_id: row.room_id,
            check_in_date: row.check_in_date,
            check_out_date: row.check_out_date,
            reservation_status: row.reservation_status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            guest_name: row.guest_name,
            guest_phone: row.guest_phone,
            hotel_name: row.hotel_name,
            room_number: row.room_number
        });
    }
}

module.exports = AccommodationReservation;
