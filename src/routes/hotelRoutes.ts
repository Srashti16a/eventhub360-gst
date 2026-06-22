import { Router } from 'express';
import { listHotels, createHotel } from '../controllers/hotelController';

const router = Router();

router.get('/', listHotels);
router.post('/', createHotel);

export default router;
