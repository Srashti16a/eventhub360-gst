import { Router } from 'express';
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  searchGuests
} from '../controllers/groupController';

const router = Router();

router.get('/', listGroups);
router.post('/', createGroup);
router.get('/:id', getGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/:id/members', addMember);
router.delete('/:id/members/:guestId', removeMember);
router.get('/:id/search-guests', searchGuests);

export default router;
