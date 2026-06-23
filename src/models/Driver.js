/**
 * Driver Entity Model
 */
class Driver {
    /**
     * @param {Object} params
     * @param {number} [params.driver_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {string} params.full_name
     * @param {string} params.phone_number
     * @param {'Available' | 'Active' | 'Off Duty'} [params.status]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        driver_id,
        company_id,
        branch_id = null,
        full_name,
        phone_number,
        status = 'Available',
        created_at,
        updated_at
    }) {
        this.driver_id = driver_id ? Number(driver_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.full_name = full_name;
        this.phone_number = phone_number;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to Driver Entity instance
     * @param {Object} row 
     * @returns {Driver}
     */
    static fromRow(row) {
        if (!row) return null;
        return new Driver({
            driver_id: row.driver_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            full_name: row.full_name,
            phone_number: row.phone_number,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = Driver;
