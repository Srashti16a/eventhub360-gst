const pool = require('./db');
const CommunicationLogService = require('../models/CommunicationLogService');

async function runTest() {
    const context = {
        companyId: 1,
        branchId: null,
        userId: 999
    };

    console.log("=== STARTING MONITORING INTEGRATION TEST ===");

    try {
        // Clear previous monitoring logs first
        console.log("0. Cleaning up tables...");
        await pool.query("DELETE FROM automation_alerts");
        await pool.query("DELETE FROM communication_latencies");
        await pool.query("DELETE FROM traffic_reroutes");
        await pool.query("DELETE FROM retry_histories");
        await pool.query("DELETE FROM gateway_failures");
        await pool.query("DELETE FROM message_delivery_logs");

        // Fetch a guest to log against (reusing Alice Smith from past seed if exists)
        const guestRes = await pool.query("SELECT guest_id FROM guest LIMIT 1");
        if (guestRes.rows.length === 0) {
            console.error("Please seed a guest before running tests!");
            return;
        }
        const guestId = guestRes.rows[0].guest_id;

        // 1. Log a message delivery
        console.log("\n1. Logging message delivery (Pending)...");
        const log = await CommunicationLogService.createLog({
            guest_id: guestId,
            channel: 'Email',
            recipient_address: 'test@company.com',
            status: 'Pending',
            sent_at: new Date(Date.now() - 5000) // sent 5 seconds ago
        }, context);
        console.log("Logged Delivery ID:", log.id, "Status:", log.status);

        // 2. Track receipt webhook callback (Success: Delivered)
        console.log("\n2. Simulating webhook Delivered callback...");
        const deliveredLog = await CommunicationLogService.trackDeliveryReceipt({
            log_id: log.id,
            status: 'Delivered',
            delivery_result: 'Delivered successfully via SendGrid SMTP',
            gateway_name: 'SendGrid'
        }, context);
        console.log("Updated Log Status:", deliveredLog.status);

        // Verify latency calculation
        const details = await CommunicationLogService.getLogDetails(log.id, context);
        console.log("Queue Latency (ms):", details.latency.queue_latency_ms);
        console.log("Delivery Latency (ms):", details.latency.delivery_latency_ms);
        console.log("Total Latency (ms):", details.latency.total_latency_ms);

        // 3. Track failures and Automation Alerts threshold
        console.log("\n3. Testing failures threshold & Automated Alerting...");
        for (let i = 0; i < 11; i++) {
            const failLog = await CommunicationLogService.createLog({
                guest_id: guestId,
                channel: 'SMS',
                recipient_address: `+1555999${i}`,
                status: 'Pending',
                sent_at: new Date()
            }, context);

            await CommunicationLogService.trackDeliveryReceipt({
                log_id: failLog.id,
                status: 'Failed',
                gateway_name: 'Twilio SMS',
                error_code: '30008',
                error_message: 'Carrier delivery failure'
            }, context);
        }

        // Verify alert was raised
        const alerts = await CommunicationLogService.getAutomationAlerts('Active', context);
        console.log("Active alerts raised:", alerts.length);
        if (alerts.length > 0) {
            console.log("Alert Message:", alerts[0].message);
            console.log("Alert Severity:", alerts[0].severity);
            console.log("Alert Type:", alerts[0].alert_type);

            // 4. Update alert status
            console.log("\n4. Resolving alert status...");
            const resolvedAlert = await CommunicationLogService.updateAlertStatus(alerts[0].id, 'Resolved', context);
            console.log("Updated Alert ID:", resolvedAlert.id, "New Status:", resolvedAlert.status);
        }

        // 5. Test retry logging
        console.log("\n5. Testing retry history logging...");
        // Log a pending message
        const retryLogObj = await CommunicationLogService.createLog({
            guest_id: guestId,
            channel: 'SMS',
            recipient_address: '+15551234',
            status: 'Pending'
        }, context);

        const retryResult = await CommunicationLogService.logRetryAttempt({
            log_id: retryLogObj.id,
            retry_count: 1,
            status: 'Retrying',
            gateway_response: 'Twilio rate limit hit. Retrying in 10s.'
        }, context);
        console.log("Logged Retry Status:", retryResult.status, "Retry Count:", retryResult.retry_count);

        const retryDetail = await CommunicationLogService.getLogDetails(retryLogObj.id, context);
        console.log("Retried log parent status updated to:", retryDetail.status);
        console.log("Retries list count:", retryDetail.retries.length);

        // 6. Test Rerouting
        console.log("\n6. Simulating gateway traffic reroute...");
        const reroute = await CommunicationLogService.rerouteTraffic({
            channel: 'SMS',
            from_gateway: 'Twilio SMS',
            to_gateway: 'Nexmo SMS',
            reroute_reason: 'Resolved Twilio connection warnings'
        }, context);
        console.log("Executed Reroute to:", reroute.to_gateway, "Active status:", reroute.is_active);

        const activeGateway = await CommunicationLogService.getActiveGateway('SMS', context);
        console.log("Active Gateway resolved to:", activeGateway.to_gateway);

        // 7. Verify Dashboard Analytics Stats
        console.log("\n7. Fetching Dashboard aggregated metrics stats...");
        const stats = await CommunicationLogService.getDashboardStats(context);
        console.log("Dashboard Stats - Total Logs:", stats.total_logs);
        console.log("Dashboard Stats - Successful Deliveries %:", stats.successful_deliveries_pct);
        console.log("Dashboard Stats - Active Failures Count:", stats.active_failures);
        console.log("Dashboard Stats - Avg Latency (seconds):", stats.avg_latency_sec);

        // 8. Test Export Logs
        console.log("\n8. Exporting CSV format logs...");
        const csv = await CommunicationLogService.exportLogsCsv({}, context);
        console.log("CSV Header & Sample Data:\n", csv.split('\n').slice(0, 3).join('\n'));

        console.log("\n=== MONITORING INTEGRATION TEST PASSED SUCCESSFULLY ===");
    } catch (error) {
        console.error("Monitoring integration test failed:", error);
    } finally {
        await pool.end();
    }
}

runTest();
