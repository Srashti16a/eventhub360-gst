const express = require('express');
const router = express.Router();
const TransportationController = require('../controllers/TransportationController');
const {
    fleetAssignmentCreateSchema,
    fleetAssignmentUpdateSchema,
    transportRouteCreateSchema,
    scheduleCreateSchema,
    scheduleUpdateSchema,
    maintenanceCreateSchema,
    maintenanceUpdateSchema,
    driverStatusUpdateSchema,
    queryTransportationSchema
} = require('../models/TransportationValidation');

/**
 * Request validation middleware helper
 * @param {Object} schema - Joi validation schema
 * @param {'body' | 'query' | 'params'} [property] - Target data to validate
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ success: false, error: errorMessage });
        }
        req[property] = value;
        next();
    };
};

// 1. Fleet Assignments
router.post(
    '/assignments',
    validate(fleetAssignmentCreateSchema, 'body'),
    TransportationController.assignFleet
);

router.get(
    '/assignments',
    TransportationController.listAssignments
);

router.delete(
    '/assignments/:id',
    TransportationController.deleteAssignment
);

// 2. Transport Routes
router.post(
    '/routes',
    validate(transportRouteCreateSchema, 'body'),
    TransportationController.createRoute
);

router.get(
    '/routes',
    TransportationController.listRoutes
);

router.post(
    '/routes/:id/optimize',
    TransportationController.optimizeRoute
);

// 3. Arrivals & Departures Transfers
router.post(
    '/transfers',
    validate(scheduleCreateSchema, 'body'),
    TransportationController.scheduleTransfer
);

router.get(
    '/transfers',
    TransportationController.listTransfers
);

router.get(
    '/transfers/:id',
    TransportationController.getTransferDetails
);

router.put(
    '/transfers/:id',
    validate(scheduleUpdateSchema, 'body'),
    TransportationController.updateTransfer
);

router.delete(
    '/transfers/:id',
    TransportationController.deleteTransfer
);

// 4. Drivers Status Management
router.put(
    '/drivers/:id/status',
    validate(driverStatusUpdateSchema, 'body'),
    TransportationController.updateDriverStatus
);

// 5. Vehicle Status Management
router.put(
    '/vehicles/:id/status',
    validate(driverStatusUpdateSchema, 'body'), // reuse drivers schema since both only have string "status"
    TransportationController.updateVehicleStatus
);

// 6. Vehicle Maintenance
router.post(
    '/maintenance',
    validate(maintenanceCreateSchema, 'body'),
    TransportationController.scheduleMaintenance
);

router.get(
    '/maintenance',
    TransportationController.listMaintenances
);

router.put(
    '/maintenance/:id',
    validate(maintenanceUpdateSchema, 'body'),
    TransportationController.updateMaintenance
);

// 7. Activity Logs
router.get(
    '/activity-logs',
    TransportationController.listActivityLogs
);

// 8. Dashboard Overview
router.get(
    '/dashboard/overview/:eventId',
    TransportationController.getDashboardOverview
);

router.post(
    '/dashboard/refresh/:eventId',
    TransportationController.triggerAnalyticsRefresh
);

module.exports = router;
