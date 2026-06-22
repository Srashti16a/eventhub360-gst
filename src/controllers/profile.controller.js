const profileService = require('../services/profile.service');

class ProfileController {
  /**
   * GET /api/v1/profiles/:eventGuestId
   * Fetch complete profile statistics, seating layout, accommodation, transportation, and activities log.
   */
  async getProfile(req, res, next) {
    try {
      const { eventGuestId } = req.params;
      const id = parseInt(eventGuestId, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Event Guest ID must be a valid integer',
        });
      }

      const profile = await profileService.getProfile(id);
      return res.status(200).json({
        success: true,
        data: profile,
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

  /**
   * PATCH /api/v1/profiles/:eventGuestId
   * Edit profile properties, category classifications, and other layout variables.
   */
  async updateProfile(req, res, next) {
    try {
      const { eventGuestId } = req.params;
      const id = parseInt(eventGuestId, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Event Guest ID must be a valid integer',
        });
      }

      const profile = await profileService.updateProfile(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Guest profile updated successfully',
        data: profile,
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

  /**
   * POST /api/v1/profiles/:eventGuestId/notes
   * Append a new concierge note to a guest profile.
   */
  async addNote(req, res, next) {
    try {
      const { eventGuestId } = req.params;
      const { content, author } = req.body;
      const id = parseInt(eventGuestId, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Event Guest ID must be a valid integer',
        });
      }

      const note = await profileService.addNote(id, content, author);
      return res.status(201).json({
        success: true,
        message: 'Concierge note added successfully',
        data: note,
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

  /**
   * GET /api/v1/profiles/:eventGuestId/notes
   * Fetch listing of all internal notes added to a guest.
   */
  async getNotes(req, res, next) {
    try {
      const { eventGuestId } = req.params;
      const id = parseInt(eventGuestId, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Event Guest ID must be a valid integer',
        });
      }

      const notes = await profileService.getNotes(id);
      return res.status(200).json({
        success: true,
        data: notes,
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

module.exports = new ProfileController();
