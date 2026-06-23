/**
 * BusinessCardScan Entity Model
 */
class BusinessCardScan {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.guest_id]
     * @param {string} params.image_url
     * @param {Object} [params.ocr_data]
     * @param {'Pending' | 'Completed' | 'Failed'} [params.processing_status]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        id,
        company_id,
        guest_id = null,
        image_url,
        ocr_data = {},
        processing_status = 'Pending',
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.guest_id = guest_id ? Number(guest_id) : null;
        this.image_url = image_url;
        this.ocr_data = typeof ocr_data === 'string' ? JSON.parse(ocr_data) : ocr_data;
        this.processing_status = processing_status;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to BusinessCardScan Entity instance
     * @param {Object} row 
     * @returns {BusinessCardScan}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BusinessCardScan({
            id: row.id,
            company_id: row.company_id,
            guest_id: row.guest_id,
            image_url: row.image_url,
            ocr_data: row.ocr_data,
            processing_status: row.processing_status,
            created_at: row.created_at
        });
    }
}

module.exports = BusinessCardScan;
