/**
 * KioskLanguage Entity Model
 */
class KioskLanguage {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {string} params.language_code
     * @param {string} params.language_name
     * @param {boolean} [params.is_active]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        id,
        language_code,
        language_name,
        is_active = true,
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.language_code = language_code;
        this.language_name = language_name;
        this.is_active = !!is_active;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to KioskLanguage Entity instance
     * @param {Object} row 
     * @returns {KioskLanguage}
     */
    static fromRow(row) {
        if (!row) return null;
        return new KioskLanguage({
            id: row.id,
            language_code: row.language_code,
            language_name: row.language_name,
            is_active: row.is_active,
            created_at: row.created_at
        });
    }
}

module.exports = KioskLanguage;
