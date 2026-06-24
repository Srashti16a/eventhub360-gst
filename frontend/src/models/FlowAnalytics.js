/**
 * FlowAnalytics Entity Model
 */
class FlowAnalytics {
    /**
     * @param {Object} params
     * @param {number} [params.analytics_id]
     * @param {number} params.event_id
     * @param {Date|string} params.time_slot
     * @param {number} [params.guest_count]
     * @param {number} [params.flow_rate]
     * @param {boolean} [params.peak_indicator]
     */
    constructor({
        analytics_id,
        event_id,
        time_slot,
        guest_count = 0,
        flow_rate = 0.00,
        peak_indicator = false
    }) {
        this.analytics_id = analytics_id ? Number(analytics_id) : undefined;
        this.event_id = Number(event_id);
        this.time_slot = new Date(time_slot);
        this.guest_count = Number(guest_count);
        this.flow_rate = Number(flow_rate);
        this.peak_indicator = Boolean(peak_indicator);
    }

    /**
     * Map database row directly to FlowAnalytics Entity instance
     * @param {Object} row 
     * @returns {FlowAnalytics}
     */
    static fromRow(row) {
        if (!row) return null;
        return new FlowAnalytics({
            analytics_id: row.analytics_id,
            event_id: row.event_id,
            time_slot: row.time_slot,
            guest_count: row.guest_count,
            flow_rate: row.flow_rate,
            peak_indicator: row.peak_indicator
        });
    }
}

module.exports = FlowAnalytics;
