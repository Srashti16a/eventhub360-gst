import { Router } from 'express';
import guestRoutes from './guestRoutes';
import eventRoutes from './eventRoutes';
import hotelRoutes from './hotelRoutes';
import dashboardRoutes from './dashboardRoutes';
import seatingRoutes from './seatingRoutes';
import campaignRoutes from './campaignRoutes';
import transportationRoutes from './transportationRoutes';
import groupRoutes from './groupRoutes';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/guests', guestRoutes);
router.use('/events', eventRoutes);
router.use('/hotels', hotelRoutes);
router.use('/seating', seatingRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/transportation', transportationRoutes);
router.use('/groups', groupRoutes);

export default router;
