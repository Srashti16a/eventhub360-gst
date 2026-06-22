const express = require('express');
const rsvpRoutes = require('./rsvp.routes');
const guestRoutes = require('./guest.routes');
const checkinRoutes = require('./checkin.routes');
const seatingRoutes = require('./seating.routes');
const groupRoutes = require('./group.routes');
const categoryRoutes = require('./category.routes');
const profileRoutes = require('./profile.routes');
const organizationRoutes = require('./organization.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

router.use('/rsvp', rsvpRoutes);
router.use('/guests', guestRoutes);
router.use('/checkin', checkinRoutes);
router.use('/seating', seatingRoutes);
router.use('/groups', groupRoutes);
router.use('/categories', categoryRoutes);
router.use('/profiles', profileRoutes);
router.use('/organization', organizationRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
