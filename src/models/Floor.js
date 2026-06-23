/**
 * Floor Entity Model
 */
class Floor {
    /**
     * @param {Object} params
     * @param {number} [params.floor_id]
     * @param {number} params.hotel_id
     * @param {string} params.floor_name
     * @param {number} params.floor_number
     * @param {number} [params.total_rooms]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        floor_id,
        hotel_id,
        floor_name,
        floor_number,
        total_rooms = 0,
        created_at,
        updated_at
    }) {
        this.floor_id = floor_id ? Number(floor_id) : undefined;
        this.hotel_id = Number(hotel_id);
        this.floor_name = floor_name;
        this.floor_number = Number(floor_number);
        this.total_rooms = Number(total_rooms);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
     }

     /**
      * Map database row directly to Floor Entity instance
      * @param {Object} row 
      * @returns {Floor}
      */
     static fromRow(row) {
         if (!row) return null;
         return new Floor({
             floor_id: row.floor_id,
             hotel_id: row.hotel_id,
             floor_name: row.floor_name,
             floor_number: row.floor_number,
             total_rooms: row.total_rooms,
             created_at: row.created_at,
             updated_at: row.updated_at
         });
     }
}

module.exports = Floor;
