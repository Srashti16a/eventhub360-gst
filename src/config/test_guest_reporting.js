process.env.PORT = 5055; // Set port for HTTP testing

const pool = require('./db');
const GuestReportingService = require('../models/GuestReportingService');
const server = require('../server'); // Boot up server on port 5055

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log("=== STARTING GUEST REPORTING INTEGRATION TESTS ===");
    const context = {
        companyId: 1,
        branchId: null,
        userId: 999
    };

    try {
        // 1. Clean up and seed data
        console.log("\n1. Seeding test environment...");
        await pool.query("DELETE FROM report_export_histories");
        await pool.query("DELETE FROM guest_data_snapshots");
        await pool.query("DELETE FROM guest_reports");
        await pool.query("DELETE FROM report_columns");
        await pool.query("DELETE FROM report_templates");
        await pool.query("DELETE FROM guest_category_analytics");
        await pool.query("DELETE FROM attendance_trends");
        await pool.query("DELETE FROM satisfaction_analytics");

        await pool.query("DELETE FROM checkin_records");
        await pool.query("DELETE FROM rsvp");
        await pool.query("DELETE FROM event_guest");
        await pool.query("DELETE FROM guest_transport_allocations");
        await pool.query("DELETE FROM vehicles");
        await pool.query("DELETE FROM drivers");
        await pool.query("DELETE FROM accommodation_reservations");
        await pool.query("DELETE FROM rooms");
        await pool.query("DELETE FROM hotels");
        await pool.query("DELETE FROM meal_pref");
        await pool.query("DELETE FROM guest");
        await pool.query("DELETE FROM events");

        // Seed basic event
        await pool.query(`
            INSERT INTO events (event_id, event_name, venue, event_date)
            VALUES (1, 'Tech Summit 2026', 'Main Hall', '2026-06-30');
        `);

        // Seed guest
        await pool.query(`
            INSERT INTO guest (guest_id, company_id, name, email, phone, category, company, job_title)
            VALUES (101, 1, 'Alex Harrison', 'alex.h@techvision.com', '+1555101', 'VIP', 'TechVision', 'Director');
        `);

        // Seed event guest relationship
        await pool.query(`
            INSERT INTO event_guest (event_guest_id, event_id, guest_id)
            VALUES (201, 1, 101);
        `);

        // Seed RSVP
        await pool.query(`
            INSERT INTO rsvp (rsvp_id, event_guest_id, status)
            VALUES (301, 201, 'Accepted');
        `);

        // Seed Meal Preference
        await pool.query(`
            INSERT INTO meal_pref (company_id, guest_id, dietary_type, special_requests)
            VALUES (1, 101, 'Vegetarian', 'No peanuts');
        `);

        // Seed Accommodation
        await pool.query(`
            INSERT INTO hotels (hotel_id, hotel_name, hotel_type, address)
            VALUES (401, 'Grand Hyatt', 'Business', 'Downtown');
        `);
        await pool.query(`
            INSERT INTO rooms (room_id, hotel_id, room_number, room_type)
            VALUES (501, 401, '504', 'Deluxe');
        `);
        await pool.query(`
            INSERT INTO accommodation_reservations (guest_id, hotel_id, room_id, check_in_date, check_out_date, reservation_status)
            VALUES (101, 401, 501, '2026-06-29', '2026-07-02', 'Confirmed');
        `);

        // Seed Checkin Record
        await pool.query(`
            INSERT INTO checkin_records (guest_id, event_id, checkin_method, status)
            VALUES (101, 1, 'Manual', 'Success');
        `);

        console.log("Seeding complete. Testing service layer...");

        // 2. Service Level - Report Templates CRUD
        console.log("\n2. Testing Report Templates CRUD...");
        const templateData = {
            name: "VIP Room and Dietary Summary",
            description: "Test template for guest reporting",
            group_by_column: "hotel_selection",
            filter_criteria: { category: "VIP" },
            sort_criteria: { column: "guest_name", direction: "ASC" },
            columns: [
                { column_name: "guest_name", display_label: "Guest Name", column_order: 1 },
                { column_name: "meal_preference", display_label: "Dietary Preferene", column_order: 2 },
                { column_name: "hotel_selection", display_label: "Hotel", column_order: 3 }
            ]
        };

        const template = await GuestReportingService.createTemplate(templateData, context);
        console.log("Created template ID:", template.id);
        if (template.name !== templateData.name) throw new Error("Template name mismatch");

        const fetchedTemplate = await GuestReportingService.getTemplateById(template.id, context);
        console.log("Fetched template name:", fetchedTemplate.name);
        if (fetchedTemplate.columns.length !== 3) throw new Error("Template columns length mismatch");

        const allTemplates = await GuestReportingService.listTemplates(context);
        console.log("Listed templates count:", allTemplates.length);
        if (allTemplates.length === 0) throw new Error("No templates listed");

        // 3. Service Level - Previews
        console.log("\n3. Testing Report Previews...");
        const preview = await GuestReportingService.previewReport(1, template.id, {}, context);
        console.log("Preview rows count:", preview.rows.length);
        if (preview.rows.length === 0) throw new Error("Preview rows should not be empty");
        console.log("Preview row data:", preview.rows[0]);

        // 4. Service Level - Generated Reports CRUD
        console.log("\n4. Testing Report Generation & Snapshots...");
        const reportData = {
            event_id: 1,
            name: "Tech Summit 2026 VIP Catering Breakdown",
            description: "Frozen snapshot of VIP guests rooms and meals",
            template_id: template.id
        };
        const report = await GuestReportingService.createReport(reportData, context);
        console.log("Created Report ID:", report.id);

        const reportDetails = await GuestReportingService.getReportDetails(report.id, context);
        console.log("Report details snapshots count:", reportDetails.snapshots.length);
        if (reportDetails.snapshots.length === 0) throw new Error("Report details should contain snapshots");
        console.log("Snapshot data:", reportDetails.snapshots[0].snapshot_data);

        const allReports = await GuestReportingService.listReports(1, context);
        console.log("Listed reports count:", allReports.length);

        // 5. Service Level - Export & Logs
        console.log("\n5. Testing CSV Export & Logs...");
        const csv = await GuestReportingService.exportReportCsv(report.id, context);
        console.log("Generated CSV contents:\n", csv);
        if (!csv.includes("Alex Harrison")) throw new Error("CSV does not contain seeded guest name");

        const logData = {
            report_id: report.id,
            export_type: "Excel",
            file_url: "https://s3.amazonaws.com/eventhub360/reports/report_5_export.xlsx"
        };
        const exportLog = await GuestReportingService.logExport(logData, context);
        console.log("Created Export Log ID:", exportLog.id);

        const exportHistory = await GuestReportingService.getExportHistory(context);
        console.log("Export history count:", exportHistory.length);

        // 6. Service Level - Dashboard & Refresh
        console.log("\n6. Testing Dashboard Analytics & Cache Refresh...");
        await GuestReportingService.triggerAnalyticsRefresh(1, context);
        console.log("Analytics refresh triggered.");

        const overview = await GuestReportingService.getDashboardOverview(1, context);
        console.log("Dashboard overview metrics:", overview);
        if (overview.reports_generated !== 1) throw new Error("Overview report count mismatch");

        const catAnalytics = await GuestReportingService.getCategoryAnalytics(1, context);
        console.log("Category analytics count:", catAnalytics.length);
        console.log("Category analytic row:", catAnalytics[0]);

        const trends = await GuestReportingService.getAttendanceTrends(1, context);
        console.log("Attendance check-in trends count:", trends.length);

        console.log("\nService-level tests passed. Booting HTTP server and testing API endpoints...");
        await sleep(1000); // Wait a second for Express port binding

        // 7. HTTP Endpoint Tests
        const baseUrl = "http://localhost:5055/api/v1/guest-reporting";
        const headers = {
            "Content-Type": "application/json",
            "x-company-id": "1",
            "x-user-id": "999"
        };

        // HTTP GET templates
        console.log("\nHTTP: GET /templates");
        let res = await fetch(`${baseUrl}/templates`, { headers });
        let json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Data Count:", json.data.length);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET templates failed");

        // HTTP POST templates
        console.log("\nHTTP: POST /templates");
        res = await fetch(`${baseUrl}/templates`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                name: "HTTP Custom template",
                columns: [{ column_name: "guest_name", display_label: "Guest Name" }]
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "New Template ID:", json.data ? json.data.id : null);
        if (res.status !== 201 || !json.success) throw new Error("HTTP POST template failed");
        const httpTemplateId = json.data.id;

        // HTTP POST preview
        console.log("\nHTTP: POST /preview/:eventId");
        res = await fetch(`${baseUrl}/preview/1?template_id=${template.id}`, {
            method: "POST",
            headers,
            body: JSON.stringify({})
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Preview Rows:", json.data ? json.data.rows.length : null);
        if (res.status !== 200 || !json.success) throw new Error("HTTP POST preview failed");

        // HTTP POST reports
        console.log("\nHTTP: POST /reports");
        res = await fetch(`${baseUrl}/reports`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                event_id: 1,
                name: "HTTP Generated Report",
                template_id: template.id
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "New Report ID:", json.data ? json.data.id : null);
        if (res.status !== 201 || !json.success) throw new Error("HTTP POST reports failed");
        const httpReportId = json.data.id;

        // HTTP GET report details
        console.log(`\nHTTP: GET /reports/${httpReportId}`);
        res = await fetch(`${baseUrl}/reports/${httpReportId}`, { headers });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Report Name:", json.data ? json.data.name : null);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET report details failed");

        // HTTP GET report CSV
        console.log(`\nHTTP: GET /reports/${httpReportId}/export`);
        res = await fetch(`${baseUrl}/reports/${httpReportId}/export`, { headers });
        const text = await res.text();
        console.log("Status:", res.status, "CSV Header:", text.split('\n')[0]);
        if (res.status !== 200 || !text.includes("Guest ID")) throw new Error("HTTP GET report CSV failed");

        // HTTP POST exports log
        console.log("\nHTTP: POST /exports/log");
        res = await fetch(`${baseUrl}/exports/log`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                report_id: httpReportId,
                export_type: "PDF",
                file_url: "https://s3.amazonaws.com/eventhub360/reports/report_http.pdf"
            })
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Logged ID:", json.data ? json.data.id : null);
        if (res.status !== 200 || !json.success) throw new Error("HTTP POST exports log failed");

        // HTTP GET exports history
        console.log("\nHTTP: GET /exports/history");
        res = await fetch(`${baseUrl}/exports/history`, { headers });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "History Items:", json.data ? json.data.length : null);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET exports history failed");

        // HTTP GET dashboard overview
        console.log("\nHTTP: GET /dashboard/overview/1");
        res = await fetch(`${baseUrl}/dashboard/overview/1`, { headers });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Overview:", json.data);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET dashboard overview failed");

        // HTTP GET dashboard categories
        console.log("\nHTTP: GET /dashboard/categories/1");
        res = await fetch(`${baseUrl}/dashboard/categories/1`, { headers });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Categories rings data:", json.data);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET dashboard categories failed");

        // HTTP GET dashboard trends
        console.log("\nHTTP: GET /dashboard/trends/1");
        res = await fetch(`${baseUrl}/dashboard/trends/1`, { headers });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Trends timeline:", json.data);
        if (res.status !== 200 || !json.success) throw new Error("HTTP GET dashboard trends failed");

        // HTTP POST dashboard refresh
        console.log("\nHTTP: POST /dashboard/refresh/1");
        res = await fetch(`${baseUrl}/dashboard/refresh/1`, {
            method: "POST",
            headers
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success, "Message:", json.message);
        if (res.status !== 200 || !json.success) throw new Error("HTTP POST dashboard refresh failed");

        // Clean up
        console.log("\nHTTP: DELETE /templates/:id");
        res = await fetch(`${baseUrl}/templates/${httpTemplateId}`, {
            method: "DELETE",
            headers
        });
        json = await res.json();
        console.log("Status:", res.status, "Success:", json.success);
        if (res.status !== 200 || !json.success) throw new Error("HTTP DELETE template failed");

        console.log("\n=== ALL GUEST REPORTING INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
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
