const organizationRepository = require('../repositories/organization.repository');

class OrganizationService {
  /**
   * Get current organization settings.
   */
  async getOrganization() {
    const org = await organizationRepository.find();
    if (!org) {
      const error = new Error('Organization configuration not found');
      error.statusCode = 404;
      throw error;
    }
    return org;
  }

  /**
   * Update organization settings.
   */
  async updateOrganization(updateData) {
    const org = await organizationRepository.find();
    if (!org) {
      const error = new Error('Organization configuration not found');
      error.statusCode = 404;
      throw error;
    }
    return await organizationRepository.update(updateData);
  }

  /**
   * Replace organization logo path.
   */
  async updateLogo(logoUrl) {
    const org = await organizationRepository.find();
    if (!org) {
      const error = new Error('Organization configuration not found');
      error.statusCode = 404;
      throw error;
    }
    return await organizationRepository.updateLogo(logoUrl);
  }
}

module.exports = new OrganizationService();
