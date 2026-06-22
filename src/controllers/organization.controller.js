const organizationService = require('../services/organization.service');

class OrganizationController {
  /**
   * GET /api/v1/organization
   * Retrieve current organization configurations.
   */
  async getOrganization(req, res, next) {
    try {
      const data = await organizationService.getOrganization();
      return res.status(200).json({
        success: true,
        data,
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
   * PATCH /api/v1/organization
   * Edit organization settings.
   */
  async updateOrganization(req, res, next) {
    try {
      const data = await organizationService.updateOrganization(req.body);
      return res.status(200).json({
        success: true,
        message: 'Organization configuration updated successfully',
        data,
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
   * POST /api/v1/organization/logo
   * Upload or assign a new logo to the organization.
   */
  async updateLogo(req, res, next) {
    try {
      const { logo } = req.body;
      const data = await organizationService.updateLogo(logo);
      return res.status(200).json({
        success: true,
        message: 'Organization logo updated successfully',
        data,
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

module.exports = new OrganizationController();
