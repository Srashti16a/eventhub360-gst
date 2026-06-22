const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  /**
   * GET /api/v1/analytics/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const eventId = parseInt(req.query.event, 10);
      const data = await analyticsService.getDashboard(eventId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/attendance-trends
   */
  async getAttendanceTrends(req, res, next) {
    try {
      const eventId = parseInt(req.query.event, 10);
      const data = await analyticsService.getAttendanceTrends(eventId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/rsvp-funnel
   */
  async getRsvpFunnel(req, res, next) {
    try {
      const eventId = parseInt(req.query.event, 10);
      const data = await analyticsService.getRsvpFunnel(eventId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/arrival-heatmap
   */
  async getArrivalHeatmap(req, res, next) {
    try {
      const eventId = parseInt(req.query.event, 10);
      const data = await analyticsService.getArrivalHeatmap(eventId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/guest-breakdown
   */
  async getGuestBreakdown(req, res, next) {
    try {
      const eventId = parseInt(req.query.event, 10);
      const data = await analyticsService.getGuestBreakdown(eventId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/no-show-analysis
   */
  async getNoShowAnalysis(req, res, next) {
    try {
      const eventId = parseInt(req.query.event, 10);
      const data = await analyticsService.getNoShowAnalysis(eventId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/concierge-insights
   */
  async getConciergeInsights(req, res, next) {
    try {
      const eventId = parseInt(req.query.event, 10);
      const data = await analyticsService.getConciergeInsights(eventId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
