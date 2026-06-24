/**
 * PrinterAlert Entity Model
 */
class PrinterAlert {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.printer_id
     * @param {string} params.alert_type
     * @param {'Info' | 'Warning' | 'Critical'} params.severity
     * @param {string} params.message
     * @param {'Active' | 'Resolved' | 'Dismissed'} [params.status]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.printer_name]
     */
    constructor({
        id,
        company_id,
        printer_id,
        alert_type,
        severity,
        message,
        status = 'Active',
        created_at,
        printer_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.printer_id = Number(printer_id);
        this.alert_type = alert_type;
        this.severity = severity;
        this.message = message;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.printer_name = printer_name;
    }

    /**
     * Map database row directly to PrinterAlert Entity instance
     * @param {Object} row 
     * @returns {PrinterAlert}
     */
    static fromRow(row) {
        if (!row) return null;
        return new PrinterAlert({
            id: row.id,
            company_id: row.company_id,
            printer_id: row.printer_id,
            alert_type: row.alert_type,
            severity: row.severity,
            message: row.message,
            status: row.status,
            created_at: row.created_at,
            printer_name: row.printer_name
        });
    }
}

module.exports = PrinterAlert;
