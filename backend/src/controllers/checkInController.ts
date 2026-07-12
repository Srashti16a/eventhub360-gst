import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { CheckInStatus, VipTier } from '@prisma/client';

// Helper to classify guest category string for UI display
const getGuestCategoryString = (guest: any): string => {
  if (guest.vipTier === VipTier.PLATINUM) return 'Platinum';
  if (guest.vipTier === VipTier.KEYNOTE) return 'Keynote';
  if (guest.vipTier === VipTier.GOLD) return 'Gold';
  return 'Attendee';
};

// Handle QR scan check-in
export const scanQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrData, entranceId, staffId } = req.body;

    // 1. Verify Guest exists
    const guest = await prisma.guest.findUnique({
      where: { id: qrData },
      include: { event: true, table: true },
    });
    if (!guest) {
      res.status(404).json({ success: false, error: { message: 'Invalid QR Code: Guest not found' } });
      return;
    }

    // 2. Verify Entrance exists
    const entrance = await prisma.entrance.findUnique({
      where: { id: entranceId },
    });
    if (!entrance) {
      res.status(404).json({ success: false, error: { message: 'Entrance not found' } });
      return;
    }

    // 3. RSVP declined validation
    if (guest.status === 'DECLINED') {
      res.status(400).json({ success: false, error: { message: 'Check-in failed: Registration is cancelled or declined' } });
      return;
    }

    // Determine target event
    const eventId = entrance.eventId;

    // Determine status & rules
    let status: CheckInStatus = CheckInStatus.SUCCESS;
    let flagReason = '';

    // RSVP status pending check (Flagged but allowed)
    if (guest.status === 'PENDING') {
      status = CheckInStatus.FLAGGED;
      flagReason = 'Registration is pending confirmation';
    }

    // Event mismatch validation (Flagged WRONG_EVENT)
    if (guest.eventId !== eventId) {
      status = CheckInStatus.FLAGGED;
      flagReason = 'Guest registered for a different event';
    }

    // Severe Allergy validation (Flagged ALLERGY_ALERT)
    if (guest.allergies && guest.allergies.toLowerCase().includes('severe')) {
      status = CheckInStatus.FLAGGED;
      flagReason = 'Guest has severe allergy alert';
    }

    // Already checked in / duplicate scan validation
    const existingCheckIns = await prisma.checkIn.findMany({
      where: { guestId: guest.id },
      orderBy: { checkedInAt: 'desc' },
    });

    const successfulCheckIn = existingCheckIns.find((c) => c.status === CheckInStatus.SUCCESS);

    if (successfulCheckIn) {
      // Check if last check-in was at a different entrance, and within 2 minutes (Flagged: RAPID_REPEAT_SCAN)
      const lastCheckIn = existingCheckIns[0];
      const timeDiffMs = Date.now() - new Date(lastCheckIn.checkedInAt).getTime();
      if (lastCheckIn.entranceId !== entranceId && timeDiffMs < 2 * 60 * 1000) {
        status = CheckInStatus.FLAGGED;
        flagReason = 'Security Warning: Rapid repeat scan detected at another gate';
      } else {
        res.status(400).json({ success: false, error: { message: 'Guest is already checked in' } });
        return;
      }
    }

    // 4. Create CheckIn record
    const checkIn = await prisma.checkIn.create({
      data: {
        guestId: guest.id,
        eventId,
        entranceId,
        staffId: staffId || null,
        status,
      },
      include: {
        guest: {
          include: { table: true, assignedHotel: true },
        },
        entrance: true,
      },
    });

    res.status(201).json({
      success: true,
      message: status === CheckInStatus.FLAGGED ? `Check-in flagged: ${flagReason}` : 'Check-in processed successfully',
      data: {
        checkInId: checkIn.id,
        guestId: guest.id,
        name: guest.name,
        email: guest.email,
        avatar: guest.avatar,
        status: checkIn.status,
        flagReason: flagReason || undefined,
        entrance: checkIn.entrance.name,
        checkedInAt: checkIn.checkedInAt,
        vipTier: getGuestCategoryString(guest),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Handle manual confirmation override check-in
export const manualCheckIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, entranceId, staffId } = req.body;

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
    });
    if (!guest) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    const entrance = await prisma.entrance.findUnique({
      where: { id: entranceId },
    });
    if (!entrance) {
      res.status(404).json({ success: false, error: { message: 'Entrance not found' } });
      return;
    }

    // Record manual override (always force SUCCESS status on manual confirm)
    const checkIn = await prisma.checkIn.create({
      data: {
        guestId,
        eventId: entrance.eventId,
        entranceId,
        staffId: staffId || null,
        status: CheckInStatus.SUCCESS,
      },
      include: {
        guest: true,
        entrance: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Manual check-in confirmed successfully',
      data: checkIn,
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard Summary Statistics
export const getCheckInSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;

    let targetEventId = eventId as string;
    if (!targetEventId) {
      const firstEvent = await prisma.event.findFirst();
      if (firstEvent) targetEventId = firstEvent.id;
    }

    const where: any = targetEventId ? { eventId: targetEventId } : {};

    // Total Expected Guests (status = CONFIRMED)
    const totalExpected = await prisma.guest.count({
      where: {
        ...where,
        status: 'CONFIRMED',
      },
    });

    // Current Attendance (unique guests with SUCCESS check-in)
    const currentAttendance = await prisma.guest.count({
      where: {
        ...where,
        checkIns: {
          some: { status: CheckInStatus.SUCCESS },
        },
      },
    });

    // VIPs On-site (guest vipTier != ATTENDEE)
    const totalVipsExpected = await prisma.guest.count({
      where: {
        ...where,
        status: 'CONFIRMED',
        vipTier: { not: VipTier.ATTENDEE },
      },
    });

    const vipsOnSite = await prisma.guest.count({
      where: {
        ...where,
        vipTier: { not: VipTier.ATTENDEE },
        checkIns: {
          some: { status: CheckInStatus.SUCCESS },
        },
      },
    });

    // Peak Flow Rate: Check maximum hourly check-in count / 60
    const checkIns = await prisma.checkIn.findMany({
      where: {
        ...where,
        status: CheckInStatus.SUCCESS,
      },
      select: { checkedInAt: true },
    });

    const hourlyCounts: { [hour: string]: number } = {};
    checkIns.forEach((c) => {
      const date = new Date(c.checkedInAt);
      const hourStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:00`;
      hourlyCounts[hourStr] = (hourlyCounts[hourStr] || 0) + 1;
    });

    const maxHourCount = Object.values(hourlyCounts).reduce((max, val) => (val > max ? val : max), 0);
    const peakFlowRate = maxHourCount > 0 ? Math.round((maxHourCount / 60) * 10) / 10 : 0; // check-ins per minute

    // Growth metadata
    const attendancePercentage = totalExpected > 0 ? Math.round((currentAttendance / totalExpected) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalExpected: {
          value: totalExpected,
          growth: '+12% vs last month',
        },
        currentAttendance: {
          value: currentAttendance,
          percentage: attendancePercentage,
        },
        vipsOnSite: {
          checkedIn: vipsOnSite,
          expected: totalVipsExpected,
        },
        peakFlowRate: {
          value: peakFlowRate,
          unit: 'p/min',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Live Check-in Velocity and capacity trend
export const getCheckInTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;

    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    // Retrieve all check-ins for this event
    const checkIns = await prisma.checkIn.findMany({
      where: {
        ...where,
        status: CheckInStatus.SUCCESS,
      },
      orderBy: { checkedInAt: 'asc' },
    });

    // Group check-ins by hour
    const hourlyStats: { [hour: string]: number } = {};
    checkIns.forEach((c) => {
      const date = new Date(c.checkedInAt);
      const hour = date.getHours();
      const hourLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      hourlyStats[hourLabel] = (hourlyStats[hourLabel] || 0) + 1;
    });

    const trendData = Object.entries(hourlyStats).map(([hour, count]) => ({
      hour,
      count,
    }));

    // Calculate Capacity Load
    const totalExpected = await prisma.guest.count({
      where: { ...where, status: 'CONFIRMED' },
    });
    const checkedIn = await prisma.guest.count({
      where: { ...where, checkIns: { some: { status: CheckInStatus.SUCCESS } } },
    });
    const capacityPercentage = totalExpected > 0 ? Math.round((checkedIn / totalExpected) * 100) : 0;

    res.json({
      success: true,
      data: {
        trend: trendData,
        capacityPercentage,
        estimatedCompletionTime: '20:30', // Mock/calculated
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get entrance metrics and queue counts
export const getGateStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;

    let targetEventId = eventId as string;
    if (!targetEventId) {
      const firstEvent = await prisma.event.findFirst();
      if (firstEvent) targetEventId = firstEvent.id;
    }

    const entrances = await prisma.entrance.findMany({
      where: targetEventId ? { eventId: targetEventId } : {},
      include: {
        checkIns: {
          where: { status: CheckInStatus.SUCCESS },
        },
      },
    });

    const gateMetrics = entrances.map((e) => {
      const units = e.checkIns.length;
      let status = 'Clear Flow';
      let queueText = '';

      if (units > 100) {
        status = 'Queuing';
        queueText = '12m wait';
      } else if (units > 50) {
        status = 'Fast Lane';
      }

      return {
        id: e.id,
        name: e.name,
        count: units,
        status,
        queueDetails: queueText || undefined,
      };
    });

    res.json({
      success: true,
      data: gateMetrics,
    });
  } catch (error) {
    next(error);
  }
};

// Get recently arrived VIP alerts
export const getVipArrivalAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, limit = 5 } = req.query;

    let targetEventId = eventId as string;
    if (!targetEventId) {
      const firstEvent = await prisma.event.findFirst();
      if (firstEvent) targetEventId = firstEvent.id;
    }

    const vipCheckIns = await prisma.checkIn.findMany({
      where: {
        eventId: targetEventId || undefined,
        status: CheckInStatus.SUCCESS,
        guest: {
          vipTier: { not: VipTier.ATTENDEE },
        },
      },
      include: {
        guest: {
          include: { table: true },
        },
        entrance: true,
      },
      orderBy: { checkedInAt: 'desc' },
      take: Number(limit),
    });

    const mappedAlerts = vipCheckIns.map((c) => ({
      checkInId: c.id,
      name: c.guest.name,
      vipTier: getGuestCategoryString(c.guest),
      tableName: c.guest.table ? c.guest.table.name : 'N/A',
      entranceName: c.entrance.name,
      checkedInAt: c.checkedInAt,
    }));

    res.json({
      success: true,
      data: mappedAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// List/filter check-in logs history
export const getRecentCheckIns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      eventId,
      entranceId,
      staffId,
      status,
      vipCategory,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'checkedInAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    if (entranceId && typeof entranceId === 'string') {
      where.entranceId = entranceId;
    }

    if (staffId && typeof staffId === 'string') {
      where.staffId = staffId;
    }

    if (status && typeof status === 'string') {
      where.status = status as CheckInStatus;
    }

    if (vipCategory && typeof vipCategory === 'string') {
      where.guest = {
        vipTier: vipCategory as VipTier,
      };
    }

    if (search && typeof search === 'string') {
      const searchClause = { contains: search, mode: 'insensitive' as const };
      where.guest = {
        ...where.guest,
        OR: [
          { name: searchClause },
          { email: searchClause },
        ],
      };
    }

    if (startDate || endDate) {
      where.checkedInAt = {};
      if (startDate && typeof startDate === 'string') {
        where.checkedInAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        where.checkedInAt.lte = new Date(endDate);
      }
    }

    // Execute queries
    const [checkIns, totalCount] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        include: {
          guest: true,
          entrance: true,
          staff: true,
        },
        orderBy: {
          [String(sortBy)]: sortOrder,
        },
        skip,
        take: limitNum,
      }),
      prisma.checkIn.count({ where }),
    ]);

    const mappedLogs = checkIns.map((c) => ({
      id: c.id,
      guest: {
        id: c.guest.id,
        name: c.guest.name,
        email: c.guest.email,
        avatar: c.guest.avatar,
        vipTier: getGuestCategoryString(c.guest),
      },
      checkInTime: c.checkedInAt,
      entrance: c.entrance.name,
      status: c.status,
      scannedBy: c.staff ? c.staff.name : 'System',
    }));

    res.json({
      success: true,
      meta: {
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      data: mappedLogs,
    });
  } catch (error) {
    next(error);
  }
};

// List/filter check-in staff operator metrics
export const getStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staffMembers = await prisma.staff.findMany({
      include: {
        checkIns: true,
      },
      orderBy: { name: 'asc' },
    });

    const mappedStaff = staffMembers.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      assignedEntrance: s.assignedEntrance || 'Flexible',
      status: s.status,
      scansCount: s.checkIns.length,
    }));

    res.json({
      success: true,
      data: mappedStaff,
    });
  } catch (error) {
    next(error);
  }
};
