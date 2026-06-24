import { Router } from 'express';
import { listEvents, createEvent } from '../controllers/eventController';

const router = Router();

router.get('/', listEvents);
router.post('/', createEvent);

export default router;
