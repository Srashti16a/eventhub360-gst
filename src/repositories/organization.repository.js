const db = require('../config/db');

class OrganizationRepository {
  /**
   * Retrieve the organization configuration (assumed single company record, org_id = 1).
   */
  async find() {
    const queryText = `
      SELECT company_name, tax_id, address, timezone, currency, logo
      FROM organization
      WHERE org_id = 1
      LIMIT 1
    `;
    const { rows } = await db.query(queryText);
    return rows[0] || null;
  }

  /**
   * Update organization configuration parameters.
   */
  async update(updateData) {
    const fields = [];
    const values = [];
    let counter = 1;

    const allowedFields = ['company_name', 'tax_id', 'address', 'timezone', 'currency'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${counter}`);
        values.push(updateData[field]);
        counter++;
      }
    });

    if (fields.length === 0) return await this.find();

    const queryText = `
      UPDATE organization
      SET ${fields.join(', ')}
      WHERE org_id = 1
      RETURNING company_name, tax_id, address, timezone, currency, logo
    `;

    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  /**
   * Update the organization logo path or URL.
   */
  async updateLogo(logoUrl) {
    const queryText = `
      UPDATE organization
      SET logo = $1
      WHERE org_id = 1
      RETURNING company_name, tax_id, address, timezone, currency, logo
    `;
    const { rows } = await db.query(queryText, [logoUrl]);
    return rows[0];
  }
}

module.exports = new OrganizationRepository();
