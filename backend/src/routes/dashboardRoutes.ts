import { Router } from 'express';
import {
  getStats,
  getCheckinStats,
  getRecentCheckins,
  getVipAlerts,
  scanCheckin,
  manualCheckin,
  approveCheckin
} from '../controllers/dashboardController';
import { getCheckInTrend } from '../controllers/checkInController';

const router = Router();

router.get('/stats', getStats);
router.get('/checkin/stats', getCheckinStats);
router.get('/checkin/recent', getRecentCheckins);
router.get('/checkin/alerts', getVipAlerts);
router.get('/checkin/trend', getCheckInTrend);
router.post('/checkin/scan', scanCheckin);
router.post('/checkin/manual', manualCheckin);
router.post('/checkin/approve/:id', approveCheckin);

export default router;
