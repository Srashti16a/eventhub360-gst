/**
 * ArrivalDepartureSchedule Entity Model
 */
class ArrivalDepartureSchedule {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.guest_id
     * @param {number} params.event_id
     * @param {'Airport Pickup' | 'Airport Dropoff' | 'Hotel Transfer' | 'VIP Transport' | 'Other'} params.transfer_type
     * @param {string} params.pickup_location
     * @param {string} params.dropoff_location
     * @param {Date|string} params.scheduled_time
     * @param {number} [params.route_id]
     * @param {number} [params.vehicle_id]
     * @param {number} [params.driver_id]
     * @param {'Scheduled' | 'In Transit' | 'Completed' | 'Cancelled'} [params.status]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Joined details
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     * @param {string} [params.event_name]
     * @param {string} [params.route_name]
     * @param {string} [params.vehicle_name]
     * @param {string} [params.driver_name]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        guest_id,
        event_id,
        transfer_type,
        pickup_location,
        dropoff_location,
        scheduled_time,
        route_id = null,
        vehicle_id = null,
        driver_id = null,
        status = 'Scheduled',
        created_at,
        updated_at,
        guest_name = null,
        guest_category = null,
        event_name = null,
        route_name = null,
        vehicle_name = null,
        driver_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.guest_id = Number(guest_id);
        this.event_id = Number(event_id);
        this.transfer_type = transfer_type;
        this.pickup_location = pickup_location;
        this.dropoff_location = dropoff_location;
        this.scheduled_time = scheduled_time ? new Date(scheduled_time) : undefined;
        this.route_id = route_id ? Number(route_id) : null;
        this.vehicle_id = vehicle_id ? Number(vehicle_id) : null;
        this.driver_id = driver_id ? Number(driver_id) : null;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_category = guest_category;
        this.event_name = event_name;
        this.route_name = route_name;
        this.vehicle_name = vehicle_name;
        this.driver_name = driver_name;
    }

    /**
     * Map database row directly to ArrivalDepartureSchedule instance
     * @param {Object} row 
     * @returns {ArrivalDepartureSchedule}
     */
    static fromRow(row) {
        if (!row) return null;
        return new ArrivalDepartureSchedule({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            guest_id: row.guest_id,
            event_id: row.event_id,
            transfer_type: row.transfer_type,
            pickup_location: row.pickup_location,
            dropoff_location: row.dropoff_location,
            scheduled_time: row.scheduled_time,
            route_id: row.route_id,
            vehicle_id: row.vehicle_id,
            driver_id: row.driver_id,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            guest_name: row.guest_name,
            guest_category: row.guest_category,
            event_name: row.event_name,
            route_name: row.route_name,
            vehicle_name: row.vehicle_name,
            driver_name: row.driver_name
        });
    }
}

module.exports = ArrivalDepartureSchedule;
