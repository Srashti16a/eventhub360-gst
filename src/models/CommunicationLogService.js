const pool = require('../config/db');
const CommunicationLogRepository = require('./CommunicationLogRepository');
const {
    MessageDeliveryLogResponseDTO,
    GatewayFailureResponseDTO,
    RetryHistoryResponseDTO,
    TrafficRerouteResponseDTO,
    CommunicationLatencyResponseDTO,
    AutomationAlertResponseDTO,
    DashboardStatsResponseDTO
} = require('./CommunicationLogDTO');

class CommunicationLogService {
    // ==========================================
    // 1. Delivery & Webhook Tracking
    // ==========================================
    async createLog(data, context) {
        const log = await CommunicationLogRepository.createDeliveryLog({
            ...data,
            company_id: context.companyId
        });
        return new MessageDeliveryLogResponseDTO(log);
    }

    async trackDeliveryReceipt(data, context) {
        const log = await CommunicationLogRepository.findDeliveryLogById(data.log_id, context.companyId);
        if (!log) {
            const error = new Error('Delivery log not found');
            error.status = 404;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const dates = {};
            if (data.status === 'Sent') dates.sent_at = data.sent_at || new Date();
            if (data.status === 'Delivered') dates.delivered_at = data.delivered_at || new Date();
            if (data.status === 'Read') dates.read_at = data.read_at || new Date();

            // Update log status
            const updatedLog = await CommunicationLogRepository.updateDeliveryLogStatus(
                data.log_id,
                context.companyId,
                data.status,
                data.delivery_result || null,
                dates,
                client
            );

            // Log latency if Delivered or Read
            if (['Delivered', 'Read'].includes(data.status)) {
                const createdTime = log.created_at;
                const sentTime = updatedLog.sent_at || log.sent_at || new Date();
                const deliverTime = updatedLog.delivered_at || updatedLog.read_at || new Date();

                const queueLatency = Math.max(0, sentTime.getTime() - createdTime.getTime());
                const deliveryLatency = Math.max(0, deliverTime.getTime() - sentTime.getTime());
                const totalLatency = queueLatency + deliveryLatency;

                await CommunicationLogRepository.createLatencyLog({
                    company_id: context.companyId,
                    log_id: data.log_id,
                    channel: log.channel,
                    queue_latency_ms: queueLatency,
                    delivery_latency_ms: deliveryLatency,
                    total_latency_ms: totalLatency
                }, client);
            }

            // Log gateway failure if status is Failed
            if (data.status === 'Failed') {
                await CommunicationLogRepository.createGatewayFailure({
                    company_id: context.companyId,
                    log_id: data.log_id,
                    gateway_name: data.gateway_name || 'Primary Gateway',
                    error_code: data.error_code || 'GW_ERROR',
                    error_message: data.error_message || 'Delivery failed at gateway'
                }, client);

                // Check automated alerting thresholds: if failures > 10 in the last 15 minutes
                const recentFailures = await CommunicationLogRepository.getRecentFailuresCount(context.companyId, 15);
                if (recentFailures >= 10) {
                    const activeAlerts = await CommunicationLogRepository.getAutomationAlerts(context.companyId, 'Active');
                    const hasHighFailureAlert = activeAlerts.some(a => a.alert_type === 'High Failure Rate');

                    if (!hasHighFailureAlert) {
                        await CommunicationLogRepository.createAutomationAlert({
                            company_id: context.companyId,
                            alert_type: 'High Failure Rate',
                            severity: 'Critical',
                            message: `We detected ${recentFailures} delivery failures in the last 15 minutes. Would you like to re-route via secondary gateway?`
                        }, client);
                    }
                }
            }

            await client.query('COMMIT');
            return new MessageDeliveryLogResponseDTO(updatedLog);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async logRetryAttempt(data, context) {
        const log = await CommunicationLogRepository.findDeliveryLogById(data.log_id, context.companyId);
        if (!log) {
            const error = new Error('Delivery log not found');
            error.status = 404;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Record retry history
            const retry = await CommunicationLogRepository.createRetryHistory({
                company_id: context.companyId,
                log_id: data.log_id,
                retry_count: data.retry_count,
                status: data.status,
                gateway_response: data.gateway_response || null
            }, client);

            // Update parent delivery log status to the latest status of retry (e.g. Sent or Failed)
            const dates = {};
            if (data.status === 'Success') {
                dates.sent_at = new Date();
            }

            const updatedStatus = data.status === 'Success' ? 'Sent' : (data.status === 'Failed' ? 'Failed' : 'Pending');
            await CommunicationLogRepository.updateDeliveryLogStatus(
                data.log_id,
                context.companyId,
                updatedStatus,
                `Retried ${data.retry_count} times. Status: ${data.status}`,
                dates,
                client
            );

            await client.query('COMMIT');
            return new RetryHistoryResponseDTO(retry);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==========================================
    // 2. Traffic Rerouting
    // ==========================================
    async rerouteTraffic(data, context) {
        const reroute = await CommunicationLogRepository.createTrafficReroute({
            ...data,
            company_id: context.companyId
        });
        return new TrafficRerouteResponseDTO(reroute);
    }

    async getTrafficReroutes(context) {
        const list = await CommunicationLogRepository.getTrafficReroutes(context.companyId);
        return list.map(rr => new TrafficRerouteResponseDTO(rr));
    }

    async getActiveGateway(channel, context) {
        const active = await CommunicationLogRepository.getLatestActiveReroute(context.companyId, channel);
        if (active) {
            return new TrafficRerouteResponseDTO(active);
        }
        // Default gateway mapping
        return {
            channel: channel,
            from_gateway: 'Primary',
            to_gateway: 'Primary',
            is_active: true
        };
    }

    // ==========================================
    // 3. Automation Alerts
    // ==========================================
    async getAutomationAlerts(status, context) {
        const list = await CommunicationLogRepository.getAutomationAlerts(context.companyId, status);
        return list.map(a => new AutomationAlertResponseDTO(a));
    }

    async updateAlertStatus(id, status, context) {
        const updated = await CommunicationLogRepository.updateAlertStatus(id, context.companyId, status);
        return new AutomationAlertResponseDTO(updated);
    }

    // ==========================================
    // 4. Monitoring Logs List & Details
    // ==========================================
    async listLogs(queryParams, context) {
        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const search = queryParams.search;
        const channel = queryParams.channel;
        const status = queryParams.status;
        const startDate = queryParams.startDate ? new Date(queryParams.startDate) : null;
        const endDate = queryParams.endDate ? new Date(queryParams.endDate) : null;

        const [items, total] = await Promise.all([
            CommunicationLogRepository.findAllDeliveryLogs(context.companyId, { page, limit, search, channel, status, startDate, endDate }),
            CommunicationLogRepository.countDeliveryLogs(context.companyId, { search, channel, status, startDate, endDate })
        ]);

        const data = [];
        for (const item of items) {
            const dto = new MessageDeliveryLogResponseDTO(item);
            
            // Hydrate nested elements for deep details
            const [failures, retries, latency] = await Promise.all([
                CommunicationLogRepository.getGatewayFailures(item.id),
                CommunicationLogRepository.getRetryHistories(item.id),
                CommunicationLogRepository.getLatencyLog(item.id)
            ]);

            dto.failures = failures.map(f => new GatewayFailureResponseDTO(f));
            dto.retries = retries.map(r => new RetryHistoryResponseDTO(r));
            dto.latency = latency ? new CommunicationLatencyResponseDTO(latency) : null;

            data.push(dto);
        }

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data
        };
    }

    async getLogDetails(id, context) {
        const log = await CommunicationLogRepository.findDeliveryLogById(id, context.companyId);
        if (!log) {
            const error = new Error('Delivery log not found');
            error.status = 404;
            throw error;
        }

        const dto = new MessageDeliveryLogResponseDTO(log);
        const [failures, retries, latency] = await Promise.all([
            CommunicationLogRepository.getGatewayFailures(id),
            CommunicationLogRepository.getRetryHistories(id),
            CommunicationLogRepository.getLatencyLog(id)
        ]);

        dto.failures = failures.map(f => new GatewayFailureResponseDTO(f));
        dto.retries = retries.map(r => new RetryHistoryResponseDTO(r));
        dto.latency = latency ? new CommunicationLatencyResponseDTO(latency) : null;

        return dto;
    }

    // ==========================================
    // 5. Dashboard Statistics
    // ==========================================
    async getDashboardStats(context) {
        const stats = await CommunicationLogRepository.getDashboardAggregateStats(context.companyId);
        return new DashboardStatsResponseDTO(stats);
    }

    // ==========================================
    // 6. Export Logs CSV
    // ==========================================
    async exportLogsCsv(queryParams, context) {
        const limit = 1000; // high limit export boundaries
        const logs = await CommunicationLogRepository.findAllDeliveryLogs(context.companyId, {
            page: 1,
            limit,
            search: queryParams.search,
            channel: queryParams.channel,
            status: queryParams.status,
            startDate: queryParams.startDate ? new Date(queryParams.startDate) : null,
            endDate: queryParams.endDate ? new Date(queryParams.endDate) : null
        });

        let csv = 'Timestamp,Channel,Recipient,Status,Result\n';
        for (const l of logs) {
            csv += `"${l.created_at.toISOString()}","${l.channel}","${l.recipient_address}","${l.status}","${l.delivery_result || ''}"\n`;
        }
        return csv;
    }
}

module.exports = new CommunicationLogService();
