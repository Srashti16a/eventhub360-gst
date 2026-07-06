import { Router } from 'express';
import { listGuests, getGuest, createGuest, updateGuest, deleteGuest } from '../controllers/guestController';
import {
  getGuestProfile,
  getGuestCommunications,
  getGuestAccommodation,
  getGuestTransportation,
  getGuestSeating,
  getGuestNotes,
  createGuestNote,
} from '../controllers/guestProfileController';
import { validate } from '../middlewares/validation';
import { createGuestSchema, updateGuestSchema, getGuestSchema, listGuestsSchema } from '../schemas/guest';
import { createNoteSchema } from '../schemas/guestProfile';
import { exportGuests, importGuests } from '../controllers/bulkController';

const router = Router();

// Guest list
router.get('/', validate(listGuestsSchema), listGuests);

// Bulk operations (defined before parameterized :id routes)
router.get('/export', exportGuests);
router.post('/import', importGuests);

// CRUD operations
router.get('/:id', validate(getGuestSchema), getGuest);
router.post('/', validate(createGuestSchema), createGuest);
router.put('/:id', validate(updateGuestSchema), updateGuest);
router.delete('/:id', validate(getGuestSchema), deleteGuest);

router.get('/:id/profile', getGuestProfile);
router.get('/:id/communications', getGuestCommunications);
router.get('/:id/accommodation', getGuestAccommodation);
router.get('/:id/transportation', getGuestTransportation);
router.get('/:id/seating', getGuestSeating);
router.get('/:id/notes', getGuestNotes);
router.post('/:id/notes', validate(createNoteSchema), createGuestNote);
export default router;
