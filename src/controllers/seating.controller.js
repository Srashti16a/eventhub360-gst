const seatingService = require('../services/seating.service');

class SeatingController {
  /**
   * PATCH /api/v1/seating/:id
   * Updates seating details (table and/or seat number) for drag-and-drop seat reassignment.
   */
  async reassignSeat(req, res, next) {
    try {
      const { id } = req.params;
      const { table_no, seat_no } = req.body;

      const seatingId = parseInt(id, 10);
      if (isNaN(seatingId)) {
        return res.status(400).json({
          success: false,
          message: 'Seating ID must be a valid integer',
        });
      }

      const result = await seatingService.reassignSeat(seatingId, {
        table_no,
        seat_no,
        updated_by: 1, // Placeholder: assume updated by administrative user (ID 1)
      });

      return res.status(200).json({
        success: true,
        message: 'Seating updated successfully',
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

module.exports = new SeatingController();
