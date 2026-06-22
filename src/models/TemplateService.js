const pool = require('../config/db');
const TemplateRepository = require('./TemplateRepository');
const {
    TemplateResponseDTO,
    TemplateListResponseDTO
} = require('./TemplateDTO');

class TemplateService {
    /**
     * Create a new template in draft mode
     * @param {Object} data 
     * @param {Object} context 
     * @returns {Promise<TemplateResponseDTO>}
     */
    async createTemplate(data, context) {
        const newTemplate = await TemplateRepository.create({
            ...data,
            company_id: context.companyId,
            branch_id: context.branchId,
            created_by: context.userId,
            updated_by: context.userId,
            status: 'DRAFT'
        });
        return new TemplateResponseDTO(newTemplate);
    }

    /**
     * Retrieve a single template by ID
     * @param {number} templateId 
     * @param {number} companyId 
     * @returns {Promise<TemplateResponseDTO>}
     */
    async getTemplateById(templateId, companyId) {
        const template = await TemplateRepository.findById(templateId, companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }
        return new TemplateResponseDTO(template);
    }

    /**
     * List templates with pagination filters
     */
    async listTemplates(queryParams, companyId) {
        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const offset = (page - 1) * limit;

        const filters = {
            companyId,
            channel: queryParams.channel,
            status: queryParams.status,
            category: queryParams.category,
            search: queryParams.search,
            limit,
            offset
        };

        const [items, total] = await Promise.all([
            TemplateRepository.findAll(filters),
            TemplateRepository.count(filters)
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: items.map(item => new TemplateListResponseDTO(item))
        };
    }

    /**
     * Update template details
     */
    async updateTemplate(templateId, companyId, updateData, userId) {
        const template = await TemplateRepository.findById(templateId, companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }

        const updated = await TemplateRepository.update(templateId, companyId, {
            ...updateData,
            updated_by: userId
        });

        return new TemplateResponseDTO(updated);
    }

    /**
     * Soft delete a template
     */
    async deleteTemplate(templateId, companyId, userId) {
        const template = await TemplateRepository.findById(templateId, companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }

        return await TemplateRepository.delete(templateId, companyId, userId);
    }

    /**
     * Publish template (transactional)
     */
    async publishTemplate(templateId, companyId, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const template = await TemplateRepository.findById(templateId, companyId);
            if (!template) {
                const error = new Error('Template not found');
                error.status = 404;
                throw error;
            }

            // Get next version number
            const latestVer = await TemplateRepository.findLatestVersionNumber(templateId, client);
            const nextVer = latestVer + 1;

            // Create version snapshot
            await TemplateRepository.createVersion({
                template_id: templateId,
                version_number: nextVer,
                subject: template.subject,
                content: template.content,
                created_by: userId
            }, client);

            // Update parent template status
            await TemplateRepository.update(templateId, companyId, {
                status: 'PUBLISHED',
                updated_by: userId
            }, client);

            await client.query('COMMIT');
            
            return {
                template_id: templateId,
                status: 'PUBLISHED',
                version_number: nextVer
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Preview template by evaluating replacement parameters
     */
    async previewTemplate(templateId, companyId, replacements = {}) {
        const template = await TemplateRepository.findById(templateId, companyId);
        if (!template) {
            const error = new Error('Template not found');
            error.status = 404;
            throw error;
        }

        // Verify all required template variables exist in parameters
        const declaredVariables = template.variables || [];
        const missingVars = declaredVariables.filter(v => replacements[v] === undefined);

        if (missingVars.length > 0) {
            const error = new Error(`Missing variable replacement context for: ${missingVars.join(', ')}`);
            error.status = 400;
            throw error;
        }

        // Interpolate content block strings recursively
        const renderedContent = this._replacePlaceholders(template.content, replacements);

        // Subject line interpolation (for EMAIL channels)
        let renderedSubject = template.subject;
        if (template.channel === 'EMAIL' && template.subject) {
            renderedSubject = this._replacePlaceholders(template.subject, replacements);
        }

        return {
            channel: template.channel,
            subject: renderedSubject,
            rendered_content: renderedContent
        };
    }

    /**
     * Helper to recursively interpolate string values in object trees
     * @private
     */
    _replacePlaceholders(obj, replacements) {
        if (typeof obj === 'string') {
            let result = obj;
            for (const [key, val] of Object.entries(replacements)) {
                // Matches standard templates interpolation brackets {{var}} and {{ var }}
                result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), val);
            }
            return result;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this._replacePlaceholders(item, replacements));
        }
        if (obj !== null && typeof obj === 'object') {
            const newObj = {};
            for (const [key, val] of Object.entries(obj)) {
                newObj[key] = this._replacePlaceholders(val, replacements);
            }
            return newObj;
        }
        return obj;
    }
}

module.exports = new TemplateService();
