const db = require('../config/db');
const categoryRepository = require('../repositories/category.repository');

class CategoryService {
  /**
   * Get dashboard statistics for guest categories.
   */
  async getDashboardStats(eventId = null) {
    const counts = await categoryRepository.getCounts(eventId);

    const countMap = {};
    counts.forEach((row) => {
      countMap[row.category] = parseInt(row.count, 10);
    });

    const categoryPriorities = {
      'VIP': 'Critical Priority',
      'Speaker': 'High Priority',
      'Sponsor': 'High Priority',
      'Media': 'Medium Priority',
      'Staff': 'Low Priority',
      'Guest': 'Low Priority',
    };

    const predefinedList = ['VIP', 'Speaker', 'Sponsor', 'Media', 'Staff', 'Guest'];
    const distribution = [];
    let totalGuests = 0;

    // First process predefined categories in order to preserve sequential presentation
    predefinedList.forEach((cat) => {
      const count = countMap[cat] || 0;
      totalGuests += count;
      distribution.push({
        category: cat,
        priority: categoryPriorities[cat],
        attendee_count: count,
      });
      delete countMap[cat];
    });

    // Process any custom categories returned by the DB
    Object.keys(countMap).forEach((cat) => {
      const count = countMap[cat];
      totalGuests += count;
      distribution.push({
        category: cat,
        priority: categoryPriorities[cat] || 'Low Priority',
        attendee_count: count,
      });
    });

    return {
      total_guests: totalGuests,
      distribution,
    };
  }

  /**
   * List all guest categories with priorities and attendee counts.
   */
  async getCategories(eventId = null) {
    const { distribution } = await this.getDashboardStats(eventId);
    return distribution;
  }

  /**
   * Get detail statistics and paginated guest listing for a specific category.
   */
  async getCategoryDetails(categoryName, eventId = null, filters = {}) {
    const categoryPriorities = {
      'VIP': 'Critical Priority',
      'Speaker': 'High Priority',
      'Sponsor': 'High Priority',
      'Media': 'Medium Priority',
      'Staff': 'Low Priority',
      'Guest': 'Low Priority',
    };

    const limit = parseInt(filters.limit || 10, 10);
    const page = parseInt(filters.page || 1, 10);

    const rows = await categoryRepository.findGuestsByCategory(categoryName, eventId, filters);
    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;

    // Remove the window count parameter from the returning items
    const guests = rows.map((row) => {
      const { total_count, ...guestInfo } = row;
      return guestInfo;
    });

    return {
      category: categoryName,
      priority: categoryPriorities[categoryName] || 'Low Priority',
      count: total,
      guests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Assign/Update a guest's category.
   */
  async assignCategory(guestId, category) {
    // 1. Verify guest exists
    const guestCheck = await db.query(
      'SELECT guest_id FROM guest WHERE guest_id = $1 AND is_active = TRUE',
      [guestId]
    );

    if (guestCheck.rows.length === 0) {
      const error = new Error('Guest not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Perform the update
    return await categoryRepository.assignCategory(guestId, category);
  }
}

module.exports = new CategoryService();
