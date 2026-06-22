const db = require('../config/db');

class SeatingRepository {
  /**
   * Find a seating assignment by ID.
   */
  async findById(seatingId) {
    const queryText = `
      SELECT 
        s.seating_id,
        s.event_guest_id,
        s.table_no,
        s.seat_no,
        s.tenant_id,
        s.company_id,
        s.branch_id,
        s.is_active,
        eg.event_id,
        g.name AS guest_name
      FROM seating s
      INNER JOIN event_guest eg ON s.event_guest_id = eg.event_guest_id
      INNER JOIN guest g ON eg.guest_id = g.guest_id
      WHERE s.seating_id = $1 AND s.is_active = TRUE
    `;
    const { rows } = await db.query(queryText, [seatingId]);
    return rows[0] || null;
  }

  /**
   * Update seating table and seat assignment.
   */
  async update(seatingId, updateData) {
    const { table_no, seat_no, updated_by } = updateData;

    // Dynamically build the update query to allow updating only table_no or seat_no or both
    const fields = [];
    const values = [];
    let counter = 1;

    if (table_no !== undefined) {
      fields.push(`table_no = $${counter}`);
      values.push(table_no);
      counter++;
    }

    if (seat_no !== undefined) {
      fields.push(`seat_no = $${counter}`);
      values.push(seat_no);
      counter++;
    }

    if (updated_by !== undefined) {
      fields.push(`updated_by = $${counter}`);
      values.push(updated_by);
      counter++;
    }

    fields.push(`updated_at = NOW()`);

    if (fields.length === 1) {
      // Nothing to update other than updated_at
      return this.findById(seatingId);
    }

    values.push(seatingId);
    const queryText = `
      UPDATE seating
      SET ${fields.join(', ')}
      WHERE seating_id = $${counter}
      RETURNING *
    `;

    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  /**
   * Find seating assignments by event_guest_id.
   */
  async findByEventGuestId(eventGuestId) {
    const queryText = `
      SELECT * FROM seating
      WHERE event_guest_id = $1 AND is_active = TRUE
    `;
    const { rows } = await db.query(queryText, [eventGuestId]);
    return rows;
  }
}

module.exports = new SeatingRepository();
