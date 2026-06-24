import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        guests: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
            isVip: true,
            seatNumber: true,
          },
          orderBy: {
            seatNumber: 'asc',
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

export const assignGuestToTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, tableId, seatNumber } = req.body;

    if (!guestId) {
      res.status(400).json({ success: false, error: { message: 'guestId is required' } });
      return;
    }

    // Verify Guest exists
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    // Verify Table exists if tableId is provided
    if (tableId) {
      const table = await prisma.table.findUnique({
        where: { id: tableId },
        include: { guests: true },
      });
      if (!table) {
        res.status(404).json({ success: false, error: { message: 'Table not found' } });
        return;
      }

      // Check capacity
      if (table.guests.length >= table.capacity && guest.tableId !== tableId) {
        res.status(400).json({
          success: false,
          error: { message: `Table ${table.name} has reached its capacity of ${table.capacity} guests` },
        });
        return;
      }

      // Optional: Check if seat number is already taken
      if (seatNumber) {
        const seatTaken = table.guests.some((g) => g.seatNumber === seatNumber && g.id !== guestId);
        if (seatTaken) {
          res.status(400).json({
            success: false,
            error: { message: `Seat number ${seatNumber} is already occupied at Table ${table.name}` },
          });
          return;
        }
      }
    }

    // Update guest table/seat
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        tableId: tableId || null,
        seatNumber: tableId ? (seatNumber || null) : null,
      },
      include: {
        table: true,
      },
    });

    res.json({
      success: true,
      message: tableId ? `Guest assigned to ${updatedGuest.table?.name} successfully` : 'Guest unassigned from table successfully',
      data: updatedGuest,
    });
  } catch (error) {
    next(error);
  }
};
