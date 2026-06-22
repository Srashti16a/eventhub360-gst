const groupService = require('../services/group.service');

class GroupController {
  /**
   * POST /api/v1/groups
   * Creates a new guest group.
   */
  async createGroup(req, res, next) {
    try {
      const result = await groupService.createGroup(req.body);
      return res.status(201).json({
        success: true,
        message: 'Guest group created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/groups
   * Lists guest groups for an event with search filters and pagination.
   */
  async getGroups(req, res, next) {
    try {
      const { event, search, page, limit } = req.query;

      if (!event) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' (event_id) is required",
        });
      }

      const eventId = parseInt(event, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' must be a valid integer",
        });
      }

      const filters = { search, page, limit };
      const result = await groupService.getGroups(eventId, filters);

      return res.status(200).json({
        success: true,
        data: result.groups,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/groups/dashboard
   * Retrieves dashboard statistics/metrics for guest groups in an event.
   */
  async getDashboardStats(req, res, next) {
    try {
      const { event } = req.query;

      if (!event) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' (event_id) is required",
        });
      }

      const eventId = parseInt(event, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'event' must be a valid integer",
        });
      }

      const stats = await groupService.getDashboardStats(eventId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/groups/:groupId
   * Retrieves detailed group metadata and member profiles.
   */
  async getGroupById(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = parseInt(groupId, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Group ID must be a valid integer',
        });
      }

      const group = await groupService.getGroupById(id);

      return res.status(200).json({
        success: true,
        data: group,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * PATCH /api/v1/groups/:groupId
   * Updates guest group details (name/is_active).
   */
  async updateGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = parseInt(groupId, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Group ID must be a valid integer',
        });
      }

      const result = await groupService.updateGroup(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Guest group updated successfully',
        data: result,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/groups/:groupId/members
   * Adds a member (guest) to a group.
   */
  async addMember(req, res, next) {
    try {
      const { groupId } = req.params;
      const { guest_id } = req.body;

      const groupIntId = parseInt(groupId, 10);
      if (isNaN(groupIntId)) {
        return res.status(400).json({
          success: false,
          message: 'Group ID must be a valid integer',
        });
      }

      const result = await groupService.addMember(groupIntId, guest_id);

      return res.status(200).json({
        success: true,
        message: 'Member added to group successfully',
        data: result,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/v1/groups/:groupId/members/:guestId
   * Removes a member (guest) from a group.
   */
  async removeMember(req, res, next) {
    try {
      const { groupId, guestId } = req.params;

      const groupIntId = parseInt(groupId, 10);
      const guestIntId = parseInt(guestId, 10);

      if (isNaN(groupIntId) || isNaN(guestIntId)) {
        return res.status(400).json({
          success: false,
          message: 'Group ID and Guest ID must be valid integers',
        });
      }

      const result = await groupService.removeMember(groupIntId, guestIntId);

      return res.status(200).json({
        success: true,
        message: 'Member removed from group successfully',
        data: result,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

module.exports = new GroupController();
