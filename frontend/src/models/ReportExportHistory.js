/**
 * ReportExportHistory Entity Model
 */
class ReportExportHistory {
    constructor({
        id,
        company_id,
        report_id = null,
        export_type,
        file_url,
        performed_by = null,
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.report_id = report_id ? Number(report_id) : null;
        this.export_type = export_type;
        this.file_url = file_url;
        this.performed_by = performed_by ? Number(performed_by) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new ReportExportHistory({
            id: row.id,
            company_id: row.company_id,
            report_id: row.report_id,
            export_type: row.export_type,
            file_url: row.file_url,
            performed_by: row.performed_by,
            created_at: row.created_at
        });
    }
}

module.exports = ReportExportHistory;
