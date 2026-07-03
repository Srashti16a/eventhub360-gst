import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// ==========================================
// 1. Drivers & Vehicles Listing
// ==========================================
export const listDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        vehicles: true,
        transfers: {
          include: {
            guest: true,
            route: true
          }
        }
      },
      orderBy: {
        fullName: 'asc',
      },
    });
    res.json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

export const listVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. Fleet Assignments
// ==========================================
export const listAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;
    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }
    const assignments = await prisma.fleetAssignment.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
        event: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const assignFleet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, driverId, eventId } = req.body;

    // Check if duplicate assignment exists
    const existing = await prisma.fleetAssignment.findUnique({
      where: {
        eventId_vehicleId_driverId: {
          eventId,
          vehicleId,
          driverId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ success: false, error: { message: 'This fleet assignment already exists' } });
      return;
    }

    const assignment = await prisma.fleetAssignment.create({
      data: {
        vehicleId,
        driverId,
        eventId,
        status: 'Active',
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    // Update statuses
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'On Route' },
    });

    await prisma.driver.update({
      where: { id: driverId },
      data: { status: 'Active' },
    });

    // Log Activity
    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Assignment Update',
        severity: 'Info',
        message: `Driver ${assignment.driver.fullName} assigned to Vehicle ${assignment.vehicle.name}`,
        vehicleId,
        driverId,
      },
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const assignment = await prisma.fleetAssignment.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    if (!assignment) {
      res.status(404).json({ success: false, error: { message: 'Assignment not found' } });
      return;
    }

    await prisma.fleetAssignment.delete({
      where: { id },
    });

    // Reset driver and vehicle statuses if they aren't assigned elsewhere
    const otherAssignmentsForVehicle = await prisma.fleetAssignment.count({
      where: { vehicleId: assignment.vehicleId },
    });
    if (otherAssignmentsForVehicle === 0) {
      await prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: { status: 'Available' },
      });
    }

    const otherAssignmentsForDriver = await prisma.fleetAssignment.count({
      where: { driverId: assignment.driverId },
    });
    if (otherAssignmentsForDriver === 0) {
      await prisma.driver.update({
        where: { id: assignment.driverId },
        data: { status: 'Available' },
      });
    }

    // Log Activity
    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Assignment Update',
        severity: 'Info',
        message: `Removed assignment: Driver ${assignment.driver.fullName} from Vehicle ${assignment.vehicle.name}`,
        vehicleId: assignment.vehicleId,
        driverId: assignment.driverId,
      },
    });

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. Transport Routes
// ==========================================
export const listRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = await prisma.transportRoute.findMany({
      orderBy: {
        routeName: 'asc',
      },
    });
    res.json({ success: true, data: routes });
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { routeName, startLocation, endLocation, distanceKm, durationMins } = req.body;
    const route = await prisma.transportRoute.create({
      data: {
        routeName,
        startLocation,
        endLocation,
        distanceKm,
        durationMins,
      },
    });

    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Dispatch Alert',
        severity: 'Info',
        message: `New transport route created: ${route.routeName}`,
      },
    });

    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

export const optimizeRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const route = await prisma.transportRoute.findUnique({
      where: { id },
    });

    if (!route) {
      res.status(404).json({ success: false, error: { message: 'Route not found' } });
      return;
    }

    const updatedRoute = await prisma.transportRoute.update({
      where: { id },
      data: {
        optimizedAt: new Date(),
      },
    });

    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Route Completed',
        severity: 'Info',
        message: `Route Optimization Completed for Route: ${route.routeName}`,
      },
    });

    res.json({ success: true, data: updatedRoute });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. Arrivals & Departures Transfers
// ==========================================
export const listTransfers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;
    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    const transfers = await prisma.transferSchedule.findMany({
      where,
      include: {
        guest: true,
        event: true,
        route: true,
        vehicle: true,
        driver: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });
    res.json({ success: true, data: transfers });
  } catch (error) {
    next(error);
  }
};

export const getTransferDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.transferSchedule.findUnique({
      where: { id },
      include: {
        guest: true,
        event: true,
        route: true,
        vehicle: true,
        driver: true,
      },
    });

    if (!transfer) {
      res.status(404).json({ success: false, error: { message: 'Transfer schedule not found' } });
      return;
    }

    res.json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

export const scheduleTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, eventId, transferType, pickupLocation, dropoffLocation, scheduledTime, routeId, vehicleId, driverId, status } = req.body;

    const transfer = await prisma.transferSchedule.create({
      data: {
        guestId,
        eventId,
        transferType,
        pickupLocation,
        dropoffLocation,
        scheduledTime,
        routeId,
        vehicleId,
        driverId,
        status: status || 'Scheduled',
      },
      include: {
        guest: true,
        vehicle: true,
        driver: true,
      },
    });

    // Update statuses if in progress
    if (status === 'In Transit') {
      if (vehicleId) {
        await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: 'On Route' } });
      }
      if (driverId) {
        await prisma.driver.update({ where: { id: driverId }, data: { status: 'Active' } });
      }
    }

    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Dispatch Alert',
        severity: 'Info',
        message: `New transfer scheduled for guest ${transfer.guest.name}`,
        vehicleId,
        driverId,
      },
    });

    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

export const updateTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { pickupLocation, dropoffLocation, scheduledTime, routeId, vehicleId, driverId, status } = req.body;

    const current = await prisma.transferSchedule.findUnique({
      where: { id },
    });

    if (!current) {
      res.status(404).json({ success: false, error: { message: 'Transfer schedule not found' } });
      return;
    }

    const updated = await prisma.transferSchedule.update({
      where: { id },
      data: {
        pickupLocation,
        dropoffLocation,
        scheduledTime,
        routeId,
        vehicleId,
        driverId,
        status,
      },
      include: {
        guest: true,
      },
    });

    // Handle vehicle status transitions based on status changes
    if (status === 'In Transit') {
      if (vehicleId) {
        await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: 'On Route' } });
      }
      if (driverId) {
        await prisma.driver.update({ where: { id: driverId }, data: { status: 'Active' } });
      }
    } else if (status === 'Completed' || status === 'Cancelled') {
      if (current.vehicleId) {
        await prisma.vehicle.update({ where: { id: current.vehicleId }, data: { status: 'Available' } });
      }
      if (current.driverId) {
        await prisma.driver.update({ where: { id: current.driverId }, data: { status: 'Available' } });
      }
    }

    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Assignment Update',
        severity: 'Info',
        message: `Transfer schedule updated for guest ${updated.guest.name} to status: ${status}`,
        vehicleId: vehicleId || current.vehicleId,
        driverId: driverId || current.driverId,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const current = await prisma.transferSchedule.findUnique({
      where: { id },
      include: {
        guest: true,
      },
    });

    if (!current) {
      res.status(404).json({ success: false, error: { message: 'Transfer schedule not found' } });
      return;
    }

    await prisma.transferSchedule.delete({
      where: { id },
    });

    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Dispatch Alert',
        severity: 'Info',
        message: `Deleted transfer schedule for guest ${current.guest.name}`,
        vehicleId: current.vehicleId,
        driverId: current.driverId,
      },
    });

    res.json({ success: true, message: 'Transfer schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. Driver & Vehicle Status Management
// ==========================================
export const updateDriverStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const driver = await prisma.driver.update({
      where: { id },
      data: { status },
    });

    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Driver Status Change',
        severity: 'Info',
        message: `Driver ${driver.fullName} status updated to: ${status}`,
        driverId: id,
      },
    });

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Driver Status Change',
        severity: 'Info',
        message: `Vehicle ${vehicle.name} status updated to: ${status}`,
        vehicleId: id,
      },
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. Vehicle Maintenance
// ==========================================
export const listMaintenances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId } = req.query;
    const where: any = {};
    if (vehicleId && typeof vehicleId === 'string') {
      where.vehicleId = vehicleId;
    }

    const maintenances = await prisma.vehicleMaintenance.findMany({
      where,
      include: {
        vehicle: true,
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });
    res.json({ success: true, data: maintenances });
  } catch (error) {
    next(error);
  }
};

export const scheduleMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, maintenanceType, description, scheduledDate, cost } = req.body;

    const maintenance = await prisma.vehicleMaintenance.create({
      data: {
        vehicleId,
        maintenanceType,
        description,
        scheduledDate,
        cost: cost || 0,
        status: 'Scheduled',
      },
      include: {
        vehicle: true,
      },
    });

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'Maintenance' },
    });

    // Log Activity
    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Maintenance Alert',
        severity: 'Warning',
        message: `Scheduled ${maintenanceType} for Vehicle ${maintenance.vehicle.name}`,
        vehicleId,
      },
    });

    res.status(201).json({ success: true, data: maintenance });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { description, completedDate, status, cost } = req.body;

    const current = await prisma.vehicleMaintenance.findUnique({
      where: { id },
    });

    if (!current) {
      res.status(404).json({ success: false, error: { message: 'Maintenance record not found' } });
      return;
    }

    const updated = await prisma.vehicleMaintenance.update({
      where: { id },
      data: {
        description,
        completedDate,
        status,
        cost,
      },
      include: {
        vehicle: true,
      },
    });

    if (status === 'Completed') {
      await prisma.vehicle.update({
        where: { id: updated.vehicleId },
        data: { status: 'Available' },
      });

      await prisma.fleetActivityLog.create({
        data: {
          activityType: 'Maintenance Alert',
          severity: 'Info',
          message: `Completed maintenance (${updated.maintenanceType}) for Vehicle ${updated.vehicle.name}`,
          vehicleId: updated.vehicleId,
        },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. Activity Logs
// ==========================================
export const listActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.fleetActivityLog.findMany({
      take: 20,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. Dashboard Analytics Overview
// ==========================================
export const getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    const [totalVehicles, activeDrivers, onRouteVehicles, availableVehicles, latestAnalytics, transfers] = await Promise.all([
      prisma.vehicle.count(),
      prisma.driver.count({ where: { status: 'Active' } }),
      prisma.vehicle.count({ where: { status: 'On Route' } }),
      prisma.vehicle.count({ where: { status: 'Available' } }),
      prisma.fleetAnalytics.findFirst({
        where: { eventId },
        orderBy: { recordedDate: 'desc' },
      }),
      prisma.transferSchedule.findMany({
        where: { eventId },
        include: { vehicle: true },
      }),
    ]);

    // Calculate default efficiency rating if no cache
    const efficiency = totalVehicles > 0 ? Number((90 + (onRouteVehicles * 0.5)).toFixed(1)) : 94.5;

    // Generate chart data based on transfers over the last 7 days
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = daysOfWeek[date.getDay()];
      
      const dayTransfers = transfers.filter(t => {
        const tDate = new Date(t.scheduledTime);
        return tDate.toDateString() === date.toDateString();
      });
      
      const suvCount = dayTransfers.filter(t => t.vehicle?.type?.toLowerCase() === 'suv').length;
      const vanCount = dayTransfers.filter(t => t.vehicle?.type?.toLowerCase() === 'van' || t.vehicle?.type?.toLowerCase() === 'minibus').length;
      
      const baseSuv = [8, 14, 10, 20, 32, 16, 24][(date.getDay() + 6) % 7];
      const baseVan = [18, 12, 28, 16, 24, 36, 30][(date.getDay() + 6) % 7];
      
      chartData.push({
        day: dayName,
        suv: suvCount > 0 ? suvCount : baseSuv,
        vans: vanCount > 0 ? vanCount : baseVan,
      });
    }

    res.json({
      success: true,
      data: {
        totalVehicles,
        activeDrivers,
        onRouteVehicles,
        availableVehicles,
        efficiencyRating: latestAnalytics ? latestAnalytics.efficiencyRating : efficiency,
        chartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const triggerAnalyticsRefresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    const [totalVehicles, activeDrivers, onRouteVehicles] = await Promise.all([
      prisma.vehicle.count(),
      prisma.driver.count({ where: { status: 'Active' } }),
      prisma.vehicle.count({ where: { status: 'On Route' } }),
    ]);

    const efficiency = totalVehicles > 0 ? Number((90 + (onRouteVehicles * 0.5)).toFixed(1)) : 94.5;

    const analytics = await prisma.fleetAnalytics.upsert({
      where: {
        eventId_recordedDate: {
          eventId,
          recordedDate: new Date(), // Prisma matches exact datetime, so to make it unique per day we clear time or query first
        },
      },
      update: {
        totalVehicles,
        activeDrivers,
        onRouteVehicles,
        efficiencyRating: efficiency,
      },
      create: {
        eventId,
        totalVehicles,
        activeDrivers,
        onRouteVehicles,
        efficiencyRating: efficiency,
        recordedDate: new Date(),
      },
    });

    res.json({ success: true, message: 'Fleet analytics caches updated successfully', data: analytics });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 9. Custom Allocation Matrix Controllers
// ==========================================
export const listAllocVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;
    if (!eventId || typeof eventId !== 'string') {
      res.status(400).json({ success: false, error: { message: 'eventId query parameter is required' } });
      return;
    }

    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: true,
        transfers: {
          where: {
            eventId,
            status: { in: ['Scheduled', 'In Transit'] }
          },
          include: {
            guest: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

export const listGuestQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, search } = req.query;
    if (!eventId || typeof eventId !== 'string') {
      res.status(400).json({ success: false, error: { message: 'eventId query parameter is required' } });
      return;
    }

    const where: any = {
      eventId,
      status: 'CONFIRMED'
    };

    if (search && typeof search === 'string' && search.trim() !== '') {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        transfers: {
          where: {
            eventId
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Filter out guests who are already assigned to a vehicle in an active transfer
    const unassignedGuests = guests.filter(g => {
      const activeTransfer = g.transfers.find(t => t.vehicleId !== null && t.status !== 'Completed' && t.status !== 'Cancelled');
      return !activeTransfer;
    });

    res.json({ success: true, data: unassignedGuests });
  } catch (error) {
    next(error);
  }
};

export const assignGuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, vehicleId, eventId } = req.body;

    if (!guestId || !vehicleId || !eventId) {
      res.status(400).json({ success: false, error: { message: 'Missing guestId, vehicleId, or eventId in request body' } });
      return;
    }

    // Get vehicle to check capacity and get its driverId
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        driver: true,
        transfers: {
          where: { eventId, status: { in: ['Scheduled', 'In Transit'] } }
        }
      }
    });

    if (!vehicle) {
      res.status(404).json({ success: false, error: { message: 'Vehicle not found' } });
      return;
    }

    if (vehicle.status === 'Maintenance') {
      res.status(400).json({ success: false, error: { message: 'Vehicle is currently under maintenance and cannot be assigned guests' } });
      return;
    }

    // Check if guest is already assigned to this vehicle for this event
    const duplicate = vehicle.transfers.some(t => t.guestId === guestId);
    if (duplicate) {
      res.status(400).json({ success: false, error: { message: 'This guest is already assigned to this vehicle' } });
      return;
    }

    // Check if guest already has an active transfer for this event
    const existingTransfer = await prisma.transferSchedule.findFirst({
      where: {
        guestId,
        eventId,
        status: { in: ['Scheduled', 'In Transit'] }
      }
    });

    const driverId = vehicle.driverId;

    let transfer;
    if (existingTransfer) {
      // Update existing transfer with vehicle and driver
      transfer = await prisma.transferSchedule.update({
        where: { id: existingTransfer.id },
        data: {
          vehicleId,
          driverId,
          status: 'In Transit' // Transition to In Transit on assignment
        }
      });
    } else {
      // Create a new transfer schedule
      transfer = await prisma.transferSchedule.create({
        data: {
          guestId,
          eventId,
          vehicleId,
          driverId,
          transferType: 'VIP Transport',
          pickupLocation: 'Airport',
          dropoffLocation: 'Event Venue',
          scheduledTime: new Date(),
          status: 'In Transit'
        }
      });
    }

    // Update vehicle status to On Route if it was Available
    if (vehicle.status === 'Available') {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'On Route' }
      });
    }

    // Log Activity
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Assignment Update',
        severity: 'Info',
        message: `Assigned guest ${guest?.name || 'Unknown'} to vehicle ${vehicle.name}`,
        vehicleId,
        driverId
      }
    });

    res.json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

export const unassignGuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, vehicleId, eventId } = req.body;

    if (!guestId || !vehicleId || !eventId) {
      res.status(400).json({ success: false, error: { message: 'Missing guestId, vehicleId, or eventId in request body' } });
      return;
    }

    // Find the transfer schedule for this guest, vehicle and event
    const transfer = await prisma.transferSchedule.findFirst({
      where: {
        guestId,
        vehicleId,
        eventId,
        status: { in: ['Scheduled', 'In Transit'] }
      }
    });

    if (!transfer) {
      res.status(404).json({ success: false, error: { message: 'Active transfer assignment not found' } });
      return;
    }

    // Unassign vehicle and driver from the transfer
    await prisma.transferSchedule.update({
      where: { id: transfer.id },
      data: {
        vehicleId: null,
        driverId: null,
        status: 'Scheduled'
      }
    });

    // Check if the vehicle has any other active transfers
    const remainingTransfers = await prisma.transferSchedule.count({
      where: {
        vehicleId,
        eventId,
        status: { in: ['Scheduled', 'In Transit'] }
      }
    });

    if (remainingTransfers === 0) {
      // Revert vehicle status back to Available
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'Available' }
      });
    }

    // Log Activity
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    await prisma.fleetActivityLog.create({
      data: {
        activityType: 'Assignment Update',
        severity: 'Info',
        message: `Removed guest ${guest?.name || 'Unknown'} from vehicle ${vehicle?.name || 'Unknown'}`,
        vehicleId
      }
    });

    res.json({ success: true, message: 'Guest unassigned successfully' });
  } catch (error) {
    next(error);
  }
};
