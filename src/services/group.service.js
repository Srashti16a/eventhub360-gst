const db = require('../config/db');
const groupRepository = require('../repositories/group.repository');

class GroupService {
  /**
   * Create a guest group.
   */
  async createGroup(groupData) {
    return await groupRepository.create(groupData);
  }

  /**
   * Get groups for an event with filters and pagination.
   */
  async getGroups(eventId, filters = {}) {
    const limit = parseInt(filters.limit || 10, 10);
    const page = parseInt(filters.page || 1, 10);

    const rows = await groupRepository.findAll(eventId, filters);
    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;

    // Clean total_count property from output rows
    const groups = rows.map((row) => {
      const { total_count, ...groupInfo } = row;
      return groupInfo;
    });

    return {
      groups,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get detailed group metadata and member list.
   */
  async getGroupById(groupId) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      const error = new Error('Guest group not found');
      error.statusCode = 404;
      throw error;
    }
    return group;
  }

  /**
   * Update group properties.
   */
  async updateGroup(groupId, updateData) {
    const group = await groupRepository.findGroupOnlyById(groupId);
    if (!group) {
      const error = new Error('Guest group not found');
      error.statusCode = 404;
      throw error;
    }
    return await groupRepository.update(groupId, updateData);
  }

  /**
   * Add a guest to a group.
   */
  async addMember(groupId, guestId) {
    // 1. Verify group exists
    const group = await groupRepository.findGroupOnlyById(groupId);
    if (!group) {
      const error = new Error('Guest group not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify guest exists
    const guestCheck = await db.query(
      'SELECT guest_id FROM guest WHERE guest_id = $1 AND is_active = TRUE',
      [guestId]
    );
    if (guestCheck.rows.length === 0) {
      const error = new Error('Guest not found');
      error.statusCode = 404;
      throw error;
    }

    // 3. Add guest to the group (creates or updates event_guest junction row)
    return await groupRepository.addMember(groupId, guestId, group);
  }

  /**
   * Remove a guest from a group (un-maps group_id).
   */
  async removeMember(groupId, guestId) {
    // 1. Verify group exists
    const group = await groupRepository.findGroupOnlyById(groupId);
    if (!group) {
      const error = new Error('Guest group not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Remove member mapping
    const result = await groupRepository.removeMember(groupId, guestId);
    if (!result) {
      const error = new Error('Guest is not a member of this group or is inactive');
      error.statusCode = 400;
      throw error;
    }
    return result;
  }

  /**
   * Get metrics dashboard statistics for an event.
   */
  async getDashboardStats(eventId) {
    if (!eventId) {
      const error = new Error("Query parameter 'event' is required");
      error.statusCode = 400;
      throw error;
    }
    return await groupRepository.getDashboardStats(eventId);
  }
}

module.exports = new GroupService();
