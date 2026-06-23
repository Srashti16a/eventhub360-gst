const SeatingRepository = require('./SeatingRepository');
const {
    SeatingDashboardAnalyticsDTO,
    SeatingZoneResponseDTO,
    SeatAssignmentResponseDTO,
    EventTableResponseDTO,
    TableLayoutResponseDTO,
    LayoutRuleValidationResponseDTO
} = require('./SeatingDTO');

class SeatingService {
    /**
     * Get layout analytics dashboard data
     */
    async getDashboardAnalytics(eventId, companyId) {
        // Fetch layout for event
        const layouts = await SeatingRepository.getLayoutsByEvent(eventId, companyId);
        if (layouts.length === 0) {
            // Create a default layout if none exists
            await SeatingRepository.createLayout({
                company_id: companyId,
                event_id: eventId,
                name: 'Default Table Layout',
                version: '1.0.0',
                status: 'Draft'
            });
        }
        
        const activeLayout = (await SeatingRepository.getLayoutsByEvent(eventId, companyId))[0];
        const stats = await SeatingRepository.getSeatingStats(eventId, activeLayout.layout_id, companyId);
        
        return new SeatingDashboardAnalyticsDTO({
            totalTables: stats.totalTables,
            activeTablesCount: stats.activeTablesCount,
            maxCapacity: stats.maxCapacity,
            assignedCount: stats.assignedCount,
            unassignedCount: stats.unassignedCount
        });
    }

    /**
     * Get layout, zones, tables and detailed seat assignments
     */
    async getLayoutDetails(layoutId, companyId) {
        const layout = await SeatingRepository.getLayoutById(layoutId, companyId);
        if (!layout) {
            throw new Error(`Seating layout not found with ID ${layoutId}`);
        }

        const zones = await SeatingRepository.getZonesByLayout(layoutId, companyId);
        const tables = await SeatingRepository.getTablesByLayout(layoutId, companyId);
        const assignments = await SeatingRepository.getAssignmentsByLayout(layoutId, companyId);
        
        const zoneDTOs = zones.map(z => new SeatingZoneResponseDTO(z));
        
        const tableDTOs = [];
        for (const table of tables) {
            const seats = await SeatingRepository.getSeatsByTable(table.table_id);
            const seatDTOs = seats.map(seat => {
                const ass = assignments.find(a => a.table_id === table.table_id && a.seat_id === seat.seat_id);
                return new SeatAssignmentResponseDTO(seat, ass);
            });
            tableDTOs.push(new EventTableResponseDTO(table, seatDTOs));
        }

        return new TableLayoutResponseDTO(layout, zoneDTOs, tableDTOs);
    }

    /**
     * Create a table and automatically generate physical seat offsets
     */
    async createTable(tableData, companyId) {
        const table = await SeatingRepository.createTable({
            ...tableData,
            company_id: companyId
        });

        // Automatically generate circular offsets for the seats around the table center
        const seats = [];
        const radius = 50.0; // standard offset radius in frontend pixels
        for (let i = 1; i <= table.capacity; i++) {
            const angle = (2 * Math.PI * (i - 1)) / table.capacity;
            seats.push({
                table_id: table.table_id,
                seat_number: i,
                offset_x: radius * Math.cos(angle),
                offset_y: radius * Math.sin(angle),
                is_blocked: false
            });
        }
        await SeatingRepository.bulkCreateSeats(seats);
        return table;
    }

    /**
     * Edit a table and regenerate/truncate seats if capacity changed
     */
    async updateTable(tableId, tableData, companyId) {
        const existingTable = await SeatingRepository.getTablesByLayout(tableData.layout_id, companyId)
            .then(list => list.find(t => t.table_id === Number(tableId)));

        if (!existingTable) {
            throw new Error(`Table not found with ID ${tableId}`);
        }

        const updatedTable = await SeatingRepository.updateTable(tableId, tableData, companyId);
        
        // If capacity changes, update seats list (re-distribute offsets)
        if (tableData.capacity && Number(tableData.capacity) !== existingTable.capacity) {
            const newCapacity = Number(tableData.capacity);
            await SeatingRepository.deleteSeatsForTable(tableId);
            
            const seats = [];
            const radius = 50.0;
            for (let i = 1; i <= newCapacity; i++) {
                const angle = (2 * Math.PI * (i - 1)) / newCapacity;
                seats.push({
                    table_id: tableId,
                    seat_number: i,
                    offset_x: radius * Math.cos(angle),
                    offset_y: radius * Math.sin(angle),
                    is_blocked: false
                });
            }
            await SeatingRepository.bulkCreateSeats(seats);
        }

        return updatedTable;
    }

    /**
     * Bulk save positions for drag and drop actions
     */
    async saveTablePositions(tables, companyId) {
        return await SeatingRepository.bulkUpdateTablePositions(tables, companyId);
    }

    /**
     * Assign guest to seat
     */
    async assignGuestToSeat(data, companyId, assignedBy) {
        // Validate seat is available and not blocked
        if (data.seat_id) {
            const seats = await SeatingRepository.getSeatsByTable(data.table_id);
            const targetSeat = seats.find(s => s.seat_id === data.seat_id);
            if (!targetSeat) throw new Error('Seat does not exist');
            if (targetSeat.is_blocked) throw new Error('Cannot assign guest: Target seat is blocked');
        }

        return await SeatingRepository.assignGuest({
            company_id: companyId,
            layout_id: data.layout_id,
            table_id: data.table_id,
            seat_id: data.seat_id,
            guest_id: data.guest_id,
            assigned_by: assignedBy
        });
    }

    /**
     * Unassign guest
     */
    async unassignGuest(layoutId, guestId, companyId) {
        return await SeatingRepository.removeGuestAssignment(layoutId, guestId, companyId);
    }

    /**
     * Save layout parameters
     */
    async saveLayoutSettings(layoutId, data, companyId, userId) {
        return await pool.query(
            `UPDATE table_layouts 
             SET name = COALESCE($1, name), status = COALESCE($2, status), updated_by = $3, updated_at = CURRENT_TIMESTAMP
             WHERE layout_id = $4 AND company_id = $5 RETURNING *;`,
            [data.name, data.status, userId, layoutId, companyId]
        ).then(res => res.rows[0]);
    }

    /**
     * Clone layout & contents to support version control
     */
    async createNewLayoutVersion(layoutId, newVersionName, companyId, userId) {
        const originalLayout = await SeatingRepository.getLayoutById(layoutId, companyId);
        if (!originalLayout) throw new Error('Layout to clone not found');

        // Create new version row
        const verSplit = originalLayout.version.split('.');
        const nextPatch = Number(verSplit[2] || 0) + 1;
        const newVersionString = `${verSplit[0]}.${verSplit[1]}.${nextPatch}`;

        const newLayout = await SeatingRepository.createLayout({
            company_id: companyId,
            branch_id: originalLayout.branch_id,
            event_id: originalLayout.event_id,
            name: newVersionName,
            version: newVersionString,
            status: 'Draft',
            created_by: userId,
            updated_by: userId
        });

        // Duplicate seating zones
        const originalZones = await SeatingRepository.getZonesByLayout(layoutId, companyId);
        const zoneMap = new Map();
        for (const zone of originalZones) {
            const newZone = await SeatingRepository.createZone({
                company_id: companyId,
                branch_id: zone.branch_id,
                layout_id: newLayout.layout_id,
                name: zone.name,
                color_code: zone.color_code
            });
            zoneMap.set(zone.zone_id, newZone.zone_id);
        }

        // Duplicate tables and seats
        const originalTables = await SeatingRepository.getTablesByLayout(layoutId, companyId);
        for (const table of originalTables) {
            const targetZoneId = zoneMap.get(table.zone_id) || null;
            const newTable = await SeatingRepository.createTable({
                company_id: companyId,
                branch_id: table.branch_id,
                layout_id: newLayout.layout_id,
                zone_id: targetZoneId,
                table_number: table.table_number,
                shape: table.shape,
                capacity: table.capacity,
                is_vip: table.is_vip,
                x_coordinate: table.x_coordinate,
                y_coordinate: table.y_coordinate,
                rotation: table.rotation,
                width: table.width,
                height: table.height
            });

            // Duplicate seats
            const originalSeats = await SeatingRepository.getSeatsByTable(table.table_id);
            const seatsToCreate = originalSeats.map(s => ({
                table_id: newTable.table_id,
                seat_number: s.seat_number,
                offset_x: s.offset_x,
                offset_y: s.offset_y,
                is_blocked: s.is_blocked
            }));
            await SeatingRepository.bulkCreateSeats(seatsToCreate);
        }

        return newLayout;
    }

    /**
     * Validation Engine checking layout constraints
     */
    async runLayoutRuleValidation(layoutId, eventId, companyId) {
        // Clear old logs
        await SeatingRepository.clearValidationLogs(layoutId, companyId);

        const tables = await SeatingRepository.getTablesByLayout(layoutId, companyId);
        const rules = await SeatingRepository.getRulesByEvent(eventId, companyId);
        const assignments = await SeatingRepository.getAssignmentsByLayout(layoutId, companyId);

        let layoutIsValid = true;
        const loggedViolations = [];

        // If no custom rules exist, setup default clearance rules
        if (rules.length === 0) {
            // Standard default constraints (e.g. VIP Spacing)
            const defaultRule = await pool.query(
                `INSERT INTO layout_rules (company_id, event_id, rule_name, rule_type, rule_configuration)
                 VALUES ($1, $2, 'Standard 2-meter Clearance', 'Spacing Clearance', '{"min_meters": 2.0}')
                 RETURNING *;`,
                [companyId, eventId]
            ).then(res => res.rows[0]);
            rules.push(defaultRule);
        }

        for (const rule of rules) {
            if (rule.rule_type === 'Spacing Clearance') {
                // Check distance between VIP tables and others
                const minDistance = Number(rule.rule_configuration.min_meters || 2.0);
                
                // Let's assume grid scale: 1 meter = 50 units (pixels) on canvas
                const thresholdPx = minDistance * 50.0;

                for (let i = 0; i < tables.length; i++) {
                    const tableA = tables[i];
                    for (let j = i + 1; j < tables.length; j++) {
                        const tableB = tables[j];

                        // Distance calculation on canvas: sqrt((x1-x2)^2 + (y1-y2)^2)
                        const dx = tableA.x_coordinate - tableB.x_coordinate;
                        const dy = tableA.y_coordinate - tableB.y_coordinate;
                        const dist = Math.sqrt(dx*dx + dy*dy);

                        if (dist < thresholdPx) {
                            // If either is VIP, trigger a violation
                            if (tableA.is_vip || tableB.is_vip) {
                                layoutIsValid = false;
                                const log = await SeatingRepository.logValidationFailure({
                                    company_id: companyId,
                                    layout_id: layoutId,
                                    rule_id: rule.rule_id,
                                    severity: 'Warning',
                                    message: `VIP Table Clearance Conflict: Table ${tableA.table_number} and Table ${tableB.table_number} are too close (${(dist / 50.0).toFixed(1)}m). Minimum required is ${minDistance}m.`,
                                    details: {
                                        table_a_id: tableA.table_id,
                                        table_b_id: tableB.table_id,
                                        distance_meters: dist / 50.0
                                    }
                                });
                                loggedViolations.push(log);
                            }
                        }
                    }
                }
            } else if (rule.rule_type === 'Max Capacity') {
                // Validate assigned counts don't exceed capacities
                for (const table of tables) {
                    const assignedGuests = assignments.filter(a => a.table_id === table.table_id);
                    if (assignedGuests.length > table.capacity) {
                        layoutIsValid = false;
                        const log = await SeatingRepository.logValidationFailure({
                            company_id: companyId,
                            layout_id: layoutId,
                            rule_id: rule.rule_id,
                            severity: 'Critical',
                            message: `Capacity Violation: Table ${table.table_number} exceeds maximum capacity. Assigned: ${assignedGuests.length}, Capacity: ${table.capacity}.`,
                            details: {
                                table_id: table.table_id,
                                assigned_count: assignedGuests.length,
                                max_capacity: table.capacity
                            }
                        });
                        loggedViolations.push(log);
                    }
                }
            }
        }

        return new LayoutRuleValidationResponseDTO(layoutIsValid, loggedViolations);
    }
}

module.exports = new SeatingService();
