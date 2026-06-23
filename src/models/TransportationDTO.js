/**
 * Transportation DTO Layer
 */

class FleetAssignmentResponseDTO {
    constructor(assignment) {
        if (!assignment) return;
        this.id = assignment.id;
        this.company_id = assignment.company_id;
        this.branch_id = assignment.branch_id;
        this.vehicle_id = assignment.vehicle_id;
        this.driver_id = assignment.driver_id;
        this.event_id = assignment.event_id;
        this.status = assignment.status;
        this.assigned_at = assignment.assigned_at ? assignment.assigned_at.toISOString() : null;
        this.updated_at = assignment.updated_at ? assignment.updated_at.toISOString() : null;
        
        // Joined details
        this.vehicle_name = assignment.vehicle_name;
        this.driver_name = assignment.driver_name;
        this.event_name = assignment.event_name;
    }
}

class TransportRouteResponseDTO {
    constructor(route) {
        if (!route) return;
        this.id = route.id;
        this.company_id = route.company_id;
        this.branch_id = route.branch_id;
        this.route_name = route.route_name;
        this.start_location = route.start_location;
        this.end_location = route.end_location;
        this.distance_km = Number(route.distance_km);
        this.duration_mins = Number(route.duration_mins);
        this.status = route.status;
        this.optimized_at = route.optimized_at ? route.optimized_at.toISOString() : null;
        this.created_at = route.created_at ? route.created_at.toISOString() : null;
        this.updated_at = route.updated_at ? route.updated_at.toISOString() : null;
    }
}

class ArrivalDepartureScheduleResponseDTO {
    constructor(schedule) {
        if (!schedule) return;
        this.id = schedule.id;
        this.company_id = schedule.company_id;
        this.branch_id = schedule.branch_id;
        this.guest_id = schedule.guest_id;
        this.event_id = schedule.event_id;
        this.transfer_type = schedule.transfer_type;
        this.pickup_location = schedule.pickup_location;
        this.dropoff_location = schedule.dropoff_location;
        this.scheduled_time = schedule.scheduled_time ? schedule.scheduled_time.toISOString() : null;
        this.route_id = schedule.route_id;
        this.vehicle_id = schedule.vehicle_id;
        this.driver_id = schedule.driver_id;
        this.status = schedule.status;
        this.created_at = schedule.created_at ? schedule.created_at.toISOString() : null;
        this.updated_at = schedule.updated_at ? schedule.updated_at.toISOString() : null;

        // Joined details
        this.guest_name = schedule.guest_name;
        this.guest_category = schedule.guest_category;
        this.event_name = schedule.event_name;
        this.route_name = schedule.route_name;
        this.vehicle_name = schedule.vehicle_name;
        this.driver_name = schedule.driver_name;
    }
}

class FleetActivityLogResponseDTO {
    constructor(log) {
        if (!log) return;
        this.id = log.id;
        this.company_id = log.company_id;
        this.branch_id = log.branch_id;
        this.activity_type = log.activity_type;
        this.severity = log.severity;
        this.message = log.message;
        this.vehicle_id = log.vehicle_id;
        this.driver_id = log.driver_id;
        this.created_at = log.created_at ? log.created_at.toISOString() : null;

        // Joined details
        this.vehicle_name = log.vehicle_name;
        this.driver_name = log.driver_name;
    }
}

class VehicleMaintenanceResponseDTO {
    constructor(maintenance) {
        if (!maintenance) return;
        this.id = maintenance.id;
        this.company_id = maintenance.company_id;
        this.branch_id = maintenance.branch_id;
        this.vehicle_id = maintenance.vehicle_id;
        this.maintenance_type = maintenance.maintenance_type;
        this.description = maintenance.description;
        this.scheduled_date = maintenance.scheduled_date ? (typeof maintenance.scheduled_date === 'string' ? maintenance.scheduled_date : maintenance.scheduled_date.toISOString().split('T')[0]) : null;
        this.completed_date = maintenance.completed_date ? (typeof maintenance.completed_date === 'string' ? maintenance.completed_date : maintenance.completed_date.toISOString().split('T')[0]) : null;
        this.status = maintenance.status;
        this.cost = Number(maintenance.cost);
        this.created_at = maintenance.created_at ? maintenance.created_at.toISOString() : null;
        this.updated_at = maintenance.updated_at ? maintenance.updated_at.toISOString() : null;

        // Joined details
        this.vehicle_name = maintenance.vehicle_name;
        this.license_number = maintenance.license_number;
    }
}

class FleetAnalyticsResponseDTO {
    constructor(analytics) {
        if (!analytics) return;
        this.id = analytics.id;
        this.company_id = analytics.company_id;
        this.branch_id = analytics.branch_id;
        this.event_id = analytics.event_id;
        this.total_vehicles = Number(analytics.total_vehicles);
        this.active_drivers = Number(analytics.active_drivers);
        this.on_route_vehicles = Number(analytics.on_route_vehicles);
        this.efficiency_rating = Number(analytics.efficiency_rating);
        this.recorded_date = analytics.recorded_date ? (typeof analytics.recorded_date === 'string' ? analytics.recorded_date : analytics.recorded_date.toISOString().split('T')[0]) : null;
        this.created_at = analytics.created_at ? analytics.created_at.toISOString() : null;

        // Joined details
        this.event_name = analytics.event_name;
    }
}

class DashboardOverviewResponseDTO {
    constructor({ total_vehicles, active_drivers, on_route_vehicles, efficiency_rating }) {
        this.total_vehicles = total_vehicles || 0;
        this.active_drivers = active_drivers || 0;
        this.on_route_vehicles = on_route_vehicles || 0;
        this.efficiency_rating = efficiency_rating !== undefined ? Number(efficiency_rating) : 0.0;
    }
}

module.exports = {
    FleetAssignmentResponseDTO,
    TransportRouteResponseDTO,
    ArrivalDepartureScheduleResponseDTO,
    FleetActivityLogResponseDTO,
    VehicleMaintenanceResponseDTO,
    FleetAnalyticsResponseDTO,
    DashboardOverviewResponseDTO
};
