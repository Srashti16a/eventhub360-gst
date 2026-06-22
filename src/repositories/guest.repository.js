const db = require('../config/db');

class GuestRepository {
  /**
   * Find all guests for a specific event with filters.
   * Joins guest details, group details, RSVP, seating, meal preferences, and check-in history.
   */
  async findByEventId(eventId, filters = {}) {
    let queryText = `
      SELECT 
        eg.event_guest_id,
        eg.event_id,
        eg.invited,
        eg.rsvp_token,
        g.guest_id,
        g.company_id,
        g.name,
        g.phone,
        g.category,
        gg.group_id,
        gg.name AS group_name,
        r.rsvp_id,
        r.status AS rsvp_status,
        r.pax AS rsvp_pax,
        r.responded_at AS rsvp_responded_at,
        (
          SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'seating_id', s.seating_id, 
            'table_no', s.table_no, 
            'seat_no', s.seat_no
          )), '[]'::json)
          FROM seating s
          WHERE s.event_guest_id = eg.event_guest_id AND s.is_active = TRUE
        ) AS seating,
        (
          SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'meal_pref_id', mp.meal_pref_id, 
            'preference', mp.preference
          )), '[]'::json)
          FROM meal_pref mp
          WHERE mp.event_guest_id = eg.event_guest_id AND mp.is_active = TRUE
        ) AS meal_preferences,
        (
          SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'checkin_id', gc.checkin_id, 
            'checked_in_at', gc.checked_in_at, 
            'qr_code', gc.qr_code
          )), '[]'::json)
          FROM guest_checkin gc
          WHERE gc.event_guest_id = eg.event_guest_id AND gc.is_active = TRUE
        ) AS checkins
      FROM event_guest eg
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      LEFT JOIN guest_group gg ON eg.group_id = gg.group_id AND gg.is_active = TRUE
      LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.is_active = TRUE
      WHERE eg.event_id = $1 AND eg.is_active = TRUE
    `;

    const queryParams = [eventId];
    let paramCounter = 2;

    // Search query by guest name or phone
    if (filters.search) {
      queryText += ` AND (g.name ILIKE $${paramCounter} OR g.phone ILIKE $${paramCounter})`;
      queryParams.push(`%${filters.search}%`);
      paramCounter++;
    }

    // Filter by guest category (VIP, Family, Corporate)
    if (filters.category) {
      queryText += ` AND g.category = $${paramCounter}`;
      queryParams.push(filters.category);
      paramCounter++;
    }

    // Filter by RSVP status (yes, no, maybe)
    // For 'pending', we filter where r.status IS NULL or status is empty
    if (filters.status) {
      if (filters.status === 'pending') {
        queryText += ` AND r.status IS NULL`;
      } else {
        queryText += ` AND r.status = $${paramCounter}`;
        queryParams.push(filters.status);
        paramCounter++;
      }
    }

    queryText += ` ORDER BY g.name ASC`;

    const { rows } = await db.query(queryText, queryParams);
    return rows;
  }
}

module.exports = new GuestRepository();
