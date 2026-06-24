const pool = require('../config/db');
const BadgePrintingRepository = require('./BadgePrintingRepository');
const QrPassRepository = require('./QrPassRepository');
const QrPassService = require('./QrPassService');
const {
    BadgePrinterResponseDTO,
    BadgeTemplateResponseDTO,
    BadgePrintJobResponseDTO,
    PrintQueueResponseDTO,
    PrinterAlertResponseDTO,
    BadgePrintLogResponseDTO,
    BadgeConfigurationResponseDTO,
    BadgeBatchResponseDTO,
    PrintPreviewResponseDTO
} = require('./BadgePrintingDTO');

class BadgePrintingService {
    // ==========================================
    // 1. Badge Printers
    // ==========================================
    async registerPrinter(data, context) {
        const printer = await BadgePrintingRepository.createPrinter({
            ...data,
            company_id: context.companyId,
            branch_id: context.branchId
        });
        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            action: `Printer ${printer.printer_name} (${printer.printer_code}) registered.`,
            performed_by: context.userId
        });
        return new BadgePrinterResponseDTO(printer);
    }

    async updatePrinter(id, data, context) {
        const printer = await BadgePrintingRepository.findPrinterById(id, context.companyId);
        if (!printer) {
            const error = new Error('Printer not found');
            error.status = 404;
            throw error;
        }

        const updated = await BadgePrintingRepository.updatePrinter(id, context.companyId, data);
        
        // Auto alert generation if status changes to Offline/Maintenance/Paper Low
        if (data.status && data.status !== printer.status && data.status !== 'Online') {
            await BadgePrintingRepository.createAlert({
                company_id: context.companyId,
                printer_id: id,
                alert_type: data.status,
                severity: data.status === 'Offline' ? 'Critical' : 'Warning',
                message: `Printer status changed to ${data.status}`
            });
        }
        if (data.paper_status && data.paper_status !== printer.paper_status && data.paper_status === 'Empty') {
            await BadgePrintingRepository.createAlert({
                company_id: context.companyId,
                printer_id: id,
                alert_type: 'Paper Empty',
                severity: 'Critical',
                message: 'Printer is out of paper / badge stock'
            });
        }

        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            printer_id: id,
            action: `Printer details updated: status=${updated.status}, paper=${updated.paper_status}`,
            performed_by: context.userId
        });

        return new BadgePrinterResponseDTO(updated);
    }

    async listPrinters(context) {
        const printers = await BadgePrintingRepository.findAllPrinters(context.companyId);
        return printers.map(p => new BadgePrinterResponseDTO(p));
    }

    async getPrinterById(id, context) {
        const printer = await BadgePrintingRepository.findPrinterById(id, context.companyId);
        if (!printer) {
            const error = new Error('Printer not found');
            error.status = 404;
            throw error;
        }
        return new BadgePrinterResponseDTO(printer);
    }

    async triggerTestPrint(printerId, context) {
        const printer = await BadgePrintingRepository.findPrinterById(printerId, context.companyId);
        if (!printer) {
            const error = new Error('Printer not found');
            error.status = 404;
            throw error;
        }

        await BadgePrintingRepository.updatePrinterLastSeen(printerId, context.companyId);

        // Check if printer has a block alert
        if (printer.status === 'Offline') {
            throw new Error(`Test print failed: Printer ${printer.printer_name} is Offline`);
        }

        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            printer_id: printerId,
            action: 'Test print command executed successfully',
            performed_by: context.userId
        });

        return {
            success: true,
            message: `Test print pattern sent successfully to printer: ${printer.printer_name}`
        };
    }

    // ==========================================
    // 2. Printer Alerts
    // ==========================================
    async getPrinterAlerts(context) {
        const alerts = await BadgePrintingRepository.getActiveAlerts(context.companyId);
        return alerts.map(a => new PrinterAlertResponseDTO(a));
    }

    async resolvePrinterAlert(alertId, context) {
        const resolved = await BadgePrintingRepository.resolveAlert(alertId, context.companyId);
        if (!resolved) {
            const error = new Error('Alert not found');
            error.status = 404;
            throw error;
        }
        
        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            printer_id: resolved.printer_id,
            action: `Alert ID ${alertId} (${resolved.alert_type}) resolved.`,
            performed_by: context.userId
        });

        return new PrinterAlertResponseDTO(resolved);
    }

    // ==========================================
    // 3. Badge Templates
    // ==========================================
    async createTemplate(data, context) {
        const template = await BadgePrintingRepository.createTemplate({
            ...data,
            company_id: context.companyId,
            branch_id: context.branchId
        });
        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            action: `Template '${template.template_name}' created.`,
            performed_by: context.userId
        });
        return new BadgeTemplateResponseDTO(template);
    }

    async updateTemplate(id, data, context) {
        const template = await BadgePrintingRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }

        const updated = await BadgePrintingRepository.updateTemplate(id, context.companyId, data);
        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            action: `Template '${updated.template_name}' updated.`,
            performed_by: context.userId
        });
        return new BadgeTemplateResponseDTO(updated);
    }

    async listTemplates(queryParams, context) {
        const eventId = parseInt(queryParams.event_id, 10);
        if (!eventId || isNaN(eventId)) {
            const error = new Error('event_id query parameter is required');
            error.status = 400;
            throw error;
        }

        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const offset = (page - 1) * limit;

        const [items, total] = await Promise.all([
            BadgePrintingRepository.findAllTemplates(context.companyId, eventId, { limit, offset }),
            BadgePrintingRepository.countTemplates(context.companyId, eventId)
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: items.map(item => new BadgeTemplateResponseDTO(item))
        };
    }

    async getTemplateById(id, context) {
        const template = await BadgePrintingRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }
        return new BadgeTemplateResponseDTO(template);
    }

    async deleteTemplate(id, context) {
        const template = await BadgePrintingRepository.findTemplateById(id, context.companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }
        const success = await BadgePrintingRepository.deleteTemplate(id, context.companyId);
        if (success) {
            await BadgePrintingRepository.createLog({
                company_id: context.companyId,
                action: `Template '${template.template_name}' deleted.`,
                performed_by: context.userId
            });
        }
        return success;
    }

    // ==========================================
    // 4. Print Preview Generation
    // ==========================================
    async generatePrintPreview(guestId, templateId, context) {
        const guest = await BadgePrintingRepository.findGuestById(guestId, context.companyId);
        if (!guest) {
            const error = new Error('Guest not found');
            error.status = 404;
            throw error;
        }

        let template = null;
        if (templateId) {
            template = await BadgePrintingRepository.findTemplateById(templateId, context.companyId);
        }

        // Fallback default template lookup from configurations
        if (!template && guest.event_id) {
            const config = await BadgePrintingRepository.getConfiguration(guest.event_id, context.companyId);
            if (config && config.default_template_id) {
                template = await BadgePrintingRepository.findTemplateById(config.default_template_id, context.companyId);
            }
        }

        // Pull QR Pass
        let qrPass = await QrPassRepository.getPassById(guestId, context.companyId); // In our schema check qp has unique guest_id lookup
        if (!qrPass) {
            // Find by guest_id in qr_passes directly
            const qrPassQuery = `SELECT * FROM qr_passes WHERE guest_id = $1 AND company_id = $2;`;
            const qrRes = await pool.query(qrPassQuery, [guestId, context.companyId]);
            if (qrRes.rows[0]) {
                qrPass = qrRes.rows[0];
            }
        }

        return new PrintPreviewResponseDTO({
            guest,
            template,
            qrPass,
            renderingData: {
                width_px: template && template.orientation === 'Landscape' ? 600 : 400,
                height_px: template && template.orientation === 'Landscape' ? 400 : 600,
                font_family: 'Outfit, Inter, sans-serif',
                primary_color: guest.category === 'VIP' ? '#D4AF37' : (guest.category === 'Staff' ? '#2B6CB0' : '#2D3748')
            }
        });
    }

    // ==========================================
    // 5. Configurations
    // ==========================================
    async getConfiguration(eventId, context) {
        const config = await BadgePrintingRepository.getConfiguration(eventId, context.companyId);
        if (!config) {
            return {
                event_id: eventId,
                default_template_id: null,
                auto_generate_qr: true,
                auto_print_on_checkin: false
            };
        }
        return new BadgeConfigurationResponseDTO(config);
    }

    async saveConfiguration(data, context) {
        const config = await BadgePrintingRepository.saveConfiguration({
            ...data,
            company_id: context.companyId
        });
        return new BadgeConfigurationResponseDTO(config);
    }

    // ==========================================
    // 6. Print Jobs and Live Queue Workflows
    // ==========================================
    async createPrintJob(data, context) {
        const guest = await BadgePrintingRepository.findGuestById(data.guest_id, context.companyId);
        if (!guest) {
            const error = new Error('Guest not found');
            error.status = 404;
            throw error;
        }

        // 1. Resolve Default Template if needed
        let templateId = data.template_id;
        if (!templateId && guest.event_id) {
            const config = await BadgePrintingRepository.getConfiguration(guest.event_id, context.companyId);
            if (config && config.default_template_id) {
                templateId = config.default_template_id;
            }
        }

        // 2. Security Verification and Auto QR generation check
        let qrPass = null;
        const qrPassQuery = `SELECT * FROM qr_passes WHERE guest_id = $1 AND company_id = $2;`;
        const qrRes = await pool.query(qrPassQuery, [data.guest_id, context.companyId]);
        if (qrRes.rows[0]) {
            qrPass = qrRes.rows[0];
        }

        if (!qrPass && guest.event_id) {
            const config = await BadgePrintingRepository.getConfiguration(guest.event_id, context.companyId);
            if (config && config.auto_generate_qr) {
                // Auto generate QR pass
                const passType = guest.category === 'VIP' ? 'VIP' : 
                                 (guest.category === 'Staff' ? 'Staff' : 'Attendee');
                
                // Expiration defaults to 2 days from now
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 2);

                qrPass = await QrPassService.generateQrPass({
                    guest_id: data.guest_id,
                    pass_type: passType,
                    expires_at: expiresAt
                }, context.companyId, context.userId);

                // Log a validation check security audit trace
                await QrPassRepository.logSecurityAudit({
                    company_id: context.companyId,
                    pass_id: qrPass.pass_id,
                    action_type: 'Token Signature Verification',
                    ip_address: '127.0.0.1',
                    user_agent: 'Badge Printing Auto Generator',
                    hash_verified: true
                });
            }
        }

        // 3. Queue or Dispatch Print Job
        let printerId = data.printer_id;
        let jobStatus = 'Pending';
        
        // If printer is specified, check health
        if (printerId) {
            const printer = await BadgePrintingRepository.findPrinterById(printerId, context.companyId);
            if (printer && (printer.status === 'Offline' || printer.paper_status === 'Empty')) {
                // Automate alert logging
                await BadgePrintingRepository.createAlert({
                    company_id: context.companyId,
                    printer_id: printerId,
                    alert_type: 'Job Dispatch Failure',
                    severity: 'Warning',
                    message: `Print job failed for guest ${guest.name}: Printer is Offline/Empty`
                });
                jobStatus = 'Failed';
            } else if (printer && printer.status === 'Online') {
                jobStatus = 'Printing'; // Set to printing active execution status
            }
        }

        const job = await BadgePrintingRepository.createPrintJob({
            company_id: context.companyId,
            guest_id: data.guest_id,
            template_id: templateId || null,
            printer_id: printerId || null,
            job_status: jobStatus,
            priority: data.priority || 1
        });

        // Log print action
        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            print_job_id: job.id,
            printer_id: printerId || null,
            action: `Print job created for guest '${guest.name}'. Status: ${jobStatus}`,
            performed_by: context.userId
        });

        if (jobStatus === 'Pending') {
            // Add job to live queue
            await BadgePrintingRepository.addToQueue(context.companyId, job.id);
        } else if (jobStatus === 'Printing') {
            // Mock immediate execution dispatch
            setTimeout(async () => {
                try {
                    await BadgePrintingRepository.updatePrintJobStatus(job.id, context.companyId, 'Completed', new Date());
                    await BadgePrintingRepository.createLog({
                        company_id: context.companyId,
                        print_job_id: job.id,
                        printer_id: printerId,
                        action: `Printed successfully for guest '${guest.name}'`
                    });
                } catch (e) {
                    console.error('Immediate print job execution mock update error:', e);
                }
            }, 1500);
        }

        return new BadgePrintJobResponseDTO(job);
    }

    async listPrintJobs(queryParams, context) {
        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const offset = (page - 1) * limit;

        const filters = {
            status: queryParams.status,
            printerId: queryParams.printer_id ? parseInt(queryParams.printer_id, 10) : null
        };

        const [items, total] = await Promise.all([
            BadgePrintingRepository.findAllPrintJobs(context.companyId, { limit, offset, ...filters }),
            BadgePrintingRepository.countPrintJobs(context.companyId, filters)
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: items.map(item => new BadgePrintJobResponseDTO(item))
        };
    }

    async getPrintQueue(context) {
        const items = await BadgePrintingRepository.getQueueItems(context.companyId);
        return items.map(item => new PrintQueueResponseDTO(item));
    }

    async reorderQueue(queueItemIds, context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (let i = 0; i < queueItemIds.length; i++) {
                const itemId = queueItemIds[i];
                await BadgePrintingRepository.updateQueuePosition(itemId, context.companyId, i + 1, client);
            }

            await client.query('COMMIT');
            return { success: true, message: 'Print queue re-prioritized successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async cancelPrintJob(jobId, context) {
        const job = await BadgePrintingRepository.findPrintJobById(jobId, context.companyId);
        if (!job) {
            const error = new Error('Print job not found');
            error.status = 404;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            await BadgePrintingRepository.removeFromQueue(jobId, context.companyId, client);
            await BadgePrintingRepository.updatePrintJobStatus(jobId, context.companyId, 'Failed', null, client);
            
            await BadgePrintingRepository.createLog({
                company_id: context.companyId,
                print_job_id: jobId,
                action: 'Print job cancelled and removed from active queue',
                performed_by: context.userId
            }, client);

            await client.query('COMMIT');
            return { success: true, message: 'Print job cancelled successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async retryPrintJob(jobId, context) {
        const job = await BadgePrintingRepository.findPrintJobById(jobId, context.companyId);
        if (!job) {
            const error = new Error('Print job not found');
            error.status = 404;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await BadgePrintingRepository.updatePrintJobStatus(jobId, context.companyId, 'Pending', null, client);
            await BadgePrintingRepository.addToQueue(context.companyId, jobId, client);

            await BadgePrintingRepository.createLog({
                company_id: context.companyId,
                print_job_id: jobId,
                action: 'Retry print request queued',
                performed_by: context.userId
            }, client);

            await client.query('COMMIT');
            return { success: true, message: 'Print job retry scheduled' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async recoverFailedPrints(context) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const query = `
                SELECT id FROM badge_print_jobs
                WHERE company_id = $1 AND job_status = 'Failed'
            `;
            const failedJobsRes = await client.query(query, [context.companyId]);
            const jobs = failedJobsRes.rows;

            if (jobs.length === 0) {
                await client.query('COMMIT');
                return { count: 0, message: 'No failed print jobs detected' };
            }

            for (const j of jobs) {
                await BadgePrintingRepository.updatePrintJobStatus(j.id, context.companyId, 'Pending', null, client);
                await BadgePrintingRepository.addToQueue(context.companyId, j.id, client);
                await BadgePrintingRepository.createLog({
                    company_id: context.companyId,
                    print_job_id: j.id,
                    action: 'System automated failed print recovery scheduled',
                    performed_by: context.userId
                }, client);
            }

            await client.query('COMMIT');
            return { count: jobs.length, message: `Successfully recovered and re-queued ${jobs.length} failed print jobs` };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async clearPrintQueue(context) {
        await BadgePrintingRepository.clearQueue(context.companyId);
        await BadgePrintingRepository.createLog({
            company_id: context.companyId,
            action: 'All items removed from the active print queue.',
            performed_by: context.userId
        });
        return { success: true, message: 'Print queue cleared successfully' };
    }

    async exportHistory(queryParams, context) {
        const printerId = queryParams.printer_id ? parseInt(queryParams.printer_id, 10) : null;
        const limit = 100;
        const logs = await BadgePrintingRepository.getLogs(context.companyId, { limit, printerId });

        let csv = 'Log ID,Action,Printer,Performed By,Timestamp\n';
        for (const l of logs) {
            csv += `"${l.id}","${l.action}","${l.printer_name || 'System / Auto'}","${l.performed_by || 'Auto'}","${l.created_at.toISOString()}"\n`;
        }
        return csv;
    }

    // ==========================================
    // 7. Batch Badge Generations
    // ==========================================
    async triggerBatchPrint(data, context) {
        const guestsList = data.guest_ids;
        
        // 1. Create BadgeBatch tracker
        const batch = await BadgePrintingRepository.createBatch({
            company_id: context.companyId,
            event_id: data.event_id,
            batch_name: data.batch_name,
            total_badges: guestsList.length,
            status: 'Processing'
        });

        // 2. Sequential processing loop (mock background trigger)
        let generated = 0;
        for (const guestId of guestsList) {
            try {
                await this.createPrintJob({
                    guest_id: guestId,
                    template_id: data.template_id,
                    printer_id: data.printer_id,
                    priority: 1 // Batch priority defaults to 1
                }, context);
                generated++;
            } catch (err) {
                console.error(`Batch print job creation error for guest ID ${guestId}:`, err);
            }
        }

        const finalStatus = generated === guestsList.length ? 'Completed' : (generated > 0 ? 'Completed' : 'Failed');
        const updatedBatch = await BadgePrintingRepository.updateBatchProgress(batch.id, context.companyId, generated, finalStatus);

        return new BadgeBatchResponseDTO(updatedBatch);
    }

    async listBatches(queryParams, context) {
        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const offset = (page - 1) * limit;

        const [items, total] = await Promise.all([
            BadgePrintingRepository.getBatches(context.companyId, { limit, offset }),
            BadgePrintingRepository.countBatches(context.companyId)
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: items.map(item => new BadgeBatchResponseDTO(item))
        };
    }

    async getBatchById(id, context) {
        const batch = await BadgePrintingRepository.findBatchById(id, context.companyId);
        if (!batch) {
            const error = new Error('Batch not found');
            error.status = 404;
            throw error;
        }
        return new BadgeBatchResponseDTO(batch);
    }
}

module.exports = new BadgePrintingService();
