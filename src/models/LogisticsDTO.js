/**
 * Logistics Matrix Data Transfer Objects (DTOs)
 */

class VehicleAllocationMatrixDTO {
    /**
     * @param {import('./Vehicle')} vehicle
     * @param {Object[]} assignedGuests - Guests allocated to this vehicle
     * @param {Object[]} conflictsList - Active conflicts linked to allocations in this vehicle
     */
    constructor(vehicle, assignedGuests = [], conflictsList = []) {
        this.vehicle_id = vehicle.vehicle_id;
        this.vehicle_name = vehicle.vehicle_name;
        this.vehicle_type = vehicle.vehicle_type;
        this.license_number = vehicle.license_number;
        this.capacity = vehicle.capacity;
        this.status = vehicle.status; // 'On Route', 'Staged', 'Maintenance', 'Available'
        
        this.driver = vehicle.driver_id ? {
            driver_id: vehicle.driver_id,
            full_name: vehicle.driver_name || 'Assigned Driver',
            phone_number: vehicle.driver_phone || ''
        } : null;

        this.assigned_guests = assignedGuests.map(g => ({
            guest_id: g.guest_id,
            guest_name: g.guest_name,
            guest_category: g.guest_category || 'Attendee', // VIP, Speaker, Staff, Attendee
            allocation_id: g.allocation_id,
            allocation_status: g.allocation_status,
            vip_placement: g.guest_category === 'VIP' || g.guest_category === 'Speaker'
        }));

        this.occupancy_count = this.assigned_guests.length;
        
        // Dynamic capacity indicators
        this.is_over_capacity = this.occupancy_count > this.capacity;
        
        // Conflict Warning indicators
        const vehicleConflicts = conflictsList.filter(c => c.vehicle_id === this.vehicle_id);
        this.has_conflict = vehicleConflicts.length > 0;
        this.conflict_warnings = vehicleConflicts.map(c => ({
            conflict_id: c.conflict_id,
            conflict_type: c.conflict_type,
            conflict_message: c.conflict_message
        }));
    }
}

class GuestQueueDTO {
    constructor(row) {
        this.guest_id = Number(row.guest_id);
        this.guest_name = row.guest_name;
        this.guest_category = row.guest_category || 'Attendee'; // VIP, Speaker, Staff, Attendee
        this.eta = row.eta ? new Date(row.eta).toISOString() : null; // matches ETA times e.g. 11:30 AM
        this.priority_level = row.priority_level || 'Standard'; // Critical, High, Standard, Low
        
        // Flight Delay Alerts Context
        this.flight_delay_minutes = row.flight_delay_minutes ? Number(row.flight_delay_minutes) : null;
        this.flight_delay_alert = row.flight_delay_minutes ? `Flight delayed by ${row.flight_delay_minutes} mins` : null;
        
        this.is_waitlisted = Boolean(row.is_waitlisted);
        this.notes = row.notes || null;
    }
}

// ==========================================
// VEHICLE DTOs
// ==========================================
class VehicleRequestDTO {
    constructor(data) {
        this.vehicle_name = data.vehicle_name;
        this.vehicle_type = data.vehicle_type;
        this.license_number = data.license_number;
        this.capacity = Number(data.capacity);
        this.status = data.status || 'Available';
        this.driver_id = data.driver_id ? Number(data.driver_id) : null;
    }
}

class VehicleResponseDTO {
    /**
     * @param {import('./Vehicle')} vehicle
     */
    constructor(vehicle) {
        this.vehicle_id = vehicle.vehicle_id;
        this.vehicle_name = vehicle.vehicle_name;
        this.vehicle_type = vehicle.vehicle_type;
        this.license_number = vehicle.license_number;
        this.capacity = vehicle.capacity;
        this.status = vehicle.status;
        this.driver_id = vehicle.driver_id;
        this.created_at = vehicle.created_at ? vehicle.created_at.toISOString() : null;
        this.updated_at = vehicle.updated_at ? vehicle.updated_at.toISOString() : null;
    }
}

// ==========================================
// ALLOCATION DTOs
// ==========================================
class GuestTransportAllocationRequestDTO {
    constructor(data) {
        this.guest_id = Number(data.guest_id);
        this.vehicle_id = Number(data.vehicle_id);
        this.allocation_status = data.allocation_status || 'Assigned';
    }
}

class GuestTransportAllocationResponseDTO {
    /**
     * @param {import('./GuestTransportAllocation')} gta
     */
    constructor(gta) {
        this.allocation_id = gta.allocation_id;
        this.guest_id = gta.guest_id;
        this.guest_name = gta.guest_name || 'Guest ID #' + gta.guest_id;
        this.guest_category = gta.guest_category || 'Attendee';
        this.vehicle_id = gta.vehicle_id;
        this.vehicle_name = gta.vehicle_name || 'Vehicle ID #' + gta.vehicle_id;
        this.allocation_status = gta.allocation_status;
        this.assigned_at = gta.assigned_at ? gta.assigned_at.toISOString() : null;
    }
}

// ==========================================
// CONFLICT DTOs
// ==========================================
class ConflictResponseDTO {
    /**
     * @param {import('./TransportConflict')} tc
     */
    constructor(tc) {
        this.conflict_id = tc.conflict_id;
        this.allocation_id = tc.allocation_id;
        this.guest_name = tc.guest_name;
        this.vehicle_name = tc.vehicle_name;
        this.conflict_type = tc.conflict_type; // 'Capacity Conflict', 'Timing Conflict', 'Route Conflict'
        this.conflict_message = tc.conflict_message;
        this.status = tc.status; // 'Unresolved', 'Resolved'
        this.created_at = tc.created_at ? tc.created_at.toISOString() : null;
    }
}

// ==========================================
// ROUTE OPTIMIZATION DTOs
// ==========================================
class RouteOptimizationResultDTO {
    /**
     * @param {import('./RouteOptimizationLog')} log
     */
    constructor(log) {
        this.log_id = log.log_id;
        this.vehicle_id = log.vehicle_id;
        this.optimized_route_details = log.optimization_result;
        this.generated_by = log.generated_by;
        this.created_at = log.created_at ? log.created_at.toISOString() : null;
    }
}

// ==========================================
// WAITLIST DTOs
// ==========================================
class WaitlistResponseDTO {
    /**
     * @param {import('./WaitlistGuest')} wg
     */
    constructor(wg) {
        this.waitlist_id = wg.waitlist_id;
        this.guest_id = wg.guest_id;
        this.guest_name = wg.guest_name || 'Guest ID #' + wg.guest_id;
        this.guest_category = wg.guest_category || 'Attendee';
        this.priority_level = wg.priority_level;
        this.eta = wg.eta ? wg.eta.toISOString() : null;
        this.notes = wg.notes;
        this.created_at = wg.created_at ? wg.created_at.toISOString() : null;
    }
}

// ==========================================
// METRICS STATISTICS DTO
// ==========================================
class FleetStatisticsDTO {
    constructor(stats) {
        this.totalVehicles = Number(stats.total_vehicles || 0);
        this.unassignedGuests = Number(stats.unassigned_guests || 0);
        this.conflictAlertsCount = Number(stats.conflict_alerts_count || 0);
        this.conflictAlertsMessage = stats.conflict_alerts_message || "No conflicts detected";
    }
}

module.exports = {
    VehicleAllocationMatrixDTO,
    GuestQueueDTO,
    VehicleRequestDTO,
    VehicleResponseDTO,
    GuestTransportAllocationRequestDTO,
    GuestTransportAllocationResponseDTO,
    ConflictResponseDTO,
    RouteOptimizationResultDTO,
    WaitlistResponseDTO,
    FleetStatisticsDTO
};
