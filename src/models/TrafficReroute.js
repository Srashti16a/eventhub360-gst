/**
 * TrafficReroute Entity Model
 */
class TrafficReroute {
    constructor({
        id,
        company_id,
        channel,
        from_gateway,
        to_gateway,
        reroute_reason = null,
        rerouted_at,
        is_active = true
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.channel = channel;
        this.from_gateway = from_gateway;
        this.to_gateway = to_gateway;
        this.reroute_reason = reroute_reason;
        this.rerouted_at = rerouted_at ? new Date(rerouted_at) : undefined;
        this.is_active = !!is_active;
    }

    static fromRow(row) {
        if (!row) return null;
        return new TrafficReroute({
            id: row.id,
            company_id: row.company_id,
            channel: row.channel,
            from_gateway: row.from_gateway,
            to_gateway: row.to_gateway,
            reroute_reason: row.reroute_reason,
            rerouted_at: row.rerouted_at,
            is_active: row.is_active
        });
    }
}

module.exports = TrafficReroute;
