/**
 * GuestReporting DTO Layer
 */

class GuestReportResponseDTO {
    constructor(report) {
        if (!report) return;
        this.id = report.id;
        this.company_id = report.company_id;
        this.event_id = report.event_id;
        this.name = report.name;
        this.description = report.description;
        this.template_id = report.template_id;
        this.created_at = report.created_at ? report.created_at.toISOString() : null;
        this.updated_at = report.updated_at ? report.updated_at.toISOString() : null;
    }
}

class ReportTemplateResponseDTO {
    constructor(temp) {
        if (!temp) return;
        this.id = temp.id;
        this.company_id = temp.company_id;
        this.name = temp.name;
        this.description = temp.description;
        this.group_by_column = temp.group_by_column;
        this.filter_criteria = temp.filter_criteria;
        this.sort_criteria = temp.sort_criteria;
        this.created_at = temp.created_at ? temp.created_at.toISOString() : null;
        
        // Joined details
        this.columns = [];
    }
}

class GuestDataSnapshotResponseDTO {
    constructor(snap) {
        if (!snap) return;
        this.id = snap.id;
        this.report_id = snap.report_id;
        this.guest_id = snap.guest_id;
        this.snapshot_data = snap.snapshot_data;
        this.created_at = snap.created_at ? snap.created_at.toISOString() : null;
    }
}

class ReportExportHistoryResponseDTO {
    constructor(h) {
        if (!h) return;
        this.id = h.id;
        this.company_id = h.company_id;
        this.report_id = h.report_id;
        this.export_type = h.export_type;
        this.file_url = h.file_url;
        this.performed_by = h.performed_by;
        this.created_at = h.created_at ? h.created_at.toISOString() : null;
    }
}

class GuestCategoryAnalyticsResponseDTO {
    constructor(a) {
        if (!a) return;
        this.id = a.id;
        this.company_id = a.company_id;
        this.event_id = a.event_id;
        this.category = a.category;
        this.total_count = a.total_count;
        this.confirmed_count = a.confirmed_count;
        this.checked_in_count = a.checked_in_count;
    }
}

class AttendanceTrendResponseDTO {
    constructor(t) {
        if (!t) return;
        this.id = t.id;
        this.company_id = t.company_id;
        this.event_id = t.event_id;
        this.time_bucket = t.time_bucket;
        this.checkin_count = t.checkin_count;
    }
}

class SatisfactionAnalyticsResponseDTO {
    constructor(s) {
        if (!s) return;
        this.id = s.id;
        this.company_id = s.company_id;
        this.event_id = s.event_id;
        this.average_score = Number(s.average_score);
        this.total_responses = s.total_responses;
    }
}

class DashboardOverviewResponseDTO {
    constructor({ reports_generated, avg_attendance_pct, satisfaction_score, unique_data_points }) {
        this.reports_generated = reports_generated || 0;
        this.avg_attendance_pct = avg_attendance_pct !== undefined ? Number(avg_attendance_pct) : 0.0;
        this.satisfaction_score = satisfaction_score !== undefined ? Number(satisfaction_score) : 0.0;
        this.unique_data_points = unique_data_points || 0;
    }
}

class ReportPreviewResponseDTO {
    constructor({ headers, rows }) {
        this.headers = headers || []; // e.g. [{"key": "guest_name", "label": "Guest Name"}]
        this.rows = rows || [];       // e.g. [{"guest_name": "Alex", "email": "alex@..."}]
    }
}

module.exports = {
    GuestReportResponseDTO,
    ReportTemplateResponseDTO,
    GuestDataSnapshotResponseDTO,
    ReportExportHistoryResponseDTO,
    GuestCategoryAnalyticsResponseDTO,
    AttendanceTrendResponseDTO,
    SatisfactionAnalyticsResponseDTO,
    DashboardOverviewResponseDTO,
    ReportPreviewResponseDTO
};
