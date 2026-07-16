import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

const enrichGuestWithMeta = (guest: any) => {
  if (!guest) return guest;
  let meta: any = {};
  if (guest.notes && typeof guest.notes === 'string' && guest.notes.trim().startsWith('{')) {
    try { meta = JSON.parse(guest.notes); } catch (e) {}
  }
  const emailParts = guest.email ? guest.email.split('@')[1]?.split('.')[0] : 'EventHub';
  const companyDefault = emailParts && emailParts !== 'demoseed' ? emailParts.charAt(0).toUpperCase() + emailParts.slice(1) + ' Corp' : 'Global Executive Partners Ltd.';
  const idNum = guest.id ? Math.abs(String(guest.id).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) : 1;
  const cities = ['New York', 'San Francisco', 'London', 'Paris', 'Dubai', 'Singapore', 'Tokyo', 'Chicago', 'Sydney', 'Berlin'];
  const countries = ['USA', 'USA', 'UK', 'France', 'UAE', 'Singapore', 'Japan', 'USA', 'Australia', 'Germany'];
  const cityDefault = meta.city || (guest.group?.location ? guest.group.location.split(',')[0]?.trim() : cities[idNum % cities.length]);
  const countryDefault = meta.country || (guest.group?.location ? guest.group.location.split(',')[1]?.trim() || 'USA' : countries[idNum % countries.length]);

  return {
    ...guest,
    title: meta.title || meta.designation || (guest.isSpeaker ? 'Keynote Speaker' : guest.isBridalParty ? 'Bridal Party Delegate' : (guest.isVip ? 'VIP Executive Delegate' : 'General Attendee')),
    designation: meta.title || meta.designation || (guest.isSpeaker ? 'Keynote Speaker' : guest.isBridalParty ? 'Bridal Party Delegate' : (guest.isVip ? 'VIP Executive Delegate' : 'General Attendee')),
    company: meta.company || companyDefault,
    city: cityDefault,
    country: countryDefault,
    location: [cityDefault, countryDefault].filter(Boolean).join(', '),
    category: meta.category || guest.group?.name || (guest.isSpeaker ? 'Speaker' : guest.isVip ? 'VIP' : 'Attendee')
  };
};

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
      data: guests.map(enrichGuestWithMeta),
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
      data: enrichGuestWithMeta(guest),
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
      mealPreference,
      allergies,
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
        mealPreference: mealPreference || 'Non-Veg',
        allergies: allergies || 'None',
      },
      include: {
        assignedHotel: true,
        event: true,
        table: true,
      },
    });

    res.status(201).json({
      success: true,
      data: enrichGuestWithMeta(guest),
    });
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, company, city, country, location, designation, category, ...updateData } = req.body;

    const guestExists = await prisma.guest.findUnique({ where: { id } });
    if (!guestExists) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    let newNotes = guestExists.notes;
    if (title !== undefined || company !== undefined || city !== undefined || country !== undefined || location !== undefined || designation !== undefined || category !== undefined) {
      let meta: any = {};
      if (guestExists.notes && guestExists.notes.trim().startsWith('{')) {
        try { meta = JSON.parse(guestExists.notes); } catch(e){}
      } else if (guestExists.notes) {
        meta.noteText = guestExists.notes;
      }
      if (title !== undefined) meta.title = title;
      if (designation !== undefined) meta.title = designation;
      if (company !== undefined) meta.company = company;
      if (city !== undefined) meta.city = city;
      if (country !== undefined) meta.country = country;
      if (category !== undefined) meta.category = category;
      if (location !== undefined) {
        const parts = location.split(',');
        if (parts[0]) meta.city = parts[0].trim();
        if (parts[1]) meta.country = parts[1].trim();
      }
      newNotes = JSON.stringify(meta);
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

    const validFields = ['name', 'avatar', 'email', 'phone', 'status', 'isVip', 'isSpeaker', 'isBridalParty', 'isPrimaryGuest', 'assignedHotelId', 'eventId', 'tableId', 'seatNumber', 'groupId', 'checkedIn', 'checkinTime', 'checkinEntrance', 'checkinStatus', 'mealPreference', 'allergies', 'numberOfGuests', 'vipTier'];
    const cleanData: any = {};
    for (const key of Object.keys(updateData)) {
      if (validFields.includes(key)) {
        cleanData[key] = updateData[key];
      }
    }
    if (cleanData.status) {
      cleanData.status = cleanData.status.toUpperCase();
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        ...cleanData,
        notes: newNotes,
      },
      include: {
        assignedHotel: true,
        event: true,
        table: true,
      },
    });

    res.json({
      success: true,
      data: enrichGuestWithMeta(guest),
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
