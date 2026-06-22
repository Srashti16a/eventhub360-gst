const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const validate = require('../middlewares/validation');
const { queryAnalyticsSchema } = require('../validations/analytics.validation');

const router = express.Router();

// Apply event_id query parameter validation to all analytics endpoints
router.use(validate(queryAnalyticsSchema, 'query'));

/**
 * @openapi
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Retrieve summary attendance metrics
 *     description: Fetch expected guests count, checked-in count, attendance rate, no-show rate, and peak arrival stats.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID.
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully.
 */
router.get('/dashboard', analyticsController.getDashboard);

/**
 * @openapi
 * /api/v1/analytics/attendance-trends:
 *   get:
 *     summary: Retrieve hourly check-in volume
 *     description: Fetch check-in volumes grouped by hour for the duration of the event.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID.
 *     responses:
 *       200:
 *         description: Trends retrieved successfully.
 */
router.get('/attendance-trends', analyticsController.getAttendanceTrends);

/**
 * @openapi
 * /api/v1/analytics/rsvp-funnel:
 *   get:
 *     summary: Retrieve RSVP funnel stages
 *     description: Fetch analytics tracking invitations from sent to opening, clicks, RSVP confirm, and check-in rates.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID.
 *     responses:
 *       200:
 *         description: Funnel metrics retrieved successfully.
 */
router.get('/rsvp-funnel', analyticsController.getRsvpFunnel);

/**
 * @openapi
 * /api/v1/analytics/arrival-heatmap:
 *   get:
 *     summary: Retrieve check-in density heatmap
 *     description: Fetch check-in counts mapped by entrance gates and standard timeline hours.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID.
 *     responses:
 *       200:
 *         description: Heatmap data retrieved successfully.
 */
router.get('/arrival-heatmap', analyticsController.getArrivalHeatmap);

/**
 * @openapi
 * /api/v1/analytics/guest-breakdown:
 *   get:
 *     summary: Retrieve checked-in guest category breakdown
 *     description: Fetch breakdowns of attendees categorized as Standard, VIP, or Speakers/Media.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID.
 *     responses:
 *       200:
 *         description: Breakdown retrieved successfully.
 */
router.get('/guest-breakdown', analyticsController.getGuestBreakdown);

/**
 * @openapi
 * /api/v1/analytics/no-show-analysis:
 *   get:
 *     summary: Retrieve detailed no-show analysis
 *     description: Fetch analysis of pending guests who responded 'yes' but have not check-in, categorized by segments, with travel correlation insights.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID.
 *     responses:
 *       200:
 *         description: No-shows analysis retrieved successfully.
 */
router.get('/no-show-analysis', analyticsController.getNoShowAnalysis);

/**
 * @openapi
 * /api/v1/analytics/concierge-insights:
 *   get:
 *     summary: Retrieve dynamic concierge insights
 *     description: Fetch list of textual concierge insights highlighting peaks, VIP statuses, and re-routing suggestions.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID.
 *     responses:
 *       200:
 *         description: Insights retrieved successfully.
 */
router.get('/concierge-insights', analyticsController.getConciergeInsights);

module.exports = router;
