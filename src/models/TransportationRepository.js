const pool = require('../config/db');
const FleetAssignment = require('./FleetAssignment');
const TransportRoute = require('./TransportRoute');
const ArrivalDepartureSchedule = require('./ArrivalDepartureSchedule');
const FleetActivityLog = require('./FleetActivityLog');
const VehicleMaintenance = require('./VehicleMaintenance');
const FleetAnalytics = require('./FleetAnalytics');

class TransportationRepository {
    // ==========================================
    // 1. Fleet Assignments
    // ==========================================
    async createAssignment(data, client = pool) {
        const query = `
            INSERT INTO fleet_assignments (company_id, branch_id, vehicle_id, driver_id, event_id, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (event_id, vehicle_id, driver_id) DO UPDATE
            SET status = EXCLUDED.status, updated_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.vehicle_id,
            data.driver_id,
            data.event_id,
            data.status || 'Active'
        ]);
        return FleetAssignment.fromRow(result.rows[0]);
    }

    async findAssignmentById(id, companyId, client = pool) {
        const query = `
            SELECT fa.*, v.vehicle_name, d.full_name as driver_name, e.event_name
            FROM fleet_assignments fa
            JOIN vehicles v ON fa.vehicle_id = v.vehicle_id
            JOIN drivers d ON fa.driver_id = d.driver_id
            JOIN events e ON fa.event_id = e.event_id
            WHERE fa.id = $1 AND fa.company_id = $2;
        `;
        const result = await client.query(query, [id, companyId]);
        return FleetAssignment.fromRow(result.rows[0]);
    }

    async findAllAssignments(companyId, eventId) {
        let query = `
            SELECT fa.*, v.vehicle_name, d.full_name as driver_name, e.event_name
            FROM fleet_assignments fa
            JOIN vehicles v ON fa.vehicle_id = v.vehicle_id
            JOIN drivers d ON fa.driver_id = d.driver_id
            JOIN events e ON fa.event_id = e.event_id
            WHERE fa.company_id = $1
        `;
        const values = [companyId];
        if (eventId) {
            query += ` AND fa.event_id = $2`;
            values.push(eventId);
        }
        query += ` ORDER BY fa.assigned_at DESC;`;

        const result = await pool.query(query, values);
        return result.rows.map(row => FleetAssignment.fromRow(row));
    }

    async deleteAssignment(id, companyId, client = pool) {
        const query = `DELETE FROM fleet_assignments WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 2. Transport Routes
    // ==========================================
    async createRoute(data, client = pool) {
        const query = `
            INSERT INTO transport_routes (company_id, branch_id, route_name, start_location, end_location, distance_km, duration_mins, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.route_name,
            data.start_location,
            data.end_location,
            data.distance_km,
            data.duration_mins,
            data.status || 'Active'
        ]);
        return TransportRoute.fromRow(result.rows[0]);
    }

    async findRouteById(id, companyId, client = pool) {
        const query = `SELECT * FROM transport_routes WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return TransportRoute.fromRow(result.rows[0]);
    }

    async findAllRoutes(companyId) {
        const query = `SELECT * FROM transport_routes WHERE company_id = $1 ORDER BY route_name ASC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => TransportRoute.fromRow(row));
    }

    async deleteRoute(id, companyId, client = pool) {
        const query = `DELETE FROM transport_routes WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 3. Arrivals & Departures Transfers
    // ==========================================
    async createSchedule(data, client = pool) {
        const query = `
            INSERT INTO arrival_departure_schedules (
                company_id, branch_id, guest_id, event_id, transfer_type,
                pickup_location, dropoff_location, scheduled_time,
                route_id, vehicle_id, driver_id, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.guest_id,
            data.event_id,
            data.transfer_type,
            data.pickup_location,
            data.dropoff_location,
            data.scheduled_time,
            data.route_id || null,
            data.vehicle_id || null,
            data.driver_id || null,
            data.status || 'Scheduled'
        ]);
        return ArrivalDepartureSchedule.fromRow(result.rows[0]);
    }

    async findScheduleById(id, companyId, client = pool) {
        const query = `
            SELECT ads.*, g.name as guest_name, g.category as guest_category, e.event_name,
                   tr.route_name, v.vehicle_name, d.full_name as driver_name
            FROM arrival_departure_schedules ads
            JOIN guest g ON ads.guest_id = g.guest_id
            JOIN events e ON ads.event_id = e.event_id
            LEFT JOIN transport_routes tr ON ads.route_id = tr.id
            LEFT JOIN vehicles v ON ads.vehicle_id = v.vehicle_id
            LEFT JOIN drivers d ON ads.driver_id = d.driver_id
            WHERE ads.id = $1 AND ads.company_id = $2;
        `;
        const result = await client.query(query, [id, companyId]);
        return ArrivalDepartureSchedule.fromRow(result.rows[0]);
    }

    async findAllSchedules(companyId, eventId) {
        let query = `
            SELECT ads.*, g.name as guest_name, g.category as guest_category, e.event_name,
                   tr.route_name, v.vehicle_name, d.full_name as driver_name
            FROM arrival_departure_schedules ads
            JOIN guest g ON ads.guest_id = g.guest_id
            JOIN events e ON ads.event_id = e.event_id
            LEFT JOIN transport_routes tr ON ads.route_id = tr.id
            LEFT JOIN vehicles v ON ads.vehicle_id = v.vehicle_id
            LEFT JOIN drivers d ON ads.driver_id = d.driver_id
            WHERE ads.company_id = $1
        `;
        const values = [companyId];
        if (eventId) {
            query += ` AND ads.event_id = $2`;
            values.push(eventId);
        }
        query += ` ORDER BY ads.scheduled_time ASC;`;

        const result = await pool.query(query, values);
        return result.rows.map(row => ArrivalDepartureSchedule.fromRow(row));
    }

    async updateSchedule(id, data, companyId, client = pool) {
        // Build dynamic update query
        const fields = [];
        const values = [id, companyId];
        let index = 3;

        const updatable = ['route_id', 'vehicle_id', 'driver_id', 'status', 'pickup_location', 'dropoff_location', 'scheduled_time'];
        updatable.forEach(f => {
            if (data[f] !== undefined) {
                fields.push(`${f} = $${index}`);
                values.push(data[f]);
                index++;
            }
        });

        if (fields.length === 0) return null;

        const query = `
            UPDATE arrival_departure_schedules
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return ArrivalDepartureSchedule.fromRow(result.rows[0]);
    }

    async deleteSchedule(id, companyId, client = pool) {
        const query = `DELETE FROM arrival_departure_schedules WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 4. Fleet Activity Logs
    // ==========================================
    async createActivityLog(data, client = pool) {
        const query = `
            INSERT INTO fleet_activity_logs (company_id, branch_id, activity_type, severity, message, vehicle_id, driver_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.activity_type,
            data.severity || 'Info',
            data.message,
            data.vehicle_id || null,
            data.driver_id || null
        ]);
        return FleetActivityLog.fromRow(result.rows[0]);
    }

    async getRecentActivityLogs(companyId, limit = 10) {
        const query = `
            SELECT fal.*, v.vehicle_name, d.full_name as driver_name
            FROM fleet_activity_logs fal
            LEFT JOIN vehicles v ON fal.vehicle_id = v.vehicle_id
            LEFT JOIN drivers d ON fal.driver_id = d.driver_id
            WHERE fal.company_id = $1
            ORDER BY fal.created_at DESC
            LIMIT $2;
        `;
        const result = await pool.query(query, [companyId, limit]);
        return result.rows.map(row => FleetActivityLog.fromRow(row));
    }

    // ==========================================
    // 5. Vehicle Maintenance
    // ==========================================
    async createMaintenance(data, client = pool) {
        const query = `
            INSERT INTO vehicle_maintenances (
                company_id, branch_id, vehicle_id, maintenance_type,
                description, scheduled_date, completed_date, status, cost
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.vehicle_id,
            data.maintenance_type,
            data.description || null,
            data.scheduled_date,
            data.completed_date || null,
            data.status || 'Scheduled',
            data.cost || 0.00
        ]);
        return VehicleMaintenance.fromRow(result.rows[0]);
    }

    async findMaintenanceById(id, companyId, client = pool) {
        const query = `
            SELECT vm.*, v.vehicle_name, v.license_number
            FROM vehicle_maintenances vm
            JOIN vehicles v ON vm.vehicle_id = v.vehicle_id
            WHERE vm.id = $1 AND vm.company_id = $2;
        `;
        const result = await client.query(query, [id, companyId]);
        return VehicleMaintenance.fromRow(result.rows[0]);
    }

    async findAllMaintenances(companyId, vehicleId) {
        let query = `
            SELECT vm.*, v.vehicle_name, v.license_number
            FROM vehicle_maintenances vm
            JOIN vehicles v ON vm.vehicle_id = v.vehicle_id
            WHERE vm.company_id = $1
        `;
        const values = [companyId];
        if (vehicleId) {
            query += ` AND vm.vehicle_id = $2`;
            values.push(vehicleId);
        }
        query += ` ORDER BY vm.scheduled_date DESC;`;

        const result = await pool.query(query, values);
        return result.rows.map(row => VehicleMaintenance.fromRow(row));
    }

    async updateMaintenance(id, data, companyId, client = pool) {
        const fields = [];
        const values = [id, companyId];
        let index = 3;

        const updatable = ['completed_date', 'status', 'cost', 'description'];
        updatable.forEach(f => {
            if (data[f] !== undefined) {
                fields.push(`${f} = $${index}`);
                values.push(data[f]);
                index++;
            }
        });

        if (fields.length === 0) return null;

        const query = `
            UPDATE vehicle_maintenances
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return VehicleMaintenance.fromRow(result.rows[0]);
    }

    // ==========================================
    // 6. Fleet Analytics Cache
    // ==========================================
    async createOrUpdateAnalytics(data, client = pool) {
        const query = `
            INSERT INTO fleet_analytics (
                company_id, branch_id, event_id, total_vehicles,
                active_drivers, on_route_vehicles, efficiency_rating, recorded_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_DATE))
            ON CONFLICT (event_id, recorded_date) DO UPDATE
            SET total_vehicles = EXCLUDED.total_vehicles,
                active_drivers = EXCLUDED.active_drivers,
                on_route_vehicles = EXCLUDED.on_route_vehicles,
                efficiency_rating = EXCLUDED.efficiency_rating,
                created_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.event_id,
            data.total_vehicles || 0,
            data.active_drivers || 0,
            data.on_route_vehicles || 0,
            data.efficiency_rating || 0.00,
            data.recorded_date || null
        ]);
        return FleetAnalytics.fromRow(result.rows[0]);
    }

    async getAnalyticsByEvent(eventId, companyId) {
        const query = `
            SELECT fa.*, e.event_name
            FROM fleet_analytics fa
            JOIN events e ON fa.event_id = e.event_id
            WHERE fa.event_id = $1 AND fa.company_id = $2
            ORDER BY fa.recorded_date DESC
            LIMIT 1;
        `;
        const result = await pool.query(query, [eventId, companyId]);
        return FleetAnalytics.fromRow(result.rows[0]);
    }

    // ==========================================
    // 7. Driver and Vehicle Operations
    // ==========================================
    async updateDriverStatus(driverId, status, companyId, client = pool) {
        const query = `
            UPDATE drivers
            SET status = $1, updated_at = NOW()
            WHERE driver_id = $2 AND company_id = $3
            RETURNING *;
        `;
        const result = await client.query(query, [status, driverId, companyId]);
        return result.rowCount > 0;
    }

    async updateVehicleStatus(vehicleId, status, companyId, client = pool) {
        const query = `
            UPDATE vehicles
            SET status = $1, updated_at = NOW()
            WHERE vehicle_id = $2 AND company_id = $3
            RETURNING *;
        `;
        const result = await client.query(query, [status, vehicleId, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 8. Conflict Detection checks
    // ==========================================
    async checkDriverOverlappingTransfer(driverId, scheduledTime, companyId, client = pool) {
        // Find if driver has another transfer scheduled within +/- 1 hour
        const query = `
            SELECT ads.*, g.name as guest_name
            FROM arrival_departure_schedules ads
            JOIN guest g ON ads.guest_id = g.guest_id
            WHERE ads.driver_id = $1 
              AND ads.company_id = $2
              AND ads.status IN ('Scheduled', 'In Transit')
              AND ads.scheduled_time >= $3::TIMESTAMPTZ - INTERVAL '1 hour'
              AND ads.scheduled_time <= $3::TIMESTAMPTZ + INTERVAL '1 hour';
        `;
        const result = await client.query(query, [driverId, companyId, scheduledTime]);
        return result.rows;
    }

    async checkVehicleOverlappingTransfer(vehicleId, scheduledTime, companyId, client = pool) {
        // Find if vehicle has another transfer scheduled within +/- 1 hour
        const query = `
            SELECT ads.*, g.name as guest_name
            FROM arrival_departure_schedules ads
            JOIN guest g ON ads.guest_id = g.guest_id
            WHERE ads.vehicle_id = $1 
              AND ads.company_id = $2
              AND ads.status IN ('Scheduled', 'In Transit')
              AND ads.scheduled_time >= $3::TIMESTAMPTZ - INTERVAL '1 hour'
              AND ads.scheduled_time <= $3::TIMESTAMPTZ + INTERVAL '1 hour';
        `;
        const result = await client.query(query, [vehicleId, companyId, scheduledTime]);
        return result.rows;
    }
}

module.exports = new TransportationRepository();
