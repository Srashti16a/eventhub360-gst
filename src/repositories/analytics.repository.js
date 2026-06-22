const db = require('../config/db');

class AnalyticsRepository {
  /**
   * Retrieve summary statistics for the dashboard.
   */
  async getSummary(eventId) {
    const queryText = `
      SELECT 
        -- Total Invited
        (SELECT COUNT(*) FROM event_guest WHERE event_id = $1 AND is_active = TRUE)::int AS total_invited,
        -- Total Expected (Confirmed Yes + Pending)
        (
          SELECT COUNT(eg.event_guest_id) 
          FROM event_guest eg 
          LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.is_active = TRUE
          WHERE eg.event_id = $1 AND eg.is_active = TRUE AND (r.status IS NULL OR r.status != 'no')
        )::int AS total_expected,
        -- Confirmed Yes
        (
          SELECT COUNT(eg.event_guest_id) 
          FROM event_guest eg 
          INNER JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.status = 'yes' AND r.is_active = TRUE
          WHERE eg.event_id = $1 AND eg.is_active = TRUE
        )::int AS confirmed_yes,
        -- Checked-In count
        (
          SELECT COUNT(gc.checkin_id) 
          FROM guest_checkin gc 
          INNER JOIN event_guest eg ON gc.event_guest_id = eg.event_guest_id AND eg.is_active = TRUE
          WHERE eg.event_id = $1 AND gc.is_active = TRUE
        )::int AS current_checkins,
        -- No-Shows count (RSVP = 'yes' but checkin is NULL)
        (
          SELECT COUNT(eg.event_guest_id) 
          FROM event_guest eg 
          INNER JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.status = 'yes' AND r.is_active = TRUE
          LEFT JOIN guest_checkin gc ON eg.event_guest_id = gc.event_guest_id AND gc.is_active = TRUE
          WHERE eg.event_id = $1 AND eg.is_active = TRUE AND gc.checkin_id IS NULL
        )::int AS no_shows
    `;
    const { rows } = await db.query(queryText, [eventId]);
    return rows[0];
  }

  /**
   * Retrieve check-ins grouped by hour.
   */
  async getHourlyCheckins(eventId) {
    const queryText = `
      SELECT EXTRACT(HOUR FROM gc.checked_in_at)::int AS checkin_hour, COUNT(gc.checkin_id)::int AS count
      FROM guest_checkin gc
      INNER JOIN event_guest eg ON gc.event_guest_id = eg.event_guest_id AND eg.is_active = TRUE
      WHERE eg.event_id = $1 AND gc.is_active = TRUE
      GROUP BY checkin_hour
      ORDER BY checkin_hour ASC
    `;
    const { rows } = await db.query(queryText, [eventId]);
    return rows;
  }

  /**
   * Fetch checked-in guests grouped by category.
   */
  async getCheckinsByCategory(eventId) {
    const queryText = `
      SELECT COALESCE(g.category, 'Guest') AS category, COUNT(gc.checkin_id)::int AS count
      FROM guest_checkin gc
      INNER JOIN event_guest eg ON gc.event_guest_id = eg.event_guest_id AND eg.is_active = TRUE
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      WHERE eg.event_id = $1 AND gc.is_active = TRUE
      GROUP BY g.category
    `;
    const { rows } = await db.query(queryText, [eventId]);
    return rows;
  }

  /**
   * Fetch no-shows details grouped by category.
   */
  async getNoShowsByCategory(eventId) {
    const queryText = `
      SELECT 
        COALESCE(g.category, 'Guest') AS category,
        COUNT(eg.event_guest_id)::int AS total_confirmed,
        SUM(CASE WHEN gc.checkin_id IS NULL THEN 1 ELSE 0 END)::int AS no_shows
      FROM event_guest eg
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      INNER JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.status = 'yes' AND r.is_active = TRUE
      LEFT JOIN guest_checkin gc ON eg.event_guest_id = gc.event_guest_id AND gc.is_active = TRUE
      WHERE eg.event_id = $1 AND eg.is_active = TRUE
      GROUP BY g.category
    `;
    const { rows } = await db.query(queryText, [eventId]);
    return rows;
  }

  /**
   * Fetch check-ins with categories to help project gate entries.
   */
  async getCheckinGatesDetails(eventId) {
    const queryText = `
      SELECT 
        g.guest_id, 
        COALESCE(g.category, 'Guest') AS category, 
        EXTRACT(HOUR FROM gc.checked_in_at)::int AS checkin_hour
      FROM guest_checkin gc
      INNER JOIN event_guest eg ON gc.event_guest_id = eg.event_guest_id AND eg.is_active = TRUE
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      WHERE eg.event_id = $1 AND gc.is_active = TRUE
    `;
    const { rows } = await db.query(queryText, [eventId]);
    return rows;
  }
}

module.exports = new AnalyticsRepository();
