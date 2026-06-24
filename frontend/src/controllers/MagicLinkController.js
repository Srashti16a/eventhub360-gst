const MagicLinkService = require('../models/MagicLinkService');
const { MagicLinkCreateDTO, MagicLinkBulkCreateDTO } = require('../models/MagicLinkDTO');

class MagicLinkController {
    /**
     * Create a single magic link
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

            const dto = new MagicLinkCreateDTO(req.body);
            const result = await MagicLinkService.createLink(dto, { companyId, branchId, userId });
            
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk generate magic links for multiple guests
     */
    async createBulk(req, res, next) {
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

            const dto = new MagicLinkBulkCreateDTO(req.body);
            const result = await MagicLinkService.createBulkLinks(dto, { companyId, branchId, userId });
            
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Read a single magic link details
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
                    error: 'Magic Link ID must be a valid number' 
                });
            }

            const result = await MagicLinkService.getLinkById(id, companyId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get paginated list of magic links with filters
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

            const result = await MagicLinkService.listLinks(req.query, companyId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Fetch active stats card data for dashboard view
     */
    async getStats(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            
            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const result = await MagicLinkService.getStats(companyId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Regenerate active/expired magic link
     */
    async regenerate(req, res, next) {
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
                    error: 'Magic Link ID must be a valid number' 
                });
            }

            const result = await MagicLinkService.regenerateLink(id, companyId, userId);
            res.status(200).json({ success: true, message: 'Magic link regenerated successfully', data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Revoke magic link
     */
    async revoke(req, res, next) {
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
                    error: 'Magic Link ID must be a valid number' 
                });
            }

            const result = await MagicLinkService.revokeLink(id, companyId, userId);
            res.status(200).json({ success: true, message: 'Magic link revoked successfully', data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Distribute link via email or WhatsApp
     */
    async distribute(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const id = parseInt(req.params.id, 10);
            const channel = req.body.channel;
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
                    error: 'Magic Link ID must be a valid number' 
                });
            }

            const result = await MagicLinkService.distributeLink(id, companyId, channel, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export all links to CSV file format
     */
    async export(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const csvContent = await MagicLinkService.exportLinksCSV(companyId);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=magic_links_export.csv');
            return res.status(200).send(csvContent);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Public resolver endpoint: resolves and logs in via token verification
     */
    async resolve(req, res, next) {
        try {
            const token = req.params.token;
            // Capture client IP taking proxy settings into consideration
            const clientIp = req.headers['x-forwarded-for'] 
                ? req.headers['x-forwarded-for'].split(',')[0].trim() 
                : req.ip;

            const result = await MagicLinkService.resolveToken(token, clientIp);
            
            // On success, redirect to login dashboard with auth token mapping, or send successful JSON
            res.status(200).json({ 
                success: true, 
                message: 'Token resolved successfully. Authentication granted.', 
                data: {
                    token: result.token,
                    guest_id: result.guest_id,
                    guest_name: result.guest_name,
                    redirect_url: `https://eventhub360.com/concierge/dashboard?auth_token=${result.token}`
                }
            });
        } catch (error) {
            // Return validation error response (403 Forbidden / 404 Not Found)
            res.status(error.status || 500).json({
                success: false,
                error: error.message || 'Internal Server Error'
            });
        }
    }
}

module.exports = new MagicLinkController();
