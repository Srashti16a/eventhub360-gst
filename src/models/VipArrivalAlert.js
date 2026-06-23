/**
 * VipArrivalAlert Entity Model
 */
class VipArrivalAlert {
    /**
     * @param {Object} params
     * @param {number} [params.alert_id]
     * @param {number} params.guest_id
     * @param {number} params.event_id
     * @param {Date|string} [params.arrival_time]
     * @param {'Unread' | 'Read' | 'Dismissed'} [params.alert_status]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     * @param {string} [params.table_number]
     * @param {string} [params.gate_name]
     */
    constructor({
        alert_id,
        guest_id,
        event_id,
        arrival_time,
        alert_status = 'Unread',
        guest_name = null,
        guest_category = null,
        table_number = null,
        gate_name = null
    }) {
        this.alert_id = alert_id ? Number(alert_id) : undefined;
        this.guest_id = Number(guest_id);
        this.event_id = Number(event_id);
        this.arrival_time = arrival_time ? new Date(arrival_time) : undefined;
        this.alert_status = alert_status;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_category = guest_category;
        this.table_number = table_number;
        this.gate_name = gate_name;
    }

    /**
     * Map database row directly to VipArrivalAlert Entity instance
     * @param {Object} row 
     * @returns {VipArrivalAlert}
     */
    static fromRow(row) {
        if (!row) return null;
        return new VipArrivalAlert({
            alert_id: row.alert_id,
            guest_id: row.guest_id,
            event_id: row.event_id,
            arrival_time: row.arrival_time,
            alert_status: row.alert_status,
            guest_name: row.guest_name,
            guest_category: row.guest_category,
            table_number: row.table_number,
            gate_name: row.gate_name
        });
    }
}

module.exports = VipArrivalAlert;
