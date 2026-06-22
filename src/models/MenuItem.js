/**
 * MenuItem Entity Model
 */
class MenuItem {
    /**
     * @param {Object} params
     * @param {number} [params.menu_item_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} [params.event_id]
     * @param {string} params.name
     * @param {string} [params.description]
     * @param {'Vegan' | 'Vegetarian' | 'Non-Vegetarian' | 'Gluten-Free' | 'Keto' | 'Custom'} params.dietary_category
     * @param {string[]} [params.allergens]
     * @param {boolean} [params.is_daily_special]
     * @param {number} [params.price]
     * @param {boolean} [params.is_active]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * @param {number} [params.created_by]
     * @param {number} [params.updated_by]
     */
    constructor({
        menu_item_id,
        company_id,
        branch_id = null,
        event_id = null,
        name,
        description = null,
        dietary_category,
        allergens = [],
        is_daily_special = false,
        price = 0.00,
        is_active = true,
        created_at,
        updated_at,
        created_by = null,
        updated_by = null
    }) {
        this.menu_item_id = menu_item_id ? Number(menu_item_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.event_id = event_id ? Number(event_id) : null;
        this.name = name;
        this.description = description;
        this.dietary_category = dietary_category;
        this.allergens = Array.isArray(allergens) ? allergens : [];
        this.is_daily_special = Boolean(is_daily_special);
        this.price = Number(price);
        this.is_active = Boolean(is_active);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
        this.updated_by = updated_by ? Number(updated_by) : null;
    }

    /**
     * Map database row directly to MenuItem Entity instance
     * @param {Object} row 
     * @returns {MenuItem}
     */
    static fromRow(row) {
        if (!row) return null;
        return new MenuItem({
            menu_item_id: row.menu_item_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            event_id: row.event_id,
            name: row.name,
            description: row.description,
            dietary_category: row.dietary_category,
            allergens: row.allergens,
            is_daily_special: row.is_daily_special,
            price: row.price,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by
        });
    }
}

module.exports = MenuItem;
