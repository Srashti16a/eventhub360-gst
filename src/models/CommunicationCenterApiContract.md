# EventHub360 Communication Center REST API Contract

## Global Headers
- `x-company-id` (Required, Integer): Scope of multi-tenant database queries.
- `x-branch-id` (Optional, Integer): Optional branch scope.
- `x-user-id` (Optional, Integer): ID of active operator context.
- `Content-Type` (Required, String): `application/json`

---

## 1. Templates Management

### Create Template
- **URL**: `/api/v1/communication-center/templates`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "VIP Gala Invitation",
    "channel": "Email",
    "subject": "You are invited to the VIP Gala!",
    "content": "Dear {{guest_name}}, we are pleased to invite you to our event on {{event_date}}.",
    "variables": ["guest_name", "event_date"]
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "company_id": 1,
      "branch_id": null,
      "name": "VIP Gala Invitation",
      "channel": "Email",
      "subject": "You are invited to the VIP Gala!",
      "content": "Dear {{guest_name}}, we are pleased to invite you to our event on {{event_date}}.",
      "variables": ["guest_name", "event_date"],
      "is_active": true,
      "created_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

### List Templates
- **URL**: `/api/v1/communication-center/templates`
- **Method**: `GET`
- **Query Parameters**:
  - `channel` (Optional, String): `Email` | `WhatsApp` | `SMS`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "company_id": 1,
        "name": "VIP Gala Invitation",
        "channel": "Email",
        "subject": "You are invited to the VIP Gala!",
        "content": "Dear {{guest_name}}, we are pleased to invite you to our event on {{event_date}}.",
        "variables": ["guest_name", "event_date"],
        "is_active": true,
        "created_at": "2026-06-23T12:00:00.000Z"
      }
    ]
  }
  ```

### Update Template
- **URL**: `/api/v1/communication-center/templates/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "subject": "VIP Gala Invitation (Updated)",
    "content": "Dear {{guest_name}}, updated welcome text."
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "company_id": 1,
      "name": "VIP Gala Invitation",
      "channel": "Email",
      "subject": "VIP Gala Invitation (Updated)",
      "content": "Dear {{guest_name}}, updated welcome text.",
      "variables": ["guest_name", "event_date"],
      "is_active": true,
      "created_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

### Delete Template
- **URL**: `/api/v1/communication-center/templates/:id`
- **Method**: `DELETE`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Template deleted successfully"
  }
  ```

---

## 2. Audience Segments

### Create Audience Segment
- **URL**: `/api/v1/communication-center/segments`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "VIP Guests",
    "description": "All VIP categories",
    "rules": {
      "category": "VIP"
    }
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "company_id": 1,
      "name": "VIP Guests",
      "description": "All VIP categories",
      "rules": {
        "category": "VIP"
      },
      "created_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

### List Audience Segments
- **URL**: `/api/v1/communication-center/segments`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "company_id": 1,
        "name": "VIP Guests",
        "description": "All VIP categories",
        "rules": {
          "category": "VIP"
        },
        "created_at": "2026-06-23T12:00:00.000Z"
      }
    ]
  }
  ```

### Delete Audience Segment
- **URL**: `/api/v1/communication-center/segments/:id`
- **Method**: `DELETE`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Segment deleted successfully"
  }
  ```

### Fetch Segment Members (Cached)
- **URL**: `/api/v1/communication-center/segments/:id/members`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "segment_id": 2,
        "guest_id": 101,
        "guest_name": "Julianne Abernathy",
        "guest_email": "julianne.abernathy@company.com",
        "guest_phone": "+1 (555) 019-9000",
        "guest_category": "VIP",
        "created_at": "2026-06-23T12:00:00.000Z"
      }
    ]
  }
  ```

### Resolve and Re-Cache Segment Members
- **URL**: `/api/v1/communication-center/segments/:id/resolve`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "segment_id": 2,
        "guest_id": 101,
        "guest_name": "Julianne Abernathy",
        "guest_email": "julianne.abernathy@company.com",
        "guest_phone": "+1 (555) 019-9000",
        "guest_category": "VIP",
        "created_at": "2026-06-23T12:00:00.000Z"
      }
    ]
  }
  ```

---

## 3. Campaigns

### Create Campaign
- **URL**: `/api/v1/communication-center/campaigns`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "event_id": 1,
    "name": "VIP Welcomes",
    "channel": "Email",
    "template_id": 1,
    "segment_id": 2
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "company_id": 1,
      "branch_id": null,
      "event_id": 1,
      "name": "VIP Welcomes",
      "channel": "Email",
      "template_id": 1,
      "segment_id": 2,
      "status": "Draft",
      "created_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

### List Campaigns
- **URL**: `/api/v1/communication-center/campaigns`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (Optional, Default: 1)
  - `limit` (Optional, Default: 10)
  - `search` (Optional)
  - `channel` (Optional)
  - `status` (Optional)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    },
    "data": [
      {
        "id": 3,
        "company_id": 1,
        "event_id": 1,
        "name": "VIP Welcomes",
        "channel": "Email",
        "template_id": 1,
        "segment_id": 2,
        "status": "Draft",
        "created_at": "2026-06-23T12:00:00.000Z",
        "event_name": "Tech Conference 2026",
        "template_name": "VIP Gala Invitation",
        "segment_name": "VIP Guests"
      }
    ]
  }
  ```

### Update Campaign
- **URL**: `/api/v1/communication-center/campaigns/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "name": "Updated Campaign Title"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "company_id": 1,
      "name": "Updated Campaign Title",
      "channel": "Email",
      "template_id": 1,
      "segment_id": 2,
      "status": "Draft"
    }
  }
  ```

### Fetch Campaign Details
- **URL**: `/api/v1/communication-center/campaigns/:id`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "company_id": 1,
      "event_id": 1,
      "name": "Updated Campaign Title",
      "channel": "Email",
      "template_id": 1,
      "segment_id": 2,
      "status": "Draft"
    }
  }
  ```

### Schedule Broadcast
- **URL**: `/api/v1/communication-center/campaigns/:id/schedule`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "scheduled_time": "2026-06-24T18:00:00.000Z"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "campaign_id": 3,
      "scheduled_time": "2026-06-24T18:00:00.000Z",
      "status": "Pending",
      "created_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

### Publish Campaign (Immediate Dispatch)
- **URL**: `/api/v1/communication-center/campaigns/:id/publish`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "company_id": 1,
      "name": "Updated Campaign Title",
      "channel": "Email",
      "template_id": 1,
      "segment_id": 2,
      "status": "Completed"
    }
  }
  ```

### List Campaign Recipients
- **URL**: `/api/v1/communication-center/campaigns/:id/recipients`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    },
    "data": [
      {
        "id": 8,
        "campaign_id": 3,
        "guest_id": 101,
        "delivery_status": "Delivered",
        "error_message": null,
        "sent_at": "2026-06-23T12:05:00.000Z",
        "opened_at": null,
        "clicked_at": null,
        "guest_name": "Julianne Abernathy",
        "guest_email": "julianne.abernathy@company.com",
        "guest_phone": "+1 (555) 019-9000"
      }
    ]
  }
  ```

### Fetch Campaign Analytics
- **URL**: `/api/v1/communication-center/campaigns/:id/analytics`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "campaign_id": 3,
      "channel": "Email",
      "total_recipients_count": 1,
      "sent_count": 1,
      "delivered_count": 1,
      "opened_count": 0,
      "clicked_count": 0,
      "failed_count": 0,
      "bounce_rate": 0,
      "open_rate": 0,
      "click_rate": 0
    }
  }
  ```

---

## 4. Interaction Trackers (Webhooks)

### Track Interaction (Open / Click)
- **URL**: `/api/v1/communication-center/webhooks/track`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "recipient_id": 8,
    "action": "Opened"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 8,
      "campaign_id": 3,
      "guest_id": 101,
      "delivery_status": "Opened",
      "opened_at": "2026-06-23T12:10:00.000Z"
    }
  }
  ```

---

## 5. Opt-Out Registry

### Opt-Out / Subscribe Guest Preferences
- **URL**: `/api/v1/communication-center/opt-out`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "guest_id": 101,
    "channel": "Email",
    "opt_out": true
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "company_id": 1,
      "guest_id": 101,
      "channel": "Email",
      "opt_out": true,
      "updated_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

---

## 6. Logs & Performance Dashboards

### Get Channel Health Performance Dashboard
- **URL**: `/api/v1/communication-center/health`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "channel": "Email",
        "total_sent": 100,
        "total_delivered": 95,
        "total_opened": 60,
        "total_clicked": 25,
        "total_failed": 5,
        "delivery_rate": 95,
        "bounce_rate": 5,
        "open_rate": 60,
        "click_rate": 25
      },
      {
        "channel": "WhatsApp",
        "total_sent": 0,
        "total_delivered": 0,
        "total_opened": 0,
        "total_clicked": 0,
        "total_failed": 0,
        "delivery_rate": 0,
        "bounce_rate": 0,
        "open_rate": 0,
        "click_rate": 0
      }
    ]
  }
  ```

### Get Communication Transactional Logs
- **URL**: `/api/v1/communication-center/logs`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (Optional, Default: 1)
  - `limit` (Optional, Default: 10)
  - `channel` (Optional)
  - `status` (Optional)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    },
    "data": [
      {
        "id": 1,
        "company_id": 1,
        "campaign_id": 3,
        "guest_id": 101,
        "channel": "Email",
        "recipient_address": "julianne.abernathy@company.com",
        "status": "Delivered",
        "sent_at": "2026-06-23T12:05:00.000Z",
        "campaign_name": "VIP Welcomes",
        "guest_name": "Julianne Abernathy"
      }
    ]
  }
  ```
