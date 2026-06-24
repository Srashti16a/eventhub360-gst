# EventHub360 QR Pass Center Module API Contract Documentation

This document defines the REST API contract for the **QR Pass Center** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing context)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping)
* `X-Branch-ID`: `BIGINT` (Optional)

Hardware device verification requests require device scoping authentication headers instead of JWT credentials:
* `X-Device-Token`: `VARCHAR(64)` (Cryptographic token unique per registered scanner device)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping)

---

## 1. Dashboard Statistics Endpoints

### 1.1 Read QR Pass Dashboard Analytics
Retrieve telemetry statistics for active passes, scan ratios, delivery queues, and cryptographic security indices.

* **URL**: `/api/qr-passes/dashboard`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
* **Success Response** (`200 OK` - `QrPassDashboardDTO`):
  ```json
  {
    "success": true,
    "data": {
      "totalPasses": {
        "count": 2482,
        "label": "Total Passes Generated",
        "trend": "+12%"
      },
      "scannedActive": {
        "count": 1894,
        "label": "Scanned/Active",
        "trend": "+8%"
      },
      "pendingDelivery": {
        "count": 128,
        "label": "Pending Delivery",
        "trend": "Stable"
      },
      "securityHealth": {
        "percentage": 99.9,
        "label": "Security Health",
        "status": "Optimal"
      }
    }
  }
  ```

---

## 2. Pass Registry & Preview Endpoints

### 2.1 List Pass Registry Log
Retrieve a paginated, searchable, and filterable index of all generated passes and statuses.

* **URL**: `/api/qr-passes/registry`
* **Method**: `GET`
* **Query Parameters** (`registryQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, event context)
  - `page`: `INTEGER` (Default: `1`)
  - `limit`: `INTEGER` (Default: `10`)
  - `search`: `STRING` (Optional: Search by guest name or email)
  - `pass_type`: `STRING` (Optional: `VIP` | `Attendee` | `Staff` | `Media` | `Vendor`)
  - `status`: `STRING` (Optional: `Active` | `Scanned` | `Revoked` | `Expired`)
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "pagination": {
      "total": 2482,
      "page": 1,
      "limit": 4,
      "pages": 621
    },
    "data": [
      {
        "pass_id": 501,
        "guest_id": 1401,
        "guest_name": "Alexander Thorne",
        "guest_email": "a.thorne@eventhub.com",
        "pass_code": "EH-VIP-2901",
        "pass_type": "VIP",
        "status": "Active",
        "expires_at": "2024-10-12",
        "created_at": "2026-06-22T08:00:00.000Z"
      },
      {
        "pass_id": 502,
        "guest_id": 1402,
        "guest_name": "Elena Rodriguez",
        "guest_email": "elena.r@innovate.net",
        "pass_code": "EH-ATT-B742",
        "pass_type": "Attendee",
        "status": "Scanned",
        "expires_at": "2024-10-12",
        "created_at": "2026-06-22T08:15:00.000Z"
      },
      {
        "pass_id": 503,
        "guest_id": 1403,
        "guest_name": "Marcus Chen",
        "guest_email": "m.chen@eventhub.com",
        "pass_code": "EH-STA-F893",
        "pass_type": "Staff",
        "status": "Active",
        "expires_at": "2024-10-12",
        "created_at": "2026-06-22T08:30:00.000Z"
      },
      {
        "pass_id": 504,
        "guest_id": 1404,
        "guest_name": "Sophia Lang",
        "guest_email": "sophia.lang@media.de",
        "pass_code": "EH-VIP-C924",
        "pass_type": "VIP",
        "status": "Revoked",
        "expires_at": "2024-10-12",
        "created_at": "2026-06-22T08:45:00.000Z"
      }
    ]
  }
  ```

### 2.2 Get QR Pass Preview (Preview Panel)
Read details of a pass, including its QR server CDN URL, security SHA-256 hash validation state, and recent gate scan logs.

* **URL**: `/api/qr-passes/registry/:passId/preview`
* **Method**: `GET`
* **Success Response** (`200 OK` - `QrPassPreviewDTO`):
  ```json
  {
    "success": true,
    "data": {
      "pass_id": 501,
      "guest_name": "Alexander Thorne",
      "guest_email": "a.thorne@eventhub.com",
      "pass_code": "EH-VIP-2901",
      "pass_type": "VIP",
      "status": "Active",
      "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EH-VIP-2901:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "expires_at": "2024-10-12",
      "security": {
        "verified": true,
        "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "label": "VIP ACCESS GRANTED"
      },
      "recentScans": [
        {
          "scan_id": 901,
          "scan_location": "Grand Ballroom Entrance",
          "scanned_by": "Agent Smith",
          "scan_status": "Valid",
          "scanned_at": "2026-06-22T19:20:00.000Z"
        },
        {
          "scan_id": 895,
          "scan_location": "Valet Parking Zone 1",
          "scanned_by": "Automatic Scanner",
          "scan_status": "Valid",
          "scanned_at": "2026-06-22T19:08:00.000Z"
        }
      ]
    }
  }
  ```

---

## 3. Pass Generation & Dispatch Endpoints

### 3.1 Generate Pass
Create a QR Pass code and secure signature hash for a guest.

* **URL**: `/api/qr-passes/generate`
* **Method**: `POST`
* **Request Body** (`generatePassSchema`):
  ```json
  {
    "guest_id": 1401,
    "pass_type": "VIP",
    "expires_at": "2024-10-12T23:59:59.000Z"
  }
  ```
* **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "QR pass generated successfully",
    "data": {
      "pass_id": 501,
      "company_id": 1,
      "guest_id": 1401,
      "pass_code": "EH-VIP-2901",
      "pass_type": "VIP",
      "status": "Active",
      "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EH-VIP-2901:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "security_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "expires_at": "2024-10-12T23:59:59.000Z"
    }
  }
  ```

### 3.2 Batch Passes Generation (Generate Batch)
Create passes in bulk for multiple guest IDs (or all remaining event guests if `guest_ids` omitted).

* **URL**: `/api/qr-passes/batch-generate`
* **Method**: `POST`
* **Request Body** (`generateBatchPassSchema`):
  ```json
  {
    "event_id": 501,
    "pass_type": "Attendee",
    "guest_ids": [1402, 1405, 1408],
    "expires_at": "2024-10-12T23:59:59.000Z"
  }
  ```
* **Success Response** (`202 Accepted` - `BatchGenerationResponseDTO`):
  ```json
  {
    "success": true,
    "message": "Batch QR passes generation started",
    "data": {
      "batch_id": 41,
      "event_id": 501,
      "pass_type": "Attendee",
      "total_passes": 3,
      "generated_count": 3,
      "status": "Completed",
      "progress_percentage": 100
    }
  }
  ```

### 3.3 Dispatch Pass (Email / WhatsApp Dispatch)
Deliver the generated QR pass via Email or WhatsApp.

* **URL**: `/api/qr-passes/registry/:passId/deliver`
* **Method**: `POST`
* **Request Body** (`deliverPassSchema`):
  ```json
  {
    "channel": "WhatsApp",
    "recipient_address": "+15551234567"
  }
  ```
* **Success Response** (`200 OK` - `QrPassDeliveryTrackDTO`):
  ```json
  {
    "success": true,
    "message": "QR pass delivered successfully",
    "data": {
      "delivery_id": 801,
      "pass_id": 501,
      "channel": "WhatsApp",
      "recipient_address": "+15551234567",
      "status": "Delivered",
      "sent_at": "2026-06-22T19:25:00.000Z",
      "delivered_at": "2026-06-22T19:25:02.000Z"
    }
  }
  ```

---

## 4. Hardware Scanner & Gate Control Endpoints

### 4.1 Verify and Track Gate Scan (Device Check-In API)
Verify a QR code scanned at a hardware entrance gate, performing SHA signature verification.

* **URL**: `/api/qr-passes/scan-verify`
* **Method**: `POST`
* **Headers**:
  - `X-Device-Token`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b` (Cryptographic scanner key)
* **Request Body** (`scanVerifySchema`):
  ```json
  {
    "pass_code": "EH-VIP-2901",
    "scan_location": "Grand Ballroom Entrance",
    "scanned_by": "Agent Smith"
  }
  ```
* **Success Response** (`200 OK` - Valid / Duplicate scans):
  ```json
  {
    "success": true,
    "data": {
      "verified": true,
      "status": "Valid",
      "message": "Access Granted: VIP pass code validation successful. Welcome Alexander Thorne."
    }
  }
  ```
* **Error Response** (`403 Forbidden` - Invalid / Tampered / Revoked / Expired scans):
  ```json
  {
    "success": false,
    "data": {
      "verified": false,
      "status": "Tampered",
      "message": "Security Alert: QR Pass signature invalid. Tampering detected."
    }
  }
  ```

### 4.2 Register Scanner Device
Authorizes a new hardware scanner gate device and generates a crypto key token.

* **URL**: `/api/qr-passes/devices/register`
* **Method**: `POST`
* **Request Body** (`registerScannerDeviceSchema`):
  ```json
  {
    "device_name": "Main Hall Entrance Gate 2",
    "device_type": "Automatic"
  }
  ```
* **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Scanner device registered successfully",
    "data": {
      "device_id": 6,
      "device_name": "Main Hall Entrance Gate 2",
      "device_type": "Automatic",
      "status": "Active",
      "access_token": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    }
  }
  ```

---

## 5. Pass Revocations Endpoints

### 5.1 Revoke QR Pass
Revokes access validation for a pass in the registry.

* **URL**: `/api/qr-passes/registry/:passId/revoke`
* **Method**: `POST`
* **Request Body** (`revokePassSchema`):
  ```json
  {
    "revocation_reason": "Guest canceled booking invitation"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "QR pass revoked successfully"
  }
  ```

---

## 6. Logs & Exports Endpoints

### 6.1 Export Scan Logs
Download a CSV of scan validation logs for the event.

* **URL**: `/api/qr-passes/export-logs`
* **Method**: `GET`
* **Query Parameters** (`exportLogsQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory)
  - `start_date`: `DATE` (Optional)
  - `end_date`: `DATE` (Optional)
* **Success Response** (`200 OK` - CSV stream download):
  ```csv
  Scan ID,Pass Code,Guest Name,Location,Scanned By,Status,Timestamp
  "901","EH-VIP-2901","Alexander Thorne","Grand Ballroom Entrance","Agent Smith","Valid","2026-06-22T19:20:00.000Z"
  "895","EH-ATT-B742","Elena Rodriguez","Valet Parking Zone 1","Auto","Valid","2026-06-22T19:08:00.000Z"
  ```
