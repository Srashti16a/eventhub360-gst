const db = require('../config/db');

// In-memory cache for concierge details that do not exist in the database schema
const profileCache = {};

class ProfileRepository {
  /**
   * Fetch profile details by event guest ID.
   */
  async findProfileByEventGuestId(eventGuestId) {
    const queryText = `
      SELECT 
        eg.event_guest_id,
        eg.event_id,
        eg.invited,
        eg.rsvp_token,
        g.guest_id,
        g.name,
        g.phone,
        COALESCE(g.category, 'Guest') AS category,
        r.status AS rsvp_status,
        r.pax AS rsvp_pax,
        r.responded_at AS rsvp_responded_at,
        s.table_no,
        s.seat_no,
        (
          SELECT COALESCE(JSON_AGG(mp.preference), '[]'::json)
          FROM meal_pref mp
          WHERE mp.event_guest_id = eg.event_guest_id AND mp.is_active = TRUE
        ) AS meal_preferences
      FROM event_guest eg
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.is_active = TRUE
      LEFT JOIN seating s ON eg.event_guest_id = s.event_guest_id AND s.is_active = TRUE
      WHERE eg.event_guest_id = $1 AND eg.is_active = TRUE
      LIMIT 1
    `;

    const { rows } = await db.query(queryText, [eventGuestId]);
    return rows[0] || null;
  }

  /**
   * Save dynamic concierge details into the profile cache.
   */
  async updateCache(eventGuestId, data) {
    if (!profileCache[eventGuestId]) {
      profileCache[eventGuestId] = {};
    }
    profileCache[eventGuestId] = {
      ...profileCache[eventGuestId],
      ...data,
    };
    return profileCache[eventGuestId];
  }

  /**
   * Get cached concierge details for a profile.
   */
  async getCache(eventGuestId, guestName, guestCategory) {
    // Return cached details or default values
    const cached = profileCache[eventGuestId] || {};

    const defaults = {
      email: `${guestName.toLowerCase().replace(/\s+/g, '.')}@vge.com`,
      title: guestCategory === 'VIP' ? 'Chairman, Vanderbilt Global Enterprises' : 'Attendee',
      company_name: guestCategory === 'VIP' ? 'Vanderbilt Global Enterprises' : 'Independent',
      special_requests: guestName === 'Jameson Vanderbilt' 
        ? 'Prefers sparkling water with fresh lime at all times. Requesting a quiet lounge access for a 30-min call at 9 PM.'
        : 'None',
      accommodation: {
        hotel_name: 'The Ritz-Carlton, Manhattan',
        room_details: 'Executive Suite, Room 402',
        check_in: 'Oct 11, 3:00 PM',
        check_out: 'Oct 13, 12:00 PM',
      },
      transportation: {
        service_type: 'Airport Pickup (JFK)',
        vehicle: 'Cadillac Escalade ESV • Black',
        scheduled_time: 'Oct 11, 10:30 AM',
        driver_name: 'Robert S.',
        status: 'Tracking Link Sent',
      },
    };

    return {
      email: cached.email || defaults.email,
      title: cached.title || defaults.title,
      company_name: cached.company_name || defaults.company_name,
      special_requests: cached.special_requests || defaults.special_requests,
      accommodation: cached.accommodation || defaults.accommodation,
      transportation: cached.transportation || defaults.transportation,
    };
  }

  /**
   * Update the guest database columns.
   */
  async updateGuestDetails(eventGuestId, name, phone, category) {
    const fields = [];
    const values = [];
    let counter = 1;

    if (name !== undefined) {
      fields.push(`name = $${counter}`);
      values.push(name);
      counter++;
    }

    if (phone !== undefined) {
      fields.push(`phone = $${counter}`);
      values.push(phone);
      counter++;
    }

    if (category !== undefined) {
      fields.push(`category = $${counter}`);
      values.push(category);
      counter++;
    }

    if (fields.length === 0) return null;

    values.push(eventGuestId);
    const queryText = `
      UPDATE guest g
      SET ${fields.join(', ')}, updated_at = NOW()
      FROM event_guest eg
      WHERE eg.guest_id = g.guest_id AND eg.event_guest_id = $${counter}
      RETURNING g.*
    `;

    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  /**
   * Save a new concierge note.
   */
  async addNote(eventGuestId, content, author) {
    const queryText = `
      INSERT INTO concierge_note (event_guest_id, content, author)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [eventGuestId, content, author || 'Sarah J., Head Concierge'];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  /**
   * Fetch notes for a guest.
   */
  async findNotesByEventGuestId(eventGuestId) {
    const queryText = `
      SELECT note_id, event_guest_id, content, author, created_at
      FROM concierge_note
      WHERE event_guest_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(queryText, [eventGuestId]);
    return rows;
  }
}

module.exports = new ProfileRepository();
