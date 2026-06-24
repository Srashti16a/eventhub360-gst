/**
 * GuestAllergy Entity Model
 */
class GuestAllergy {
    /**
     * @param {Object} params
     * @param {number} [params.guest_allergy_id]
     * @param {number} params.company_id
     * @param {number} params.guest_id
     * @param {'Nuts' | 'Shellfish' | 'Dairy' | 'Soy' | 'Egg' | 'Gluten' | 'Other'} params.allergen_name
     * @param {'Mild' | 'Moderate' | 'Severe'} [params.severity]
     * @param {string} [params.notes]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        guest_allergy_id,
        company_id,
        guest_id,
        allergen_name,
        severity = 'Mild',
        notes = null,
        created_at
    }) {
        this.guest_allergy_id = guest_allergy_id ? Number(guest_allergy_id) : undefined;
        this.company_id = Number(company_id);
        this.guest_id = Number(guest_id);
        this.allergen_name = allergen_name;
        this.severity = severity;
        this.notes = notes;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to GuestAllergy Entity instance
     * @param {Object} row 
     * @returns {GuestAllergy}
     */
    static fromRow(row) {
        if (!row) return null;
        return new GuestAllergy({
            guest_allergy_id: row.guest_allergy_id,
            company_id: row.company_id,
            guest_id: row.guest_id,
            allergen_name: row.allergen_name,
            severity: row.severity,
            notes: row.notes,
            created_at: row.created_at
        });
    }
}

module.exports = GuestAllergy;
