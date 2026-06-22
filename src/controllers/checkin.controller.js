const checkinService = require('../services/checkin.service');

class CheckinController {
  /**
   * POST /api/v1/checkin
   * Scans QR / RSVP token and marks guest arrival, compiling details to print their badge.
   */
  async checkin(req, res, next) {
    try {
      const { qr_code, event_guest_id } = req.body;

      const result = await checkinService.checkin({
        qr_code,
        event_guest_id,
      });

      return res.status(201).json({
        success: true,
        message: 'Guest checked in successfully',
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

module.exports = new CheckinController();
