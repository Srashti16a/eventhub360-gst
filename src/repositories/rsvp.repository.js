const db = require('../config/db');

class RsvpRepository {
  /**
   * Upserts the RSVP record for a specific event_guest_id.
   * If a record already exists, it updates it. Otherwise, it inserts a new one.
   * Supports execution inside a transaction by passing a client.
   */
  async upsert(rsvpData, client = db) {
    const {
      event_guest_id,
      status,
      pax,
      tenant_id,
      company_id,
      branch_id,
      updated_by,
    } = rsvpData;

    const queryText = `
      INSERT INTO rsvp (
        event_guest_id, status, pax, responded_at, 
        tenant_id, company_id, branch_id, created_by, updated_by
      )
      VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $7)
      ON CONFLICT (event_guest_id) DO UPDATE SET
        status = EXCLUDED.status,
        pax = EXCLUDED.pax,
        responded_at = NOW(),
        updated_at = NOW(),
        updated_by = EXCLUDED.updated_by
      RETURNING *
    `;

    const values = [
      event_guest_id,
      status,
      pax || 1,
      tenant_id || null,
      company_id || null,
      branch_id || null,
      updated_by || null,
    ];

    const { rows } = await client.query(queryText, values);
    return rows[0];
  }

  /**
   * Find RSVP by event_guest_id.
   */
  async findByEventGuestId(eventGuestId, client = db) {
    const queryText = `
      SELECT * FROM rsvp 
      WHERE event_guest_id = $1 AND is_active = TRUE
    `;
    const { rows } = await client.query(queryText, [eventGuestId]);
    return rows[0] || null;
  }
}

module.exports = new RsvpRepository();
