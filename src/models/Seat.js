/**
 * Seat Entity Model
 */
class Seat {
    /**
     * @param {Object} params
     * @param {number} [params.seat_id]
     * @param {number} params.table_id
     * @param {number} params.seat_number
     * @param {number} [params.offset_x]
     * @param {number} [params.offset_y]
     * @param {boolean} [params.is_blocked]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        seat_id,
        table_id,
        seat_number,
        offset_x = 0.00,
        offset_y = 0.00,
        is_blocked = false,
        created_at
    }) {
        this.seat_id = seat_id ? Number(seat_id) : undefined;
        this.table_id = Number(table_id);
        this.seat_number = Number(seat_number);
        this.offset_x = Number(offset_x);
        this.offset_y = Number(offset_y);
        this.is_blocked = Boolean(is_blocked);
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to Seat Entity instance
     * @param {Object} row 
     * @returns {Seat}
     */
    static fromRow(row) {
        if (!row) return null;
        return new Seat({
            seat_id: row.seat_id,
            table_id: row.table_id,
            seat_number: row.seat_number,
            offset_x: row.offset_x,
            offset_y: row.offset_y,
            is_blocked: row.is_blocked,
            created_at: row.created_at
        });
    }
}

module.exports = Seat;
