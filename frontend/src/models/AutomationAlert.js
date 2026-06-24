/**
 * AutomationAlert Entity Model
 */
class AutomationAlert {
    constructor({
        id,
        company_id,
        alert_type,
        severity,
        message,
        status = 'Active',
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.alert_type = alert_type;
        this.severity = severity;
        this.message = message;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new AutomationAlert({
            id: row.id,
            company_id: row.company_id,
            alert_type: row.alert_type,
            severity: row.severity,
            message: row.message,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = AutomationAlert;
