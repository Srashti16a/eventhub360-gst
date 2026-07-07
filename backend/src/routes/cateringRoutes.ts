import { Router } from 'express';
import {
  getCateringSummary,
  listCateringPreferences,
  getProcurementAnalytics,
  getChefSummary,
  getSmartSuggestions,
  exportCateringData,
} from '../controllers/cateringController';
import { validate } from '../middlewares/validation';
import { listCateringSchema } from '../schemas/catering';

const router = Router();

// Dashboard summary stats
router.get('/summary', getCateringSummary);

// Guest preferences list with paging/filtering
router.get('/preferences', validate(listCateringSchema), listCateringPreferences);

// Procurement analytics
router.get('/procurement', getProcurementAnalytics);

// Chef inventory alerts and prep start time
router.get('/chef-summary', getChefSummary);

// Smart suggestions / recommendations
router.get('/suggestions', getSmartSuggestions);

// Export suitable for PDF generation
router.get('/export', exportCateringData);

export default router;
