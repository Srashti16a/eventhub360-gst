const express = require('express');
const groupController = require('../controllers/group.controller');
const validate = require('../middlewares/validation');
const {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
} = require('../validations/group.validation');

const router = express.Router();

/**
 * @openapi
 * /api/v1/groups/dashboard:
 *   get:
 *     summary: Retrieve group dashboard statistics
 *     description: Fetch key metrics for guest groups of an event, including total groups, active groups, VIP groups, and average group size.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID to retrieve statistics for.
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_groups:
 *                       type: integer
 *                       example: 5
 *                     active_groups:
 *                       type: integer
 *                       example: 5
 *                     vip_groups:
 *                       type: integer
 *                       example: 2
 *                     average_group_size:
 *                       type: number
 *                       format: float
 *                       example: 2.33
 *       400:
 *         description: Missing or invalid event query parameter.
 */
router.get('/dashboard', groupController.getDashboardStats);

/**
 * @openapi
 * /api/v1/groups:
 *   post:
 *     summary: Create guest group
 *     description: Register a new guest group (such as a family, table, or seating tier) for an event.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - event_id
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 60
 *                 description: Group label/name.
 *               event_id:
 *                 type: integer
 *                 description: Event ID associated with the group.
 *               tenant_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               branch_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Group created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Guest group created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     group_id:
 *                       type: string
 *                       example: "4"
 *                     name:
 *                       type: string
 *                       example: New Group Name
 *                     event_id:
 *                       type: string
 *                       example: "200"
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Validation failed.
 */
router.post('/', validate(createGroupSchema, 'body'), groupController.createGroup);

/**
 * @openapi
 * /api/v1/groups:
 *   get:
 *     summary: Get all groups
 *     description: Retrieve all guest groups for an event, complete with primary guest details, member counts, and group categories, supporting paginated search.
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID to query groups for.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search phrase matching group name.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page.
 *     responses:
 *       200:
 *         description: Groups retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       group_id:
 *                         type: string
 *                         example: "1"
 *                       event_id:
 *                         type: string
 *                         example: "200"
 *                       group_name:
 *                         type: string
 *                         example: Sharma Group
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                       members_count:
 *                         type: integer
 *                         example: 2
 *                       category:
 *                         type: string
 *                         example: Family
 *                       status:
 *                         type: string
 *                         example: Confirmed
 *                       primary_guest:
 *                         type: object
 *                         properties:
 *                           guest_id:
 *                             type: string
 *                             example: "1"
 *                           name:
 *                             type: string
 *                             example: Sharma Family
 *                           phone:
 *                             type: string
 *                             example: "+919876543210"
 *                           category:
 *                             type: string
 *                             example: Family
 *                           rsvp_status:
 *                             type: string
 *                             example: yes
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Missing or invalid event query parameter.
 */
router.get('/', groupController.getGroups);

/**
 * @openapi
 * /api/v1/groups/{groupId}:
 *   get:
 *     summary: Get group details
 *     description: Retrieve comprehensive group details, primary seating location, dietary preference statistics, and member information.
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID to retrieve details for.
 *     responses:
 *       200:
 *         description: Group details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     group_id:
 *                       type: string
 *                       example: "1"
 *                     group_name:
 *                       type: string
 *                       example: Sharma Group
 *                     transportation_type:
 *                       type: string
 *                       example: Standard
 *                     special_requirements:
 *                       type: string
 *                       example: None
 *                     primary_location:
 *                       type: string
 *                       example: T7
 *                     dietary_needs_count:
 *                       type: integer
 *                       example: 2
 *                     primary_guest:
 *                       type: object
 *                       properties:
 *                         guest_id:
 *                           type: string
 *                           example: "1"
 *                         name:
 *                           type: string
 *                           example: Sharma Family
 *                         phone:
 *                           type: string
 *                           example: "+919876543210"
 *                         category:
 *                           type: string
 *                           example: Family
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           guest_id:
 *                             type: string
 *                             example: "1"
 *                           event_guest_id:
 *                             type: string
 *                             example: "1"
 *                           name:
 *                             type: string
 *                             example: Sharma Family
 *                           phone:
 *                             type: string
 *                             example: "+919876543210"
 *                           category:
 *                             type: string
 *                             example: Family
 *                           rsvp_status:
 *                             type: string
 *                             example: yes
 *                           rsvp_pax:
 *                             type: integer
 *                             example: 4
 *                           table_no:
 *                             type: string
 *                             example: T7
 *                           seat_no:
 *                             type: string
 *                             example: S1
 *                           meal_preferences:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Veg", "Allergy: Peanuts"]
 *       404:
 *         description: Guest group not found.
 */
router.get('/:groupId', groupController.getGroupById);

/**
 * @openapi
 * /api/v1/groups/{groupId}:
 *   patch:
 *     summary: Update group
 *     description: Update name and/or active status of a guest group.
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 60
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Group updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Guest group updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     group_id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: Updated Group Name
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Guest group not found.
 */
router.patch('/:groupId', validate(updateGroupSchema, 'body'), groupController.updateGroup);

/**
 * @openapi
 * /api/v1/groups/{groupId}/members:
 *   post:
 *     summary: Add member to group
 *     description: Assign a guest invitation to a specific guest group. Updates the existing invitation mapping or registers a new invitation mapping.
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID to add member to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guest_id
 *             properties:
 *               guest_id:
 *                 type: integer
 *                 description: Guest ID of the member to add.
 *     responses:
 *       200:
 *         description: Member added to group successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Member added to group successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     event_guest_id:
 *                       type: string
 *                       example: "1"
 *                     group_id:
 *                       type: string
 *                       example: "1"
 *                     guest_id:
 *                       type: string
 *                       example: "1"
 *       404:
 *         description: Group or Guest not found.
 */
router.post('/:groupId/members', validate(addMemberSchema, 'body'), groupController.addMember);

/**
 * @openapi
 * /api/v1/groups/{groupId}/members/{guestId}:
 *   delete:
 *     summary: Remove member from group
 *     description: Un-assign a guest from a guest group, resetting their group assignment (invitation is NOT deleted).
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID.
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Guest ID to remove from group.
 *     responses:
 *       200:
 *         description: Member removed successfully.
 *       400:
 *         description: Guest is not a member of the specified group.
 *       404:
 *         description: Group not found.
 */
router.delete('/:groupId/members/:guestId', groupController.removeMember);

module.exports = router;
