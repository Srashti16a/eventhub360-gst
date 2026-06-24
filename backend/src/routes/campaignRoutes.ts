import { Router } from 'express';
import { sendRsvpCampaign } from '../controllers/campaignController';

const router = Router();

router.post('/send-rsvp', sendRsvpCampaign);

export default router;
