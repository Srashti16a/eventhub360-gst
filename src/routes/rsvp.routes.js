const express = require('express');
const rsvpController = require('../controllers/rsvp.controller');
const validate = require('../middlewares/validation');
const { submitRsvpSchema } = require('../validations/rsvp.validation');

const router = express.Router();

// POST /api/v1/rsvp/:token
/**
 * @openapi
 * /api/v1/rsvp/{token}:
 *   post:
 *     summary: Submit RSVP response
 *     description: Submit response status (yes/no/maybe), headcount, and dietary preferences for a guest using their invitation RSVP token.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique RSVP token associated with the guest invitation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [yes, no, maybe]
 *                 description: Attending status response.
 *               pax:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Confirmed headcount.
 *               meal_preferences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of dietary preferences (e.g. Veg, Allergy:Peanuts).
 *     responses:
 *       200:
 *         description: RSVP updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: RSVP updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     event_guest_id:
 *                       type: string
 *                       example: "1"
 *                     guest_name:
 *                       type: string
 *                       example: Sharma Family
 *                     rsvp_status:
 *                       type: string
 *                       example: yes
 *                     pax:
 *                       type: integer
 *                       example: 4
 *                     responded_at:
 *                       type: string
 *                       format: date-time
 *                     meal_preferences:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Veg", "Allergy: Peanuts"]
 *       400:
 *         description: Validation failed or missing fields.
 *       404:
 *         description: RSVP token is invalid or guest not found.
 */
router.post('/:token', validate(submitRsvpSchema, 'body'), rsvpController.submitRsvp);

module.exports = router;
