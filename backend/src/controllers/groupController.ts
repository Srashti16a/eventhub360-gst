import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const listGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.guestGroup.findMany({
      include: {
        members: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const group = await prisma.guestGroup.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!group) {
      res.status(404).json({ success: false, error: { message: 'Group not found' } });
      return;
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, status, location, transportation, specialRequirement, isVipGroup } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ success: false, error: { message: 'Group name is required' } });
      return;
    }

    const group = await prisma.guestGroup.create({
      data: {
        name,
        category,
        status: status || 'Active',
        isVipGroup: isVipGroup !== undefined ? Boolean(isVipGroup) : false,
        location: location || null,
        transportation: transportation || null,
        specialRequirement: specialRequirement || null,
        primaryGuestId: null // Force unassigned contact on creation
      },
      include: {
        members: true
      }
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, category, status, location, transportation, specialRequirement, primaryGuestId, isVipGroup } = req.body;

    if (name !== undefined && (!name || name.trim() === '')) {
      res.status(400).json({ success: false, error: { message: 'Group name cannot be empty' } });
      return;
    }

    // Check if group exists
    const group = await prisma.guestGroup.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!group) {
      res.status(404).json({ success: false, error: { message: 'Group not found' } });
      return;
    }

    // Validate primaryGuestId if updated
    if (primaryGuestId) {
      const isMember = group.members.some(m => m.id === primaryGuestId);
      if (!isMember) {
        res.status(400).json({ success: false, error: { message: 'Primary guest contact must be an existing member of the group' } });
        return;
      }
    }

    const updatedGroup = await prisma.guestGroup.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category : undefined,
        status: status !== undefined ? status : undefined,
        isVipGroup: isVipGroup !== undefined ? Boolean(isVipGroup) : undefined,
        location: location !== undefined ? location : undefined,
        transportation: transportation !== undefined ? transportation : undefined,
        specialRequirement: specialRequirement !== undefined ? specialRequirement : undefined,
        primaryGuestId: primaryGuestId !== undefined ? (primaryGuestId || null) : undefined
      },
      include: {
        members: true
      }
    });

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const groupExists = await prisma.guestGroup.findUnique({ where: { id } });
    if (!groupExists) {
      res.status(404).json({ success: false, error: { message: 'Group not found' } });
      return;
    }

    await prisma.guestGroup.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { guestId } = req.body;

    if (!guestId) {
      res.status(400).json({ success: false, error: { message: 'Guest ID is required' } });
      return;
    }

    // Verify group exists
    const group = await prisma.guestGroup.findUnique({ where: { id } });
    if (!group) {
      res.status(404).json({ success: false, error: { message: 'Group not found' } });
      return;
    }

    // Verify guest exists
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) {
      res.status(404).json({ success: false, error: { message: 'Guest not found' } });
      return;
    }

    // Prevent duplicate members in the same group
    if (guest.groupId === id) {
      res.status(400).json({ success: false, error: { message: 'Guest is already a member of this group' } });
      return;
    }

    // Update guest's groupId
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: { groupId: id }
    });

    // Fetch updated group details
    const updatedGroup = await prisma.guestGroup.findUnique({
      where: { id },
      include: { members: true }
    });

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, guestId } = req.params;

    // Verify group exists
    const group = await prisma.guestGroup.findUnique({ where: { id } });
    if (!group) {
      res.status(404).json({ success: false, error: { message: 'Group not found' } });
      return;
    }

    // Verify guest is member of this group
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest || guest.groupId !== id) {
      res.status(400).json({ success: false, error: { message: 'Guest is not a member of this group' } });
      return;
    }

    // Remove guest from group
    await prisma.guest.update({
      where: { id: guestId },
      data: { groupId: null }
    });

    // If removed guest was the primary contact, clear it
    if (group.primaryGuestId === guestId) {
      await prisma.guestGroup.update({
        where: { id },
        data: { primaryGuestId: null }
      });
    }

    // Fetch updated group details
    const updatedGroup = await prisma.guestGroup.findUnique({
      where: { id },
      include: { members: true }
    });

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    next(error);
  }
};

export const searchGuests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { q = '' } = req.query;

    const queryStr = String(q).trim();

    // Query guests not already in this group matching the query
    const conditions: any[] = [
      {
        OR: [
          { groupId: null },
          { groupId: { not: id } }
        ]
      }
    ];

    if (queryStr) {
      conditions.push({
        OR: [
          { name: { contains: queryStr, mode: 'insensitive' } },
          { email: { contains: queryStr, mode: 'insensitive' } },
          { phone: { contains: queryStr, mode: 'insensitive' } }
        ]
      });
    }

    const where: any = { AND: conditions };

    const guests = await prisma.guest.findMany({
      where,
      orderBy: {
        name: 'asc'
      },
      take: 20 // limit results for dropdown
    });

    res.json({
      success: true,
      data: guests
    });
  } catch (error) {
    next(error);
  }
};
