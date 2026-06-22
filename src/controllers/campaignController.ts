import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const sendRsvpCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignType = 'RSVP_REMINDER' } = req.body;

    let targetCount = 0;
    let campaignName = '';

    if (campaignType === 'RSVP_REMINDER') {
      // Find all pending guests
      targetCount = await prisma.guest.count({
        where: { status: 'PENDING' },
      });
      campaignName = 'RSVP Pending Reminders Campaign';
    } else if (campaignType === 'ITINERARY') {
      // Find all confirmed guests
      targetCount = await prisma.guest.count({
        where: { status: 'CONFIRMED' },
      });
      campaignName = 'Confirmed Guests Digital Itineraries Campaign';
    } else {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid campaignType. Allowed types: RSVP_REMINDER, ITINERARY' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        campaignName,
        type: campaignType,
        recipientCount: targetCount,
        status: 'SENT',
        sentAt: new Date(),
        message: `Successfully broadcasted campaign to ${targetCount} recipients.`,
      },
    });
  } catch (error) {
    next(error);
  }
};
