/**
 * Accommodation Dashboard Data Transfer Objects (DTOs)
 */

class AccommodationDashboardDTO {
    /**
     * @param {Object} data
     * @param {number} data.total_occupancy
     * @param {number} data.rooms_assigned
     * @param {number} data.total_rooms_capacity
     * @param {number} data.unassigned_guests
     * @param {number} data.vip_suites_booked
     * @param {number} data.vip_suites_capacity
     * @param {Object[]} data.utilization_trends
     */
    constructor(data) {
        this.totalOccupancy = parseFloat(Number(data.total_occupancy || 0).toFixed(1));
        this.roomsAssigned = Number(data.rooms_assigned || 0);
        this.totalRoomsCapacity = Number(data.total_rooms_capacity || 0);
        this.unassignedGuests = Number(data.unassigned_guests || 0);
        this.vipSuitesBooked = Number(data.vip_suites_booked || 0);
        this.vipSuitesCapacity = Number(data.vip_suites_capacity || 0);
        
        this.hotelUtilizationTrends = (data.utilization_trends || []).map(t => ({
            hotelName: t.hotel_name,
            occupancy: Number(t.occupancy || 0),
            capacity: Number(t.capacity || 0)
        }));

        this.metricsTrends = {
            totalOccupancyChange: "+3.2%",
            totalOccupancyLabel: "vs. last week",
            roomsAssignedCap: "82% Cap",
            unassignedGuestsLabel: "Requires allocation",
            unassignedGuestsPriority: "Priority",
            vipSuitesRemainingLabel: "3 Ultra-luxury remaining"
        };
    }
}

// ==========================================
// HOTEL DTOs
// ==========================================
class HotelRequestDTO {
    constructor(data) {
        this.hotel_name = data.hotel_name;
        this.hotel_type = data.hotel_type;
        this.address = data.address;
        this.total_rooms = data.total_rooms !== undefined ? Number(data.total_rooms) : 0;
    }
}

class HotelResponseDTO {
    /**
     * @param {import('./Hotel')} hotel 
     */
    constructor(hotel) {
        this.hotel_id = hotel.hotel_id;
        this.hotel_name = hotel.hotel_name;
        this.hotel_type = hotel.hotel_type;
        this.address = hotel.address;
        this.total_rooms = hotel.total_rooms;
        this.available_rooms = hotel.available_rooms;
        this.occupancy_percentage = hotel.occupancy_percentage;
        this.created_at = hotel.created_at ? hotel.created_at.toISOString() : null;
        this.updated_at = hotel.updated_at ? hotel.updated_at.toISOString() : null;
    }
}

// ==========================================
// ROOM DTOs
// ==========================================
class RoomRequestDTO {
    constructor(data) {
        this.hotel_id = Number(data.hotel_id);
        this.room_number = data.room_number;
        this.room_type = data.room_type;
        this.room_status = data.room_status || 'Available';
        this.capacity = data.capacity !== undefined ? Number(data.capacity) : 1;
    }
}

class RoomResponseDTO {
    /**
     * @param {import('./Room')} room 
     */
    constructor(room) {
        this.room_id = room.room_id;
        this.hotel_id = room.hotel_id;
        this.hotel_name = room.hotel_name;
        this.room_number = room.room_number;
        this.room_type = room.room_type;
        this.room_status = room.room_status;
        this.capacity = room.capacity;
        this.created_at = room.created_at ? room.created_at.toISOString() : null;
        this.updated_at = room.updated_at ? room.updated_at.toISOString() : null;
    }
}

// ==========================================
// RESERVATION DTOs
// ==========================================
class ReservationRequestDTO {
    constructor(data) {
        this.guest_id = Number(data.guest_id);
        this.hotel_id = Number(data.hotel_id);
        this.room_id = data.room_id ? Number(data.room_id) : null;
        this.check_in_date = data.check_in_date;
        this.check_out_date = data.check_out_date;
        this.reservation_status = data.reservation_status || 'Pending';
    }
}

class ReservationResponseDTO {
    /**
     * @param {import('./AccommodationReservation')} res 
     */
    constructor(res) {
        this.reservation_id = res.reservation_id;
        this.guest_id = res.guest_id;
        this.guest_name = res.guest_name || 'Guest ID #' + res.guest_id;
        this.guest_phone = res.guest_phone || null;
        this.hotel_id = res.hotel_id;
        this.hotel_name = res.hotel_name || 'Hotel ID #' + res.hotel_id;
        this.room_id = res.room_id;
        this.room_number = res.room_number || null;
        this.check_in_date = res.check_in_date ? res.check_in_date.toISOString().split('T')[0] : null;
        this.check_out_date = res.check_out_date ? res.check_out_date.toISOString().split('T')[0] : null;
        this.reservation_status = res.reservation_status;
        this.created_at = res.created_at ? res.created_at.toISOString() : null;
        this.updated_at = res.updated_at ? res.updated_at.toISOString() : null;
    }
}

// ==========================================
// VIP ALLOCATION DTOs
// ==========================================
class VipAllocationRequestDTO {
    constructor(data) {
        this.guest_id = Number(data.guest_id);
        this.hotel_id = Number(data.hotel_id);
        this.room_id = data.room_id ? Number(data.room_id) : null;
        this.allocation_status = data.allocation_status || 'Pending';
    }
}

class VipAllocationResponseDTO {
    /**
     * @param {import('./VipAllocation')} alloc 
     */
    constructor(alloc) {
        this.allocation_id = alloc.allocation_id;
        this.guest_id = alloc.guest_id;
        this.guest_name = alloc.guest_name || 'VIP Guest ID #' + alloc.guest_id;
        this.guest_phone = alloc.guest_phone || null;
        this.hotel_id = alloc.hotel_id;
        this.hotel_name = alloc.hotel_name || 'Hotel ID #' + alloc.hotel_id;
        this.room_id = alloc.room_id;
        this.room_number = alloc.room_number || null;
        this.room_type = alloc.room_type || null;
        this.allocation_status = alloc.allocation_status;
        this.assigned_at = alloc.assigned_at ? alloc.assigned_at.toISOString() : null;
    }
}

// ==========================================
// REPORT DTOs
// ==========================================
class ReportResponseDTO {
    /**
     * @param {import('./AccommodationReport')} report 
     */
    constructor(report) {
        this.report_id = report.report_id;
        this.report_type = report.report_type;
        this.generated_by = report.generated_by;
        this.generated_at = report.generated_at ? report.generated_at.toISOString() : null;
        this.file_url = report.file_url;
    }
}

class ReportExportRequestDTO {
    constructor(data) {
        this.format = data.format || 'CSV'; // CSV or PDF
        this.report_type = data.report_type || 'Utilization';
        this.filters = {
            hotel_id: data.filters && data.filters.hotel_id ? Number(data.filters.hotel_id) : null,
            room_type: data.filters && data.filters.room_type ? data.filters.room_type : null,
            reservation_status: data.filters && data.filters.reservation_status ? data.filters.reservation_status : null,
            check_in_from: data.filters && data.filters.check_in_from ? data.filters.check_in_from : null,
            check_out_to: data.filters && data.filters.check_out_to ? data.filters.check_out_to : null
        };
    }
}

module.exports = {
    AccommodationDashboardDTO,
    HotelRequestDTO,
    HotelResponseDTO,
    RoomRequestDTO,
    RoomResponseDTO,
    ReservationRequestDTO,
    ReservationResponseDTO,
    VipAllocationRequestDTO,
    VipAllocationResponseDTO,
    ReportResponseDTO,
    ReportExportRequestDTO
};
