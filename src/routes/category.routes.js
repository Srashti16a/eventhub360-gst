const express = require('express');
const categoryController = require('../controllers/category.controller');
const validate = require('../middlewares/validation');
const {
  assignCategorySchema,
  queryCategorySchema,
} = require('../validations/category.validation');

const router = express.Router();

/**
 * @openapi
 * /api/v1/categories/dashboard:
 *   get:
 *     summary: Retrieve category dashboard statistics
 *     description: Fetch distribution metrics of guest classifications, including attendee counts and total registered guests.
 *     parameters:
 *       - in: query
 *         name: event
 *         schema:
 *           type: integer
 *         description: Event ID to scope statistics for.
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully.
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
 *                     total_guests:
 *                       type: integer
 *                       example: 1248
 *                     distribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: VIP
 *                           priority:
 *                             type: string
 *                             example: Critical Priority
 *                           attendee_count:
 *                             type: integer
 *                             example: 42
 *       400:
 *         description: Invalid query parameters.
 */
router.get(
  '/dashboard',
  validate(queryCategorySchema, 'query'),
  categoryController.getDashboardStats
);

/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     summary: List guest categories
 *     description: Retrieve list of guest category classifications, complete with attendee count and priority level mappings.
 *     parameters:
 *       - in: query
 *         name: event
 *         schema:
 *           type: integer
 *         description: Event ID to scope category listings for.
 *     responses:
 *       200:
 *         description: Categories retrieved successfully.
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
 *                       category:
 *                         type: string
 *                         example: Speaker
 *                       priority:
 *                         type: string
 *                         example: High Priority
 *                       attendee_count:
 *                         type: integer
 *                         example: 28
 *       400:
 *         description: Invalid query parameters.
 */
router.get('/', validate(queryCategorySchema, 'query'), categoryController.getCategories);

/**
 * @openapi
 * /api/v1/categories/{category}:
 *   get:
 *     summary: Get category details
 *     description: Retrieve category priority classification, guest count, and detailed profile listings of guests belonging to this category.
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name (e.g. VIP, Speaker, Sponsor).
 *       - in: query
 *         name: event
 *         schema:
 *           type: integer
 *         description: Event ID to scope guest lists for.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter guests by name or phone.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Category details retrieved successfully.
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
 *                     category:
 *                       type: string
 *                       example: VIP
 *                     priority:
 *                       type: string
 *                       example: Critical Priority
 *                     count:
 *                       type: integer
 *                       example: 42
 *                     guests:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 42
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 5
 *       400:
 *         description: Invalid query or path parameters.
 */
router.get(
  '/:category',
  validate(queryCategorySchema, 'query'),
  categoryController.getCategoryDetails
);

/**
 * @openapi
 * /api/v1/categories/assign/{guestId}:
 *   patch:
 *     summary: Assign category to guest
 *     description: Assign or update the category classification of a specific guest.
 *     parameters:
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Guest ID to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *             properties:
 *               category:
 *                 type: string
 *                 maxLength: 20
 *                 example: Speaker
 *     responses:
 *       200:
 *         description: Guest category assigned successfully.
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
 *                   example: Guest category assigned successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     guest_id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: Sharma Family
 *                     category:
 *                       type: string
 *                       example: Speaker
 *       400:
 *         description: Validation failed or invalid guestId.
 *       404:
 *         description: Guest not found.
 */
router.patch(
  '/assign/:guestId',
  validate(assignCategorySchema, 'body'),
  categoryController.assignCategory
);

module.exports = router;
