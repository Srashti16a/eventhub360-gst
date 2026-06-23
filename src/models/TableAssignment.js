/**
 * TableAssignment Entity Model
 */
class TableAssignment {
    /**
     * @param {Object} params
     * @param {number} [params.assignment_id]
     * @param {number} params.company_id
     * @param {number} params.layout_id
     * @param {number} params.table_id
     * @param {number} [params.seat_id]
     * @param {number} params.guest_id
     * @param {number} params.assigned_by
     * @param {Date|string} [params.assigned_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     * @param {string} [params.table_number]
     * @param {number} [params.seat_number]
     */
    constructor({
        assignment_id,
        company_id,
        layout_id,
        table_id,
        seat_id = null,
        guest_id,
        assigned_by,
        assigned_at,
        guest_name = null,
        guest_category = null,
        table_number = null,
        seat_number = null
    }) {
        this.assignment_id = assignment_id ? Number(assignment_id) : undefined;
        this.company_id = Number(company_id);
        this.layout_id = Number(layout_id);
        this.table_id = Number(table_id);
        this.seat_id = seat_id ? Number(seat_id) : null;
        this.guest_id = Number(guest_id);
        this.assigned_by = Number(assigned_by);
        this.assigned_at = assigned_at ? new Date(assigned_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_category = guest_category;
        this.table_number = table_number;
        this.seat_number = seat_number ? Number(seat_number) : null;
    }

    /**
     * Map database row directly to TableAssignment Entity instance
     * @param {Object} row 
     * @returns {TableAssignment}
     */
    static fromRow(row) {
        if (!row) return null;
        return new TableAssignment({
            assignment_id: row.assignment_id,
            company_id: row.company_id,
            layout_id: row.layout_id,
            table_id: row.table_id,
            seat_id: row.seat_id,
            guest_id: row.guest_id,
            assigned_by: row.assigned_by,
            assigned_at: row.assigned_at,
            guest_name: row.guest_name,
            guest_category: row.guest_category,
            table_number: row.table_number,
            seat_number: row.seat_number
        });
    }
}

module.exports = TableAssignment;
