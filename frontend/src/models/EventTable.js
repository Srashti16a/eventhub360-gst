/**
 * EventTable Entity Model
 */
class EventTable {
    /**
     * @param {Object} params
     * @param {number} [params.table_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.layout_id
     * @param {number} [params.zone_id]
     * @param {string} params.table_number
     * @param {'Round' | 'Square' | 'Rectangle' | 'Long'} [params.shape]
     * @param {number} [params.capacity]
     * @param {boolean} [params.is_vip]
     * @param {number} [params.x_coordinate]
     * @param {number} [params.y_coordinate]
     * @param {number} [params.rotation]
     * @param {number} [params.width]
     * @param {number} [params.height]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Joined parameters
     * @param {string} [params.zone_name]
     * @param {string} [params.zone_color]
     */
    constructor({
        table_id,
        company_id,
        branch_id = null,
        layout_id,
        zone_id = null,
        table_number,
        shape = 'Round',
        capacity = 8,
        is_vip = false,
        x_coordinate = 0.00,
        y_coordinate = 0.00,
        rotation = 0.00,
        width = null,
        height = null,
        created_at,
        updated_at,
        zone_name = null,
        zone_color = null
    }) {
        this.table_id = table_id ? Number(table_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.layout_id = Number(layout_id);
        this.zone_id = zone_id ? Number(zone_id) : null;
        this.table_number = table_number;
        this.shape = shape;
        this.capacity = Number(capacity);
        this.is_vip = Boolean(is_vip);
        this.x_coordinate = Number(x_coordinate);
        this.y_coordinate = Number(y_coordinate);
        this.rotation = Number(rotation);
        this.width = width ? Number(width) : null;
        this.height = height ? Number(height) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.zone_name = zone_name;
        this.zone_color = zone_color;
    }

    /**
     * Map database row directly to EventTable Entity instance
     * @param {Object} row 
     * @returns {EventTable}
     */
    static fromRow(row) {
        if (!row) return null;
        return new EventTable({
            table_id: row.table_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            layout_id: row.layout_id,
            zone_id: row.zone_id,
            table_number: row.table_number,
            shape: row.shape,
            capacity: row.capacity,
            is_vip: row.is_vip,
            x_coordinate: row.x_coordinate,
            y_coordinate: row.y_coordinate,
            rotation: row.rotation,
            width: row.width,
            height: row.height,
            created_at: row.created_at,
            updated_at: row.updated_at,
            zone_name: row.zone_name,
            zone_color: row.zone_color
        });
    }
}

module.exports = EventTable;
