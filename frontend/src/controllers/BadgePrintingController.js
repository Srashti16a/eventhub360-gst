const BadgePrintingService = require('../models/BadgePrintingService');

class BadgePrintingController {
    // Helper to retrieve company and user contexts from headers
    _getContext(req) {
        const companyId = parseInt(req.headers['x-company-id'], 10);
        const branchId = req.headers['x-branch-id'] ? parseInt(req.headers['x-branch-id'], 10) : null;
        const userId = req.headers['x-user-id'] 
            ? parseInt(req.headers['x-user-id'], 10) 
            : (req.user ? req.user.id : null);

        if (!companyId || isNaN(companyId)) {
            const error = new Error('X-Company-ID header is required and must be a valid integer');
            error.status = 400;
            throw error;
        }

        return { companyId, branchId, userId };
    }

    // ==========================================
    // 1. Templates
    // ==========================================
    async createTemplate(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.createTemplate(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateTemplate(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            const result = await BadgePrintingService.updateTemplate(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listTemplates(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.listTemplates(req.query, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getTemplateById(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            const result = await BadgePrintingService.getTemplateById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteTemplate(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            await BadgePrintingService.deleteTemplate(id, context);
            res.status(200).json({ success: true, message: 'Badge template deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getPreview(req, res, next) {
        try {
            const context = this._getContext(req);
            const guestId = parseInt(req.query.guest_id, 10);
            const templateId = req.query.template_id ? parseInt(req.query.template_id, 10) : null;
            
            if (isNaN(guestId)) {
                return res.status(400).json({ success: false, error: 'guest_id parameter must be a valid number' });
            }

            const result = await BadgePrintingService.generatePrintPreview(guestId, templateId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 2. Printers
    // ==========================================
    async registerPrinter(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.registerPrinter(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updatePrinter(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid printer ID' });
            }
            const result = await BadgePrintingService.updatePrinter(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listPrinters(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.listPrinters(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getPrinterById(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid printer ID' });
            }
            const result = await BadgePrintingService.getPrinterById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async testPrint(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid printer ID' });
            }
            const result = await BadgePrintingService.triggerTestPrint(id, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 3. Alerts
    // ==========================================
    async listAlerts(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.getPrinterAlerts(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async resolveAlert(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid alert ID' });
            }
            await BadgePrintingService.resolvePrinterAlert(id, context);
            res.status(200).json({ success: true, message: 'Alert status successfully resolved' });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 4. Live Queue Management
    // ==========================================
    async getQueue(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.getPrintQueue(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async reorderQueue(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.reorderQueue(req.body.queue_item_ids, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async clearQueue(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.clearPrintQueue(context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 5. Print Jobs
    // ==========================================
    async createJob(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.createPrintJob(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listJobs(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.listPrintJobs(req.query, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async cancelJob(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid job ID' });
            }
            const result = await BadgePrintingService.cancelPrintJob(id, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async retryJob(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid job ID' });
            }
            const result = await BadgePrintingService.retryPrintJob(id, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async recoverFailed(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.recoverFailedPrints(context);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async exportHistory(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.exportHistory(req.query, context);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="badge_print_history.csv"');
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 6. Batches
    // ==========================================
    async createBatch(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.triggerBatchPrint(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listBatches(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.listBatches(req.query, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getBatchById(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid batch ID' });
            }
            const result = await BadgePrintingService.getBatchById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 7. Configurations
    // ==========================================
    async getConfig(req, res, next) {
        try {
            const context = this._getContext(req);
            const eventId = parseInt(req.params.eventId, 10);
            if (isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'Invalid event ID' });
            }
            const result = await BadgePrintingService.getConfiguration(eventId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async saveConfig(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await BadgePrintingService.saveConfiguration(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BadgePrintingController();
