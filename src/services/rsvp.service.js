const db = require('../config/db');
const eventGuestRepository = require('../repositories/eventGuest.repository');
const rsvpRepository = require('../repositories/rsvp.repository');
const mealPrefRepository = require('../repositories/mealPref.repository');

class RsvpService {
  /**
   * Submit RSVP response for a guest token.
   * Runs in a transaction to update RSVP status and reconstruct meal preferences.
   */
  async submitRsvp(token, rsvpData) {
    // 1. Resolve guest by token
    const guest = await eventGuestRepository.findByRsvpToken(token);
    if (!guest) {
      const error = new Error('Invalid RSVP token');
      error.statusCode = 404;
      throw error;
    }

    const { event_guest_id, tenant_id, company_id, branch_id } = guest;
    const { status, pax, meal_preferences } = rsvpData;

    // Checkout a client from the pool to manage transaction scope
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // 2. Upsert RSVP record
      const rsvp = await rsvpRepository.upsert({
        event_guest_id,
        status,
        pax,
        tenant_id,
        company_id,
        branch_id,
        updated_by: event_guest_id // assume updated by guest themselves
      }, client);

      // 3. Update Meal Preferences if provided
      let savedMealPrefs = [];
      if (meal_preferences !== undefined) {
        // Clear previous selections
        await mealPrefRepository.deleteByEventGuestId(event_guest_id, client);
        
        // Insert new preferences
        if (meal_preferences.length > 0) {
          savedMealPrefs = await mealPrefRepository.bulkInsert(
            event_guest_id,
            meal_preferences,
            { tenant_id, company_id, branch_id, created_by: event_guest_id },
            client
          );
        }
      }

      await client.query('COMMIT');

      return {
        event_guest_id,
        guest_name: guest.guest_name,
        rsvp_status: rsvp.status,
        pax: rsvp.pax,
        responded_at: rsvp.responded_at,
        meal_preferences: savedMealPrefs.map(mp => mp.preference),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction rollback in submitRsvp:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new RsvpService();
