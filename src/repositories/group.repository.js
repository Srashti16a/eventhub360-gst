const db = require('../config/db');
const crypto = require('crypto');

class GroupRepository {
  /**
   * Create a new guest group.
   */
  async create(groupData) {
    const { name, event_id, tenant_id, company_id, branch_id } = groupData;
    const queryText = `
      INSERT INTO guest_group (name, event_id, tenant_id, company_id, branch_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [name, event_id, tenant_id || null, company_id || null, branch_id || null];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  /**
   * Find a group by its ID.
   */
  async findGroupOnlyById(groupId) {
    const queryText = `
      SELECT * FROM guest_group
      WHERE group_id = $1 AND is_active = TRUE
    `;
    const { rows } = await db.query(queryText, [groupId]);
    return rows[0] || null;
  }

  /**
   * Get all groups for an event with pagination and filters.
   */
  async findAll(eventId, filters = {}) {
    const page = parseInt(filters.page || 1, 10);
    const limit = parseInt(filters.limit || 10, 10);
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT 
        gg.group_id,
        gg.event_id,
        gg.name AS group_name,
        gg.is_active,
        COUNT(*) OVER() AS total_count,
        -- Total members count
        (
          SELECT COUNT(eg.event_guest_id) 
          FROM event_guest eg 
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
        ) AS members_count,
        -- Primary guest details
        (
          SELECT JSON_BUILD_OBJECT(
            'guest_id', g.guest_id,
            'name', g.name,
            'phone', g.phone,
            'category', g.category,
            'rsvp_status', COALESCE(r.status, 'pending')
          )
          FROM event_guest eg
          INNER JOIN guest g ON eg.guest_id = g.guest_id
          LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.is_active = TRUE
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
          ORDER BY eg.event_guest_id ASC
          LIMIT 1
        ) AS primary_guest,
        -- Group category (category of primary guest)
        (
          SELECT g.category
          FROM event_guest eg
          INNER JOIN guest g ON eg.guest_id = g.guest_id
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
          ORDER BY eg.event_guest_id ASC
          LIMIT 1
        ) AS category,
        -- Status based on RSVP
        (
          SELECT 
            CASE 
              WHEN COUNT(eg.event_guest_id) = 0 THEN 'Pending'
              WHEN COUNT(r.rsvp_id) = 0 THEN 'Pending'
              WHEN SUM(CASE WHEN r.status = 'yes' THEN 1 ELSE 0 END) = COUNT(eg.event_guest_id) THEN 'Confirmed'
              ELSE 'Mixed'
            END
          FROM event_guest eg
          LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.is_active = TRUE
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
        ) AS status
      FROM guest_group gg
      WHERE gg.event_id = $1 AND gg.is_active = TRUE
    `;

    const queryParams = [eventId];
    let paramCounter = 2;

    if (filters.search) {
      queryText += ` AND gg.name ILIKE $${paramCounter}`;
      queryParams.push(`%${filters.search}%`);
      paramCounter++;
    }

    queryText += ` ORDER BY gg.name ASC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit, offset);

    const { rows } = await db.query(queryText, queryParams);
    return rows;
  }

  /**
   * Get detailed group info by ID (including members, dietary needs, seating, etc.)
   */
  async findById(groupId) {
    const queryText = `
      SELECT 
        gg.group_id,
        gg.event_id,
        gg.name AS group_name,
        gg.tenant_id,
        gg.company_id,
        gg.branch_id,
        gg.is_active,
        'Standard' AS transportation_type,
        'None' AS special_requirements,
        -- Primary guest details
        (
          SELECT JSON_BUILD_OBJECT(
            'guest_id', g.guest_id,
            'name', g.name,
            'phone', g.phone,
            'category', g.category
          )
          FROM event_guest eg
          INNER JOIN guest g ON eg.guest_id = g.guest_id
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
          ORDER BY eg.event_guest_id ASC
          LIMIT 1
        ) AS primary_guest,
        -- Primary location (first member table)
        (
          SELECT s.table_no
          FROM event_guest eg
          LEFT JOIN seating s ON eg.event_guest_id = s.event_guest_id AND s.is_active = TRUE
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
          ORDER BY eg.event_guest_id ASC
          LIMIT 1
        ) AS primary_location,
        -- Dietary needs count
        (
          SELECT COUNT(mp.meal_pref_id)
          FROM event_guest eg
          INNER JOIN meal_pref mp ON eg.event_guest_id = mp.event_guest_id AND mp.is_active = TRUE
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
        ) AS dietary_needs_count,
        -- Members list
        (
          SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'guest_id', g.guest_id,
            'event_guest_id', eg.event_guest_id,
            'name', g.name,
            'phone', g.phone,
            'category', g.category,
            'rsvp_status', COALESCE(r.status, 'pending'),
            'rsvp_pax', COALESCE(r.pax, 0),
            'table_no', COALESCE((SELECT s.table_no FROM seating s WHERE s.event_guest_id = eg.event_guest_id AND s.is_active = TRUE LIMIT 1), 'N/A'),
            'seat_no', COALESCE((SELECT s.seat_no FROM seating s WHERE s.event_guest_id = eg.event_guest_id AND s.is_active = TRUE LIMIT 1), 'N/A'),
            'meal_preferences', COALESCE((SELECT JSON_AGG(mp.preference) FROM meal_pref mp WHERE mp.event_guest_id = eg.event_guest_id AND mp.is_active = TRUE), '[]'::json)
          ) ORDER BY eg.event_guest_id ASC), '[]'::json)
          FROM event_guest eg
          INNER JOIN guest g ON eg.guest_id = g.guest_id
          LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id AND r.is_active = TRUE
          WHERE eg.group_id = gg.group_id AND eg.is_active = TRUE
        ) AS members
      FROM guest_group gg
      WHERE gg.group_id = $1 AND gg.is_active = TRUE
    `;
    const { rows } = await db.query(queryText, [groupId]);
    return rows[0] || null;
  }

  /**
   * Update guest group details.
   */
  async update(groupId, updateData) {
    const { name, is_active } = updateData;
    const fields = [];
    const values = [];
    let counter = 1;

    if (name !== undefined) {
      fields.push(`name = $${counter}`);
      values.push(name);
      counter++;
    }

    if (is_active !== undefined) {
      fields.push(`is_active = $${counter}`);
      values.push(is_active);
      counter++;
    }

    fields.push(`updated_at = NOW()`);

    values.push(groupId);
    const queryText = `
      UPDATE guest_group
      SET ${fields.join(', ')}
      WHERE group_id = $${counter}
      RETURNING *
    `;

    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  /**
   * Add a guest to a group.
   * If an event_guest entry exists for the guest on the event, set its group_id.
   * Otherwise, create a new event_guest entry.
   */
  async addMember(groupId, guestId, groupDetails) {
    const { event_id, tenant_id, company_id, branch_id } = groupDetails;

    // Check if event_guest record exists
    const checkQuery = `
      SELECT event_guest_id FROM event_guest
      WHERE guest_id = $1 AND event_id = $2 AND is_active = TRUE
    `;
    const checkRes = await db.query(checkQuery, [guestId, event_id]);

    if (checkRes.rows.length > 0) {
      const eventGuestId = checkRes.rows[0].event_guest_id;
      const updateQuery = `
        UPDATE event_guest
        SET group_id = $1, updated_at = NOW()
        WHERE event_guest_id = $2
        RETURNING *
      `;
      const { rows } = await db.query(updateQuery, [groupId, eventGuestId]);
      return rows[0];
    } else {
      // Create new event_guest entry
      const rsvpToken = `rsvp-token-${crypto.randomBytes(8).toString('hex')}`;
      const insertQuery = `
        INSERT INTO event_guest (event_id, guest_id, group_id, invited, rsvp_token, tenant_id, company_id, branch_id)
        VALUES ($1, $2, $3, TRUE, $4, $5, $6, $7)
        RETURNING *
      `;
      const { rows } = await db.query(insertQuery, [
        event_id,
        guestId,
        groupId,
        rsvpToken,
        tenant_id,
        company_id,
        branch_id,
      ]);
      return rows[0];
    }
  }

  /**
   * Remove a guest from a group (removes group_id mapping, doesn't delete invitation).
   */
  async removeMember(groupId, guestId) {
    const queryText = `
      UPDATE event_guest
      SET group_id = NULL, updated_at = NOW()
      WHERE group_id = $1 AND guest_id = $2 AND is_active = TRUE
      RETURNING *
    `;
    const { rows } = await db.query(queryText, [groupId, guestId]);
    return rows[0] || null;
  }

  /**
   * Get dashboard statistics for an event.
   */
  async getDashboardStats(eventId) {
    const queryText = `
      SELECT 
        -- Total Groups
        (SELECT COUNT(*) FROM guest_group WHERE event_id = $1 AND is_active = TRUE)::int AS total_groups,
        -- Active Groups
        (SELECT COUNT(*) FROM guest_group WHERE event_id = $1 AND is_active = TRUE)::int AS active_groups,
        -- VIP Groups (groups containing at least one guest with category = 'VIP')
        (
          SELECT COUNT(DISTINCT gg.group_id) 
          FROM guest_group gg
          INNER JOIN event_guest eg ON gg.group_id = eg.group_id AND eg.is_active = TRUE
          INNER JOIN guest g ON eg.guest_id = g.guest_id
          WHERE gg.event_id = $1 AND gg.is_active = TRUE AND g.category = 'VIP'
        )::int AS vip_groups,
        -- Average Group Size (average of member counts per group)
        (
          SELECT COALESCE(AVG(member_count), 0)::float
          FROM (
            SELECT COUNT(eg.event_guest_id) as member_count
            FROM guest_group gg
            LEFT JOIN event_guest eg ON gg.group_id = eg.group_id AND eg.is_active = TRUE
            WHERE gg.event_id = $1 AND gg.is_active = TRUE
            GROUP BY gg.group_id
          ) sub
        ) AS average_group_size
    `;
    const { rows } = await db.query(queryText, [eventId]);
    return rows[0];
  }
}

module.exports = new GroupRepository();
