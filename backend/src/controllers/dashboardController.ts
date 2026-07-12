import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalCount = await prisma.guest.count();
    const confirmedCount = await prisma.guest.count({ where: { status: 'CONFIRMED' } });
    const pendingCount = await prisma.guest.count({ where: { status: 'PENDING' } });
    const vipCount = await prisma.guest.count({ where: { isVip: true } });

    res.json({
      success: true,
      data: {
        totalGuests: {
          value: totalCount,
          growth: '+4.2%',
        },
        confirmed: {
          value: confirmedCount,
          growth: '+12%',
        },
        pendingRsvp: {
          value: pendingCount,
          growth: '-2%',
        },
        vipStatus: {
          value: vipCount,
          growth: null, // Mockup has no percentage for VIP status
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCheckinStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalCount = await prisma.guest.count();
    const checkedInCount = await prisma.guest.count({ where: { checkedIn: true } });
    const vipTotalCount = await prisma.guest.count({ where: { isVip: true } });
    const vipCheckedInCount = await prisma.guest.count({ where: { isVip: true, checkedIn: true } });

    // Entrance gates counts
    const northGateCount = await prisma.guest.count({ where: { checkedIn: true, checkinEntrance: 'North Gate' } });
    const mainBallroomCount = await prisma.guest.count({ where: { checkedIn: true, checkinEntrance: 'Main Ballroom' } });
    const vipLoungeCount = await prisma.guest.count({ where: { checkedIn: true, checkinEntrance: 'VIP Lounge' } });

    res.json({
      success: true,
      data: {
        totalExpected: totalCount || 2450,
        checkedInCount: checkedInCount,
        vipTotalCount: vipTotalCount,
        vipCheckedInCount: vipCheckedInCount,
        gates: {
          northGate: northGateCount,
          mainBallroom: mainBallroomCount,
          vipLounge: vipLoungeCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentCheckins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const checkedInParam = req.query.checkedIn;
    const checkedIn = checkedInParam === undefined ? true : checkedInParam === 'true';

    const whereClause: any = { checkedIn };

    if (search && search.trim()) {
      const searchClause = { contains: search, mode: 'insensitive' as const };
      whereClause.OR = [
        { name: searchClause },
        { email: searchClause },
        { phone: searchClause },
        { checkinEntrance: searchClause }
      ];
    }

    const checkins = await prisma.guest.findMany({
      where: whereClause,
      orderBy: checkedIn ? { checkinTime: 'desc' } : { name: 'asc' },
      take: 50
    });

    res.json({
      success: true,
      data: checkins
    });
  } catch (error) {
    next(error);
  }
};

export const getVipAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await prisma.guest.findMany({
      where: { checkedIn: true, isVip: true },
      orderBy: { checkinTime: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

export const scanCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, entrance, checkinStatus } = req.body;
    let guest;

    if (guestId) {
      guest = await prisma.guest.findUnique({ where: { id: guestId } });
    } else {
      // Pick a random guest not checked-in yet
      const unchecked = await prisma.guest.findMany({ where: { checkedIn: false } });
      if (unchecked.length > 0) {
        guest = unchecked[Math.floor(Math.random() * unchecked.length)];
      }
    }

    if (!guest) {
      res.status(404).json({ success: false, error: { message: 'No unchecked guests found in database.' } });
      return;
    }

    const entranceOptions = ['North Gate', 'Main Ballroom', 'VIP Lounge'];
    const randomEntrance = entranceOptions[Math.floor(Math.random() * entranceOptions.length)];
    const finalEntrance = entrance || randomEntrance;

    const statusOptions = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FLAGGED']; // 25% chance of flagged
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const finalStatus = checkinStatus || randomStatus;

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        checkedIn: true,
        checkinTime: new Date(),
        checkinEntrance: finalEntrance,
        checkinStatus: finalStatus
      }
    });

    // Find or create Entrance record
    let entranceRecord = await prisma.entrance.findFirst({
      where: { name: finalEntrance, eventId: guest.eventId }
    });
    if (!entranceRecord) {
      entranceRecord = await prisma.entrance.create({
        data: {
          name: finalEntrance,
          eventId: guest.eventId
        }
      });
    }

    // Create CheckIn record
    await prisma.checkIn.create({
      data: {
        guestId: guest.id,
        eventId: guest.eventId,
        entranceId: entranceRecord.id,
        status: finalStatus === 'FLAGGED' ? 'FLAGGED' : 'SUCCESS',
        checkedInAt: updatedGuest.checkinTime!
      }
    });

    res.json({
      success: true,
      data: updatedGuest
    });
  } catch (error) {
    next(error);
  }
};

export const manualCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, guestId, numberOfGuests, checkinTime, notes, entrance } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: { message: 'Name is required' } });
      return;
    }

    let guest;
    if (guestId && guestId.trim()) {
      guest = await prisma.guest.findUnique({ where: { id: guestId } });
      if (!guest) {
        res.status(404).json({ success: false, error: { message: `Guest not found with ID: ${guestId}` } });
        return;
      }
    } else {
      // Look up existing guest by name
      guest = await prisma.guest.findFirst({
        where: { name: { equals: name.trim(), mode: 'insensitive' } }
      });
    }

    if (!guest) {
      // Create guest
      let event = await prisma.event.findFirst();
      if (!event) {
        event = await prisma.event.create({
          data: {
            title: 'Default Event',
            category: 'Corporate Gala',
            date: new Date()
          }
        });
      }

      guest = await prisma.guest.create({
        data: {
          name: name.trim(),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          email: email ? email.trim() : `${name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: phone ? phone.trim() : '+1 (555) 000-0000',
          status: 'CONFIRMED',
          isVip: Math.random() > 0.8, // 20% chance of VIP
          eventId: event.id
        }
      });
    }

    const parsedTime = checkinTime ? new Date(checkinTime) : new Date();
    const finalEntrance = entrance || 'Main Ballroom';
    const parsedNumGuests = numberOfGuests ? parseInt(String(numberOfGuests), 10) : 1;

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        checkedIn: true,
        checkinTime: parsedTime,
        checkinEntrance: finalEntrance,
        checkinStatus: 'SUCCESS',
        phone: phone ? phone.trim() : guest.phone,
        email: email ? email.trim() : guest.email,
        numberOfGuests: isNaN(parsedNumGuests) ? 1 : parsedNumGuests,
        notes: notes ? notes.trim() : guest.notes
      }
    });

    // Find or create Entrance
    let entranceRecord = await prisma.entrance.findFirst({
      where: { name: finalEntrance, eventId: guest.eventId }
    });
    if (!entranceRecord) {
      entranceRecord = await prisma.entrance.create({
        data: {
          name: finalEntrance,
          eventId: guest.eventId
        }
      });
    }

    // Create corresponding CheckIn record
    await prisma.checkIn.create({
      data: {
        guestId: guest.id,
        eventId: guest.eventId,
        entranceId: entranceRecord.id,
        status: 'SUCCESS',
        checkedInAt: parsedTime
      }
    });

    res.json({
      success: true,
      data: updatedGuest
    });
  } catch (error) {
    next(error);
  }
};

export const approveCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const guest = await prisma.guest.findUnique({ where: { id } });
    if (!guest) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        checkinStatus: 'APPROVED'
      }
    });

    // Also update corresponding flagged CheckIn records
    await prisma.checkIn.updateMany({
      where: { guestId: id, status: 'FLAGGED' },
      data: { status: 'SUCCESS' }
    });

    res.json({
      success: true,
      data: updatedGuest
    });
  } catch (error) {
    next(error);
  }
};
