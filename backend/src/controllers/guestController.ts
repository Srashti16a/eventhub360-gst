import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const listGuests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, rsvpStatus, eventCategory, vipOnly, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (rsvpStatus && typeof rsvpStatus === 'string' && rsvpStatus !== 'ALL') {
      where.status = rsvpStatus.toUpperCase();
    }

    if (eventCategory && typeof eventCategory === 'string' && eventCategory !== 'All Events') {
      where.event = {
        category: eventCategory,
      };
    }

    if (vipOnly === 'true' || (vipOnly as unknown) === true) {
      where.isVip = true;
    }

    // Execute queries
    const [guests, totalCount] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          assignedHotel: true,
          event: true,
          table: true,
        },
        orderBy: {
          [String(sortBy)]: sortOrder,
        },
        skip,
        take: limitNum,
      }),
      prisma.guest.count({ where }),
    ]);

    res.json({
      success: true,
      meta: {
        totalGuests: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      data: guests,
    });
  } catch (error) {
    next(error);
  }
};

export const getGuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        assignedHotel: true,
        event: true,
        table: true,
      },
    });

    if (!guest) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    res.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

export const createGuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      avatar,
      email,
      phone,
      status,
      isVip,
      isSpeaker,
      isBridalParty,
      isPrimaryGuest,
      assignedHotelId,
      eventId,
      tableId,
      seatNumber,
    } = req.body;

    // Verify Event exists or fallback to first available event
    let targetEventId = eventId;
    if (targetEventId) {
      const eventExists = await prisma.event.findUnique({ where: { id: targetEventId } });
      if (!eventExists) targetEventId = null;
    }
    if (!targetEventId) {
      const firstEvent = await prisma.event.findFirst();
      if (firstEvent) {
        targetEventId = firstEvent.id;
      } else {
        const newEvent = await prisma.event.create({
          data: {
            title: 'Default Event',
            category: 'General',
            date: new Date(),
          }
        });
        targetEventId = newEvent.id;
      }
    }

    // Verify Hotel exists if provided
    if (assignedHotelId) {
      const hotelExists = await prisma.hotel.findUnique({ where: { id: assignedHotelId } });
      if (!hotelExists) {
        res.status(400).json({ success: false, error: { message: 'Invalid Hotel ID' } });
        return;
      }
    }

    // Verify Table exists if provided
    if (tableId) {
      const tableExists = await prisma.table.findUnique({ where: { id: tableId } });
      if (!tableExists) {
        res.status(400).json({ success: false, error: { message: 'Invalid Table ID' } });
        return;
      }
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        email,
        phone: phone || '+1 (555) 000-0000',
        status: (status || 'CONFIRMED').toUpperCase(),
        isVip: !!isVip,
        isSpeaker: !!isSpeaker,
        isBridalParty: !!isBridalParty,
        isPrimaryGuest: !!isPrimaryGuest,
        assignedHotelId: assignedHotelId || null,
        eventId: targetEventId,
        tableId: tableId || null,
        seatNumber: seatNumber || null,
      },
      include: {
        assignedHotel: true,
        event: true,
        table: true,
      },
    });

    res.status(201).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const guestExists = await prisma.guest.findUnique({ where: { id } });
    if (!guestExists) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    // Validate relations if updated
    if (updateData.eventId) {
      const eventExists = await prisma.event.findUnique({ where: { id: updateData.eventId } });
      if (!eventExists) {
        const firstEvent = await prisma.event.findFirst();
        if (firstEvent) {
          updateData.eventId = firstEvent.id;
        } else {
          delete updateData.eventId;
        }
      }
    }

    if (updateData.assignedHotelId) {
      const hotelExists = await prisma.hotel.findUnique({ where: { id: updateData.assignedHotelId } });
      if (!hotelExists) {
        res.status(400).json({ success: false, error: { message: 'Invalid Hotel ID' } });
        return;
      }
    }

    if (updateData.tableId) {
      const tableExists = await prisma.table.findUnique({ where: { id: updateData.tableId } });
      if (!tableExists) {
        res.status(400).json({ success: false, error: { message: 'Invalid Table ID' } });
        return;
      }
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        ...updateData,
        status: updateData.status ? updateData.status.toUpperCase() : undefined,
      },
      include: {
        assignedHotel: true,
        event: true,
        table: true,
      },
    });

    res.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const guestExists = await prisma.guest.findUnique({ where: { id } });
    if (!guestExists) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    await prisma.guest.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Guest deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
