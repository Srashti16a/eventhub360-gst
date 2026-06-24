const pool = require('../config/db');
const MagicLink = require('./MagicLink');

class MagicLinkRepository {
    /**
     * Create a new magic link record in the database
     * @param {Object} data 
     * @param {Object} [client] - Optional database client for transactional executions
     * @returns {Promise<MagicLink>}
     */
    async create(data, client = pool) {
        const query = `
            INSERT INTO magic_links (
                company_id, branch_id, guest_id, token, expires_at,
                single_use, ip_lockdown, allowed_ip, max_uses, created_by, updated_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.branch_id || null,
            data.guest_id,
            data.token,
            data.expires_at || null,
            data.single_use || false,
            data.ip_lockdown || false,
            data.allowed_ip || null,
            data.max_uses !== undefined ? data.max_uses : (data.single_use ? 1 : null),
            data.created_by || null,
            data.updated_by || null
        ];

        const result = await client.query(query, values);
        return MagicLink.fromRow(result.rows[0]);
    }

    /**
     * Create multiple magic link records inside a transaction block
     * @param {Object[]} linksArray - Array of link creation payloads
     * @returns {Promise<MagicLink[]>}
     */
    async createBulk(linksArray) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const createdLinks = [];

            for (const linkData of linksArray) {
                const link = await this.create(linkData, client);
                createdLinks.push(link);
            }

            await client.query('COMMIT');
            return createdLinks;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Find a magic link by ID and company_id, joining guest info
     */
    async findById(magicLinkId, companyId) {
        const query = `
            SELECT ml.*, g.name as guest_name, g.category as guest_category, g.phone as guest_phone
            FROM magic_links ml
            JOIN guest g ON ml.guest_id = g.guest_id
            WHERE ml.magic_link_id = $1 AND ml.company_id = $2;
        `;
        const result = await pool.query(query, [magicLinkId, companyId]);
        return MagicLink.fromRow(result.rows[0]);
    }

    /**
     * Find a magic link by its unique token, joining guest info
     */
    async findByToken(token) {
        const query = `
            SELECT ml.*, g.name as guest_name, g.category as guest_category, g.phone as guest_phone
            FROM magic_links ml
            JOIN guest g ON ml.guest_id = g.guest_id
            WHERE ml.token = $1;
        `;
        const result = await pool.query(query, [token]);
        return MagicLink.fromRow(result.rows[0]);
    }

    /**
     * Fetch magic links matching dynamic search and filtering criteria
     */
    async findAll({ companyId, status, category, search, limit = 10, offset = 0 }) {
        let query = `
            SELECT ml.*, g.name as guest_name, g.category as guest_category, g.phone as guest_phone
            FROM magic_links ml
            JOIN guest g ON ml.guest_id = g.guest_id
            WHERE ml.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        // Map status filters using raw SQL logic
        if (status) {
            if (status === 'Revoked') {
                query += ` AND ml.is_revoked = TRUE`;
            } else if (status === 'Expired') {
                query += ` AND ml.is_revoked = FALSE AND ml.expires_at IS NOT NULL AND ml.expires_at <= NOW()`;
            } else if (status === 'Used') {
                query += ` AND ml.is_revoked = FALSE AND ml.max_uses IS NOT NULL AND ml.use_count >= ml.max_uses`;
            } else if (status === 'Expiring Soon') {
                query += ` AND ml.is_revoked = FALSE AND ml.expires_at > NOW() AND ml.expires_at <= NOW() + INTERVAL '24 hours' AND (ml.max_uses IS NULL OR ml.use_count < ml.max_uses)`;
            } else if (status === 'Active') {
                query += ` AND ml.is_revoked = FALSE AND (ml.expires_at IS NULL OR ml.expires_at > NOW() + INTERVAL '24 hours') AND (ml.max_uses IS NULL OR ml.use_count < ml.max_uses)`;
            }
        }

        if (category) {
            paramCount++;
            query += ` AND g.category = $${paramCount}`;
            values.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }

        // Sorting, limit, offset
        paramCount++;
        query += ` ORDER BY ml.created_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => MagicLink.fromRow(row));
    }

    /**
     * Count magic links matching criteria (for pagination totals)
     */
    async count({ companyId, status, category, search }) {
        let query = `
            SELECT COUNT(ml.magic_link_id) as total
            FROM magic_links ml
            JOIN guest g ON ml.guest_id = g.guest_id
            WHERE ml.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (status) {
            if (status === 'Revoked') {
                query += ` AND ml.is_revoked = TRUE`;
            } else if (status === 'Expired') {
                query += ` AND ml.is_revoked = FALSE AND ml.expires_at IS NOT NULL AND ml.expires_at <= NOW()`;
            } else if (status === 'Used') {
                query += ` AND ml.is_revoked = FALSE AND ml.max_uses IS NOT NULL AND ml.use_count >= ml.max_uses`;
            } else if (status === 'Expiring Soon') {
                query += ` AND ml.is_revoked = FALSE AND ml.expires_at > NOW() AND ml.expires_at <= NOW() + INTERVAL '24 hours' AND (ml.max_uses IS NULL OR ml.use_count < ml.max_uses)`;
            } else if (status === 'Active') {
                query += ` AND ml.is_revoked = FALSE AND (ml.expires_at IS NULL OR ml.expires_at > NOW() + INTERVAL '24 hours') AND (ml.max_uses IS NULL OR ml.use_count < ml.max_uses)`;
            }
        }

        if (category) {
            paramCount++;
            query += ` AND g.category = $${paramCount}`;
            values.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].total, 10);
    }

    /**
     * Update fields of a magic link dynamically
     */
    async update(magicLinkId, companyId, updateData, client = pool) {
        const setFields = [];
        const values = [magicLinkId, companyId];
        let paramCount = 2;

        const fieldsToUpdate = [
            'token', 'expires_at', 'single_use', 'ip_lockdown',
            'allowed_ip', 'locked_ip', 'use_count', 'max_uses',
            'is_revoked', 'updated_by'
        ];

        for (const field of fieldsToUpdate) {
            if (updateData[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                values.push(updateData[field]);
            }
        }

        if (setFields.length === 0) {
            return this.findById(magicLinkId, companyId);
        }

        setFields.push(`updated_at = NOW()`);

        const query = `
            UPDATE magic_links 
            SET ${setFields.join(', ')} 
            WHERE magic_link_id = $1 AND company_id = $2
            RETURNING *;
        `;

        const result = await client.query(query, values);
        return MagicLink.fromRow(result.rows[0]);
    }

    /**
     * Revoke a magic link
     */
    async revoke(magicLinkId, companyId, userId = null) {
        return this.update(magicLinkId, companyId, {
            is_revoked: true,
            updated_by: userId
        });
    }

    /**
     * Increment usage counter on access
     */
    async incrementUse(magicLinkId, clientIp = null, client = pool) {
        let setClause = 'use_count = use_count + 1';
        const values = [magicLinkId];
        
        if (clientIp) {
            // Lock IP dynamically if lockdown is enabled and locked_ip isn't set yet
            setClause += `, locked_ip = COALESCE(locked_ip, CASE WHEN ip_lockdown = TRUE THEN $2 ELSE NULL END)`;
            values.push(clientIp);
        }

        const query = `
            UPDATE magic_links
            SET ${setClause}, updated_at = NOW()
            WHERE magic_link_id = $1
            RETURNING *;
        `;

        const result = await client.query(query, values);
        return MagicLink.fromRow(result.rows[0]);
    }

    /**
     * Get aggregate statistics summary scoping active, expiring, and total usages
     */
    async getStatsSummary(companyId) {
        const query = `
            SELECT 
                COALESCE(COUNT(CASE WHEN is_revoked = FALSE AND (expires_at IS NULL OR expires_at > NOW()) AND (max_uses IS NULL OR use_count < max_uses) THEN 1 END), 0)::INTEGER as total_active,
                COALESCE(COUNT(CASE WHEN is_revoked = FALSE AND expires_at > NOW() AND expires_at <= NOW() + INTERVAL '24 hours' AND (max_uses IS NULL OR use_count < max_uses) THEN 1 END), 0)::INTEGER as expiring_soon,
                COALESCE(SUM(use_count), 0)::INTEGER as total_uses
            FROM magic_links
            WHERE company_id = $1;
        `;
        const result = await pool.query(query, [companyId]);
        return result.rows[0];
    }
}

module.exports = new MagicLinkRepository();
