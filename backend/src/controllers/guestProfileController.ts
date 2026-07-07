import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// Helper to format RSVP info (placeholder implementation)
const formatRsvp = (event: any) => {
  if (!event) return null;
  return {
    eventName: event.title,
    eventDate: event.date,
    venue: event.category,
    rsvpStatus: event.id,
  };
};

export const getGuestProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: guestId } = req.params;
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        accommodation: true,
        transportation: true,
        seating: true,
        communications: true,
        dietaryPreferences: true,
        specialRequests: true,
        conciergeNotes: true,
        event: true,
      },
    });
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    const response = {
      id: guest.id,
      fullName: guest.name,
      profileImage: guest.avatar,
      email: guest.email,
      phone: guest.phone,
      membership: guest.status,
      vipStatus: guest.isVip,
      designation: guest.isSpeaker ? 'Speaker' : guest.isBridalParty ? 'Bridal Party' : null,
      company: null,
      city: null,
      country: null,
      rsvp: formatRsvp(guest.event),
      dietaryPreferences: guest.dietaryPreferences?.map((d) => d.preference) ?? [],
      specialRequests: guest.specialRequests?.map((s) => s.request) ?? [],
      accommodation: guest.accommodation ?? {},
      transportation: guest.transportation ?? {},
      seatingAssignment: guest.seating ?? {},
      communicationHistory: guest.communications?.map((c) => ({
        id: c.id,
        communicationType: c.communicationType,
        title: c.title,
        description: c.description,
        createdAt: c.createdAt,
        deliveryStatus: c.deliveryStatus,
      })) ?? [],
      conciergeNotes: guest.conciergeNotes?.map((n) => ({
        id: n.id,
        note: n.note,
        createdBy: n.createdBy,
        createdAt: n.createdAt,
      })) ?? [],
    };
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const getGuestCommunications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: guestId } = req.params;
    const communications = await prisma.guestCommunication.findMany({
      where: { guestId },
      select: {
        id: true,
        communicationType: true,
        title: true,
        description: true,
        createdAt: true,
        deliveryStatus: true,
      },
    });
    res.json({ success: true, data: communications });
  } catch (error) {
    next(error);
  }
};

export const getGuestAccommodation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: guestId } = req.params;
    const accommodation = await prisma.guestAccommodation.findUnique({
      where: { guestId },
    });
    res.json({ success: true, data: accommodation });
  } catch (error) {
    next(error);
  }
};

export const getGuestTransportation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: guestId } = req.params;
    const transport = await prisma.guestTransportation.findUnique({
      where: { guestId },
    });
    res.json({ success: true, data: transport });
  } catch (error) {
    next(error);
  }
};

export const getGuestSeating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: guestId } = req.params;
    const seating = await prisma.guestSeating.findUnique({
      where: { guestId },
    });
    res.json({ success: true, data: seating });
  } catch (error) {
    next(error);
  }
};

export const getGuestNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: guestId } = req.params;
    const notes = await prisma.guestConciergeNote.findMany({
      where: { guestId },
      select: {
        id: true,
        note: true,
        createdBy: true,
        createdAt: true,
      },
    });
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

export const createGuestNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: guestId } = req.params;
    const { note } = req.body;
    const createdBy = (req as any).user?.id ?? 'system';
    const newNote = await prisma.guestConciergeNote.create({
      data: { guestId, note, createdBy },
    });
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    next(error);
  }
};
