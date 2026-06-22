const express = require('express');
const organizationController = require('../controllers/organization.controller');
const validate = require('../middlewares/validation');
const {
  updateOrganizationSchema,
  uploadLogoSchema,
} = require('../validations/organization.validation');

const router = express.Router();

/**
 * @openapi
 * /api/v1/organization:
 *   get:
 *     summary: Retrieve organization configurations
 *     description: Fetch current organization General Information settings such as Company Name, Tax ID, Address, Timezone, Currency, and Logo.
 *     responses:
 *       200:
 *         description: Organization settings retrieved successfully.
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
 *                     company_name:
 *                       type: string
 *                       example: Grand Hyatt Grand Regency
 *                     tax_id:
 *                       type: string
 *                       example: US-99-2345678
 *                     address:
 *                       type: string
 *                       example: 102 Boutique Square, Luxury District, San Francisco, CA 94103
 *                     timezone:
 *                       type: string
 *                       example: Pacific Standard Time (PST)
 *                     currency:
 *                       type: string
 *                       example: USD ($)
 *                     logo:
 *                       type: string
 *                       example: https://example.com/logo.png
 *       404:
 *         description: Configuration not found.
 */
router.get('/', organizationController.getOrganization);

/**
 * @openapi
 * /api/v1/organization:
 *   patch:
 *     summary: Update organization settings
 *     description: Update General Information parameters for the organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *                 maxLength: 120
 *               tax_id:
 *                 type: string
 *                 maxLength: 50
 *               address:
 *                 type: string
 *               timezone:
 *                 type: string
 *                 maxLength: 100
 *               currency:
 *                 type: string
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Settings updated successfully.
 *       404:
 *         description: Configuration not found.
 */
router.patch(
  '/',
  validate(updateOrganizationSchema, 'body'),
  organizationController.updateOrganization
);

/**
 * @openapi
 * /api/v1/organization/logo:
 *   post:
 *     summary: Replace organization logo
 *     description: Replace the organization logo image URL or base64 resource.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logo updated successfully.
 *       404:
 *         description: Configuration not found.
 */
router.post(
  '/logo',
  validate(uploadLogoSchema, 'body'),
  organizationController.updateLogo
);

module.exports = router;
