process.env.PORT = 5056; // Set port for HTTP testing

const pool = require('./db');
const TransportationService = require('../models/TransportationService');
const server = require('../server'); // Boot up server on port 5056

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log("=== STARTING TRANSPORTATION INTEGRATION TESTS ===");
    const context = {
        companyId: 1,
        branchId: null,
        userId: 999
    };

    try {
        // 1. Clean up and seed data
        console.log("\n1. Seeding test environment...");
        await pool.query("DELETE FROM fleet_activity_logs");
        await pool.query("DELETE FROM vehicle_maintenances");
        await pool.query("DELETE FROM arrival_departure_schedules");
        await pool.query("DELETE FROM fleet_assignments");
        await pool.query("DELETE FROM transport_routes");
        await pool.query("DELETE FROM fleet_analytics");

        await pool.query("DELETE FROM guest_transport_allocations");
        await pool.query("DELETE FROM vehicles");
        await pool.query("DELETE FROM drivers");
        await pool.query("DELETE FROM event_guest");
        await pool.query("DELETE FROM guest");
        await pool.query("DELETE FROM events");

        // Seed event
        await pool.query(`
            INSERT INTO events (event_id, event_name, venue, event_date)
            VALUES (1, 'Tech Summit 2026', 'Silicon Hall', '2026-06-30');
        `);

        // Seed guest
        await pool.query(`
            INSERT INTO guest (guest_id, company_id, name, email, phone, category, company, job_title)
            VALUES (101, 1, 'Alex Harrison', 'alex.h@techvision.com', '+1555101', 'VIP', 'TechVision', 'Director');
        `);

        // Seed vehicle
        await pool.query(`
            INSERT INTO vehicles (vehicle_id, company_id, vehicle_name, vehicle_type, license_number, capacity, status)
            VALUES (1, 1, 'Mercedes V-Class (2024)', 'Van', 'XYZ-123', 7, 'Available');
        `);

        // Seed driver
        await pool.query(`
            INSERT INTO drivers (driver_id, company_id, full_name, phone_number, status)
            VALUES (2, 1, 'James Whitaker', '+1555102', 'Available');
        `);

        console.log("Seeding complete. Testing service layer...");

        // 2. Service Level - Route CRUD
        console.log("\n2. Testing Route CRUD...");
        const routeData = {
            route_name: "Airport to Grand Hall",
            start_location: "Airport Terminal 2",
            end_location: "Grand Hall North",
            distance_km: 18.50,
            duration_mins: 35
        };

        const route = await TransportationService.createRoute(routeData, context);
        console.log("Created Route ID:", route.id, "Name:", route.route_name);
        if (route.route_name !== routeData.route_name) throw new Error("Route name mismatch");

        const allRoutes = await TransportationService.listRoutes(context);
        console.log("Listed routes count:", allRoutes.length);
        if (allRoutes.length === 0) throw new Error("No routes listed");

        // 3. Service Level - Fleet Assignments
        console.log("\n3. Testing Fleet Assignments...");
        const assignmentData = {
            vehicle_id: 1,
            driver_id: 2,
            event_id: 1,
            status: "Active"
        };
        const assignment = await TransportationService.assignFleet(assignmentData, context);
        console.log("Created Assignment ID:", assignment.id, "Status:", assignment.status);
        if (assignment.vehicle_name !== "Mercedes V-Class (2024)") throw new Error("Assignment vehicle name join failed");

        const assignmentsList = await TransportationService.listAssignments(1, context);
        console.log("Active assignments count for event 1:", assignmentsList.length);

        // Check if driver is updated to 'Active' status
        const drvStatusCheck = await pool.query("SELECT status FROM drivers WHERE driver_id = 2;");
        console.log("Driver status after assignment:", drvStatusCheck.rows[0].status);
        if (drvStatusCheck.rows[0].status !== 'Active') throw new Error("Driver status not set to Active");

        // 4. Service Level - Scheduling Transfers & Conflict handling
        console.log("\n4. Testing Pickup Scheduling & Overlap Conflicts...");
        const transferTime = "2026-06-23T14:20:00.000Z";
        const transferData = {
            guest_id: 101,
            event_id: 1,
            transfer_type: "Airport Pickup",
            pickup_location: "Airport Terminal 2",
            dropoff_location: "Grand Hyatt Hotel",
            scheduled_time: transferTime,
            route_id: route.id,
            vehicle_id: 1,
            driver_id: 2
        };

        const transfer = await TransportationService.scheduleTransfer(transferData, context);
        console.log("Scheduled Transfer ID:", transfer.id, "Type:", transfer.transfer_type, "Status:", transfer.status);

        // Try scheduling an overlapping transfer for the same driver at the same time -> should throw 409 Conflict
        console.log("Testing driver conflict detection (should throw 409)...");
        try {
            await TransportationService.scheduleTransfer({
                ...transferData,
                guest_id: 101, // reuse guest for conflict testing
                scheduled_time: "2026-06-23T14:50:00.000Z" // overlapping by 30 mins
            }, context);
            throw new Error("Conflict detection failed: allowed overlapping driver schedule");
        } catch (error) {
            console.log("Conflict caught successfully:", error.message);
            if (error.status !== 409) throw new Error("Conflict error status is not 409");
        }

        // 5. Service Level - Transfers status transitions
        console.log("\n5. Testing Transit Status Transitions...");
        
        // Transition to In Transit
        const transitTransfer = await TransportationService.updateTransfer(transfer.id, { status: "In Transit" }, context);
        console.log("Updated status:", transitTransfer.status);

        // Check vehicle status -> should be 'On Route'
        const vehStatusCheck = await pool.query("SELECT status FROM vehicles WHERE vehicle_id = 1;");
        console.log("Vehicle status when transit:", vehStatusCheck.rows[0].status);
        if (vehStatusCheck.rows[0].status !== 'On Route') throw new Error("Vehicle status not updated to On Route");

        // Transition to Completed
        const completedTransfer = await TransportationService.updateTransfer(transfer.id, { status: "Completed" }, context);
        console.log("Completed status:", completedTransfer.status);

        // Check driver & vehicle status -> should be reset to 'Available'
        const freedVeh = await pool.query("SELECT status FROM vehicles WHERE vehicle_id = 1;");
        const freedDrv = await pool.query("SELECT status FROM drivers WHERE driver_id = 2;");
        console.log("Freed Vehicle:", freedVeh.rows[0].status, "Freed Driver:", freedDrv.rows[0].status);
        if (freedVeh.rows[0].status !== 'Available') throw new Error("Vehicle status not reset to Available");
        if (freedDrv.rows[0].status !== 'Available') throw new Error("Driver status not reset to Available");

        // 6. Service Level - Optimize Route
        console.log("\n6. Testing Route Optimization...");
        const optimizedRoute = await TransportationService.optimizeRoute(route.id, context);
        console.log("Route Optimized at:", optimizedRoute.optimized_at);
        if (!optimizedRoute.optimized_at) throw new Error("Route optimized_at is null");

        // 7. Service Level - Driver status changes
        console.log("\n7. Testing Driver status management...");
        await TransportationService.updateDriverStatus(2, "Resting", context);
        const restingDrv = await pool.query("SELECT status FROM drivers WHERE driver_id = 2;");
        console.log("Driver status set to:", restingDrv.rows[0].status);
        if (restingDrv.rows[0].status !== "Resting") throw new Error("Driver status update failed");

        // 8. Service Level - Vehicle Maintenance CRUD
        console.log("\n8. Testing Maintenance scheduling & completions...");
        const maintenanceData = {
            vehicle_id: 1,
            maintenance_type: "Routine Inspection",
            description: "Checking brake pads and fluids",
            scheduled_date: "2026-06-30",
            status: "Scheduled"
        };
        const maintenance = await TransportationService.scheduleMaintenance(maintenanceData, context);
        console.log("Scheduled Maintenance ID:", maintenance.id, "Type:", maintenance.maintenance_type, "Status:", maintenance.status);

        // Check vehicle status -> should be set to 'Maintenance'
        const maintVeh = await pool.query("SELECT status FROM vehicles WHERE vehicle_id = 1;");
        console.log("Vehicle status during maintenance:", maintVeh.rows[0].status);
        if (maintVeh.rows[0].status !== 'Maintenance') throw new Error("Vehicle status not updated to Maintenance");

        // Complete maintenance
        const completedMaint = await TransportationService.updateMaintenance(maintenance.id, {
            status: "Completed",
            cost: 245.50
        }, context);
        console.log("Maintenance updated. Status:", completedMaint.status, "Cost:", completedMaint.cost);

        // Check vehicle status -> should return to 'Available'
        const restoredVeh = await pool.query("SELECT status FROM vehicles WHERE vehicle_id = 1;");
        console.log("Restored Vehicle status:", restoredVeh.rows[0].status);
        if (restoredVeh.rows[0].status !== 'Available') throw new Error("Vehicle status not restored to Available");

        // 9. Service Level - Logs and Dashboard Overview
        console.log("\n9. Testing Activity Logs & Dashboard stats...");
        const logs = await TransportationService.listActivityLogs(context);
        console.log("Recent activity logs count:", logs.length);
        if (logs.length === 0) throw new Error("Activity logs should contain records");
        console.log("Latest log message:", logs[0].message);

        await TransportationService.triggerAnalyticsRefresh(1, context);
        const overview = await TransportationService.getDashboardOverview(1, context);
        console.log("Dashboard overview totals: Total Vehicles:", overview.total_vehicles, "Active Drivers:", overview.active_drivers, "On Route Vehicles:", overview.on_route_vehicles, "Efficiency:", overview.efficiency_rating + "%");

        console.log("\nService-level tests passed. Testing HTTP router endpoints...");
        await sleep(1000); // Wait a second for server startup

        // 10. HTTP Endpoint Tests
        const baseUrl = "http://localhost:5056/api/v1/transportation";
        const headers = {
            "Content-Type": "application/json",
            "x-company-id": "1",
            "x-user-id": "999"
        };

        // HTTP GET Overview
        console.log("\nHTTP: GET /dashboard/overview/1");
        let res = await fetch(`${baseUrl}/dashboard/overview/1`, { headers });
        let json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Overview:", json.data);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET dashboard overview failed");

        // HTTP POST Route
        console.log("\nHTTP: POST /routes");
        res = await fetch(`${baseUrl}/routes`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                route_name: "HTTP Route test",
                start_location: "Airport",
                end_location: "Silicon Hall",
                distance_km: 15.00,
                duration_mins: 25
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "New Route ID:", json.data ? json.data.id : null);
        if (res.status !== 201 || !json.success) throw new Error("HTTP POST route failed");
        const httpRouteId = json.data.id;

        // HTTP POST Assignments
        console.log("\nHTTP: POST /assignments");
        // Update driver status back to Available to prevent errors
        await pool.query("UPDATE drivers SET status = 'Available' WHERE driver_id = 2;");
        res = await fetch(`${baseUrl}/assignments`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                vehicle_id: 1,
                driver_id: 2,
                event_id: 1,
                status: "Active"
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "New Assignment ID:", json.data ? json.data.id : null);
        if (res.status !== 201 || !json.success) throw new Error("HTTP POST assignments failed");
        const httpAssignmentId = json.data.id;

        // HTTP POST Transfers
        console.log("\nHTTP: POST /transfers");
        res = await fetch(`${baseUrl}/transfers`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                guest_id: 101,
                event_id: 1,
                transfer_type: "Hotel Transfer",
                pickup_location: "Grand Hyatt Hotel",
                dropoff_location: "Silicon Hall",
                scheduled_time: "2026-06-23T18:00:00.000Z",
                route_id: httpRouteId,
                vehicle_id: 1,
                driver_id: 2
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "New Transfer ID:", json.data ? json.data.id : null);
        if (res.status !== 201 || !json.success) throw new Error("HTTP POST transfers failed");
        const httpTransferId = json.data.id;

        // HTTP POST Transfers conflict test
        console.log("\nHTTP: POST /transfers (overlap conflict test)");
        res = await fetch(`${baseUrl}/transfers`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                guest_id: 101,
                event_id: 1,
                transfer_type: "Hotel Transfer",
                pickup_location: "Grand Hyatt Hotel",
                dropoff_location: "Silicon Hall",
                scheduled_time: "2026-06-23T18:30:00.000Z", // overlap of 30 mins
                route_id: httpRouteId,
                vehicle_id: 1,
                driver_id: 2
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success (Expected False):", json.success, "Error Message:", json.error);
        if (res.status !== 409 || json.success) throw new Error("HTTP POST transfers conflict did not return 409");

        // HTTP PUT transfers
        console.log(`\nHTTP: PUT /transfers/${httpTransferId}`);
        res = await fetch(`${baseUrl}/transfers/${httpTransferId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ status: "Completed" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Updated Status:", json.data ? json.data.status : null);
        if (res.status !== 200 || !json.success) throw new Error("HTTP PUT transfers status update failed");

        // HTTP PUT driver status
        console.log("\nHTTP: PUT /drivers/2/status");
        res = await fetch(`${baseUrl}/drivers/2/status`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ status: "On Break" })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Message:", json.message);
        if (res.status !== 200 || !json.success) throw new Error("HTTP PUT driver status failed");

        // HTTP POST Maintenance
        console.log("\nHTTP: POST /maintenance");
        res = await fetch(`${baseUrl}/maintenance`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                vehicle_id: 1,
                maintenance_type: "Oil Change",
                scheduled_date: "2026-07-05"
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "New Maintenance ID:", json.data ? json.data.id : null);
        if (res.status !== 201 || !json.success) throw new Error("HTTP POST maintenance failed");

        // HTTP GET Activity Logs
        console.log("\nHTTP: GET /activity-logs");
        res = await fetch(`${baseUrl}/activity-logs`, { headers });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Activity log items:", json.data.length);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET activity-logs failed");

        // HTTP POST Refresh overview cache
        console.log("\nHTTP: POST /dashboard/refresh/1");
        res = await fetch(`${baseUrl}/dashboard/refresh/1`, {
            method: "POST",
            headers
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Message:", json.message);
        if (res.status !== 200 || !json.success) throw new Error("HTTP POST dashboard refresh failed");

        // Clean up
        console.log("\nHTTP: DELETE /assignments/:id");
        res = await fetch(`${baseUrl}/assignments/${httpAssignmentId}`, {
            method: "DELETE",
            headers
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success);
        if (res.status !== 200 || !json.success) throw new Error("HTTP DELETE assignment failed");

        console.log("\n=== ALL TRANSPORTATION INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error("\n!!! INTEGRATION TEST FAILED !!!");
        console.error(e);
        await pool.end();
        process.exit(1);
    }
}

// Start tests after short delay
setTimeout(runTests, 1500);
