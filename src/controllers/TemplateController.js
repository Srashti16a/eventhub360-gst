const TemplateService = require('../models/TemplateService');
const { TemplateCreateDTO, TemplateUpdateDTO } = require('../models/TemplateDTO');

class TemplateController {
    /**
     * Create a new template (Draft status)
     */
    async create(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const branchId = req.headers['x-branch-id'] ? parseInt(req.headers['x-branch-id'], 10) : null;
            const userId = req.headers['x-user-id'] 
                ? parseInt(req.headers['x-user-id'], 10) 
                : (req.user ? req.user.id : null);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const dto = new TemplateCreateDTO(req.body);
            const result = await TemplateService.createTemplate(dto, { companyId, branchId, userId });
            
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single template details
     */
    async getById(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const id = parseInt(req.params.id, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }
            if (isNaN(id)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Template ID must be a valid number' 
                });
            }

            const result = await TemplateService.getTemplateById(id, companyId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a paginated list of templates with optional filters
     */
    async list(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            
            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const result = await TemplateService.listTemplates(req.query, companyId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update template details
     */
    async update(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const id = parseInt(req.params.id, 10);
            const userId = req.headers['x-user-id'] 
                ? parseInt(req.headers['x-user-id'], 10) 
                : (req.user ? req.user.id : null);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }
            if (isNaN(id)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Template ID must be a valid number' 
                });
            }

            const dto = new TemplateUpdateDTO(req.body);
            const result = await TemplateService.updateTemplate(id, companyId, dto, userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Soft delete a template
     */
    async delete(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const id = parseInt(req.params.id, 10);
            const userId = req.headers['x-user-id'] 
                ? parseInt(req.headers['x-user-id'], 10) 
                : (req.user ? req.user.id : null);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }
            if (isNaN(id)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Template ID must be a valid number' 
                });
            }

            await TemplateService.deleteTemplate(id, companyId, userId);
            res.status(200).json({ success: true, message: 'Template deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Publish template draft and snapshot version number
     */
    async publish(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const id = parseInt(req.params.id, 10);
            const userId = req.headers['x-user-id'] 
                ? parseInt(req.headers['x-user-id'], 10) 
                : (req.user ? req.user.id : null);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }
            if (isNaN(id)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Template ID must be a valid number' 
                });
            }

            const result = await TemplateService.publishTemplate(id, companyId, userId);
            res.status(200).json({
                success: true,
                message: 'Template published successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Preview template layout with variable interpolations
     */
    async preview(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const id = parseInt(req.params.id, 10);
            const replacements = req.body.variables || {};

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }
            if (isNaN(id)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Template ID must be a valid number' 
                });
            }

            const result = await TemplateService.previewTemplate(id, companyId, replacements);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get variables list for editor dropdown
     */
    async getVariables(req, res, next) {
        try {
            const variables = [
                { name: 'guest_name', description: 'Full name of the guest', example: 'John Doe' },
                { name: 'event_name', description: 'Name of the target event', example: 'Annual Summit 2026' },
                { name: 'event_date', description: 'Formatted date of the event', example: 'October 12, 2026' },
                { name: 'rsvp_token', description: 'Unique RSVP tracking identifier', example: 'rsvp_a892f' }
            ];
            res.status(200).json({ success: true, data: variables });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TemplateController();
