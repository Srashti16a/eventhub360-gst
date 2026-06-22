/**
 * ChefPrepSchedule Entity Model
 */
class ChefPrepSchedule {
    /**
     * @param {Object} params
     * @param {number} [params.schedule_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.event_id
     * @param {number} params.menu_item_id
     * @param {string} [params.prep_start_time]
     * @param {number} [params.special_request_count]
     * @param {'Adequate' | 'Low' | 'Critical'} [params.inventory_status]
     * @param {string} [params.stock_alert_item]
     * @param {string} [params.notes]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * @param {number} [params.created_by]
     * @param {number} [params.updated_by]
     * 
     * // Optional joined fields
     * @param {string} [params.menu_item_name]
     * @param {string} [params.menu_item_dietary_category]
     */
    constructor({
        schedule_id,
        company_id,
        branch_id = null,
        event_id,
        menu_item_id,
        prep_start_time = '06:00 AM',
        special_request_count = 0,
        inventory_status = 'Adequate',
        stock_alert_item = null,
        notes = null,
        created_at,
        updated_at,
        created_by = null,
        updated_by = null,
        menu_item_name = null,
        menu_item_dietary_category = null
    }) {
        this.schedule_id = schedule_id ? Number(schedule_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.event_id = Number(event_id);
        this.menu_item_id = Number(menu_item_id);
        this.prep_start_time = prep_start_time;
        this.special_request_count = Number(special_request_count);
        this.inventory_status = inventory_status;
        this.stock_alert_item = stock_alert_item;
        this.notes = notes;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
        this.updated_by = updated_by ? Number(updated_by) : null;

        // Joined properties
        this.menu_item_name = menu_item_name;
        this.menu_item_dietary_category = menu_item_dietary_category;
    }

    /**
     * Map database row directly to ChefPrepSchedule Entity instance
     * @param {Object} row 
     * @returns {ChefPrepSchedule}
     */
    static fromRow(row) {
        if (!row) return null;
        return new ChefPrepSchedule({
            schedule_id: row.schedule_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            event_id: row.event_id,
            menu_item_id: row.menu_item_id,
            prep_start_time: row.prep_start_time,
            special_request_count: row.special_request_count,
            inventory_status: row.inventory_status,
            stock_alert_item: row.stock_alert_item,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by,
            menu_item_name: row.menu_item_name,
            menu_item_dietary_category: row.menu_item_dietary_category
        });
    }
}

module.exports = ChefPrepSchedule;
