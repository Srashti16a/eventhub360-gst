/**
 * GuestPhoto Entity Model
 */
class GuestPhoto {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.guest_id
     * @param {string} params.photo_url
     * @param {'Kiosk Camera' | 'Upload'} [params.capture_source]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        id,
        company_id,
        guest_id,
        photo_url,
        capture_source = 'Kiosk Camera',
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.guest_id = Number(guest_id);
        this.photo_url = photo_url;
        this.capture_source = capture_source;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to GuestPhoto Entity instance
     * @param {Object} row 
     * @returns {GuestPhoto}
     */
    static fromRow(row) {
        if (!row) return null;
        return new GuestPhoto({
            id: row.id,
            company_id: row.company_id,
            guest_id: row.guest_id,
            photo_url: row.photo_url,
            capture_source: row.capture_source,
            created_at: row.created_at
        });
    }
}

module.exports = GuestPhoto;
