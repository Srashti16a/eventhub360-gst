/**
 * Templates Data Transfer Objects (DTOs)
 */

class TemplateCreateDTO {
    /**
     * @param {Object} data
     * @param {string} data.name
     * @param {'EMAIL' | 'WHATSAPP'} data.channel
     * @param {string} [data.category]
     * @param {string} [data.subject]
     * @param {Object} [data.content]
     * @param {string[]} [data.variables]
     */
    constructor(data) {
        this.name = data.name;
        this.channel = data.channel;
        this.category = data.category || 'Invitation';
        this.subject = data.subject || null;
        this.content = data.content || {};
        this.variables = data.variables || [];
    }
}

class TemplateUpdateDTO {
    /**
     * @param {Object} data
     * @param {string} [data.name]
     * @param {string} [data.category]
     * @param {string} [data.subject]
     * @param {Object} [data.content]
     * @param {string[]} [data.variables]
     */
    constructor(data) {
        if (data.name !== undefined) this.name = data.name;
        if (data.category !== undefined) this.category = data.category;
        if (data.subject !== undefined) this.subject = data.subject;
        if (data.content !== undefined) this.content = data.content;
        if (data.variables !== undefined) this.variables = data.variables;
    }
}

class TemplateResponseDTO {
    /**
     * Map Template Entity to response body
     * @param {import('./Template')} template 
     */
    constructor(template) {
        this.template_id = template.template_id;
        this.name = template.name;
        this.channel = template.channel;
        this.category = template.category;
        this.status = template.status;
        this.subject = template.subject;
        this.content = template.content;
        this.variables = template.variables;
        this.created_at = template.created_at ? template.created_at.toISOString() : null;
        this.updated_at = template.updated_at ? template.updated_at.toISOString() : null;
    }
}

class TemplateListResponseDTO {
    /**
     * Map Template Entity to a compact list item format
     * @param {import('./Template')} template 
     */
    constructor(template) {
        this.template_id = template.template_id;
        this.name = template.name;
        this.channel = template.channel;
        this.category = template.category;
        this.status = template.status;
        this.created_at = template.created_at ? template.created_at.toISOString() : null;
        this.updated_at = template.updated_at ? template.updated_at.toISOString() : null;
    }
}

module.exports = {
    TemplateCreateDTO,
    TemplateUpdateDTO,
    TemplateResponseDTO,
    TemplateListResponseDTO
};
