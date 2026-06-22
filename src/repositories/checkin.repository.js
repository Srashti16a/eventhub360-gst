const db = require('../config/db');

class CheckinRepository {
  /**
   * Create a new check-in record.
   * Supports execution inside a transaction by passing a client.
   */
  async insert(checkinData, client = db) {
    const {
      event_guest_id,
      qr_code,
      tenant_id,
      company_id,
      branch_id,
      created_by,
    } = checkinData;

    const queryText = `
      INSERT INTO guest_checkin (
        event_guest_id, qr_code, checked_in_at, 
        tenant_id, company_id, branch_id, created_by, updated_by
      )
      VALUES ($1, $2, NOW(), $3, $4, $5, $6, $6)
      RETURNING *
    `;

    const values = [
      event_guest_id,
      qr_code,
      tenant_id || null,
      company_id || null,
      branch_id || null,
      created_by || null,
    ];

    const { rows } = await client.query(queryText, values);
    return rows[0];
  }

  /**
   * Get check-ins for a specific event guest.
   */
  async findByEventGuestId(eventGuestId, client = db) {
    const queryText = `
      SELECT * FROM guest_checkin
      WHERE event_guest_id = $1 AND is_active = TRUE
      ORDER BY checked_in_at DESC
    `;
    const { rows } = await client.query(queryText, [eventGuestId]);
    return rows;
  }

  /**
   * Find a guest's check-in by QR code.
   */
  async findByQrCode(qrCode, client = db) {
    const queryText = `
      SELECT * FROM guest_checkin
      WHERE qr_code = $1 AND is_active = TRUE
      ORDER BY checked_in_at DESC
    `;
    const { rows } = await client.query(queryText, [qrCode]);
    return rows[0] || null;
  }
}

module.exports = new CheckinRepository();
