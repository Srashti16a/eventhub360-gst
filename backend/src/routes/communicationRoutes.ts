import { Router } from 'express';
import {
  getCommunicationsSummary,
  getCommunicationsLogs,
  getCommunicationDetail,
  getAutomationAlerts,
  rerouteTraffic,
  exportCommunicationsLogs,
} from '../controllers/communicationController';
import { validate } from '../middlewares/validation';
import { queryLogsSchema, rerouteSchema } from '../schemas/communication';

const router = Router();

// Communications stats & alerts
router.get('/summary', getCommunicationsSummary);
router.get('/alerts', getAutomationAlerts);

// Log routes
router.get('/logs', validate(queryLogsSchema), getCommunicationsLogs);
router.get('/export', exportCommunicationsLogs);

// Traffic reroute trigger
router.post('/reroute', validate(rerouteSchema), rerouteTraffic);

// REST detail retrieval route
router.get('/:id', getCommunicationDetail);

export default router;
