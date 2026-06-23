/**
 * GuestDataSnapshot Entity Model
 */
class GuestDataSnapshot {
    constructor({
        id,
        report_id,
        guest_id,
        snapshot_data = {},
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.report_id = Number(report_id);
        this.guest_id = Number(guest_id);
        this.snapshot_data = typeof snapshot_data === 'string' ? JSON.parse(snapshot_data) : snapshot_data;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new GuestDataSnapshot({
            id: row.id,
            report_id: row.report_id,
            guest_id: row.guest_id,
            snapshot_data: row.snapshot_data,
            created_at: row.created_at
        });
    }
}

module.exports = GuestDataSnapshot;
