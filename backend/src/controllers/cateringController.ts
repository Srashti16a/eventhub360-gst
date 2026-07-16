import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// Helper to classify guest category
const getGuestCategory = (guest: any): string => {
  if (guest.isVip) return 'VIP';
  if (guest.isSpeaker) return 'Speaker';
  if (guest.isBridalParty) return 'Family';
  return 'Attendee';
};

// Helper to map meal preferences to main categories (Vegan, Vegetarian, Non-Veg)
const getMealCategory = (preference: string | null): string => {
  if (!preference) return 'Non-Veg';
  const pref = preference.toLowerCase();
  if (pref === 'vegan') return 'Vegan';
  if (pref === 'vegetarian' || pref === 'gluten-free') return 'Vegetarian';
  return 'Non-Veg'; // Non-Veg, Keto, or any other is classified under Non-Veg
};

export const getCateringSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;

    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    const totalGuests = await prisma.guest.count({ where });

    // Fetch counts dynamically based on classifications
    const allGuests = await prisma.guest.findMany({
      where,
      select: {
        mealPreference: true,
        allergies: true,
      },
    });

    let veganCount = 0;
    let vegetarianCount = 0;
    let nonVegCount = 0;
    let allergyAlertCount = 0;

    for (const g of allGuests) {
      const category = getMealCategory(g.mealPreference);
      if (category === 'Vegan') veganCount++;
      else if (category === 'Vegetarian') vegetarianCount++;
      else nonVegCount++;

      if (g.allergies && g.allergies !== 'None' && g.allergies.trim() !== '') {
        allergyAlertCount++;
      }
    }

    const veganPercent = totalGuests > 0 ? Math.round((veganCount / totalGuests) * 100) : 0;
    const vegetarianPercent = totalGuests > 0 ? Math.round((vegetarianCount / totalGuests) * 100) : 0;
    const nonVegPercent = totalGuests > 0 ? Math.round((nonVegCount / totalGuests) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalGuests: {
          value: totalGuests,
          growth: '+12% vs last month',
          allergyAlerts: allergyAlertCount,
        },
        vegan: {
          value: veganCount,
          percentage: veganPercent,
        },
        vegetarian: {
          value: vegetarianCount,
          percentage: vegetarianPercent,
        },
        nonVeg: {
          value: nonVegCount,
          percentage: nonVegPercent,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listCateringPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      mealCategory,
      preference,
      allergy,
      guestCategory,
      eventId,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const where: any = {};

    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (preference && typeof preference === 'string' && preference !== 'All Preferences') {
      where.mealPreference = { equals: preference, mode: 'insensitive' };
    }

    if (allergy && typeof allergy === 'string' && allergy !== 'All Allergies') {
      if (allergy.toLowerCase() === 'none') {
        where.OR = [
          { allergies: { equals: 'None', mode: 'insensitive' } },
          { allergies: { equals: '' } },
          { allergies: null }
        ];
      } else if (allergy.toLowerCase() === 'has allergies') {
        where.NOT = [
          { allergies: { in: ['None', ''] } },
          { allergies: null }
        ];
      } else {
        where.allergies = { contains: allergy, mode: 'insensitive' };
      }
    }

    if (guestCategory && typeof guestCategory === 'string' && guestCategory !== 'All Categories') {
      const cat = guestCategory.toLowerCase();
      if (cat === 'vip') where.isVip = true;
      else if (cat === 'speaker') where.isSpeaker = true;
      else if (cat === 'family') where.isBridalParty = true;
      else if (cat === 'attendee') {
        where.isVip = false;
        where.isSpeaker = false;
        where.isBridalParty = false;
      }
    }

    // Since mealCategory maps to multiple mealPreferences, fetch all and filter or build Prisma query
    if (mealCategory && typeof mealCategory === 'string' && mealCategory !== 'All Categories') {
      const mc = mealCategory.toLowerCase();
      if (mc === 'vegan') {
        where.mealPreference = { equals: 'Vegan', mode: 'insensitive' };
      } else if (mc === 'vegetarian') {
        where.mealPreference = { in: ['Vegetarian', 'Gluten-Free'] };
      } else if (mc === 'non-veg') {
        // Non-veg includes Keto, Non-Veg, or null/empty
        where.OR = [
          { mealPreference: { in: ['Non-Veg', 'Keto'] } },
          { mealPreference: null },
        ];
      }
    }

    // Execute queries
    const [guests, totalCount] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          assignedHotel: true,
          event: true,
        },
        orderBy: {
          [String(sortBy)]: sortOrder,
        },
        skip,
        take: limitNum,
      }),
      prisma.guest.count({ where }),
    ]);

    const mappedGuests = guests.map((g) => ({
      id: g.id,
      name: g.name,
      email: g.email,
      avatar: g.avatar,
      phone: g.phone,
      status: g.status,
      mealPreference: g.mealPreference || 'Non-Veg',
      allergies: g.allergies || 'None',
      guestCategory: getGuestCategory(g),
      event: {
        id: g.event.id,
        title: g.event.title,
        category: g.event.category,
        date: g.event.date,
      },
      hotel: g.assignedHotel ? {
        id: g.assignedHotel.id,
        name: g.assignedHotel.name,
      } : null,
    }));

    res.json({
      success: true,
      meta: {
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      data: mappedGuests,
    });
  } catch (error) {
    next(error);
  }
};

export const getProcurementAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;

    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    const allGuests = await prisma.guest.findMany({
      where,
      select: {
        mealPreference: true,
      },
    });

    let nonVegUnits = 0; // Poultry / Red Meat
    let vegetarianUnits = 0; // Lacto-Ovo Vegetarian
    let veganUnits = 0; // Plant-Based / Vegan
    const totalUnits = allGuests.length;

    for (const g of allGuests) {
      const category = getMealCategory(g.mealPreference);
      if (category === 'Vegan') veganUnits++;
      else if (category === 'Vegetarian') vegetarianUnits++;
      else nonVegUnits++;
    }

    const nonVegPercent = totalUnits > 0 ? Math.round((nonVegUnits / totalUnits) * 100) : 0;
    const vegetarianPercent = totalUnits > 0 ? Math.round((vegetarianUnits / totalUnits) * 100) : 0;
    const veganPercent = totalUnits > 0 ? Math.round((veganUnits / totalUnits) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalUnits,
        categories: [
          {
            name: 'Poultry / Red Meat',
            units: nonVegUnits,
            percentage: nonVegPercent,
          },
          {
            name: 'Lacto-Ovo Vegetarian',
            units: vegetarianUnits,
            percentage: vegetarianPercent,
          },
          {
            name: 'Plant-Based / Vegan',
            units: veganUnits,
            percentage: veganPercent,
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChefSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;

    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    // Special Request Count: count of guests with specific allergies OR mealPreference other than Non-Veg
    const specialRequestCount = await prisma.guest.count({
      where: {
        ...where,
        OR: [
          { mealPreference: { notIn: ['Non-Veg'] } },
          { allergies: { notIn: ['None', ''] } },
        ],
      },
    });

    // Mock stock data and warnings (as inventory is not persisted in DB)
    const inventoryAlerts = [
      { ingredient: 'Chicken Breast', status: 'Low', remainingUnits: 12 },
    ];

    const lowStockWarnings = [
      { ingredient: 'Chicken Breast', remainingUnits: 12 },
      { ingredient: 'Salmon Fillet', remainingUnits: 18 },
    ];

    res.json({
      success: true,
      data: {
        inventoryAlerts,
        lowStockWarnings,
        preparationStartTime: '06:00 AM',
        specialRequestCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSmartSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.query;

    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    // Calculate allergy and meal preference stats to generate smart suggestions
    const totalCount = await prisma.guest.count({ where });
    
    const nutAllergyCount = await prisma.guest.count({
      where: {
        ...where,
        allergies: { contains: 'nut', mode: 'insensitive' },
      },
    });

    const veganCount = await prisma.guest.count({
      where: {
        ...where,
        mealPreference: { equals: 'Vegan', mode: 'insensitive' },
      },
    });

    const suggestions = [];

    // Suggestion 1: Nut Allergy Overlap
    const nutPercent = totalCount > 0 ? (nutAllergyCount / totalCount) * 100 : 0;
    if (nutAllergyCount > 0) {
      suggestions.push({
        title: 'High Nut Allergy Overlap',
        description: `Based on current data, we recommend increasing the **Nut-Free** appetizer count by 15% due to high severe allergy overlap (${nutAllergyCount} guests).`,
        priority: 'HIGH',
        recommendedAction: 'Apply Recommendation',
      });
    }

    // Suggestion 2: Vegan Demand Increase
    const veganPercent = totalCount > 0 ? (veganCount / totalCount) * 100 : 0;
    if (veganPercent >= 15) {
      suggestions.push({
        title: 'Vegan Demand Increase',
        description: `Vegan preferences account for ${Math.round(veganPercent)}% of total. We suggest adding a second plant-based main course option.`,
        priority: 'MEDIUM',
        recommendedAction: 'Update Menu Options',
      });
    }

    // Suggestion 3: Ingredient Shortage Alert (Placeholder logic linked to Chef Summary warnings)
    suggestions.push({
      title: 'Ingredient Shortage Alert',
      description: 'Chicken Breast inventory is currently low (12 units remaining). Consider modifying the main course menu.',
      priority: 'CRITICAL',
      recommendedAction: 'Order Inventory',
    });

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

export const exportCateringData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, search, mealCategory, preference, allergy, guestCategory } = req.query;

    const where: any = {};

    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (preference && typeof preference === 'string' && preference !== 'All Preferences') {
      where.mealPreference = { equals: preference, mode: 'insensitive' };
    }

    if (allergy && typeof allergy === 'string' && allergy !== 'All Allergies') {
      if (allergy.toLowerCase() === 'none') {
        where.OR = [
          { allergies: { equals: 'None', mode: 'insensitive' } },
          { allergies: { equals: '' } },
          { allergies: null }
        ];
      } else if (allergy.toLowerCase() === 'has allergies') {
        where.NOT = [
          { allergies: { in: ['None', ''] } },
          { allergies: null }
        ];
      } else {
        where.allergies = { contains: allergy, mode: 'insensitive' };
      }
    }

    if (guestCategory && typeof guestCategory === 'string' && guestCategory !== 'All Categories') {
      const cat = guestCategory.toLowerCase();
      if (cat === 'vip') where.isVip = true;
      else if (cat === 'speaker') where.isSpeaker = true;
      else if (cat === 'family') where.isBridalParty = true;
      else if (cat === 'attendee') {
        where.isVip = false;
        where.isSpeaker = false;
        where.isBridalParty = false;
      }
    }

    if (mealCategory && typeof mealCategory === 'string' && mealCategory !== 'All Categories') {
      const mc = mealCategory.toLowerCase();
      if (mc === 'vegan') {
        where.mealPreference = { equals: 'Vegan', mode: 'insensitive' };
      } else if (mc === 'vegetarian') {
        where.mealPreference = { in: ['Vegetarian', 'Gluten-Free'] };
      } else if (mc === 'non-veg') {
        where.OR = [
          { mealPreference: { in: ['Non-Veg', 'Keto'] } },
          { mealPreference: null },
        ];
      }
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        assignedHotel: true,
        event: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const exportData = guests.map((g) => ({
      name: g.name,
      email: g.email,
      phone: g.phone,
      status: g.status,
      mealPreference: g.mealPreference || 'Non-Veg',
      allergies: g.allergies || 'None',
      guestCategory: getGuestCategory(g),
      eventTitle: g.event.title,
      hotelName: g.assignedHotel ? g.assignedHotel.name : 'N/A',
    }));

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    next(error);
  }
};
