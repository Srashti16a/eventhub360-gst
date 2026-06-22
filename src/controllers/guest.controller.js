const guestRepository = require('../repositories/guest.repository');

class GuestController {
  /**
   * GET /api/v1/guests?event=
   * Lists guests for an event with optional filters (search, category, status).
   */
  async getGuests(req, res, next) {
    try {
      const { event, search, category, status } = req.query;

      if (!event) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' (event_id) is required",
        });
      }

      const eventId = parseInt(event, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' must be a valid integer",
        });
      }

      const filters = { search, category, status };
      const guests = await guestRepository.findByEventId(eventId, filters);

      return res.status(200).json({
        success: true,
        count: guests.length,
        data: guests,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GuestController();
