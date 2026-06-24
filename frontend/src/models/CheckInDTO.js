/**
 * Check-In & QR Scanner Operations Data Transfer Objects (DTOs)
 */

class CheckInDashboardDTO {
    /**
     * @param {Object} params
     * @param {number} params.totalExpected
     * @param {number} params.checkedIn
     * @param {number} params.vipCheckedIn
     * @param {number} params.totalVip
     * @param {number} params.peakFlowRate
     */
    constructor({ totalExpected, checkedIn, vipCheckedIn, totalVip, peakFlowRate }) {
        this.totalExpected = {
            count: Number(totalExpected),
            label: 'Total Expected',
            trend: '+12%'
        };
        
        const attendancePercent = totalExpected > 0 
            ? Math.round((checkedIn / totalExpected) * 100) 
            : 0;

        this.currentAttendance = {
            percentage: attendancePercent,
            checkedInCount: Number(checkedIn),
            label: `Current Attendance`,
            details: `${attendancePercent}% (${checkedIn} guests)`
        };

        this.vipsOnSite = {
            checkedIn: Number(vipCheckedIn),
            total: Number(totalVip),
            label: 'VIPs On-Site',
            ratio: `${vipCheckedIn}/${totalVip}`
        };

        this.peakFlowRate = {
            rate: Number(peakFlowRate),
            label: 'Peak Flow Rate',
            details: `${peakFlowRate} p/min`,
            status: 'Real-time'
        };
        
        // Target calculation parameters for charts
        this.capacityCircle = {
            fill: attendancePercent,
            subtitle: 'Estimated completion by 20:30'
        };
    }
}

class CheckInRecordResponseDTO {
    /**
     * @param {import('./CheckInRecord')} record 
     */
    constructor(record) {
        this.checkin_record_id = record.checkin_record_id;
        this.guest_id = record.guest_id;
        this.guest_name = record.guest_name || 'Guest #' + record.guest_id;
        this.guest_category = record.guest_category || 'Attendee';
        this.checkin_time = record.checkin_time ? record.checkin_time.toLocaleTimeString('en-US', { hour12: false }) : null;
        this.checkin_method = record.checkin_method; // 'QR Scan' | 'Manual'
        this.status = record.status; // 'Success' | 'Flagged' | 'Failed'
        this.gate_name = record.gate_name || 'Main Gate';
        this.pass_code = record.pass_code || 'Manual';
    }
}

class VipArrivalAlertResponseDTO {
    /**
     * @param {import('./VipArrivalAlert')} alert 
     */
    constructor(alert) {
        this.alert_id = alert.alert_id;
        this.guest_id = alert.guest_id;
        this.guest_name = alert.guest_name || 'VIP Guest #' + alert.guest_id;
        this.guest_category = alert.guest_category || 'Keynote';
        this.arrival_time = alert.arrival_time ? alert.arrival_time.toISOString() : null;
        this.alert_status = alert.alert_status; // 'Unread' | 'Read' | 'Dismissed'
        this.table_number = alert.table_number || 'N/A';
        this.gate_name = alert.gate_name || 'VIP Entrance';
    }
}

class EntryGateResponseDTO {
    /**
     * @param {import('./EntryGate')} gate 
     * @param {number} [currentFlowCount] 
     */
    constructor(gate, currentFlowCount = 0) {
        this.entry_gate_id = gate.entry_gate_id;
        this.gate_name = gate.gate_name;
        this.gate_type = gate.gate_type;
        this.capacity_limit = gate.capacity_limit;
        this.status = gate.status; // 'Clear Flow' | 'Queuing' | 'Slow Lane' | 'Fast Lane' | 'Closed'
        this.current_flow_count = Number(currentFlowCount);
        
        // Render UI tags
        this.flowLabel = gate.status === 'Queuing' ? `Queuing (12m)` : (gate.status === 'Fast Lane' ? 'Fast Lane' : 'Clear Flow');
    }
}

class FlowAnalyticsResponseDTO {
    /**
     * @param {import('./FlowAnalytics')} log 
     */
    constructor(log) {
        this.analytics_id = log.analytics_id;
        this.time_slot = log.time_slot ? log.time_slot.toISOString().substring(11, 16) : null; // HH:MM
        this.guest_count = log.guest_count;
        this.flow_rate = log.flow_rate;
        this.peak_indicator = log.peak_indicator;
    }
}

class GuestFlagResponseDTO {
    /**
     * @param {import('./GuestFlag')} flag 
     */
    constructor(flag) {
        this.flag_id = flag.flag_id;
        this.guest_id = flag.guest_id;
        this.guest_name = flag.guest_name || 'Guest #' + flag.guest_id;
        this.flag_reason = flag.flag_reason;
        this.flag_status = flag.flag_status; // 'Flagged' | 'Reviewed' | 'Resolved'
        this.reviewed_by = flag.reviewed_by;
        this.created_at = flag.created_at ? flag.created_at.toISOString() : null;
    }
}

module.exports = {
    CheckInDashboardDTO,
    CheckInRecordResponseDTO,
    VipArrivalAlertResponseDTO,
    EntryGateResponseDTO,
    FlowAnalyticsResponseDTO,
    GuestFlagResponseDTO
};
