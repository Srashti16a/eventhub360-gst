const db = require('../config/db');

class CategoryRepository {
  /**
   * Get counts of guests by category.
   * Scoped to an event if eventId is provided, otherwise global.
   */
  async getCounts(eventId = null) {
    let queryText = '';
    const queryParams = [];

    if (eventId) {
      queryText = `
        SELECT COALESCE(g.category, 'Guest') AS category, COUNT(g.guest_id)::int AS count
        FROM guest g
        INNER JOIN event_guest eg ON g.guest_id = eg.guest_id AND eg.is_active = TRUE
        WHERE eg.event_id = $1 AND g.is_active = TRUE
        GROUP BY g.category
      `;
      queryParams.push(eventId);
    } else {
      queryText = `
        SELECT COALESCE(category, 'Guest') AS category, COUNT(guest_id)::int AS count
        FROM guest
        WHERE is_active = TRUE
        GROUP BY category
      `;
    }

    const { rows } = await db.query(queryText, queryParams);
    return rows;
  }

  /**
   * Find guests in a specific category with search and pagination filters.
   */
  async findGuestsByCategory(categoryName, eventId = null, filters = {}) {
    const page = parseInt(filters.page || 1, 10);
    const limit = parseInt(filters.limit || 10, 10);
    const offset = (page - 1) * limit;

    let queryText = '';
    const queryParams = [categoryName];
    let paramCounter = 2;

    if (eventId) {
      queryText = `
        SELECT 
          eg.event_guest_id,
          eg.event_id,
          eg.invited,
          eg.rsvp_token,
          g.guest_id,
          g.company_id,
          g.name,
          g.phone,
          COALESCE(g.category, 'Guest') AS category,
          gg.group_id,
          gg.name AS group_name,
          r.rsvp_id,
          r.status AS rsvp_status,
          r.pax AS rsvp_pax,
          r.responded_at AS rsvp_responded_at,
          COUNT(*) OVER() AS total_count
        FROM guest g
        INNER JOIN event_guest eg ON g.guest_id = eg.guest_id AND eg.is_active = TRUE
        LEFT JOIN guest_group gg ON eg.group_id = gg.group_id AND gg.is_active = TRUE
        LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.is_active = TRUE
        WHERE COALESCE(g.category, 'Guest') = $1 AND eg.event_id = $2 AND g.is_active = TRUE
      `;
      queryParams.push(eventId);
      paramCounter = 3;
    } else {
      queryText = `
        SELECT 
          g.guest_id,
          g.company_id,
          g.name,
          g.phone,
          COALESCE(g.category, 'Guest') AS category,
          g.tenant_id,
          g.company_id,
          g.branch_id,
          COUNT(*) OVER() AS total_count
        FROM guest g
        WHERE COALESCE(g.category, 'Guest') = $1 AND g.is_active = TRUE
      `;
    }

    if (filters.search) {
      queryText += ` AND (g.name ILIKE $${paramCounter} OR g.phone ILIKE $${paramCounter})`;
      queryParams.push(`%${filters.search}%`);
      paramCounter++;
    }

    queryText += ` ORDER BY g.name ASC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit, offset);

    const { rows } = await db.query(queryText, queryParams);
    return rows;
  }

  /**
   * Assign a category to a guest.
   */
  async assignCategory(guestId, category) {
    const queryText = `
      UPDATE guest
      SET category = $1, updated_at = NOW()
      WHERE guest_id = $2 AND is_active = TRUE
      RETURNING *
    `;
    const { rows } = await db.query(queryText, [category, guestId]);
    return rows[0] || null;
  }
}

module.exports = new CategoryRepository();
