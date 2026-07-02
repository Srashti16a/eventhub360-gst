import { Router } from 'express';
import {
  listDrivers,
  listVehicles,
  listAssignments,
  assignFleet,
  deleteAssignment,
  listRoutes,
  createRoute,
  optimizeRoute,
  listTransfers,
  getTransferDetails,
  scheduleTransfer,
  updateTransfer,
  deleteTransfer,
  updateDriverStatus,
  updateVehicleStatus,
  listMaintenances,
  scheduleMaintenance,
  updateMaintenance,
  listActivityLogs,
  getDashboardOverview,
  triggerAnalyticsRefresh,
  listAllocVehicles,
  listGuestQueue,
  assignGuest,
  unassignGuest
} from '../controllers/transportationController';
import { validate } from '../middlewares/validation';
import {
  createAssignmentSchema,
  deleteAssignmentSchema,
  createRouteSchema,
  optimizeRouteSchema,
  createTransferSchema,
  getTransferSchema,
  updateTransferSchema,
  deleteTransferSchema,
  updateStatusSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema
} from '../schemas/transportation';

const router = Router();

// Drivers & Vehicles Lists
router.get('/drivers', listDrivers);
router.get('/vehicles', listVehicles);

// Fleet Assignments
router.get('/assignments', listAssignments);
router.post('/assignments', validate(createAssignmentSchema), assignFleet);
router.delete('/assignments/:id', validate(deleteAssignmentSchema), deleteAssignment);

// Transport Routes
router.get('/routes', listRoutes);
router.post('/routes', validate(createRouteSchema), createRoute);
router.post('/routes/:id/optimize', validate(optimizeRouteSchema), optimizeRoute);

// Arrivals & Departures Transfers
router.get('/transfers', listTransfers);
router.post('/transfers', validate(createTransferSchema), scheduleTransfer);
router.get('/transfers/:id', validate(getTransferSchema), getTransferDetails);
router.put('/transfers/:id', validate(updateTransferSchema), updateTransfer);
router.delete('/transfers/:id', validate(deleteTransferSchema), deleteTransfer);

// Drivers & Vehicles Status Management
router.put('/drivers/:id/status', validate(updateStatusSchema), updateDriverStatus);
router.put('/vehicles/:id/status', validate(updateStatusSchema), updateVehicleStatus);

// Vehicle Maintenance
router.get('/maintenance', listMaintenances);
router.post('/maintenance', validate(createMaintenanceSchema), scheduleMaintenance);
router.put('/maintenance/:id', validate(updateMaintenanceSchema), updateMaintenance);

// Activity Logs
router.get('/activity-logs', listActivityLogs);

// Dashboard Overview & Analytics
router.get('/dashboard/overview/:eventId', getDashboardOverview);
router.post('/dashboard/refresh/:eventId', triggerAnalyticsRefresh);

// Custom Allocation Matrix Routes
router.get('/alloc-vehicles', listAllocVehicles);
router.get('/guest-queue', listGuestQueue);
router.post('/assign-guest', assignGuest);
router.post('/unassign-guest', unassignGuest);

export default router;
