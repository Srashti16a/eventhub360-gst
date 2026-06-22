const checkinRepository = require('../repositories/checkin.repository');
const eventGuestRepository = require('../repositories/eventGuest.repository');
const seatingRepository = require('../repositories/seating.repository');

class CheckinService {
  /**
   * Process a guest check-in using a QR code or specific event_guest_id.
   * Generates badge printing information upon success.
   */
  async checkin(payload) {
    const { qr_code, event_guest_id } = payload;
    let guest = null;

    // 1. Resolve event guest
    if (event_guest_id) {
      guest = await eventGuestRepository.findById(event_guest_id);
      if (!guest) {
        const error = new Error('Guest not found with the specified event guest ID');
        error.statusCode = 404;
        throw error;
      }
    } else {
      // If no event_guest_id is provided, check if qr_code matches an rsvp_token
      guest = await eventGuestRepository.findByRsvpToken(qr_code);
      if (!guest) {
        const error = new Error('No guest invitation matches this QR code / RSVP token');
        error.statusCode = 404;
        throw error;
      }
    }

    const resolvedGuestId = guest.event_guest_id;

    // 2. Register the check-in
    const checkin = await checkinRepository.insert({
      event_guest_id: resolvedGuestId,
      qr_code,
      tenant_id: guest.tenant_id,
      company_id: guest.company_id,
      branch_id: guest.branch_id,
      created_by: resolvedGuestId, // Checked in by themselves or an organizer
    });

    // 3. Fetch seating information for the badge
    const seats = await seatingRepository.findByEventGuestId(resolvedGuestId);
    const table_no = seats.length > 0 ? seats[0].table_no : 'N/A';
    const seat_no = seats.length > 0 ? seats[0].seat_no : 'N/A';

    return {
      checkin_id: checkin.checkin_id,
      event_guest_id: resolvedGuestId,
      checked_in_at: checkin.checked_in_at,
      qr_code: checkin.qr_code,
      badge: {
        guest_name: guest.guest_name,
        category: guest.guest_category || 'General',
        group_name: guest.group_name || 'N/A',
        table_no,
        seat_no,
      },
    };
  }
}

module.exports = new CheckinService();
