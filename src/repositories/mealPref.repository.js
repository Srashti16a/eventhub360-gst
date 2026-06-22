const db = require('../config/db');

class MealPrefRepository {
  /**
   * Delete all meal preferences for a specific event guest.
   * Supports execution inside a transaction client.
   */
  async deleteByEventGuestId(eventGuestId, client = db) {
    const queryText = `
      DELETE FROM meal_pref 
      WHERE event_guest_id = $1
    `;
    await client.query(queryText, [eventGuestId]);
  }

  /**
   * Bulk insert meal preferences for an event guest.
   * Supports execution inside a transaction client.
   */
  async bulkInsert(eventGuestId, preferences, tenantInfo = {}, client = db) {
    if (!preferences || preferences.length === 0) return [];

    const { tenant_id, company_id, branch_id, created_by } = tenantInfo;

    // Construct a multi-row insert query
    // e.g. INSERT INTO meal_pref (event_guest_id, preference, tenant_id, company_id, branch_id, created_by) VALUES ($1, $2, ...), ($1, $3, ...)
    const values = [];
    const valuePlaceholders = [];
    let counter = 1;

    for (const pref of preferences) {
      valuePlaceholders.push(`($${counter}, $${counter + 1}, $${counter + 2}, $${counter + 3}, $${counter + 4}, $${counter + 5})`);
      values.push(
        eventGuestId,
        pref,
        tenant_id || null,
        company_id || null,
        branch_id || null,
        created_by || null
      );
      counter += 6;
    }

    const queryText = `
      INSERT INTO meal_pref (
        event_guest_id, preference, tenant_id, company_id, branch_id, created_by
      )
      VALUES ${valuePlaceholders.join(', ')}
      RETURNING *
    `;

    const { rows } = await client.query(queryText, values);
    return rows;
  }

  /**
   * Find meal preferences by event_guest_id.
   */
  async findByEventGuestId(eventGuestId, client = db) {
    const queryText = `
      SELECT * FROM meal_pref 
      WHERE event_guest_id = $1 AND is_active = TRUE
    `;
    const { rows } = await client.query(queryText, [eventGuestId]);
    return rows;
  }
}

module.exports = new MealPrefRepository();
