import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendRsvpCampaign,
  getCampaignStats,
  getCampaignAnalytics,
  getAudienceSegments,
  getCampaignCalendar,
  getCommunicationHistory,
  getChannelOrchestration,
  exportCampaigns
} from '../controllers/campaignController';
import { validate } from '../middlewares/validation';
import { createCampaignSchema, updateCampaignSchema, getCampaignSchema, listCampaignsSchema } from '../schemas/campaign';

const router = Router();

// Stats, Analytics, Calendar, and History (placed before ID parameter routes)
router.get('/stats', getCampaignStats);
router.get('/analytics', getCampaignAnalytics);
router.get('/calendar', getCampaignCalendar);
router.get('/channels', getChannelOrchestration);
router.get('/history', getCommunicationHistory);
router.get('/segments', getAudienceSegments);
router.get('/export', exportCampaigns);

// Legacy/Compatibility endpoints
router.post('/send-rsvp', sendRsvpCampaign);

// Campaign CRUD
router.get('/', validate(listCampaignsSchema), getCampaigns);
router.get('/:id', validate(getCampaignSchema), getCampaignById);
router.post('/', validate(createCampaignSchema), createCampaign);
router.put('/:id', validate(updateCampaignSchema), updateCampaign);
router.delete('/:id', validate(getCampaignSchema), deleteCampaign);

export default router;
