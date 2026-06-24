/**
 * SeatingZone Entity Model
 */
class SeatingZone {
    /**
     * @param {Object} params
     * @param {number} [params.zone_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.layout_id
     * @param {string} params.name
     * @param {string} [params.color_code]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        zone_id,
        company_id,
        branch_id = null,
        layout_id,
        name,
        color_code = '#E2E8F0',
        created_at,
        updated_at
    }) {
        this.zone_id = zone_id ? Number(zone_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.layout_id = Number(layout_id);
        this.name = name;
        this.color_code = color_code;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to SeatingZone Entity instance
     * @param {Object} row 
     * @returns {SeatingZone}
     */
    static fromRow(row) {
        if (!row) return null;
        return new SeatingZone({
            zone_id: row.zone_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            layout_id: row.layout_id,
            name: row.name,
            color_code: row.color_code,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = SeatingZone;
