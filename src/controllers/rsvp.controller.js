const rsvpService = require('../services/rsvp.service');

class RsvpController {
  /**
   * POST /api/v1/rsvp/:token
   * Submits RSVP response and updates meal preferences for the guest token.
   */
  async submitRsvp(req, res, next) {
    try {
      const { token } = req.params;
      const { status, pax, meal_preferences } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'RSVP token is required in the path',
        });
      }

      const result = await rsvpService.submitRsvp(token, {
        status,
        pax,
        meal_preferences,
      });

      return res.status(200).json({
        success: true,
        message: 'RSVP updated successfully',
        data: result,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

module.exports = new RsvpController();
