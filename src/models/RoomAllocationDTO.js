/**
 * Room Allocation Matrix Data Transfer Objects (DTOs)
 */

class FloorResponseDTO {
    /**
     * @param {import('./Floor')} floor
     * @param {Object[]} roomsList - Rooms linked to this floor
     */
    constructor(floor, roomsList = []) {
        this.floor_id = floor.floor_id;
        this.hotel_id = floor.hotel_id;
        this.floor_name = floor.floor_name;
        this.floor_number = floor.floor_number;
        this.total_rooms = floor.total_rooms;
        
        // Floor Analytics Calculation
        this.assigned_rooms = roomsList.filter(r => r.room_status === 'Occupied' || r.room_status === 'Reserved').length;
        this.available_rooms = roomsList.filter(r => r.room_status === 'Available').length;
        this.conflict_count = roomsList.filter(r => r.has_conflict === true).length;

        this.rooms = roomsList.map(r => ({
            room_id: r.room_id,
            room_number: r.room_number,
            room_type: r.room_type,
            room_status: r.room_status, // 'Available', 'Reserved', 'Occupied', 'Maintenance'
            has_conflict: Boolean(r.has_conflict),
            conflict_message: r.conflict_message || null,
            guest: r.guest_id ? {
                guest_id: r.guest_id,
                guest_name: r.guest_name,
                guest_category: r.guest_category, // e.g. 'Speaker', 'Media', 'Attendee'
                vip_placement: Boolean(r.is_vip),
                check_in_date: r.check_in_date ? r.check_in_date.toISOString().split('T')[0] : null,
                check_out_date: r.check_out_date ? r.check_out_date.toISOString().split('T')[0] : null
            } : null
        }));
    }
}

class RoomAllocationRequestDTO {
    constructor(data) {
        this.room_id = Number(data.room_id);
        this.guest_id = Number(data.guest_id);
        this.reservation_id = data.reservation_id ? Number(data.reservation_id) : null;
        this.allocation_status = data.allocation_status || 'Assigned';
    }
}

class RoomAllocationBulkSaveDTO {
    constructor(data) {
        this.allocations = Array.isArray(data.allocations) 
            ? data.allocations.map(a => new RoomAllocationRequestDTO(a)) 
            : [];
    }
}

class RoomAllocationResponseDTO {
    /**
     * @param {import('./RoomAllocation')} ra 
     */
    constructor(ra) {
        this.allocation_id = ra.allocation_id;
        this.room_id = ra.room_id;
        this.room_number = ra.room_number || 'Room ID #' + ra.room_id;
        this.guest_id = ra.guest_id;
        this.guest_name = ra.guest_name || 'Guest ID #' + ra.guest_id;
        this.guest_category = ra.guest_category || 'General';
        this.reservation_id = ra.reservation_id;
        this.check_in_date = ra.check_in_date ? ra.check_in_date.toISOString().split('T')[0] : null;
        this.check_out_date = ra.check_out_date ? ra.check_out_date.toISOString().split('T')[0] : null;
        this.allocation_status = ra.allocation_status;
        this.assigned_by = ra.assigned_by;
        this.assigned_at = ra.assigned_at ? ra.assigned_at.toISOString() : null;
        this.updated_at = ra.updated_at ? ra.updated_at.toISOString() : null;
    }
}

class UnassignedGuestDTO {
    constructor(row) {
        this.guest_id = Number(row.guest_id);
        this.guest_name = row.name;
        this.guest_category = row.category || 'General'; // Speaker, Attendee, Media
        this.request_details = row.request_value ? `Request: ${row.request_value}` : 'No specific requests';
        this.check_in_date = row.check_in_date ? new Date(row.check_in_date).toISOString().split('T')[0] : null;
        this.check_out_date = row.check_out_date ? new Date(row.check_out_date).toISOString().split('T')[0] : null;
    }
}

class ConflictResponseDTO {
    /**
     * @param {import('./RoomConflict')} rc 
     */
    constructor(rc) {
        this.conflict_id = rc.conflict_id;
        this.room_id = rc.room_id;
        this.room_number = rc.room_number || 'Room ID #' + rc.room_id;
        this.guest_id = rc.guest_id;
        this.guest_name = rc.guest_name || 'Guest ID #' + rc.guest_id;
        this.conflict_type = rc.conflict_type;
        this.conflict_message = rc.conflict_message;
        this.resolved = rc.resolved;
        this.resolved_at = rc.resolved_at ? rc.resolved_at.toISOString() : null;
        this.created_at = rc.created_at ? rc.created_at.toISOString() : null;
    }
}

class GuestRequestDTO {
    /**
     * @param {import('./GuestRequest')} req 
     */
    constructor(req) {
        this.request_id = req.request_id;
        this.guest_id = req.guest_id;
        this.request_type = req.request_type;
        this.request_value = req.request_value;
        this.created_at = req.created_at ? req.created_at.toISOString() : null;
    }
}

class GuestRequestCreateDTO {
    constructor(data) {
        this.guest_id = Number(data.guest_id);
        this.request_type = data.request_type; // 'High Floor' | 'VIP Placement' | 'King Bed' | 'Suite Upgrade' | 'Other'
        this.request_value = data.request_value || null;
    }
}

class AutoAssignResultDTO {
    constructor(success, assignedCount, logs = []) {
        this.success = Boolean(success);
        this.assigned_count = Number(assignedCount);
        this.logs = logs.map(l => ({
            log_id: l.log_id,
            guest_id: l.guest_id,
            room_id: l.room_id,
            assignment_rule: l.assignment_rule,
            created_at: l.created_at ? l.created_at.toISOString() : null
        }));
    }
}

module.exports = {
    FloorResponseDTO,
    RoomAllocationRequestDTO,
    RoomAllocationBulkSaveDTO,
    RoomAllocationResponseDTO,
    UnassignedGuestDTO,
    ConflictResponseDTO,
    GuestRequestDTO,
    GuestRequestCreateDTO,
    AutoAssignResultDTO
};
