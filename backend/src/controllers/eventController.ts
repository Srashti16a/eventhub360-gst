import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const listEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { title: 'asc' },
    });
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category, date } = req.body;
    if (!title || !category) {
      res.status(400).json({ success: false, error: { message: 'Title and category are required' } });
      return;
    }
    const event = await prisma.event.create({
      data: {
        title,
        category,
        date: date ? new Date(date) : new Date(),
      },
    });
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
