const pool = require('../config/db');
const TransportationRepository = require('./TransportationRepository');
const TransportRoute = require('./TransportRoute');
const {
    FleetAssignmentResponseDTO,
    TransportRouteResponseDTO,
    ArrivalDepartureScheduleResponseDTO,
    FleetActivityLogResponseDTO,
    VehicleMaintenanceResponseDTO,
    FleetAnalyticsResponseDTO,
    DashboardOverviewResponseDTO
} = require('./TransportationDTO');

class TransportationService {
    // ==========================================
    // 1. Dashboard Overview
    // ==========================================
    async getDashboardOverview(eventId, context) {
        // Compute metrics
        // 1. Total vehicles
        const vehQuery = `SELECT COUNT(*)::INTEGER as count FROM vehicles WHERE company_id = $1;`;
        const vehRes = await pool.query(vehQuery, [context.companyId]);
        const totalVehicles = vehRes.rows[0].count;

        // 2. Active drivers
        const drvQuery = `SELECT COUNT(*)::INTEGER as count FROM drivers WHERE company_id = $1 AND status = 'Active';`;
        const drvRes = await pool.query(drvQuery, [context.companyId]);
        const activeDrivers = drvRes.rows[0].count;

        // 3. On-route vehicles
        const routeVehQuery = `SELECT COUNT(*)::INTEGER as count FROM vehicles WHERE company_id = $1 AND status = 'On Route';`;
        const routeVehRes = await pool.query(routeVehQuery, [context.companyId]);
        const onRouteVehicles = routeVehRes.rows[0].count;

        // 4. Efficiency rating (fallback to cached analytics or 94.5)
        let efficiencyRating = 94.50;
        if (eventId) {
            const cached = await TransportationRepository.getAnalyticsByEvent(eventId, context.companyId);
            if (cached) {
                efficiencyRating = Number(cached.efficiency_rating);
            }
        }

        return new DashboardOverviewResponseDTO({
            total_vehicles: totalVehicles,
            active_drivers: activeDrivers,
            on_route_vehicles: onRouteVehicles,
            efficiency_rating: efficiencyRating
        });
    }

    // ==========================================
    // 2. Fleet Assignments
    // ==========================================
    async assignFleet(data, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const assignment = await TransportationRepository.createAssignment({
                ...data,
                company_id: context.companyId
            }, client);

            // Fetch detail details for logging
            const details = await TransportationRepository.findAssignmentById(assignment.id, context.companyId, client);

            // Update statuses
            await client.query(
                `UPDATE vehicles SET status = 'Available', driver_id = $1 WHERE vehicle_id = $2;`,
                [data.driver_id, data.vehicle_id]
            );
            await client.query(
                `UPDATE drivers SET status = 'Active' WHERE driver_id = $1;`,
                [data.driver_id]
            );

            // Log activity
            await TransportationRepository.createActivityLog({
                company_id: context.companyId,
                activity_type: 'Assignment Update',
                severity: 'Info',
                message: `Assignment Update: Driver ${details.driver_name || 'ID ' + data.driver_id} assigned to Vehicle ${details.vehicle_name || 'ID ' + data.vehicle_id} for Event ${details.event_name || 'ID ' + data.event_id}`,
                vehicle_id: data.vehicle_id,
                driver_id: data.driver_id
            }, client);

            await client.query('COMMIT');
            return new FleetAssignmentResponseDTO(details);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async listAssignments(eventId, context) {
        const list = await TransportationRepository.findAllAssignments(context.companyId, eventId);
        return list.map(a => new FleetAssignmentResponseDTO(a));
    }

    async deleteAssignment(id, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const assignment = await TransportationRepository.findAssignmentById(id, context.companyId, client);
            if (!assignment) {
                const error = new Error('Assignment not found');
                error.status = 404;
                throw error;
            }

            await TransportationRepository.deleteAssignment(id, context.companyId, client);

            // Free vehicle and driver status
            await client.query(
                `UPDATE vehicles SET driver_id = NULL WHERE vehicle_id = $1;`,
                [assignment.vehicle_id]
            );
            await client.query(
                `UPDATE drivers SET status = 'Available' WHERE driver_id = $1;`,
                [assignment.driver_id]
            );

            // Log activity
            await TransportationRepository.createActivityLog({
                company_id: context.companyId,
                activity_type: 'Assignment Update',
                severity: 'Info',
                message: `Assignment Update: Removed assignment for Driver ${assignment.driver_name} and Vehicle ${assignment.vehicle_name}`,
                vehicle_id: assignment.vehicle_id,
                driver_id: assignment.driver_id
            }, client);

            await client.query('COMMIT');
            return { success: true, message: 'Fleet assignment deleted successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==========================================
    // 3. Driver & Vehicle Status Management
    // ==========================================
    async updateDriverStatus(driverId, status, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Check if driver exists
            const driverRes = await client.query('SELECT full_name FROM drivers WHERE driver_id = $1 AND company_id = $2;', [driverId, context.companyId]);
            if (driverRes.rows.length === 0) {
                const error = new Error('Driver not found');
                error.status = 404;
                throw error;
            }
            const driverName = driverRes.rows[0].full_name;

            await TransportationRepository.updateDriverStatus(driverId, status, context.companyId, client);

            // Log
            await TransportationRepository.createActivityLog({
                company_id: context.companyId,
                activity_type: 'Driver Status Change',
                severity: 'Info',
                message: `Driver Status Change: Driver ${driverName} set status to ${status}`,
                driver_id: driverId
            }, client);

            await client.query('COMMIT');
            return { success: true, message: `Driver status successfully updated to ${status}` };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateVehicleStatus(vehicleId, status, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const vehRes = await client.query('SELECT vehicle_name FROM vehicles WHERE vehicle_id = $1 AND company_id = $2;', [vehicleId, context.companyId]);
            if (vehRes.rows.length === 0) {
                const error = new Error('Vehicle not found');
                error.status = 404;
                throw error;
            }
            const vehName = vehRes.rows[0].vehicle_name;

            await TransportationRepository.updateVehicleStatus(vehicleId, status, context.companyId, client);

            await TransportationRepository.createActivityLog({
                company_id: context.companyId,
                activity_type: 'Assignment Update',
                severity: 'Info',
                message: `Vehicle Status Change: Vehicle ${vehName} status set to ${status}`,
                vehicle_id: vehicleId
            }, client);

            await client.query('COMMIT');
            return { success: true, message: `Vehicle status successfully updated to ${status}` };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==========================================
    // 4. Arrivals & Departures Scheduling
    // ==========================================
    async scheduleTransfer(data, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Conflict handling:
            if (data.driver_id) {
                const overlaps = await TransportationRepository.checkDriverOverlappingTransfer(data.driver_id, data.scheduled_time, context.companyId, client);
                if (overlaps.length > 0) {
                    const drvRes = await client.query('SELECT full_name FROM drivers WHERE driver_id = $1;', [data.driver_id]);
                    const name = drvRes.rows[0] ? drvRes.rows[0].full_name : 'Driver';
                    const message = `Conflict Detected: Driver ${name} has overlapping transfer scheduled around ${new Date(data.scheduled_time).toLocaleTimeString()}`;
                    
                    await TransportationRepository.createActivityLog({
                        company_id: context.companyId,
                        activity_type: 'Conflict Detected',
                        severity: 'Critical',
                        message,
                        driver_id: data.driver_id
                    }, client);

                    const error = new Error(message);
                    error.status = 409;
                    throw error;
                }
            }

            if (data.vehicle_id) {
                const overlaps = await TransportationRepository.checkVehicleOverlappingTransfer(data.vehicle_id, data.scheduled_time, context.companyId, client);
                if (overlaps.length > 0) {
                    const vehRes = await client.query('SELECT vehicle_name FROM vehicles WHERE vehicle_id = $1;', [data.vehicle_id]);
                    const name = vehRes.rows[0] ? vehRes.rows[0].vehicle_name : 'Vehicle';
                    const message = `Conflict Detected: Vehicle ${name} has overlapping transfer scheduled around ${new Date(data.scheduled_time).toLocaleTimeString()}`;

                    await TransportationRepository.createActivityLog({
                        company_id: context.companyId,
                        activity_type: 'Conflict Detected',
                        severity: 'Critical',
                        message,
                        vehicle_id: data.vehicle_id
                    }, client);

                    const error = new Error(message);
                    error.status = 409;
                    throw error;
                }
            }

            const schedule = await TransportationRepository.createSchedule({
                ...data,
                company_id: context.companyId
            }, client);

            const details = await TransportationRepository.findScheduleById(schedule.id, context.companyId, client);

            // Log
            await TransportationRepository.createActivityLog({
                company_id: context.companyId,
                activity_type: 'Dispatch Alert',
                severity: 'Info',
                message: `Dispatch Alert: New ${data.transfer_type} transfer scheduled for guest ${details.guest_name} at ${new Date(data.scheduled_time).toLocaleTimeString()}`,
                vehicle_id: data.vehicle_id,
                driver_id: data.driver_id
            }, client);

            await client.query('COMMIT');
            return new ArrivalDepartureScheduleResponseDTO(details);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async listTransfers(eventId, context) {
        const list = await TransportationRepository.findAllSchedules(context.companyId, eventId);
        return list.map(s => new ArrivalDepartureScheduleResponseDTO(s));
    }

    async getTransferDetails(id, context) {
        const schedule = await TransportationRepository.findScheduleById(id, context.companyId);
        if (!schedule) {
            const error = new Error('Transfer schedule not found');
            error.status = 404;
            throw error;
        }
        return new ArrivalDepartureScheduleResponseDTO(schedule);
    }

    async updateTransfer(id, data, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const current = await TransportationRepository.findScheduleById(id, context.companyId, client);
            if (!current) {
                const error = new Error('Transfer schedule not found');
                error.status = 404;
                throw error;
            }

            const time = data.scheduled_time || current.scheduled_time;
            
            // Check conflicts if driver or vehicle is changing or time changes
            if (data.driver_id && data.driver_id !== current.driver_id) {
                const overlaps = await TransportationRepository.checkDriverOverlappingTransfer(data.driver_id, time, context.companyId, client);
                if (overlaps.filter(o => o.id !== id).length > 0) {
                    const drvRes = await client.query('SELECT full_name FROM drivers WHERE driver_id = $1;', [data.driver_id]);
                    const name = drvRes.rows[0] ? drvRes.rows[0].full_name : 'Driver';
                    throw new Error(`Conflict Detected: Driver ${name} has overlapping transfer scheduled around ${new Date(time).toLocaleTimeString()}`);
                }
            }

            if (data.vehicle_id && data.vehicle_id !== current.vehicle_id) {
                const overlaps = await TransportationRepository.checkVehicleOverlappingTransfer(data.vehicle_id, time, context.companyId, client);
                if (overlaps.filter(o => o.id !== id).length > 0) {
                    const vehRes = await client.query('SELECT vehicle_name FROM vehicles WHERE vehicle_id = $1;', [data.vehicle_id]);
                    const name = vehRes.rows[0] ? vehRes.rows[0].vehicle_name : 'Vehicle';
                    throw new Error(`Conflict Detected: Vehicle ${name} has overlapping transfer scheduled around ${new Date(time).toLocaleTimeString()}`);
                }
            }

            const updated = await TransportationRepository.updateSchedule(id, data, context.companyId, client);
            const details = await TransportationRepository.findScheduleById(id, context.companyId, client);

            // Log and update statuses depending on status changes
            if (data.status && data.status !== current.status) {
                if (data.status === 'Completed') {
                    await TransportationRepository.createActivityLog({
                        company_id: context.companyId,
                        activity_type: 'Route Completed',
                        severity: 'Info',
                        message: `Route Completed: Transfer completed for guest ${details.guest_name}`,
                        vehicle_id: details.vehicle_id,
                        driver_id: details.driver_id
                    }, client);

                    if (details.vehicle_id) {
                        await client.query(`UPDATE vehicles SET status = 'Available' WHERE vehicle_id = $1;`, [details.vehicle_id]);
                    }
                    if (details.driver_id) {
                        await client.query(`UPDATE drivers SET status = 'Available' WHERE driver_id = $1;`, [details.driver_id]);
                    }
                } else if (data.status === 'In Transit') {
                    if (details.vehicle_id) {
                        await client.query(`UPDATE vehicles SET status = 'On Route' WHERE vehicle_id = $1;`, [details.vehicle_id]);
                    }
                    if (details.driver_id) {
                        await client.query(`UPDATE drivers SET status = 'Active' WHERE driver_id = $1;`, [details.driver_id]);
                    }
                }
            }

            await client.query('COMMIT');
            return new ArrivalDepartureScheduleResponseDTO(details);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteTransfer(id, context) {
        const schedule = await TransportationRepository.findScheduleById(id, context.companyId);
        if (!schedule) {
            const error = new Error('Transfer schedule not found');
            error.status = 404;
            throw error;
        }
        return await TransportationRepository.deleteSchedule(id, context.companyId);
    }

    // ==========================================
    // 5. Routes Management
    // ==========================================
    async createRoute(data, context) {
        const route = await TransportationRepository.createRoute({
            ...data,
            company_id: context.companyId
        });
        return new TransportRouteResponseDTO(route);
    }

    async listRoutes(context) {
        const list = await TransportationRepository.findAllRoutes(context.companyId);
        return list.map(r => new TransportRouteResponseDTO(r));
    }

    async optimizeRoute(routeId, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const route = await TransportationRepository.findRouteById(routeId, context.companyId, client);
            if (!route) {
                const error = new Error('Route not found');
                error.status = 404;
                throw error;
            }

            const updated = await client.query(
                `UPDATE transport_routes SET optimized_at = NOW(), updated_at = NOW() WHERE id = $1 AND company_id = $2 RETURNING *;`,
                [routeId, context.companyId]
            );

            await TransportationRepository.createActivityLog({
                company_id: context.companyId,
                activity_type: 'Assignment Update',
                severity: 'Info',
                message: `Route Optimization Completed for Route: ${route.route_name}`
            }, client);

            await client.query('COMMIT');
            return new TransportRouteResponseDTO(TransportRoute.fromRow(updated.rows[0]));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==========================================
    // 6. Vehicle Maintenance
    // ==========================================
    async scheduleMaintenance(data, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const maintenance = await TransportationRepository.createMaintenance({
                ...data,
                company_id: context.companyId
            }, client);

            const details = await TransportationRepository.findMaintenanceById(maintenance.id, context.companyId, client);

            // Put vehicle into maintenance status
            await client.query(`UPDATE vehicles SET status = 'Maintenance' WHERE vehicle_id = $1;`, [data.vehicle_id]);

            // Log activity
            await TransportationRepository.createActivityLog({
                company_id: context.companyId,
                activity_type: 'Maintenance Alert',
                severity: 'Warning',
                message: `Maintenance Alert: Scheduled ${data.maintenance_type} for Vehicle ${details.vehicle_name || 'ID ' + data.vehicle_id}`,
                vehicle_id: data.vehicle_id
            }, client);

            await client.query('COMMIT');
            return new VehicleMaintenanceResponseDTO(details);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async listMaintenances(vehicleId, context) {
        const list = await TransportationRepository.findAllMaintenances(context.companyId, vehicleId);
        return list.map(m => new VehicleMaintenanceResponseDTO(m));
    }

    async updateMaintenance(id, data, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const current = await TransportationRepository.findMaintenanceById(id, context.companyId, client);
            if (!current) {
                const error = new Error('Maintenance record not found');
                error.status = 404;
                throw error;
            }

            const updated = await TransportationRepository.updateMaintenance(id, data, context.companyId, client);
            const details = await TransportationRepository.findMaintenanceById(id, context.companyId, client);

            if (data.status === 'Completed') {
                // Free vehicle back to Available
                await client.query(`UPDATE vehicles SET status = 'Available' WHERE vehicle_id = $1;`, [details.vehicle_id]);

                // Log
                await TransportationRepository.createActivityLog({
                    company_id: context.companyId,
                    activity_type: 'Maintenance Alert',
                    severity: 'Info',
                    message: `Maintenance Alert: Completed maintenance (${details.maintenance_type}) for Vehicle ${details.vehicle_name}`,
                    vehicle_id: details.vehicle_id
                }, client);
            }

            await client.query('COMMIT');
            return new VehicleMaintenanceResponseDTO(details);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==========================================
    // 7. Analytics & History Logs
    // ==========================================
    async listActivityLogs(context) {
        const list = await TransportationRepository.getRecentActivityLogs(context.companyId, 20);
        return list.map(l => new FleetActivityLogResponseDTO(l));
    }

    async triggerAnalyticsRefresh(eventId, context) {
        // Calculate counts
        // 1. Total vehicles
        const vehQuery = `SELECT COUNT(*)::INTEGER as count FROM vehicles WHERE company_id = $1;`;
        const vehRes = await pool.query(vehQuery, [context.companyId]);
        const totalVehicles = vehRes.rows[0].count;

        // 2. Active drivers
        const drvQuery = `SELECT COUNT(*)::INTEGER as count FROM drivers WHERE company_id = $1 AND status = 'Active';`;
        const drvRes = await pool.query(drvQuery, [context.companyId]);
        const activeDrivers = drvRes.rows[0].count;

        // 3. On-route vehicles
        const routeVehQuery = `SELECT COUNT(*)::INTEGER as count FROM vehicles WHERE company_id = $1 AND status = 'On Route';`;
        const routeVehRes = await pool.query(routeVehQuery, [context.companyId]);
        const onRouteVehicles = routeVehRes.rows[0].count;

        // Compute mockup efficiency score based on active vs total (e.g. 94.5%)
        const efficiency = totalVehicles > 0 ? Number((90 + (onRouteVehicles * 0.5)).toFixed(1)) : 94.50;

        await TransportationRepository.createOrUpdateAnalytics({
            company_id: context.companyId,
            event_id: eventId,
            total_vehicles: totalVehicles,
            active_drivers: activeDrivers,
            on_route_vehicles: onRouteVehicles,
            efficiency_rating: efficiency
        });

        return { success: true, message: 'Fleet analytics caches updated successfully' };
    }
}

module.exports = new TransportationService();
