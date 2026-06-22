/**
 * AccommodationReport Entity Model
 */
class AccommodationReport {
    /**
     * @param {Object} params
     * @param {number} [params.report_id]
     * @param {string} params.report_type
     * @param {number} params.generated_by
     * @param {Date|string} [params.generated_at]
     * @param {string} params.file_url
     */
    constructor({
        report_id,
        report_type,
        generated_by,
        generated_at,
        file_url
    }) {
        this.report_id = report_id ? Number(report_id) : undefined;
        this.report_type = report_type;
        this.generated_by = Number(generated_by);
        this.generated_at = generated_at ? new Date(generated_at) : undefined;
        this.file_url = file_url;
    }

    /**
     * Map database row directly to AccommodationReport Entity instance
     * @param {Object} row 
     * @returns {AccommodationReport}
     */
    static fromRow(row) {
        if (!row) return null;
        return new AccommodationReport({
            report_id: row.report_id,
            report_type: row.report_type,
            generated_by: row.generated_by,
            generated_at: row.generated_at,
            file_url: row.file_url
        });
    }
}

module.exports = AccommodationReport;
