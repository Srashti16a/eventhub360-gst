const CheckInRepository = require('./CheckInRepository');
const QrPassService = require('./QrPassService');
const QrPassRepository = require('./QrPassRepository');
const {
    CheckInDashboardDTO,
    CheckInRecordResponseDTO,
    VipArrivalAlertResponseDTO,
    EntryGateResponseDTO,
    FlowAnalyticsResponseDTO,
    GuestFlagResponseDTO
} = require('./CheckInDTO');
const pool = require('../config/db');

class CheckInService {
    /**
     * Read dashboard metrics stats DTO
     */
    async getDashboardData(eventId, companyId) {
        // Ensure attendance tracker row exists
        let tracker = await CheckInRepository.getAttendanceTracker(eventId);
        if (!tracker) {
            // Count total invited guests for default expected count
            const expectedCountRes = await pool.query(
                `SELECT COUNT(eg.event_guest_id)::INTEGER FROM event_guest eg
                 JOIN guest g ON eg.guest_id = g.guest_id
                 WHERE eg.event_id = $1 AND g.company_id = $2;`,
                [eventId, companyId]
            );
            const expected = expectedCountRes.rows[0].count || 0;

            tracker = await CheckInRepository.createAttendanceTracker({
                event_id: eventId,
                expected_guests: expected
            });
        }

        const stats = await CheckInRepository.getQrPassStats(eventId, companyId);
        
        // Count total VIP expected guests
        const totalVipRes = await pool.query(
            `SELECT COUNT(eg.event_guest_id)::INTEGER FROM event_guest eg
             JOIN guest g ON eg.guest_id = g.guest_id
             WHERE eg.event_id = $1 AND g.company_id = $2 AND g.category IN ('VIP', 'Speaker');`,
            [eventId, companyId]
        );
        const totalVip = totalVipRes.rows[0].count || 0;

        // Current real-time flow rate logic: checkin count in the last 5 minutes / 5
        const recentFlowRes = await pool.query(
            `SELECT COUNT(*)::INTEGER FROM checkin_records 
             WHERE event_id = $1 AND checkin_time >= CURRENT_TIMESTAMP - INTERVAL '5 minutes';`,
            [eventId]
        );
        const recentCheckinsCount = recentFlowRes.rows[0].count || 0;
        const currentFlowRate = Number((recentCheckinsCount / 5.0).toFixed(1));

        // Save flow rate to analytics table hourly
        const currentHourSlot = new Date();
        currentHourSlot.setMinutes(0, 0, 0); // truncate to hour slot
        await CheckInRepository.logFlowAnalytics({
            event_id: eventId,
            time_slot: currentHourSlot,
            guest_count: tracker.checked_in_guests,
            flow_rate: currentFlowRate,
            peak_indicator: currentFlowRate >= 15.0
        });

        return new CheckInDashboardDTO({
            totalExpected: tracker.expected_guests,
            checkedIn: tracker.checked_in_guests,
            vipCheckedIn: tracker.vip_checked_in,
            totalVip: totalVip,
            peakFlowRate: currentFlowRate
        });
    }

    /**
     * Get recent logs list
     */
    async getCheckInFeed(eventId, limit = 5) {
        const list = await CheckInRepository.getRecentCheckInRecords(eventId, limit);
        return list.map(r => new CheckInRecordResponseDTO(r));
    }

    /**
     * Get VIP arrival alert list
     */
    async getUnreadVipAlerts(eventId, limit = 5) {
        const list = await CheckInRepository.getUnreadVipAlerts(eventId, limit);
        return list.map(a => new VipArrivalAlertResponseDTO(a));
    }

    /**
     * Manual Override check-in
     */
    async manualCheckInGuest(data, companyId, userId) {
        const existingRecord = await CheckInRepository.getCheckInRecordByGuest(data.event_id, data.guest_id);
        if (existingRecord) {
            throw new Error('Guest is already checked in');
        }

        // Fetch guest details to verify VIP category
        const guestRes = await pool.query(
            `SELECT category, name FROM guest WHERE guest_id = $1 AND company_id = $2;`,
            [data.guest_id, companyId]
        );
        if (guestRes.rows.length === 0) {
            throw new Error('Guest not found');
        }
        const guest = guestRes.rows[0];
        const isVip = ['VIP', 'Speaker'].includes(guest.category);

        // Check if guest is flagged
        const flag = await CheckInRepository.getGuestFlag(data.event_id, data.guest_id);
        const recordStatus = (flag && flag.flag_status === 'Flagged') ? 'Flagged' : data.status;

        const record = await CheckInRepository.createCheckInRecord({
            guest_id: data.guest_id,
            event_id: data.event_id,
            entry_gate_id: data.entry_gate_id,
            checkin_method: 'Manual',
            status: recordStatus
        });

        // Trigger VIP alerts if success and VIP
        if (isVip && recordStatus === 'Success') {
            await CheckInRepository.createVipArrivalAlert({
                guest_id: data.guest_id,
                event_id: data.event_id,
                alert_status: 'Unread'
            });
        }

        // Increment cumulative attendance counts
        await CheckInRepository.incrementAttendance(data.event_id, isVip);

        // Log auditable override actions
        await CheckInRepository.logCheckInHistory({
            guest_id: data.guest_id,
            event_id: data.event_id,
            action: `Manual override check-in status: ${recordStatus}`,
            performed_by: userId
        });

        return new CheckInRecordResponseDTO(record);
    }

    /**
     * QR validation gate scan check-in
     */
    async qrScanCheckInGuest(data, companyId, deviceToken, clientIp) {
        // Validate code credentials using the existing QrPassService logic
        const verifyResult = await QrPassService.verifyAndTrackPassScan({
            pass_code: data.pass_code,
            scan_location: 'Gate Check-In'
        }, companyId, deviceToken, clientIp);

        if (!verifyResult.verified) {
            // Write a failed checkin record log
            const pass = await QrPassRepository.getPassByCode(data.pass_code, companyId);
            if (pass) {
                await CheckInRepository.createCheckInRecord({
                    guest_id: pass.guest_id,
                    event_id: data.event_id,
                    pass_id: pass.pass_id,
                    entry_gate_id: data.entry_gate_id,
                    checkin_method: 'QR Scan',
                    status: 'Failed'
                });
            }
            throw new Error(`Check-In Denied: ${verifyResult.message}`);
        }

        const pass = await QrPassRepository.getPassByCode(data.pass_code, companyId);
        const existingRecord = await CheckInRepository.getCheckInRecordByGuest(data.event_id, pass.guest_id);
        if (existingRecord) {
            return new CheckInRecordResponseDTO(existingRecord); // Allow return of successful checked-in ticket info
        }

        const isVip = ['VIP', 'Speaker'].includes(pass.pass_type);

        // Check guest security flags
        const flag = await CheckInRepository.getGuestFlag(data.event_id, pass.guest_id);
        const recordStatus = (flag && flag.flag_status === 'Flagged') ? 'Flagged' : 'Success';

        // Retrieve hardware scanner ID if mapped
        const scanner = await QrPassRepository.getScannerByToken(deviceToken);

        const record = await CheckInRepository.createCheckInRecord({
            guest_id: pass.guest_id,
            event_id: data.event_id,
            pass_id: pass.pass_id,
            scanner_device_id: scanner ? scanner.device_id : null,
            entry_gate_id: data.entry_gate_id,
            checkin_method: 'QR Scan',
            status: recordStatus
        });

        // Trigger VIP notifications
        if (isVip && recordStatus === 'Success') {
            await CheckInRepository.createVipArrivalAlert({
                guest_id: pass.guest_id,
                event_id: data.event_id,
                alert_status: 'Unread'
            });
        }

        // Increment stats
        await CheckInRepository.incrementAttendance(data.event_id, isVip);

        return new CheckInRecordResponseDTO(record);
    }

    /**
     * Flag guest security override
     */
    async flagGuest(data, companyId, userId) {
        const flag = await CheckInRepository.createGuestFlag(data);
        
        // Update check-in record status to Flagged if exists
        await pool.query(
            `UPDATE checkin_records SET status = 'Flagged' 
             WHERE guest_id = $1 AND event_id = $2;`,
            [data.guest_id, data.event_id]
        );

        await CheckInRepository.logCheckInHistory({
            guest_id: data.guest_id,
            event_id: data.event_id,
            action: `Guest Flagged: ${data.flag_reason}`,
            performed_by: userId
        });

        return flag;
    }

    /**
     * Review guest security flags
     */
    async reviewFlag(flagId, status, companyId, userId) {
        const flag = await pool.query(
            `SELECT * FROM guest_flags WHERE flag_id = $1;`
        ).then(res => res.rows[0]);

        if (!flag) throw new Error('Security flag not found');

        const updatedFlag = await CheckInRepository.updateGuestFlagStatus(flagId, status, userId);

        // If status resolved, revert check-in status to Success
        if (status === 'Resolved') {
            await pool.query(
                `UPDATE checkin_records SET status = 'Success' 
                 WHERE guest_id = $1 AND event_id = $2;`,
                [flag.guest_id, flag.event_id]
            );
        }

        await CheckInRepository.logCheckInHistory({
            guest_id: flag.guest_id,
            event_id: flag.event_id,
            action: `Guest Flag Review Status: ${status}`,
            performed_by: userId
        });

        return updatedFlag;
    }

    /**
     * Get monitoring status for gates
     */
    async getEntryGatesMetrics(eventId) {
        const gates = await CheckInRepository.getGatesByEvent(eventId);
        const metrics = [];

        for (const gate of gates) {
            // Count entries in the last 15 minutes to calculate gate velocity
            const countRes = await pool.query(
                `SELECT COUNT(*)::INTEGER FROM checkin_records 
                 WHERE entry_gate_id = $1 AND checkin_time >= CURRENT_TIMESTAMP - INTERVAL '15 minutes';`,
                [gate.entry_gate_id]
            );
            const count = countRes.rows[0].count || 0;
            
            // Adjust status threshold based on velocity
            let dynamicStatus = gate.status;
            if (count > 30) {
                dynamicStatus = 'Queuing';
            } else if (count > 15) {
                dynamicStatus = 'Slow Lane';
            } else if (gate.status !== 'Closed') {
                dynamicStatus = 'Clear Flow';
            }

            if (dynamicStatus !== gate.status) {
                await CheckInRepository.updateGate(gate.entry_gate_id, { status: dynamicStatus });
                gate.status = dynamicStatus;
            }

            metrics.push(new EntryGateResponseDTO(gate, count));
        }

        return metrics;
    }
}

module.exports = new CheckInService();
