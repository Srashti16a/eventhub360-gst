# EventHub360 Badge Printing REST API Contract

## Global Headers
All HTTP requests require the following authentication and multi-tenant context headers:
- `x-company-id` (Required, Integer): Scope of multi-tenant database queries.
- `x-user-id` (Optional, Integer): ID of active operator.
- `Content-Type` (Required, String): `application/json`

---

## 1. Badge Templates Registry

### Create Badge Template
- **URL**: `/api/v1/badge-printing/templates`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "event_id": 1,
    "template_name": "VIP Gala Portrait Style",
    "orientation": "Portrait",
    "card_size": "4x6",
    "include_qr": true,
    "include_logo": true,
    "show_job_title": true,
    "center_alignment": true
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "event_id": 1,
      "template_name": "VIP Gala Portrait Style",
      "orientation": "Portrait",
      "card_size": "4x6",
      "include_qr": true,
      "include_logo": true,
      "show_job_title": true,
      "center_alignment": true,
      "created_at": "2026-06-23T11:45:00.000Z"
    }
  }
  ```

### List Badge Templates
- **URL**: `/api/v1/badge-printing/templates`
- **Method**: `GET`
- **Query Params**:
  - `event_id` (Required, Integer)
  - `page` (Optional, Integer, default: 1)
  - `limit` (Optional, Integer, default: 10)
- **Response** (200 OK):
  ```json
  {
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    },
    "data": [
      {
        "id": 1,
        "event_id": 1,
        "template_name": "VIP Gala Portrait Style",
        "orientation": "Portrait",
        "card_size": "4x6",
        "include_qr": true,
        "include_logo": true,
        "show_job_title": true,
        "center_alignment": true,
        "created_at": "2026-06-23T11:45:00.000Z"
      }
    ]
  }
  ```

### Update Badge Template
- **URL**: `/api/v1/badge-printing/templates/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "orientation": "Landscape",
    "center_alignment": false
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "event_id": 1,
      "template_name": "VIP Gala Portrait Style",
      "orientation": "Landscape",
      "card_size": "4x6",
      "include_qr": true,
      "include_logo": true,
      "show_job_title": true,
      "center_alignment": false,
      "created_at": "2026-06-23T11:45:00.000Z"
    }
  }
  ```

### Delete Badge Template
- **URL**: `/api/v1/badge-printing/templates/:id`
- **Method**: `DELETE`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Badge template deleted successfully"
  }
  ```

### Generate Print Preview
- **URL**: `/api/v1/badge-printing/templates/preview`
- **Method**: `GET`
- **Query Params**:
  - `guest_id` (Required, Integer)
  - `template_id` (Optional, Integer)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "template": {
        "id": 1,
        "template_name": "VIP Gala Portrait Style",
        "orientation": "Portrait",
        "card_size": "4x6",
        "include_qr": true,
        "include_logo": true,
        "show_job_title": true,
        "center_alignment": true
      },
      "badge_data": {
        "guest_id": 102,
        "name": "Julianne Abernathy",
        "company": "Global Hospitality Group",
        "role": "VIP",
        "job_title": "Hospitality Director",
        "qr_code_enabled": true,
        "qr_code_value": "EH-VIP-E8C2B3",
        "logo_enabled": true,
        "center_aligned": true,
        "orientation": "Portrait",
        "card_size": "4x6"
      },
      "rendering": {
        "width_px": 400,
        "height_px": 600,
        "font_family": "Outfit, Inter, sans-serif",
        "primary_color": "#D4AF37"
      }
    }
  }
  ```

---

## 2. Printer Registry

### Register Printer
- **URL**: `/api/v1/badge-printing/printers`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "printer_name": "Main Gate ZD621",
    "printer_code": "PRN-ZD621-01",
    "location": "Check-in Gate B1",
    "status": "Online",
    "paper_status": "OK"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 5,
      "printer_name": "Main Gate ZD621",
      "printer_code": "PRN-ZD621-01",
      "location": "Check-in Gate B1",
      "status": "Online",
      "paper_status": "OK",
      "last_seen": "2026-06-23T11:45:00.000Z"
    }
  }
  ```

### List Printers
- **URL**: `/api/v1/badge-printing/printers`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "printer_name": "Main Gate ZD621",
        "printer_code": "PRN-ZD621-01",
        "location": "Check-in Gate B1",
        "status": "Online",
        "paper_status": "OK",
        "last_seen": "2026-06-23T11:45:00.000Z"
      }
    ]
  }
  ```

### Trigger Test Print
- **URL**: `/api/v1/badge-printing/printers/:id/test-print`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Test print pattern sent successfully to printer: Main Gate ZD621"
  }
  ```

---

## 3. Printer Alerts

### List Active Alerts
- **URL**: `/api/v1/badge-printing/alerts`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 12,
        "printer_id": 5,
        "alert_type": "Paper Empty",
        "severity": "Critical",
        "message": "Printer is out of paper / badge stock",
        "status": "Active",
        "printer_name": "Main Gate ZD621",
        "created_at": "2026-06-23T11:46:00.000Z"
      }
    ]
  }
  ```

### Resolve Alert
- **URL**: `/api/v1/badge-printing/alerts/:id/resolve`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Alert status successfully resolved"
  }
  ```

---

## 4. Live Print Queue Management

### Fetch Live Print Queue
- **URL**: `/api/v1/badge-printing/queue`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 3,
        "print_job_id": 8,
        "queue_position": 1,
        "status": "Pending",
        "job": {
          "id": 8,
          "guest_id": 102,
          "job_status": "Pending",
          "priority": 2,
          "requested_at": "2026-06-23T11:47:00.000Z",
          "guest_name": "Julianne Abernathy",
          "guest_role": "VIP"
        }
      }
    ]
  }
  ```

### Reorder Print Queue
- **URL**: `/api/v1/badge-printing/queue/reorder`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "queue_item_ids": [5, 3, 8]
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Print queue re-prioritized successfully"
  }
  ```

### Clear Print Queue
- **URL**: `/api/v1/badge-printing/queue/clear`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Print queue cleared successfully"
  }
  ```

---

## 5. Single Badge Print Jobs

### Trigger Single Badge Print
- **URL**: `/api/v1/badge-printing/jobs`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "guest_id": 102,
    "template_id": 1,
    "printer_id": 5,
    "priority": 1
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 8,
      "guest_id": 102,
      "template_id": 1,
      "printer_id": 5,
      "job_status": "Pending",
      "priority": 1,
      "requested_at": "2026-06-23T11:47:00.000Z",
      "guest_name": "Julianne Abernathy",
      "guest_role": "VIP"
    }
  }
  ```

### List Badge Print History Logs
- **URL**: `/api/v1/badge-printing/jobs`
- **Method**: `GET`
- **Query Params**:
  - `page` (Optional, Integer, default: 1)
  - `limit` (Optional, Integer, default: 10)
  - `status` (Optional, String, filter job status)
  - `printer_id` (Optional, Integer)
- **Response** (200 OK):
  ```json
  {
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    },
    "data": [
      {
        "id": 8,
        "guest_id": 102,
        "template_id": 1,
        "printer_id": 5,
        "job_status": "Completed",
        "priority": 1,
        "requested_at": "2026-06-23T11:47:00.000Z",
        "completed_at": "2026-06-23T11:48:30.000Z",
        "guest_name": "Julianne Abernathy",
        "guest_role": "VIP"
      }
    ]
  }
  ```

### Cancel Active Print Job
- **URL**: `/api/v1/badge-printing/jobs/:id/cancel`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Print job cancelled successfully"
  }
  ```

### Retry Failed Print Job
- **URL**: `/api/v1/badge-printing/jobs/:id/retry`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Print job retry scheduled"
  }
  ```

### Recover All Failed Prints
- **URL**: `/api/v1/badge-printing/jobs/recover-failed`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Successfully recovered and re-queued 3 failed print jobs"
  }
  ```

### Export History Logs
- **URL**: `/api/v1/badge-printing/jobs/export`
- **Method**: `GET`
- **Query Params**:
  - `printer_id` (Optional, Integer)
- **Response** (200 OK):
  CSV file layout response (formatted string payload).

---

## 6. Batch Badge Generations

### Trigger Batch Badge Print
- **URL**: `/api/v1/badge-printing/batches`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "event_id": 1,
    "batch_name": "Gala Speakers Morning Batch",
    "guest_ids": [102, 103, 104],
    "template_id": 1,
    "printer_id": 5
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 9,
      "event_id": 1,
      "batch_name": "Gala Speakers Morning Batch",
      "total_badges": 3,
      "generated_count": 3,
      "status": "Completed",
      "created_at": "2026-06-23T11:50:00.000Z"
    }
  }
  ```

### List Batches
- **URL**: `/api/v1/badge-printing/batches`
- **Method**: `GET`
- **Query Params**:
  - `page` (Optional, Integer, default: 1)
  - `limit` (Optional, Integer, default: 10)
- **Response** (200 OK):
  ```json
  {
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    },
    "data": [
      {
        "id": 9,
        "event_id": 1,
        "batch_name": "Gala Speakers Morning Batch",
        "total_badges": 3,
        "generated_count": 3,
        "status": "Completed",
        "created_at": "2026-06-23T11:50:00.000Z"
      }
    ]
  }
  ```

---

## 7. Badge Configurations

### Fetch Badge Configuration
- **URL**: `/api/v1/badge-printing/configurations/:eventId`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "event_id": 1,
      "default_template_id": 1,
      "auto_generate_qr": true,
      "auto_print_on_checkin": false
    }
  }
  ```

### Save Badge Configuration
- **URL**: `/api/v1/badge-printing/configurations`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "event_id": 1,
    "default_template_id": 1,
    "auto_generate_qr": true,
    "auto_print_on_checkin": true
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "event_id": 1,
      "default_template_id": 1,
      "auto_generate_qr": true,
      "auto_print_on_checkin": true,
      "created_at": "2026-06-23T11:55:00.000Z"
    }
  }
  ```
