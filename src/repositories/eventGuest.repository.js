const db = require('../config/db');

class EventGuestRepository {
  /**
   * Find event_guest by rsvp_token, including basic guest and group details.
   */
  async findByRsvpToken(token) {
    const queryText = `
      SELECT 
        eg.event_guest_id,
        eg.event_id,
        eg.guest_id,
        eg.group_id,
        eg.invited,
        eg.rsvp_token,
        eg.tenant_id,
        eg.company_id,
        eg.branch_id,
        g.name AS guest_name,
        g.phone AS guest_phone,
        g.category AS guest_category,
        gg.name AS group_name
      FROM event_guest eg
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      LEFT JOIN guest_group gg ON eg.group_id = gg.group_id AND gg.is_active = TRUE
      WHERE eg.rsvp_token = $1 AND eg.is_active = TRUE
    `;
    const { rows } = await db.query(queryText, [token]);
    return rows[0] || null;
  }

  /**
   * Find event_guest by ID, including details.
   */
  async findById(eventGuestId) {
    const queryText = `
      SELECT 
        eg.event_guest_id,
        eg.event_id,
        eg.guest_id,
        eg.group_id,
        eg.invited,
        eg.rsvp_token,
        eg.tenant_id,
        eg.company_id,
        eg.branch_id,
        g.name AS guest_name,
        g.phone AS guest_phone,
        g.category AS guest_category
      FROM event_guest eg
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      WHERE eg.event_guest_id = $1 AND eg.is_active = TRUE
    `;
    const { rows } = await db.query(queryText, [eventGuestId]);
    return rows[0] || null;
  }
}

module.exports = new EventGuestRepository();
