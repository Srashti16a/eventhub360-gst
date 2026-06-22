const express = require('express');
const guestController = require('../controllers/guest.controller');

const router = express.Router();

// GET /api/v1/guests?event=
/**
 * @openapi
 * /api/v1/guests:
 *   get:
 *     summary: Retrieve guest list with RSVPs, seating, and check-ins
 *     description: Retrieve list of guest invitations for a specific event with complete details including RSVP responses, seating arrangements, meal preferences, and check-in history. Optional query filters can be applied.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID to retrieve guest list for.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search phrase matching guest name or phone.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Guest category filter (e.g. VIP, Family, Corporate).
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [yes, no, maybe, pending]
 *         description: RSVP status filter. Use 'pending' for guests who have not responded.
 *     responses:
 *       200:
 *         description: Guest list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       event_guest_id:
 *                         type: string
 *                         example: "1"
 *                       event_id:
 *                         type: string
 *                         example: "200"
 *                       invited:
 *                         type: boolean
 *                         example: true
 *                       rsvp_token:
 *                         type: string
 *                         example: "rsvp-token-sharma"
 *                       guest_id:
 *                         type: string
 *                         example: "1"
 *                       company_id:
 *                         type: string
 *                         example: "100"
 *                       name:
 *                         type: string
 *                         example: Sharma Family
 *                       phone:
 *                         type: string
 *                         example: "+919876543210"
 *                       category:
 *                         type: string
 *                         example: Family
 *                       group_id:
 *                         type: string
 *                         example: "1"
 *                       group_name:
 *                         type: string
 *                         example: Sharma Group
 *                       rsvp_id:
 *                         type: string
 *                         example: "1"
 *                       rsvp_status:
 *                         type: string
 *                         example: yes
 *                       rsvp_pax:
 *                         type: integer
 *                         example: 4
 *                       rsvp_responded_at:
 *                         type: string
 *                         format: date-time
 *                       seating:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             seating_id:
 *                               type: string
 *                               example: "1"
 *                             table_no:
 *                               type: string
 *                               example: T7
 *                             seat_no:
 *                               type: string
 *                               example: S1
 *                       meal_preferences:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             meal_pref_id:
 *                               type: string
 *                               example: "1"
 *                             preference:
 *                               type: string
 *                               example: Veg
 *                       checkins:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             checkin_id:
 *                               type: string
 *                               example: "1"
 *                             checked_in_at:
 *                               type: string
 *                               format: date-time
 *                             qr_code:
 *                               type: string
 *                               example: "qr-sharma-123"
 *       400:
 *         description: Event ID is missing or invalid.
 */
router.get('/', guestController.getGuests);

module.exports = router;
