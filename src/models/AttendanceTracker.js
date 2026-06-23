/**
 * AttendanceTracker Entity Model
 */
class AttendanceTracker {
    /**
     * @param {Object} params
     * @param {number} [params.tracker_id]
     * @param {number} params.event_id
     * @param {number} [params.expected_guests]
     * @param {number} [params.checked_in_guests]
     * @param {number} [params.vip_checked_in]
     * @param {number} [params.occupancy_percentage]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        tracker_id,
        event_id,
        expected_guests = 0,
        checked_in_guests = 0,
        vip_checked_in = 0,
        occupancy_percentage = 0.00,
        updated_at
    }) {
        this.tracker_id = tracker_id ? Number(tracker_id) : undefined;
        this.event_id = Number(event_id);
        this.expected_guests = Number(expected_guests);
        this.checked_in_guests = Number(checked_in_guests);
        this.vip_checked_in = Number(vip_checked_in);
        this.occupancy_percentage = Number(occupancy_percentage);
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to AttendanceTracker Entity instance
     * @param {Object} row 
     * @returns {AttendanceTracker}
     */
    static fromRow(row) {
        if (!row) return null;
        return new AttendanceTracker({
            tracker_id: row.tracker_id,
            event_id: row.event_id,
            expected_guests: row.expected_guests,
            checked_in_guests: row.checked_in_guests,
            vip_checked_in: row.vip_checked_in,
            occupancy_percentage: row.occupancy_percentage,
            updated_at: row.updated_at
        });
    }
}

module.exports = AttendanceTracker;
