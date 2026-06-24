# EventHub360 Kiosk Guest Self-Registration REST API Contract

## Global Headers
- `x-company-id` (Required, Integer): Scope of multi-tenant database queries.
- `x-user-id` (Optional, Integer): ID of active operator context.
- `Content-Type` (Required, String): `application/json`

---

## 1. Kiosk Devices Registry

### Register Kiosk Device
- **URL**: `/api/v1/kiosk-registration/devices`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "device_name": "Main Gate Kiosk A",
    "device_code": "KSK-01",
    "location": "Grand Ballroom Foyer",
    "status": "Active"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "device_name": "Main Gate Kiosk A",
      "device_code": "KSK-01",
      "location": "Grand Ballroom Foyer",
      "status": "Active",
      "last_seen": "2026-06-23T11:50:00.000Z",
      "created_at": "2026-06-23T11:50:00.000Z"
    }
  }
  ```

### List Kiosk Devices
- **URL**: `/api/v1/kiosk-registration/devices`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "device_name": "Main Gate Kiosk A",
        "device_code": "KSK-01",
        "location": "Grand Ballroom Foyer",
        "status": "Active",
        "last_seen": "2026-06-23T11:50:00.000Z",
        "created_at": "2026-06-23T11:50:00.000Z"
      }
    ]
  }
  ```

### Update Kiosk Device
- **URL**: `/api/v1/kiosk-registration/devices/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "Maintenance"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "device_name": "Main Gate Kiosk A",
      "device_code": "KSK-01",
      "location": "Grand Ballroom Foyer",
      "status": "Maintenance",
      "last_seen": "2026-06-23T11:52:00.000Z"
    }
  }
  ```

---

## 2. Kiosk Health Monitoring

### Fetch Health Overview
- **URL**: `/api/v1/kiosk-registration/health`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "online_kiosks_count": 3,
      "offline_kiosks_count": 1,
      "active_sessions_count": 5,
      "pending_assistance_alerts": 1
    }
  }
  ```

---

## 3. Kiosk Sessions

### Start Registration Session
- **URL**: `/api/v1/kiosk-registration/sessions/start`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "kiosk_device_id": 1
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 15,
      "kiosk_device_id": 1,
      "guest_id": null,
      "session_start": "2026-06-23T11:55:00.000Z",
      "session_end": null,
      "status": "Active"
    }
  }
  ```

### End Registration Session
- **URL**: `/api/v1/kiosk-registration/sessions/:id/end`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "status": "Abandoned"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 15,
      "kiosk_device_id": 1,
      "guest_id": null,
      "session_start": "2026-06-23T11:55:00.000Z",
      "session_end": "2026-06-23T11:57:30.000Z",
      "status": "Abandoned"
    }
  }
  ```

---

## 4. Business Card Scanner

### Scan Card & Autofill Form (OCR)
- **URL**: `/api/v1/kiosk-registration/cards/scan`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "image_url": "https://s3.amazonaws.com/eventhub360/cards/card_123.jpg"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 4,
      "guest_id": null,
      "image_url": "https://s3.amazonaws.com/eventhub360/cards/card_123.jpg",
      "ocr_data": {
        "first_name": "Julianne",
        "last_name": "Abernathy",
        "email": "julianne.abernathy@company.com",
        "company": "Global Hospitality Group",
        "job_title": "Hospitality Director",
        "phone": "+1 (555) 019-9000"
      },
      "processing_status": "Completed"
    }
  }
  ```

---

## 5. Profile Photo Capture

### Attach Guest Photo
- **URL**: `/api/v1/kiosk-registration/photos/capture`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "guest_id": 102,
    "photo_url": "https://s3.amazonaws.com/eventhub360/photos/guest_102.jpg",
    "capture_source": "Kiosk Camera"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 9,
      "guest_id": 102,
      "photo_url": "https://s3.amazonaws.com/eventhub360/photos/guest_102.jpg",
      "capture_source": "Kiosk Camera"
    }
  }
  ```

---

## 6. Self-Service Guest Registration

### Register & Print Badge Workflow
- **URL**: `/api/v1/kiosk-registration/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "session_id": 15,
    "event_id": 1,
    "first_name": "Julianne",
    "last_name": "Abernathy",
    "email": "julianne.abernathy@company.com",
    "company": "Global Hospitality Group",
    "job_title": "Hospitality Director",
    "phone": "+1 (555) 019-9000",
    "category": "VIP",
    "photo_url": "https://s3.amazonaws.com/eventhub360/photos/guest_102.jpg",
    "card_scan_id": 4
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "guest_id": 102,
      "name": "Julianne Abernathy",
      "email": "julianne.abernathy@company.com",
      "company": "Global Hospitality Group",
      "qr_pass_code": "EH-VIP-A78F23",
      "print_job_id": 18,
      "queue_entry_id": 12
    }
  }
  ```

---

## 7. Concierge Assistance Requests

### Trigger Assistance Alert
- **URL**: `/api/v1/kiosk-registration/assist`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "kiosk_device_id": 1,
    "message": "Out of badge card stock paper / printing error at Main Gate Kiosk A"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Concierge notification dispatched successfully. Help is on the way!"
  }
  ```

---

## 8. Multi-Language Settings

### List Active Kiosk Languages
- **URL**: `/api/v1/kiosk-registration/languages`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "language_code": "en",
        "language_name": "English",
        "is_active": true
      },
      {
        "id": 2,
        "language_code": "es",
        "language_name": "Español",
        "is_active": true
      }
    ]
  }
  ```

### Save Kiosk Language
- **URL**: `/api/v1/kiosk-registration/languages`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "language_code": "fr",
    "language_name": "Français",
    "is_active": true
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "language_code": "fr",
      "language_name": "Français",
      "is_active": true
    }
  }
  ```

---

## 9. Registration Queue Management

### Fetch Registration Queue
- **URL**: `/api/v1/kiosk-registration/queue`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 12,
        "guest_id": 102,
        "queue_status": "Approved",
        "priority": 2,
        "guest_name": "Julianne Abernathy",
        "guest_email": "julianne.abernathy@company.com",
        "guest_company": "Global Hospitality Group",
        "guest_category": "VIP"
      }
    ]
  }
  ```

### Update Queue Item
- **URL**: `/api/v1/kiosk-registration/queue/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "priority": 3,
    "queue_status": "Printed"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 12,
      "guest_id": 102,
      "queue_status": "Printed",
      "priority": 3
    }
  }
  ```

### Delete Queue Item
- **URL**: `/api/v1/kiosk-registration/queue/:id`
- **Method**: `DELETE`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Queue entry removed successfully"
  }
  ```
