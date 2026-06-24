const pool = require('../config/db');
const GuestReportingRepository = require('./GuestReportingRepository');
const {
    GuestReportResponseDTO,
    ReportTemplateResponseDTO,
    GuestDataSnapshotResponseDTO,
    ReportExportHistoryResponseDTO,
    GuestCategoryAnalyticsResponseDTO,
    AttendanceTrendResponseDTO,
    SatisfactionAnalyticsResponseDTO,
    DashboardOverviewResponseDTO,
    ReportPreviewResponseDTO
} = require('./GuestReportingDTO');

class GuestReportingService {
    // ==========================================
    // 1. Report Templates & Columns
    // ==========================================
    async createTemplate(data, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const template = await GuestReportingRepository.createTemplate({
                ...data,
                company_id: context.companyId
            }, client);

            const columns = [];
            if (data.columns && data.columns.length > 0) {
                for (let i = 0; i < data.columns.length; i++) {
                    const col = data.columns[i];
                    const createdCol = await GuestReportingRepository.createReportColumn({
                        template_id: template.id,
                        column_name: col.column_name,
                        display_label: col.display_label,
                        column_order: col.column_order || i
                    }, client);
                    columns.push(createdCol);
                }
            }

            await client.query('COMMIT');
            
            const dto = new ReportTemplateResponseDTO(template);
            dto.columns = columns;
            return dto;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getTemplateById(id, context) {
        const template = await GuestReportingRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Report template not found');
            error.status = 404;
            throw error;
        }

        const columns = await GuestReportingRepository.getReportColumnsByTemplate(id);
        const dto = new ReportTemplateResponseDTO(template);
        dto.columns = columns;
        return dto;
    }

    async listTemplates(context) {
        const templates = await GuestReportingRepository.findAllTemplates(context.companyId);
        const data = [];
        
        for (const temp of templates) {
            const columns = await GuestReportingRepository.getReportColumnsByTemplate(temp.id);
            const dto = new ReportTemplateResponseDTO(temp);
            dto.columns = columns;
            data.push(dto);
        }
        return data;
    }

    async deleteTemplate(id, context) {
        const template = await GuestReportingRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Report template not found');
            error.status = 404;
            throw error;
        }
        return await GuestReportingRepository.deleteTemplate(id, context.companyId);
    }

    // ==========================================
    // 2. Dynamic Report Builder & Previews
    // ==========================================
    async previewReport(eventId, templateId, options, context) {
        let filters = options.filter_criteria || {};
        let sorts = options.sort_criteria || {};
        let columnsList = options.columns || [];
        let groupBy = options.group_by_column;

        if (templateId) {
            const template = await GuestReportingRepository.findTemplateById(templateId, context.companyId);
            if (template) {
                filters = template.filter_criteria;
                sorts = template.sort_criteria;
                groupBy = template.group_by_column;
                
                const dbCols = await GuestReportingRepository.getReportColumnsByTemplate(templateId);
                columnsList = dbCols.map(c => ({
                    column_name: c.column_name,
                    display_label: c.display_label
                }));
            }
        }

        // Default columns if none specified
        if (columnsList.length === 0) {
            columnsList = [
                { column_name: 'guest_name', display_label: 'Guest Name' },
                { column_name: 'guest_email', display_label: 'Email' },
                { column_name: 'rsvp_status', display_label: 'RSVP Status' },
                { column_name: 'guest_category', display_label: 'Tier' }
            ];
        }

        // Fetch dynamic guest database details
        const rows = await GuestReportingRepository.getDynamicGuestData(context.companyId, eventId, filters, sorts);

        // Map database records to selected columns format
        let formattedRows = rows.map(r => {
            const formatted = {};
            columnsList.forEach(col => {
                formatted[col.column_name] = r[col.column_name] !== undefined ? r[col.column_name] : null;
            });
            // Include guest_id for reference
            formatted.guest_id = r.guest_id;
            return formatted;
        });

        // Group by column logic (optional)
        if (groupBy) {
            const groups = {};
            formattedRows.forEach(row => {
                const groupVal = row[groupBy] || 'Unassigned';
                if (!groups[groupVal]) groups[groupVal] = [];
                groups[groupVal].push(row);
            });
            
            // Flatten grouped rows back or return grouped layout
            formattedRows = Object.keys(groups).map(gName => ({
                group_name: gName,
                rows: groups[gName]
            }));
        }

        return new ReportPreviewResponseDTO({
            headers: columnsList,
            rows: formattedRows
        });
    }

    // ==========================================
    // 3. Guest Reports & Frozen Snapshots
    // ==========================================
    async createReport(data, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const report = await GuestReportingRepository.createReport({
                ...data,
                company_id: context.companyId
            }, client);

            // Fetch dynamic guests data to create frozen snapshots
            let filters = {};
            let sorts = {};
            if (data.template_id) {
                const template = await GuestReportingRepository.findTemplateById(data.template_id, context.companyId);
                if (template) {
                    filters = template.filter_criteria;
                    sorts = template.sort_criteria;
                }
            }

            const guests = await GuestReportingRepository.getDynamicGuestData(context.companyId, data.event_id, filters, sorts);

            // Save snapshots
            for (const guest of guests) {
                await GuestReportingRepository.createGuestSnapshot({
                    report_id: report.id,
                    guest_id: guest.guest_id,
                    snapshot_data: {
                        name: guest.guest_name,
                        email: guest.guest_email,
                        phone: guest.guest_phone,
                        category: guest.guest_category,
                        rsvp_status: guest.rsvp_status,
                        meal_preference: guest.meal_preference,
                        hotel_selection: guest.hotel_selection,
                        room_number: guest.room_number,
                        checkin_time: guest.checkin_time,
                        flight_number: guest.flight_number
                    }
                }, client);
            }

            await client.query('COMMIT');
            return new GuestReportResponseDTO(report);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getReportDetails(id, context) {
        const report = await GuestReportingRepository.findReportById(id, context.companyId);
        if (!report) {
            const error = new Error('Guest report not found');
            error.status = 404;
            throw error;
        }

        const snapshots = await GuestReportingRepository.getSnapshotsByReport(id);
        const dto = new GuestReportResponseDTO(report);
        dto.snapshots = snapshots.map(s => new GuestDataSnapshotResponseDTO(s));
        return dto;
    }

    async listReports(eventId, context) {
        const list = await GuestReportingRepository.findAllReports(context.companyId, eventId);
        return list.map(r => new GuestReportResponseDTO(r));
    }

    async deleteReport(id, context) {
        const report = await GuestReportingRepository.findReportById(id, context.companyId);
        if (!report) {
            const error = new Error('Guest report not found');
            error.status = 404;
            throw error;
        }
        return await GuestReportingRepository.deleteReport(id, context.companyId);
    }

    // ==========================================
    // 4. PDF/Excel Export & History
    // ==========================================
    async logExport(data, context) {
        const exportLog = await GuestReportingRepository.createExportHistory({
            ...data,
            company_id: context.companyId,
            performed_by: context.userId
        });
        return new ReportExportHistoryResponseDTO(exportLog);
    }

    async getExportHistory(context) {
        const list = await GuestReportingRepository.getExportHistories(context.companyId);
        return list.map(h => new ReportExportHistoryResponseDTO(h));
    }

    async exportReportCsv(reportId, context) {
        const report = await GuestReportingRepository.findReportById(reportId, context.companyId);
        if (!report) {
            const error = new Error('Guest report not found');
            error.status = 404;
            throw error;
        }

        const snapshots = await GuestReportingRepository.getSnapshotsByReport(reportId);
        
        let csv = 'Guest ID,Guest Name,Email,Phone,Tier,RSVP,Meal Pref,Hotel Room,Flight,Checkin Time\n';
        for (const snap of snapshots) {
            const d = snap.snapshot_data;
            csv += `"${snap.guest_id}","${d.name || ''}","${d.email || ''}","${d.phone || ''}","${d.category || ''}","${d.rsvp_status || ''}","${d.meal_preference || ''}","${d.hotel_selection || ''} ${d.room_number || ''}","${d.flight_number || ''}","${d.checkin_time || ''}"\n`;
        }
        return csv;
    }

    // ==========================================
    // 5. Dashboard Statistics & Overview
    // ==========================================
    async getDashboardOverview(eventId, context) {
        // Count total reports generated
        const reportsList = await GuestReportingRepository.findAllReports(context.companyId, eventId);
        const reportsCount = reportsList.length;

        // Fetch category totals for check-in percentage
        const categories = await GuestReportingRepository.getCategoryAnalyticsByEvent(eventId, context.companyId);
        let totalGuests = 0;
        let checkedInGuests = 0;
        categories.forEach(c => {
            totalGuests += c.total_count || 0;
            checkedInGuests += c.checked_in_count || 0;
        });
        const attendancePct = totalGuests > 0 ? Number(((checkedInGuests / totalGuests) * 100).toFixed(1)) : 0.0;

        // Fetch satisfaction score
        const satisfaction = await GuestReportingRepository.getSatisfactionByEvent(eventId, context.companyId);
        const avgSatisfaction = satisfaction ? Number(satisfaction.average_score) : 0.0;

        // Fetch unique data points (simulating counts from snapshots and allocations)
        const uniqueDataPoints = (totalGuests * 4) + (reportsCount * 10);

        return new DashboardOverviewResponseDTO({
            reports_generated: reportsCount,
            avg_attendance_pct: attendancePct,
            satisfaction_score: avgSatisfaction,
            unique_data_points: uniqueDataPoints
        });
    }

    async getCategoryAnalytics(eventId, context) {
        const list = await GuestReportingRepository.getCategoryAnalyticsByEvent(eventId, context.companyId);
        return list.map(c => new GuestCategoryAnalyticsResponseDTO(c));
    }

    async getAttendanceTrends(eventId, context) {
        const list = await GuestReportingRepository.getAttendanceTrendsByEvent(eventId, context.companyId);
        return list.map(t => new AttendanceTrendResponseDTO(t));
    }

    // Recalculates metrics and updates cache
    async triggerAnalyticsRefresh(eventId, context) {
        // 1. Recalculate guest category counts
        const categoryQuery = `
            SELECT 
                COALESCE(g.category, 'Standard') as cat,
                COUNT(eg.event_guest_id)::INTEGER as total,
                COALESCE(COUNT(CASE WHEN r.status IN ('yes', 'Accepted') THEN 1 END), 0)::INTEGER as confirmed,
                COALESCE(COUNT(CASE WHEN cr.status = 'Success' THEN 1 END), 0)::INTEGER as checked_in
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            LEFT JOIN checkin_records cr ON g.guest_id = cr.guest_id AND cr.event_id = eg.event_id
            WHERE eg.event_id = $1 AND g.company_id = $2
            GROUP BY cat;
        `;
        const catRes = await pool.query(categoryQuery, [eventId, context.companyId]);
        
        for (const row of catRes.rows) {
            await GuestReportingRepository.createOrUpdateCategoryAnalytics({
                company_id: context.companyId,
                event_id: eventId,
                category: row.cat,
                total_count: row.total,
                confirmed_count: row.confirmed,
                checked_in_count: row.checked_in
            });
        }

        // 2. Recalculate attendance trends (daily checkins check)
        const trendsQuery = `
            SELECT 
                TO_CHAR(checkin_time, 'FMDay') as day_bucket,
                COUNT(*)::INTEGER as checkin_count
            FROM checkin_records
            WHERE event_id = $1 AND status = 'Success'
            GROUP BY day_bucket;
        `;
        const trendsRes = await pool.query(trendsQuery, [eventId]);
        
        for (const row of trendsRes.rows) {
            await GuestReportingRepository.createOrUpdateAttendanceTrend({
                company_id: context.companyId,
                event_id: eventId,
                time_bucket: row.day_bucket,
                checkin_count: row.checkin_count
            });
        }

        // 3. Mock satisfaction rating average (e.g. 4.80)
        await GuestReportingRepository.createOrUpdateSatisfaction({
            company_id: context.companyId,
            event_id: eventId,
            average_score: 4.80,
            total_responses: 248
        });

        return { success: true, message: 'Analytics caches updated successfully' };
    }
}

module.exports = new GuestReportingService();
