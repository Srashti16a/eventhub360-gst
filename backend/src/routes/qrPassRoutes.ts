import { Router } from 'express';
import {
  getStats,
  getPasses,
  getRecentScans,
  getSecurityHealth,
  exportPasses,
  exportLogs,
  getPassById,
  downloadPass,
  createPass,
  verifyPass,
  generateBatch,
  bulkActions,
  sendPass,
  updatePass,
  deletePass,
  getHelp,
  getNotifications,
  getHistory
} from '../controllers/qrPassController';
import { validate } from '../middlewares/validation';
import {
  createQRPassSchema,
  updateQRPassSchema,
  listQRPassSchema,
  scanPassSchema,
  bulkGenerateSchema,
  bulkActionSchema,
  getQRPassSchema,
  deliveryPassSchema
} from '../schemas/qrPass';

const router = Router();

// Stats, logs, exports, and special endpoints
router.get('/stats', getStats);
router.get('/recent-scans', getRecentScans);
router.get('/security-health', getSecurityHealth);
router.get('/export', exportPasses);
router.get('/export-logs', exportLogs);
router.get('/help', getHelp);
router.get('/notifications', getNotifications);
router.get('/history', getHistory);

// Verification and batch generation
router.post('/verify', validate(scanPassSchema), verifyPass);
router.post('/generate-batch', validate(bulkGenerateSchema), generateBatch);
router.post('/bulk-actions', validate(bulkActionSchema), bulkActions);

// Standard CRUD endpoints
router.get('/', validate(listQRPassSchema), getPasses);
router.get('/:id', validate(getQRPassSchema), getPassById);
router.get('/:id/download', validate(getQRPassSchema), downloadPass);
router.post('/', validate(createQRPassSchema), createPass);
router.post('/:id/send', validate(deliveryPassSchema), sendPass);
router.put('/:id', validate(updateQRPassSchema), updatePass);
router.delete('/:id', validate(getQRPassSchema), deletePass);

export default router;
