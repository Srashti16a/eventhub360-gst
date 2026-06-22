const express = require('express');
const checkinController = require('../controllers/checkin.controller');
const validate = require('../middlewares/validation');
const { createCheckinSchema } = require('../validations/checkin.validation');

const router = express.Router();

// POST /api/v1/checkin
/**
 * @openapi
 * /api/v1/checkin:
 *   post:
 *     summary: Scan QR code and check in guest
 *     description: Register a guest's on-site arrival using their QR code (matching RSVP token) or specific event guest ID, generating badge print information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qr_code
 *             properties:
 *               qr_code:
 *                 type: string
 *                 description: Scanned QR code value (corresponds to invitation RSVP token).
 *               event_guest_id:
 *                 type: integer
 *                 description: Optional event guest ID. If provided, checks in this specific ID.
 *     responses:
 *       201:
 *         description: Guest checked in successfully.
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
 *                   example: Guest checked in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     checkin_id:
 *                       type: string
 *                       example: "2"
 *                     event_guest_id:
 *                       type: string
 *                       example: "2"
 *                     checked_in_at:
 *                       type: string
 *                       format: date-time
 *                     qr_code:
 *                       type: string
 *                       example: "rsvp-token-mehta"
 *                     badge:
 *                       type: object
 *                       properties:
 *                         guest_name:
 *                           type: string
 *                           example: Mr. Mehta
 *                         category:
 *                           type: string
 *                           example: VIP
 *                         group_name:
 *                           type: string
 *                           example: VIP Table 1
 *                         table_no:
 *                           type: string
 *                           example: T1
 *                         seat_no:
 *                           type: string
 *                           example: S5
 *       400:
 *         description: Validation failed (missing QR code).
 *       404:
 *         description: Guest invitation not found.
 */
router.post('/', validate(createCheckinSchema, 'body'), checkinController.checkin);

module.exports = router;
