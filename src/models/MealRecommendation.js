/**
 * MealRecommendation Entity Model
 */
class MealRecommendation {
    /**
     * @param {Object} params
     * @param {number} [params.suggestion_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.event_id
     * @param {'Dietary Trend' | 'Menu Optimization' | 'Allergy Risk Warning' | 'Smart Catering'} params.recommendation_type
     * @param {string} params.message
     * @param {Object} [params.recommendation_metadata]
     * @param {'Active' | 'Applied' | 'Dismissed'} [params.status]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.applied_at]
     * @param {number} [params.applied_by]
     */
    constructor({
        suggestion_id,
        company_id,
        branch_id = null,
        event_id,
        recommendation_type,
        message,
        recommendation_metadata = {},
        status = 'Active',
        created_at,
        applied_at = null,
        applied_by = null
    }) {
        this.suggestion_id = suggestion_id ? Number(suggestion_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.event_id = Number(event_id);
        this.recommendation_type = recommendation_type;
        this.message = message;
        this.recommendation_metadata = typeof recommendation_metadata === 'object' ? recommendation_metadata : {};
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.applied_at = applied_at ? new Date(applied_at) : null;
        this.applied_by = applied_by ? Number(applied_by) : null;
    }

    /**
     * Map database row directly to MealRecommendation Entity instance
     * @param {Object} row 
     * @returns {MealRecommendation}
     */
    static fromRow(row) {
        if (!row) return null;
        return new MealRecommendation({
            suggestion_id: row.suggestion_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            event_id: row.event_id,
            recommendation_type: row.recommendation_type,
            message: row.message,
            recommendation_metadata: row.recommendation_metadata,
            status: row.status,
            created_at: row.created_at,
            applied_at: row.applied_at,
            applied_by: row.applied_by
        });
    }
}

module.exports = MealRecommendation;
