/**
 * AttendanceTrend Entity Model
 */
class AttendanceTrend {
    constructor({
        id,
        company_id,
        event_id,
        time_bucket,
        checkin_count = 0,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.time_bucket = time_bucket;
        this.checkin_count = Number(checkin_count);
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new AttendanceTrend({
            id: row.id,
            company_id: row.company_id,
            event_id: row.event_id,
            time_bucket: row.time_bucket,
            checkin_count: row.checkin_count,
            updated_at: row.updated_at
        });
    }
}

module.exports = AttendanceTrend;
