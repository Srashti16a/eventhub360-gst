import { Router } from 'express';
import {
  scanQR,
  manualCheckIn,
  getCheckInSummary,
  getCheckInTrend,
  getGateStats,
  getVipArrivalAlerts,
  getRecentCheckIns,
  getStaff,
} from '../controllers/checkInController';
import { validate } from '../middlewares/validation';
import {
  scanQRSchema,
  manualCheckInSchema,
  listCheckInLogsSchema,
} from '../schemas/checkIn';

const router = Router();

// Scanning & Check-in actions
router.post('/scan', validate(scanQRSchema), scanQR);
router.post('/manual', validate(manualCheckInSchema), manualCheckIn);

// Live Dashboard Card Statistics
router.get('/summary', getCheckInSummary);

// Live check-in trends hourly
router.get('/trend', getCheckInTrend);

// Entrances & gate stats
router.get('/gates', getGateStats);

// Live VIP arrival notifications
router.get('/vip-alerts', getVipArrivalAlerts);

// Paged check-in history feed
router.get('/logs', validate(listCheckInLogsSchema), getRecentCheckIns);

// Staff operators list
router.get('/staff', getStaff);

export default router;
