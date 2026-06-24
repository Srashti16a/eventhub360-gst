import { Router } from 'express';
import { getTables, assignGuestToTable } from '../controllers/seatingController';

const router = Router();

router.get('/tables', getTables);
router.put('/assign', assignGuestToTable);

export default router;
