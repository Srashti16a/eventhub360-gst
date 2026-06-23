/**
 * Hotel Entity Model
 */
class Hotel {
    /**
     * @param {Object} params
     * @param {number} [params.hotel_id]
     * @param {string} params.hotel_name
     * @param {string} params.hotel_type
     * @param {string} params.address
     * @param {number} [params.total_rooms]
     * @param {number} [params.available_rooms]
     * @param {number} [params.occupancy_percentage]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        hotel_id,
        hotel_name,
        hotel_type,
        address,
        total_rooms = 0,
        available_rooms = 0,
        occupancy_percentage = 0.00,
        created_at,
        updated_at
    }) {
        this.hotel_id = hotel_id ? Number(hotel_id) : undefined;
        this.hotel_name = hotel_name;
        this.hotel_type = hotel_type;
        this.address = address;
        this.total_rooms = Number(total_rooms);
        this.available_rooms = Number(available_rooms);
        this.occupancy_percentage = Number(Number(occupancy_percentage).toFixed(2));
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Dynamic calculations helper: computes occupancy percentage locally
     */
    recalculateOccupancy() {
        if (this.total_rooms === 0) {
            this.occupancy_percentage = 0.00;
            return;
        }
        const occupied = this.total_rooms - this.available_rooms;
        this.occupancy_percentage = Number(((occupied / this.total_rooms) * 100).toFixed(2));
    }

    /**
     * Map database row directly to Hotel Entity instance
     * @param {Object} row 
     * @returns {Hotel}
     */
    static fromRow(row) {
        if (!row) return null;
        return new Hotel({
            hotel_id: row.hotel_id,
            hotel_name: row.hotel_name,
            hotel_type: row.hotel_type,
            address: row.address,
            total_rooms: row.total_rooms,
            available_rooms: row.available_rooms,
            occupancy_percentage: row.occupancy_percentage,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = Hotel;
