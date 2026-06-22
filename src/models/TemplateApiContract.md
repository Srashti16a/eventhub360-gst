# EventHub360 Templates Module API Contract Documentation

This document defines the REST API contract for the **Templates** module of the **EventHub360** backend application.

## Authentication & Context Headers
All endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing `created_by` / `updated_by`)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping maps to `company_id`)
* `X-Branch-ID`: `BIGINT` (Optional, maps to `branch_id`)

---

## 1. Create Template
Create a new template. Newly created templates start with `DRAFT` status.

* **URL**: `/api/v1/templates`
* **Method**: `POST`
* **Request Headers**:
  - `Content-Type: application/json`
  - `X-Company-ID: 10`
* **Request Body** (`TemplateCreateDTO`):
  ```json
  {
    "name": "Exclusive Event Invitation",
    "channel": "EMAIL",
    "category": "Invitation",
    "subject": "You are Invited!",
    "content": {
      "theme": {
        "backgroundColor": "#F4F6F9"
      },
      "blocks": [
        {
          "id": "block_1",
          "type": "text",
          "value": "Hello {{guest_name}},",
          "style": {
            "fontFamily": "Hanken Grotesk",
            "fontSize": "16px",
            "color": "#1F2937"
          }
        },
        {
          "id": "block_2",
          "type": "button",
          "label": "Confirm Your Attendance",
          "url": "https://eventhub360.com/rsvp/{{rsvp_token}}",
          "style": {
            "backgroundColor": "#E76F51",
            "color": "#FFFFFF",
            "borderRadius": "8px"
          }
        }
      ]
    },
    "variables": ["guest_name", "rsvp_token"]
  }
  ```
* **Success Response** (`201 Created` - `TemplateResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "template_id": 1,
      "name": "Exclusive Event Invitation",
      "channel": "EMAIL",
      "category": "Invitation",
      "status": "DRAFT",
      "subject": "You are Invited!",
      "content": {
        "theme": { "backgroundColor": "#F4F6F9" },
        "blocks": [
          { "id": "block_1", "type": "text", "value": "Hello {{guest_name}},", "style": { "fontFamily": "Hanken Grotesk", "fontSize": "16px", "color": "#1F2937" } },
          { "id": "block_2", "type": "button", "label": "Confirm Your Attendance", "url": "https://eventhub360.com/rsvp/{{rsvp_token}}", "style": { "backgroundColor": "#E76F51", "color": "#FFFFFF", "borderRadius": "8px" } }
        ]
      },
      "variables": ["guest_name", "rsvp_token"],
      "created_at": "2026-06-19T20:45:00.000Z",
      "updated_at": "2026-06-19T20:45:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Payload validation failed (e.g. missing name, invalid channel, missing subject for email).
    ```json
    {
      "success": false,
      "error": "Subject is required for Email templates"
    }
    ```

---

## 2. List Templates
Get a paginated list of active templates for the scoped company/tenant.

* **URL**: `/api/v1/templates`
* **Method**: `GET`
* **Query Parameters** (`TemplateQuerySchema`):
  - `page`: `INTEGER` (Default: `1`)
  - `limit`: `INTEGER` (Default: `10`, Max: `100`)
  - `channel`: `STRING` (Optional: `EMAIL` or `WHATSAPP`)
  - `status`: `STRING` (Optional: `DRAFT` or `PUBLISHED` or `ARCHIVED`)
  - `category`: `STRING` (Optional: e.g. `Invitation`)
  - `search`: `STRING` (Optional: Search template name)
* **Success Response** (`200 OK` - array of `TemplateListResponseDTO`):
  ```json
  {
    "success": true,
    "pagination": {
      "total": 24,
      "page": 1,
      "limit": 10,
      "pages": 3
    },
    "data": [
      {
        "template_id": 1,
        "name": "Exclusive Event Invitation",
        "channel": "EMAIL",
        "category": "Invitation",
        "status": "DRAFT",
        "created_at": "2026-06-19T20:45:00.000Z",
        "updated_at": "2026-06-19T20:45:00.000Z"
      }
    ]
  }
  ```

---

## 3. Read Template Details
Fetch a template by its primary identifier.

* **URL**: `/api/v1/templates/:id`
* **Method**: `GET`
* **Path Parameters**:
  - `id`: `BIGINT` (The template ID)
* **Success Response** (`200 OK` - `TemplateResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "template_id": 1,
      "name": "Exclusive Event Invitation",
      "channel": "EMAIL",
      "category": "Invitation",
      "status": "DRAFT",
      "subject": "You are Invited!",
      "content": { ... },
      "variables": ["guest_name", "rsvp_token"],
      "created_at": "2026-06-19T20:45:00.000Z",
      "updated_at": "2026-06-19T20:45:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - `404 Not Found`: Template does not exist or does not belong to the scoped tenant.
    ```json
    {
      "success": false,
      "error": "Template not found"
    }
    ```

---

## 4. Update Template
Update metadata or layout draft content of an existing template.

* **URL**: `/api/v1/templates/:id`
* **Method**: `PUT`
* **Path Parameters**:
  - `id`: `BIGINT`
* **Request Body** (`TemplateUpdateDTO`):
  ```json
  {
    "name": "Exclusive Invitation - Rev 2",
    "subject": "Your Invitation is waiting!",
    "content": {
      "theme": { "backgroundColor": "#FFFFFF" },
      "blocks": [
        { "id": "block_1", "type": "text", "value": "Hi {{guest_name}}," }
      ]
    }
  }
  ```
* **Success Response** (`200 OK` - `TemplateResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "template_id": 1,
      "name": "Exclusive Invitation - Rev 2",
      "channel": "EMAIL",
      "category": "Invitation",
      "status": "DRAFT",
      "subject": "Your Invitation is waiting!",
      "content": { ... },
      "variables": ["guest_name", "rsvp_token"],
      "created_at": "2026-06-19T20:45:00.000Z",
      "updated_at": "2026-06-19T20:55:00.000Z"
    }
  }
  ```

---

## 5. Delete Template
Soft-delete a template (marks `is_active` as `FALSE` in database).

* **URL**: `/api/v1/templates/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Template deleted successfully"
  }
  ```

---

## 6. Publish Template (Screen Action)
Publish the current draft content. This sets status to `PUBLISHED` and snapshots the content into a new record in `template_versions`.

* **URL**: `/api/v1/templates/:id/publish`
* **Method**: `POST`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Template published successfully",
    "data": {
      "template_id": 1,
      "status": "PUBLISHED",
      "version_number": 1
    }
  }
  ```

---

## 7. Preview Template (Screen Action)
Renders template body placeholders dynamically using variables passed in request body, returning intermediate raw layout/HTML representation.

* **URL**: `/api/v1/templates/:id/preview`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "variables": {
      "guest_name": "John Doe",
      "rsvp_token": "abc123xyz"
    }
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "channel": "EMAIL",
      "subject": "Your Invitation is waiting!",
      "rendered_content": {
        "theme": { "backgroundColor": "#FFFFFF" },
        "blocks": [
          { "id": "block_1", "type": "text", "value": "Hi John Doe," }
        ]
      }
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Missing mandatory dynamic parameters context required for interpolation.
    ```json
    {
      "success": false,
      "error": "Missing variable replacement context for: rsvp_token"
    }
    ```

---

## 8. Get Predefined System Variables (Screen Action)
Fetches dynamic variables registered in the system (e.g. event info, guest details) to populate builder dropdown fields.

* **URL**: `/api/v1/templates/variables`
* **Method**: `GET`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      { "name": "guest_name", "description": "Full name of the guest", "example": "John Doe" },
      { "name": "event_name", "description": "Name of the target event", "example": "Annual Summit 2026" },
      { "name": "event_date", "description": "Formatted date of the event", "example": "October 12, 2026" },
      { "name": "rsvp_token", "description": "Unique RSVP tracking identifier", "example": "rsvp_a892f" }
    ]
  }
  ```
