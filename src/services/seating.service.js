const seatingRepository = require('../repositories/seating.repository');

class SeatingService {
  /**
   * Reassign a table and/or seat for a given seating ID.
   */
  async reassignSeat(seatingId, updateData) {
    // 1. Verify seating record exists
    const seating = await seatingRepository.findById(seatingId);
    if (!seating) {
      const error = new Error('Seating assignment not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Perform table/seat update
    const updatedSeating = await seatingRepository.update(seatingId, updateData);

    return {
      seating_id: updatedSeating.seating_id,
      event_guest_id: updatedSeating.event_guest_id,
      guest_name: seating.guest_name,
      event_id: seating.event_id,
      table_no: updatedSeating.table_no,
      seat_no: updatedSeating.seat_no,
      updated_at: updatedSeating.updated_at,
    };
  }
}

module.exports = new SeatingService();
