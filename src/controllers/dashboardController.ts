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
