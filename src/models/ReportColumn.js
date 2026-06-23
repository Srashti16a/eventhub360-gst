/**
 * ReportColumn Entity Model
 */
class ReportColumn {
    constructor({
        id,
        template_id,
        column_name,
        display_label,
        column_order = 0
    }) {
        this.id = id ? Number(id) : undefined;
        this.template_id = Number(template_id);
        this.column_name = column_name;
        this.display_label = display_label;
        this.column_order = Number(column_order);
    }

    static fromRow(row) {
        if (!row) return null;
        return new ReportColumn({
            id: row.id,
            template_id: row.template_id,
            column_name: row.column_name,
            display_label: row.display_label,
            column_order: row.column_order
        });
    }
}

module.exports = ReportColumn;
