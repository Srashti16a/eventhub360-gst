# EventHub360 Magic Links Module API Contract Documentation

This document defines the REST API contract for the **Magic Link Generator** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing `created_by` / `updated_by`)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping maps to `company_id`)
* `X-Branch-ID`: `BIGINT` (Optional, maps to `branch_id`)
* `X-User-ID`: `BIGINT` (Optional, auditor fallback)

*Note: Public resolver endpoints (like `/api/v1/magic-links/resolve/:token`) do not mandate authentication headers.*

---

## 1. Create Magic Link
Generate an auto-login token for a selected guest.

* **URL**: `/api/v1/magic-links`
* **Method**: `POST`
* **Request Headers**:
  - `Content-Type: application/json`
  - `X-Company-ID: 10`
* **Request Body** (`MagicLinkCreateDTO`):
  ```json
  {
    "guest_id": 142,
    "expiration_type": "7 Days",
    "single_use": false,
    "ip_lockdown": true,
    "allowed_ip": "198.51.100.42"
  }
  ```
* **Success Response** (`201 Created` - `MagicLinkResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "magic_link_id": 482,
      "guest_id": 142,
      "guest_name": "Julianne Smith",
      "guest_category": "Premium Guest",
      "guest_phone": "+15550101",
      "token": "8f9ae7c8b201d47efea4908a8d11c9f4",
      "link_url": "https://eventhub360.com/rsvp/ml/8f9ae7c8b201d47efea4908a8d11c9f4",
      "expires_at": "2026-06-26T21:55:00.000Z",
      "single_use": false,
      "ip_lockdown": true,
      "allowed_ip": "198.51.100.42",
      "locked_ip": null,
      "use_count": 0,
      "max_uses": null,
      "is_revoked": false,
      "status": "Active",
      "qr_code_preview": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Feventhub360.com%2Frsvp%2Fml%2F8f9ae7c8b201d47efea4908a8d11c9f4",
      "created_at": "2026-06-19T21:55:00.000Z",
      "updated_at": "2026-06-19T21:55:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Payload validation failed (e.g. invalid IP address, missing guest_id).
    ```json
    {
      "success": false,
      "error": "Allowed IP must be a valid IPv4 or IPv6 address"
    }
    ```

---

## 2. Bulk Generate Magic Links
Generate magic links for a list of multiple guests in a single batch operation.

* **URL**: `/api/v1/magic-links/bulk`
* **Method**: `POST`
* **Request Headers**:
  - `Content-Type: application/json`
  - `X-Company-ID: 10`
* **Request Body** (`MagicLinkBulkCreateDTO`):
  ```json
  {
    "guest_ids": [142, 143, 144],
    "expiration_type": "24 Hours",
    "single_use": true,
    "ip_lockdown": false
  }
  ```
* **Success Response** (`201 Created` - array of `MagicLinkResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "magic_link_id": 483,
        "guest_id": 142,
        "guest_name": "Julianne Smith",
        "token": "8f9ae7c8b201d47efea4908a8d11c9f4",
        "link_url": "https://eventhub360.com/rsvp/ml/8f9ae7c8b201d47efea4908a8d11c9f4",
        "expires_at": "2026-06-20T21:55:00.000Z",
        "single_use": true,
        "ip_lockdown": false,
        "status": "Active",
        "created_at": "2026-06-19T21:55:00.000Z"
      },
      {
        "magic_link_id": 484,
        "guest_id": 143,
        "guest_name": "Marcus Wright",
        "token": "3x2be7c8b201d47efea4908a8d11c9f8",
        "link_url": "https://eventhub360.com/rsvp/ml/3x2be7c8b201d47efea4908a8d11c9f8",
        "expires_at": "2026-06-20T21:55:00.000Z",
        "single_use": true,
        "ip_lockdown": false,
        "status": "Active",
        "created_at": "2026-06-19T21:55:00.000Z"
      }
    ]
  }
  ```

---

## 3. List Magic Links
Get a paginated, filterable, and searchable list of active or inactive magic links.

* **URL**: `/api/v1/magic-links`
* **Method**: `GET`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Query Parameters** (`MagicLinkQuerySchema`):
  - `page`: `INTEGER` (Default: `1`)
  - `limit`: `INTEGER` (Default: `10`, Max: `100`)
  - `status`: `STRING` (Optional: `Active` | `Expiring Soon` | `Expired` | `Revoked` | `Used`)
  - `category`: `STRING` (Optional: e.g. `VIP Corporate`)
  - `search`: `STRING` (Optional: Search by Guest Name)
* **Success Response** (`200 OK` - array of `MagicLinkListResponseDTO`):
  ```json
  {
    "pagination": {
      "total": 284,
      "page": 1,
      "limit": 10,
      "pages": 29
    },
    "data": [
      {
        "magic_link_id": 482,
        "guest_id": 142,
        "guest_name": "Julianne Smith",
        "guest_category": "Premium Guest",
        "link_url": "https://eventhub360.com/rsvp/ml/8f9ae7c8b201d47efea4908a8d11c9f4",
        "created_at": "2026-06-19T21:55:00.000Z",
        "expires_at": "2026-06-26T21:55:00.000Z",
        "status": "Active",
        "use_count": 0
      }
    ]
  }
  ```

---

## 4. Get Dashboard Stats
Get aggregate metric counters for active, soon-to-expire, and total used links.

* **URL**: `/api/v1/magic-links/stats`
* **Method**: `GET`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Success Response** (`200 OK` - `MagicLinkStatsDTO`):
  ```json
  {
    "success": true,
    "data": {
      "totalActiveLinks": 1284,
      "expiringSoon": 42,
      "totalUses": 15800,
      "metricsTrends": {
        "totalActiveLinksChange": "+12%",
        "expiringSoonChange": "Critical Attention Required",
        "totalUsesLabel": "Lifetime"
      }
    }
  }
  ```

---

## 5. Read Magic Link Details
Fetch detailed settings and diagnostics for a specific magic link.

* **URL**: `/api/v1/magic-links/:id`
* **Method**: `GET`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Success Response** (`200 OK` - `MagicLinkResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "magic_link_id": 482,
      "guest_id": 142,
      "guest_name": "Julianne Smith",
      "guest_category": "Premium Guest",
      "token": "8f9ae7c8b201d47efea4908a8d11c9f4",
      "link_url": "https://eventhub360.com/rsvp/ml/8f9ae7c8b201d47efea4908a8d11c9f4",
      "expires_at": "2026-06-26T21:55:00.000Z",
      "single_use": false,
      "ip_lockdown": true,
      "allowed_ip": "198.51.100.42",
      "locked_ip": "198.51.100.42",
      "use_count": 3,
      "is_revoked": false,
      "status": "Active",
      "created_at": "2026-06-19T21:55:00.000Z"
    }
  }
  ```

---

## 6. Regenerate Magic Link
Recreate a secure token, reset IP locking rules, extend the expiry timeline from now, and reset usage counts.

* **URL**: `/api/v1/magic-links/:id/regenerate`
* **Method**: `POST`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Magic link regenerated successfully",
    "data": {
      "magic_link_id": 482,
      "guest_id": 142,
      "token": "new9ae7c8b201d47efea4908a8d11c9f4",
      "link_url": "https://eventhub360.com/rsvp/ml/new9ae7c8b201d47efea4908a8d11c9f4",
      "expires_at": "2026-06-26T22:00:00.000Z",
      "use_count": 0,
      "locked_ip": null,
      "status": "Active"
    }
  }
  ```

---

## 7. Revoke Magic Link
Immediately invalidate a link before its expiration date.

* **URL**: `/api/v1/magic-links/:id/revoke`
* **Method**: `POST`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Magic link revoked successfully",
    "data": {
      "magic_link_id": 482,
      "is_revoked": true,
      "status": "Revoked"
    }
  }
  ```

---

## 8. Distribute Magic Link
Distribute the generated link to the guest via email or WhatsApp messages.

* **URL**: `/api/v1/magic-links/:id/distribute`
* **Method**: `POST`
* **Request Headers**:
  - `Content-Type: application/json`
  - `X-Company-ID: 10`
* **Request Body**:
  ```json
  {
    "channel": "WHATSAPP"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Magic link successfully distributed to Julianne Smith via WHATSAPP"
  }
  ```

---

## 9. Export Magic Links
Download a flat CSV list of all generated magic links.

* **URL**: `/api/v1/magic-links/export`
* **Method**: `GET`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Success Response** (`200 OK`):
  - **Headers**:
    - `Content-Type: text/csv`
    - `Content-Disposition: attachment; filename=magic_links_export.csv`
  - **Body**:
    ```csv
    Guest Name,Guest Category,Link URL,Created Date,Expiry Date,Status,Uses
    "Julianne Smith","Premium Guest","https://eventhub360.com/rsvp/ml/8f9ae7c8b201d47efea4908a8d11c9f4",2026-06-19T21:55:00.000Z,2026-06-26T21:55:00.000Z,Active,0
    "Marcus Wright","VIP Corporate","https://eventhub360.com/rsvp/ml/3x2be7c8b201d47efea4908a8d11c9f8",2026-06-19T21:55:00.000Z,2026-06-20T21:55:00.000Z,Active,1
    ```

---

## 10. Public Resolve Entry Point
Resolves a link token, checks its security/expiration constraints, increments the usage count, and logs the access IP.

* **URL**: `/api/v1/magic-links/resolve/:token`
* **Method**: `GET`
* **Path Parameters**:
  - `token`: `STRING` (The unique 32-character magic link token)
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Token resolved successfully. Authentication granted.",
    "data": {
      "token": "8f9ae7c8b201d47efea4908a8d11c9f4",
      "guest_id": 142,
      "guest_name": "Julianne Smith",
      "redirect_url": "https://eventhub360.com/concierge/dashboard?auth_token=8f9ae7c8b201d47efea4908a8d11c9f4"
    }
  }
  ```
* **Forbidden Access Response** (`403 Forbidden` - e.g. IP locked or expired):
  ```json
  {
    "success": false,
    "error": "Link locked to a different IP address"
  }
  ```
