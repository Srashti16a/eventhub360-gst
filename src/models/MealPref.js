/**
 * MealPref Entity Model
 */
class MealPref {
    /**
     * @param {Object} params
     * @param {number} [params.meal_pref_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.guest_id
     * @param {'Vegan' | 'Vegetarian' | 'Non-Vegetarian' | 'Gluten-Free' | 'Keto' | 'Custom'} [params.dietary_type]
     * @param {string} [params.custom_dietary_notes]
     * @param {string} [params.special_requests]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * @param {number} [params.created_by]
     * @param {number} [params.updated_by]
     * 
     * // Optional joined fields from guest & RSVP modules
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_email]
     * @param {string} [params.guest_category]
     */
    constructor({
        meal_pref_id,
        company_id,
        branch_id = null,
        guest_id,
        dietary_type = 'Non-Vegetarian',
        custom_dietary_notes = null,
        special_requests = null,
        created_at,
        updated_at,
        created_by = null,
        updated_by = null,
        guest_name = null,
        guest_email = null,
        guest_category = null
    }) {
        this.meal_pref_id = meal_pref_id ? Number(meal_pref_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.guest_id = Number(guest_id);
        this.dietary_type = dietary_type;
        this.custom_dietary_notes = custom_dietary_notes;
        this.special_requests = special_requests;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
        this.updated_by = updated_by ? Number(updated_by) : null;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_email = guest_email;
        this.guest_category = guest_category;
    }

    /**
     * Map database row directly to MealPref Entity instance
     * @param {Object} row 
     * @returns {MealPref}
     */
    static fromRow(row) {
        if (!row) return null;
        return new MealPref({
            meal_pref_id: row.meal_pref_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            guest_id: row.guest_id,
            dietary_type: row.dietary_type,
            custom_dietary_notes: row.custom_dietary_notes,
            special_requests: row.special_requests,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by,
            guest_name: row.guest_name,
            guest_email: row.guest_email,
            guest_category: row.guest_category
        });
    }
}

module.exports = MealPref;
