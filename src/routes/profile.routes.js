const express = require('express');
const profileController = require('../controllers/profile.controller');
const validate = require('../middlewares/validation');
const {
  updateProfileSchema,
  createNoteSchema,
} = require('../validations/profile.validation');

const router = express.Router();

/**
 * @openapi
 * /api/v1/profiles/{eventGuestId}:
 *   get:
 *     summary: Retrieve guest profile details
 *     description: Fetch comprehensive guest details including seating layout, accommodation, transportation card, communication history logs, and notes.
 *     parameters:
 *       - in: path
 *         name: eventGuestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event Guest ID of the profile to retrieve.
 *     responses:
 *       200:
 *         description: Profile details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Profile not found.
 */
router.get('/:eventGuestId', profileController.getProfile);

/**
 * @openapi
 * /api/v1/profiles/{eventGuestId}:
 *   patch:
 *     summary: Update guest profile
 *     description: Edit details like email, phone, name, category, title, company, special requests, and hotel/transport assignments.
 *     parameters:
 *       - in: path
 *         name: eventGuestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event Guest ID of the profile to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               category:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               title:
 *                 type: string
 *               company_name:
 *                 type: string
 *               special_requests:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile details updated successfully.
 *       404:
 *         description: Profile not found.
 */
router.patch(
  '/:eventGuestId',
  validate(updateProfileSchema, 'body'),
  profileController.updateProfile
);

/**
 * @openapi
 * /api/v1/profiles/{eventGuestId}/notes:
 *   post:
 *     summary: Add concierge note
 *     description: Save a new internal concierge note associated with a guest's attendance record.
 *     parameters:
 *       - in: path
 *         name: eventGuestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event Guest ID to append note to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *                 default: Sarah J., Head Concierge
 *     responses:
 *       201:
 *         description: Concierge note saved successfully.
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
 *                   example: Concierge note added successfully
 *                 data:
 *                   type: object
 *       404:
 *         description: Profile not found.
 */
router.post(
  '/:eventGuestId/notes',
  validate(createNoteSchema, 'body'),
  profileController.addNote
);

/**
 * @openapi
 * /api/v1/profiles/{eventGuestId}/notes:
 *   get:
 *     summary: Retrieve concierge notes
 *     description: Fetch all concierge/internal notes created for a guest profile.
 *     parameters:
 *       - in: path
 *         name: eventGuestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event Guest ID of the profile to fetch notes for.
 *     responses:
 *       200:
 *         description: Concierge notes retrieved successfully.
 *       404:
 *         description: Profile not found.
 */
router.get('/:eventGuestId/notes', profileController.getNotes);

module.exports = router;
