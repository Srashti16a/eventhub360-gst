import { Router } from 'express';
import guestRoutes from './guestRoutes';
import eventRoutes from './eventRoutes';
import hotelRoutes from './hotelRoutes';
import dashboardRoutes from './dashboardRoutes';
import seatingRoutes from './seatingRoutes';
import campaignRoutes from './campaignRoutes';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/guests', guestRoutes);
router.use('/events', eventRoutes);
router.use('/hotels', hotelRoutes);
router.use('/seating', seatingRoutes);
router.use('/campaigns', campaignRoutes);

export default router;
