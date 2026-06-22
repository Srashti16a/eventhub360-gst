const express = require('express');
const seatingController = require('../controllers/seating.controller');
const validate = require('../middlewares/validation');
const { updateSeatingSchema } = require('../validations/seating.validation');

const router = express.Router();

// PATCH /api/v1/seating/:id
/**
 * @openapi
 * /api/v1/seating/{id}:
 *   patch:
 *     summary: Reassign table and seat
 *     description: Update table number and/or seat number for an existing seating assignment, supporting drag-and-drop actions.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seating ID to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_no:
 *                 type: string
 *                 description: New table number assignment.
 *               seat_no:
 *                 type: string
 *                 description: New seat number assignment.
 *     responses:
 *       200:
 *         description: Seating updated successfully.
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
 *                   example: Seating updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     seating_id:
 *                       type: string
 *                       example: "1"
 *                     event_guest_id:
 *                       type: string
 *                       example: "1"
 *                     guest_name:
 *                       type: string
 *                       example: Sharma Family
 *                     event_id:
 *                       type: string
 *                       example: "200"
 *                     table_no:
 *                       type: string
 *                       example: T8
 *                     seat_no:
 *                       type: string
 *                       example: S2
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation failed (missing both table_no and seat_no, or invalid ID).
 *       404:
 *         description: Seating assignment not found.
 */
router.patch('/:id', validate(updateSeatingSchema, 'body'), seatingController.reassignSeat);

module.exports = router;
