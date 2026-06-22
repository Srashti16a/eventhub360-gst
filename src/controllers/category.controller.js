const categoryService = require('../services/category.service');

class CategoryController {
  /**
   * GET /api/v1/categories/dashboard
   * Retrieves dashboard breakdown statistics of guests across classifications.
   */
  async getDashboardStats(req, res, next) {
    try {
      const { event } = req.query;
      const eventId = event ? parseInt(event, 10) : null;
      
      if (event && isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' must be a valid integer",
        });
      }

      const stats = await categoryService.getDashboardStats(eventId);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/categories
   * Lists guest category classifications with priority mappings and counts.
   */
  async getCategories(req, res, next) {
    try {
      const { event } = req.query;
      const eventId = event ? parseInt(event, 10) : null;

      if (event && isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' must be a valid integer",
        });
      }

      const categories = await categoryService.getCategories(eventId);
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/categories/:category
   * Retrieves comprehensive metadata and list of guests belonging to a specific category.
   */
  async getCategoryDetails(req, res, next) {
    try {
      const { category } = req.params;
      const { event, search, page, limit } = req.query;

      const eventId = event ? parseInt(event, 10) : null;
      if (event && isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' must be a valid integer",
        });
      }

      const filters = { search, page, limit };
      const details = await categoryService.getCategoryDetails(category, eventId, filters);

      return res.status(200).json({
        success: true,
        data: details,
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
   * PATCH /api/v1/categories/assign/:guestId
   * Assigns or updates the category classification of a specific guest.
   */
  async assignCategory(req, res, next) {
    try {
      const { guestId } = req.params;
      const { category } = req.body;

      const guestIntId = parseInt(guestId, 10);
      if (isNaN(guestIntId)) {
        return res.status(400).json({
          success: false,
          message: 'Guest ID must be a valid integer',
        });
      }

      const result = await categoryService.assignCategory(guestIntId, category);

      return res.status(200).json({
        success: true,
        message: 'Guest category assigned successfully',
        data: {
          guest_id: result.guest_id,
          name: result.name,
          category: result.category,
          updated_at: result.updated_at,
        },
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

module.exports = new CategoryController();
