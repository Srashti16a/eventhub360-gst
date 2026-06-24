import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const listHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: { message: 'Hotel name is required' } });
      return;
    }
    const hotel = await prisma.hotel.create({
      data: { name },
    });
    res.status(201).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};
