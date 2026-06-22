const crypto = require('crypto');
const MagicLinkRepository = require('./MagicLinkRepository');
const {
    MagicLinkResponseDTO,
    MagicLinkListResponseDTO,
    MagicLinkStatsDTO
} = require('./MagicLinkDTO');

class MagicLinkService {
    /**
     * Create a new magic link for a guest
     * @param {import('./MagicLinkDTO').MagicLinkCreateDTO} dto 
     * @param {Object} context 
     * @returns {Promise<MagicLinkResponseDTO>}
     */
    async createLink(dto, context) {
        const token = this._generateSecureToken();
        const expiresAt = this._calculateExpirationDate(dto.expiration_type);
        
        const ml = await MagicLinkRepository.create({
            company_id: context.companyId,
            branch_id: context.branchId,
            guest_id: dto.guest_id,
            token,
            expires_at: expiresAt,
            single_use: dto.single_use,
            ip_lockdown: dto.ip_lockdown,
            allowed_ip: dto.allowed_ip,
            max_uses: dto.single_use ? 1 : null,
            created_by: context.userId,
            updated_by: context.userId
        });

        return new MagicLinkResponseDTO(ml);
    }

    /**
     * Bulk generate magic links for multiple guests in a single transaction
     * @param {import('./MagicLinkDTO').MagicLinkBulkCreateDTO} dto 
     * @param {Object} context 
     * @returns {Promise<MagicLinkResponseDTO[]>}
     */
    async createBulkLinks(dto, context) {
        const expiresAt = this._calculateExpirationDate(dto.expiration_type);
        
        const payloads = dto.guest_ids.map(guestId => {
            const token = this._generateSecureToken();
            return {
                company_id: context.companyId,
                branch_id: context.branchId,
                guest_id: guestId,
                token,
                expires_at: expiresAt,
                single_use: dto.single_use,
                ip_lockdown: dto.ip_lockdown,
                allowed_ip: dto.allowed_ip,
                max_uses: dto.single_use ? 1 : null,
                created_by: context.userId,
                updated_by: context.userId
            };
        });

        const createdEntities = await MagicLinkRepository.createBulk(payloads);
        return createdEntities.map(ml => new MagicLinkResponseDTO(ml));
    }

    /**
     * Retrieve a single magic link by ID
     */
    async getLinkById(magicLinkId, companyId) {
        const ml = await MagicLinkRepository.findById(magicLinkId, companyId);
        if (!ml) {
            const error = new Error('Magic link not found');
            error.status = 404;
            throw error;
        }
        return new MagicLinkResponseDTO(ml);
    }

    /**
     * List magic links with filters and pagination
     */
    async listLinks(queryParams, companyId) {
        const page = parseInt(queryParams.page || 1, 10);
        const limit = parseInt(queryParams.limit || 10, 10);
        const offset = (page - 1) * limit;

        const filters = {
            companyId,
            status: queryParams.status,
            category: queryParams.category,
            search: queryParams.search,
            limit,
            offset
        };

        const [items, total] = await Promise.all([
            MagicLinkRepository.findAll(filters),
            MagicLinkRepository.count(filters)
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: items.map(item => new MagicLinkListResponseDTO(item))
        };
    }

    /**
     * Fetch active metrics stats for summary cards
     */
    async getStats(companyId) {
        const stats = await MagicLinkRepository.getStatsSummary(companyId);
        return new MagicLinkStatsDTO(stats);
    }

    /**
     * Regenerate an existing link (refreshes token, resets usage counter & locked IP, extends expiration)
     */
    async regenerateLink(magicLinkId, companyId, userId) {
        const ml = await MagicLinkRepository.findById(magicLinkId, companyId);
        if (!ml) {
            const error = new Error('Magic link not found');
            error.status = 404;
            throw error;
        }

        const newToken = this._generateSecureToken();
        
        // Calculate new expiration date by maintaining the original duration interval from NOW
        let nextExpires = null;
        if (ml.expires_at && ml.created_at) {
            const durationMs = ml.expires_at.getTime() - ml.created_at.getTime();
            nextExpires = new Date(Date.now() + durationMs);
        } else if (ml.expires_at) {
            // Default extend by 7 days if duration is unclear
            nextExpires = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
        }

        const updated = await MagicLinkRepository.update(magicLinkId, companyId, {
            token: newToken,
            expires_at: nextExpires,
            use_count: 0,
            locked_ip: null,
            is_revoked: false,
            updated_by: userId
        });

        return new MagicLinkResponseDTO(updated);
    }

    /**
     * Revoke a magic link
     */
    async revokeLink(magicLinkId, companyId, userId) {
        const ml = await MagicLinkRepository.findById(magicLinkId, companyId);
        if (!ml) {
            const error = new Error('Magic link not found');
            error.status = 404;
            throw error;
        }

        const updated = await MagicLinkRepository.revoke(magicLinkId, companyId, userId);
        return new MagicLinkResponseDTO(updated);
    }

    /**
     * Public verification resolver: validates security constraints and increments usage counter on success
     * @param {string} token - The unique magic link token
     * @param {string} clientIp - Requester IP address
     * @returns {Promise<MagicLinkResponseDTO>}
     */
    async resolveToken(token, clientIp) {
        const ml = await MagicLinkRepository.findByToken(token);
        if (!ml) {
            const error = new Error('Invalid magic link token');
            error.status = 404;
            throw error;
        }

        const validation = ml.validateAccess(clientIp);
        if (!validation.valid) {
            const error = new Error(validation.reason);
            error.status = 403;
            throw error;
        }

        // Increment access usage count and set locked IP if required
        const updatedMl = await MagicLinkRepository.incrementUse(ml.magic_link_id, clientIp);
        return new MagicLinkResponseDTO(updatedMl);
    }

    /**
     * Distribute magic link to guest via simulated Email or WhatsApp webhook
     */
    async distributeLink(magicLinkId, companyId, channel, userId) {
        const ml = await MagicLinkRepository.findById(magicLinkId, companyId);
        if (!ml) {
            const error = new Error('Magic link not found');
            error.status = 404;
            throw error;
        }

        const linkUrl = `https://eventhub360.com/rsvp/ml/${ml.token}`;
        const recipientName = ml.guest_name || 'Guest';

        if (channel === 'EMAIL') {
            const emailAddress = `${recipientName.toLowerCase().replace(/\s+/g, '')}@example.com`;
            console.log(`[Email Service] Sending Magic Link to ${emailAddress}:`);
            console.log(`Subject: Your Exclusive Event Access Link`);
            console.log(`Body: Hello ${recipientName}, click here to log in: ${linkUrl}`);
        } else if (channel === 'WHATSAPP') {
            const phone = ml.guest_phone || '+15550199';
            console.log(`[WhatsApp Service] Sending message template to ${phone}:`);
            console.log(`Message: Hi ${recipientName}, here is your concierge access code: ${linkUrl}`);
        }

        // Auditing update track
        await MagicLinkRepository.update(magicLinkId, companyId, {
            updated_by: userId
        });

        return {
            success: true,
            message: `Magic link successfully distributed to ${recipientName} via ${channel}`
        };
    }

    /**
     * Export active links data to CSV format
     */
    async exportLinksCSV(companyId) {
        // Fetch all matching links for the company
        const links = await MagicLinkRepository.findAll({
            companyId,
            limit: 100000,
            offset: 0
        });

        const headers = ['Guest Name', 'Guest Category', 'Link URL', 'Created Date', 'Expiry Date', 'Status', 'Uses'];
        const rows = links.map(ml => {
            const dto = new MagicLinkListResponseDTO(ml);
            return [
                `"${dto.guest_name.replace(/"/g, '""')}"`,
                `"${dto.guest_category.replace(/"/g, '""')}"`,
                `"${dto.link_url}"`,
                dto.created_at || '',
                dto.expires_at || 'No Expiration',
                dto.status,
                dto.use_count
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        return csvContent;
    }

    /**
     * Generate secure, random hexadecimal string for token mapping
     * @private
     */
    _generateSecureToken() {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Map UI expiration selection string to absolute Timestamp
     * @private
     * @returns {Date|null}
     */
    _calculateExpirationDate(type) {
        const now = new Date();
        switch (type) {
            case '24 Hours':
                return new Date(now.getTime() + (24 * 60 * 60 * 1000));
            case '7 Days':
                return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
            case '30 Days':
                return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
            case 'No Expiration':
            default:
                return null;
        }
    }
}

module.exports = new MagicLinkService();
