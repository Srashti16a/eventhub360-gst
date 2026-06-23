const pool = require('../config/db');
const Template = require('./Template');
const TemplateVersion = require('./TemplateVersion');

class TemplateRepository {
    /**
     * Create a new template record in database
     * @param {Object} data 
     * @param {number} data.company_id
     * @param {number|null} [data.branch_id]
     * @param {string} data.name
     * @param {'EMAIL' | 'WHATSAPP'} data.channel
     * @param {string} data.category
     * @param {'DRAFT' | 'PUBLISHED' | 'ARCHIVED'} data.status
     * @param {string|null} [data.subject]
     * @param {Object} data.content
     * @param {string[]} data.variables
     * @param {number|null} [data.created_by]
     * @param {number|null} [data.updated_by]
     * @param {Object} [client] - Optional db client for running inside transactions
     * @returns {Promise<Template>}
     */
    async create(data, client = pool) {
        const query = `
            INSERT INTO templates (
                company_id, branch_id, name, channel, category, 
                status, subject, content, variables, created_by, updated_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.branch_id || null,
            data.name,
            data.channel,
            data.category,
            data.status || 'DRAFT',
            data.subject || null,
            JSON.stringify(data.content || {}),
            JSON.stringify(data.variables || []),
            data.created_by || null,
            data.updated_by || null
        ];

        const result = await client.query(query, values);
        return Template.fromRow(result.rows[0]);
    }

    /**
     * Find template by ID and company_id
     * @param {number} templateId 
     * @param {number} companyId 
     * @returns {Promise<Template|null>}
     */
    async findById(templateId, companyId) {
        const query = `
            SELECT * FROM templates 
            WHERE template_id = $1 AND company_id = $2 AND is_active = TRUE;
        `;
        const result = await pool.query(query, [templateId, companyId]);
        return Template.fromRow(result.rows[0]);
    }

    /**
     * Fetch templates matching dynamic search criteria
     */
    async findAll({ companyId, channel, status, category, search, limit = 10, offset = 0 }) {
        let query = `
            SELECT * FROM templates 
            WHERE company_id = $1 AND is_active = TRUE
        `;
        const values = [companyId];
        let paramCount = 1;

        if (channel) {
            paramCount++;
            query += ` AND channel = $${paramCount}`;
            values.push(channel);
        }

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            values.push(status);
        }

        if (category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            values.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }

        // Add order, limit and offset
        paramCount++;
        query += ` ORDER BY updated_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => Template.fromRow(row));
    }

    /**
     * Count templates matching criteria (for pagination)
     */
    async count({ companyId, channel, status, category, search }) {
        let query = `
            SELECT COUNT(*) as total FROM templates 
            WHERE company_id = $1 AND is_active = TRUE
        `;
        const values = [companyId];
        let paramCount = 1;

        if (channel) {
            paramCount++;
            query += ` AND channel = $${paramCount}`;
            values.push(channel);
        }

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            values.push(status);
        }

        if (category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            values.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].total, 10);
    }

    /**
     * Perform update on template columns dynamically
     * @param {number} templateId 
     * @param {number} companyId 
     * @param {Object} updateData 
     * @param {Object} [client] - Optional db client
     * @returns {Promise<Template|null>}
     */
    async update(templateId, companyId, updateData, client = pool) {
        const setFields = [];
        const values = [templateId, companyId];
        let paramCount = 2;

        const fieldsToUpdate = [
            'name', 'category', 'status', 'subject', 
            'content', 'variables', 'updated_by', 'is_active'
        ];

        for (const field of fieldsToUpdate) {
            if (updateData[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                
                if (field === 'content' || field === 'variables') {
                    values.push(JSON.stringify(updateData[field]));
                } else {
                    values.push(updateData[field]);
                }
            }
        }

        if (setFields.length === 0) {
            return this.findById(templateId, companyId);
        }

        // Add automatic timestamp update
        setFields.push(`updated_at = NOW()`);

        const query = `
            UPDATE templates 
            SET ${setFields.join(', ')} 
            WHERE template_id = $1 AND company_id = $2 AND is_active = TRUE 
            RETURNING *;
        `;

        const result = await client.query(query, values);
        return Template.fromRow(result.rows[0]);
    }

    /**
     * Soft delete a template
     * @param {number} templateId 
     * @param {number} companyId 
     * @param {number|null} updatedBy 
     * @returns {Promise<boolean>}
     */
    async delete(templateId, companyId, updatedBy = null) {
        const query = `
            UPDATE templates 
            SET is_active = FALSE, updated_at = NOW(), updated_by = $3 
            WHERE template_id = $1 AND company_id = $2 AND is_active = TRUE 
            RETURNING template_id;
        `;
        const result = await pool.query(query, [templateId, companyId, updatedBy]);
        return result.rowCount > 0;
    }

    /**
     * Create a new template version record
     * @param {Object} data 
     * @param {number} data.template_id
     * @param {number} data.version_number
     * @param {string|null} [data.subject]
     * @param {Object} data.content
     * @param {number|null} [data.created_by]
     * @param {Object} [client] - Optional db client (useful inside transaction)
     * @returns {Promise<TemplateVersion>}
     */
    async createVersion(data, client = pool) {
        const query = `
            INSERT INTO template_versions (
                template_id, version_number, subject, content, created_by
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [
            data.template_id,
            data.version_number,
            data.subject || null,
            JSON.stringify(data.content || {}),
            data.created_by || null
        ];

        const result = await client.query(query, values);
        return TemplateVersion.fromRow(result.rows[0]);
    }

    /**
     * Get the latest version number for a template
     * @param {number} templateId 
     * @param {Object} [client] 
     * @returns {Promise<number>}
     */
    async findLatestVersionNumber(templateId, client = pool) {
        const query = `
            SELECT COALESCE(MAX(version_number), 0) as max_val 
            FROM template_versions 
            WHERE template_id = $1;
        `;
        const result = await client.query(query, [templateId]);
        return parseInt(result.rows[0].max_val, 10);
    }
}

module.exports = new TemplateRepository();
