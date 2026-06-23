/**
 * Seating & Table Layout Designer Data Transfer Objects (DTOs)
 */

class SeatingDashboardAnalyticsDTO {
    /**
     * @param {Object} params
     * @param {number} params.totalTables
     * @param {number} params.activeTablesCount
     * @param {number} params.maxCapacity
     * @param {number} params.assignedCount
     * @param {number} params.unassignedCount
     * @param {number} [params.efficiencyPercentage]
     */
    constructor({ totalTables, activeTablesCount, maxCapacity, assignedCount, unassignedCount, efficiencyPercentage }) {
        this.totalTables = Number(totalTables);
        this.activeTables = {
            count: Number(activeTablesCount),
            label: `+${activeTablesCount} active`
        };
        this.maxCapacity = {
            value: Number(maxCapacity),
            label: `${maxCapacity} pax`
        };
        this.assignments = {
            assigned: Number(assignedCount),
            total: Number(maxCapacity),
            label: `${assignedCount}/${maxCapacity}`
        };
        this.unassigned = {
            count: Number(unassignedCount)
        };
        
        // Compute layout efficiency
        const efficiency = efficiencyPercentage !== undefined 
            ? Number(efficiencyPercentage)
            : (maxCapacity > 0 ? Math.round((assignedCount / maxCapacity) * 100) : 0);
        
        this.layoutEfficiency = {
            percentage: efficiency,
            label: `${efficiency}%`,
            status: efficiency >= 80 ? 'Optimized' : (efficiency >= 50 ? 'Adequate' : 'Underutilized')
        };
    }
}

class SeatingZoneResponseDTO {
    /**
     * @param {import('./SeatingZone')} zone 
     */
    constructor(zone) {
        this.zone_id = zone.zone_id;
        this.layout_id = zone.layout_id;
        this.name = zone.name;
        this.color_code = zone.color_code;
    }
}

class SeatAssignmentResponseDTO {
    /**
     * @param {import('./Seat')} seat 
     * @param {import('./TableAssignment')} [assignment] 
     */
    constructor(seat, assignment = null) {
        this.seat_id = seat.seat_id;
        this.seat_number = seat.seat_number;
        this.offset_x = seat.offset_x;
        this.offset_y = seat.offset_y;
        this.is_blocked = seat.is_blocked;
        this.guest = assignment ? {
            guest_id: assignment.guest_id,
            guest_name: assignment.guest_name || 'Guest #' + assignment.guest_id,
            guest_category: assignment.guest_category || 'Attendee'
        } : null;
    }
}

class EventTableResponseDTO {
    /**
     * @param {import('./EventTable')} table 
     * @param {SeatAssignmentResponseDTO[]} seatsList 
     */
    constructor(table, seatsList = []) {
        this.table_id = table.table_id;
        this.layout_id = table.layout_id;
        this.table_number = table.table_number;
        this.shape = table.shape; // 'Round' | 'Square' | 'Rectangle' | 'Long'
        this.capacity = table.capacity;
        this.is_vip = table.is_vip;
        
        // Canvas positions
        this.position = {
            x: table.x_coordinate,
            y: table.y_coordinate,
            rotation: table.rotation
        };
        
        // Dimensions
        this.dimensions = {
            width: table.width,
            height: table.height
        };
        
        // Zone link
        this.zone = table.zone_id ? {
            zone_id: table.zone_id,
            name: table.zone_name || 'Zone name',
            color_code: table.zone_color || '#E2E8F0'
        } : null;

        this.seats = seatsList;
        this.assigned_seats_count = seatsList.filter(s => s.guest !== null).length;
    }
}

class TableLayoutResponseDTO {
    /**
     * @param {import('./TableLayout')} layout 
     * @param {SeatingZoneResponseDTO[]} zones 
     * @param {EventTableResponseDTO[]} tables 
     */
    constructor(layout, zones = [], tables = []) {
        this.layout_id = layout.layout_id;
        this.event_id = layout.event_id;
        this.name = layout.name;
        this.version = layout.version;
        this.status = layout.status; // 'Draft' | 'Saved' | 'Finalized'
        this.is_active = layout.is_active;
        this.updated_at = layout.updated_at ? layout.updated_at.toISOString() : null;
        
        this.zones = zones;
        this.tables = tables;
    }
}

class TableAssignmentRequestDTO {
    constructor(data) {
        this.guest_id = Number(data.guest_id);
        this.table_id = Number(data.table_id);
        this.seat_id = data.seat_id ? Number(data.seat_id) : null;
    }
}

class LayoutRuleValidationResponseDTO {
    /**
     * @param {boolean} isValid 
     * @param {import('./LayoutValidationLog')[]} logs 
     */
    constructor(isValid, logs = []) {
        this.isValid = Boolean(isValid);
        this.summary = this.isValid 
            ? 'All tables conform to clearance rules.' 
            : `Detected ${logs.filter(l => l.severity === 'Critical').length} critical issues and ${logs.filter(l => l.severity === 'Warning').length} warnings.`;
        
        this.logs = logs.map(l => ({
            log_id: l.log_id,
            rule_id: l.rule_id,
            rule_name: l.rule_name || 'Layout Standard Clearance',
            severity: l.severity, // 'Info' | 'Warning' | 'Critical'
            message: l.message,
            details: l.details,
            resolved: l.resolved,
            created_at: l.created_at ? l.created_at.toISOString() : null
        }));
    }
}

class EventTableUpdateDTO {
    constructor(data) {
        this.zone_id = data.zone_id ? Number(data.zone_id) : null;
        this.table_number = data.table_number;
        this.shape = data.shape;
        this.capacity = data.capacity ? Number(data.capacity) : undefined;
        this.is_vip = data.is_vip !== undefined ? Boolean(data.is_vip) : undefined;
        this.x_coordinate = data.x_coordinate !== undefined ? Number(data.x_coordinate) : undefined;
        this.y_coordinate = data.y_coordinate !== undefined ? Number(data.y_coordinate) : undefined;
        this.rotation = data.rotation !== undefined ? Number(data.rotation) : undefined;
        this.width = data.width !== undefined ? Number(data.width) : null;
        this.height = data.height !== undefined ? Number(data.height) : null;
    }
}

module.exports = {
    SeatingDashboardAnalyticsDTO,
    SeatingZoneResponseDTO,
    SeatAssignmentResponseDTO,
    EventTableResponseDTO,
    TableLayoutResponseDTO,
    TableAssignmentRequestDTO,
    LayoutRuleValidationResponseDTO,
    EventTableUpdateDTO
};
