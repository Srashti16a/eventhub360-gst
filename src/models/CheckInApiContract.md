# EventHub360 Check-In & Scanner Operations Module API Contract Documentation

This document defines the REST API contract for the **Check-In & QR Scanner Operations** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing context)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping)
* `X-Branch-ID`: `BIGINT` (Optional)

Entrance gate verification requests made by scanner devices require device scoping authentication headers instead of JWT credentials:
* `X-Device-Token`: `VARCHAR(64)` (Cryptographic token unique per registered scanner device)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping)

---

## 1. Live Check-In Dashboard Endpoints

### 1.1 Read Check-In Dashboard Metrics
Retrieve live attendance stats, VIP arrivals ratios, real-time peak flow velocities, and estimated completion times.

* **URL**: `/api/checkin/dashboard`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
* **Success Response** (`200 OK` - `CheckInDashboardDTO`):
  ```json
  {
    "success": true,
    "data": {
      "totalExpected": {
        "count": 2450,
        "label": "Total Expected",
        "trend": "+12%"
      },
      "currentAttendance": {
        "percentage": 68,
        "checkedInCount": 1668,
        "label": "Current Attendance",
        "details": "68% (1,668 guests)"
      },
      "vipsOnSite": {
        "checkedIn": 142,
        "total": 180,
        "label": "VIPs On-Site",
        "ratio": "142/180"
      },
      "peakFlowRate": {
        "rate": 18.0,
        "label": "Peak Flow Rate",
        "details": "18 p/min",
        "status": "Real-time"
      },
      "capacityCircle": {
        "fill": 68,
        "subtitle": "Estimated completion by 20:30"
      }
    }
  }
  ```

### 1.2 Read Recent Check-Ins Activity Feed
Get a feed list of the most recent guests successfully checked in at gates.

* **URL**: `/api/checkin/feeds`
* **Method**: `GET`
* **Query Parameters**:
  - `event_id`: `INTEGER` (Mandatory)
  - `limit`: `INTEGER` (Default: `5`)
* **Success Response** (`200 OK` - array of `CheckInRecordResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "checkin_record_id": 1205,
        "guest_id": 401,
        "guest_name": "Marcus Wright",
        "guest_category": "VIP",
        "checkin_time": "19:42:01",
        "checkin_method": "QR Scan",
        "status": "Success",
        "gate_name": "Main Ballroom",
        "pass_code": "EH-VIP-2902"
      },
      {
        "checkin_record_id": 1204,
        "guest_id": 402,
        "guest_name": "Sarah Koenig",
        "guest_category": "Attendee",
        "checkin_time": "19:41:45",
        "checkin_method": "QR Scan",
        "status": "Success",
        "gate_name": "North Gate",
        "pass_code": "EH-ATT-D894"
      },
      {
        "checkin_record_id": 1203,
        "guest_id": 403,
        "guest_name": "James Rockford",
        "guest_category": "VIP",
        "checkin_time": "19:40:58",
        "checkin_method": "Manual",
        "status": "Flagged",
        "gate_name": "Main Ballroom",
        "pass_code": "Manual"
      },
      {
        "checkin_record_id": 1202,
        "guest_id": 404,
        "guest_name": "Linda Blair",
        "guest_category": "VIP",
        "checkin_time": "19:39:12",
        "checkin_method": "QR Scan",
        "status": "Success",
        "gate_name": "VIP Lounge",
        "pass_code": "EH-VIP-7382"
      }
    ]
  }
  ```

---

## 2. VIP Arrival Alerts Endpoints

### 2.1 Read Unread VIP Arrivals Feed
Fetch unread alerts triggered automatically when VIP guests check-in, including zone/table assignments.

* **URL**: `/api/checkin/vip-alerts`
* **Method**: `GET`
* **Query Parameters**:
  - `event_id`: `INTEGER` (Mandatory)
* **Success Response** (`200 OK` - array of `VipArrivalAlertResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "alert_id": 51,
        "guest_id": 302,
        "guest_name": "Elena Valance",
        "guest_category": "Platinum VIP",
        "arrival_time": "2026-06-22T19:40:15.000Z",
        "alert_status": "Unread",
        "table_number": "Table 12",
        "gate_name": "Main Hallway Entrance"
      },
      {
        "alert_id": 52,
        "guest_id": 303,
        "guest_name": "Sir Richard Branson",
        "guest_category": "Keynote Speaker",
        "arrival_time": "2026-06-22T19:37:12.000Z",
        "alert_status": "Unread",
        "table_number": "Green Room",
        "gate_name": "VIP Gate"
      }
    ]
  }
  ```

### 2.2 Mark VIP Alert Read
Marks a VIP alert read.

* **URL**: `/api/checkin/vip-alerts/:alertId/read`
* **Method**: `PUT`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Alert marked as read"
  }
  ```

---

## 3. Check-In Processing Endpoints

### 3.1 Manual Guest Check-In (Manual Override)
Checks in a guest manually.

* **URL**: `/api/checkin/manual`
* **Method**: `POST`
* **Request Body** (`manualCheckInSchema`):
  ```json
  {
    "event_id": 501,
    "guest_id": 403,
    "entry_gate_id": 2,
    "status": "Success"
  }
  ```
* **Success Response** (`201 Created` - `CheckInRecordResponseDTO`):
  ```json
  {
    "success": true,
    "message": "Manual check-in override successful",
    "data": {
      "checkin_record_id": 1206,
      "guest_id": 403,
      "guest_name": "James Rockford",
      "guest_category": "VIP",
      "checkin_time": "19:45:00",
      "checkin_method": "Manual",
      "status": "Success",
      "gate_name": "Main Ballroom",
      "pass_code": "Manual"
    }
  }
  ```

### 3.2 QR Pass Gate Scanner Check-In (Entrance QR Check-In)
Validates scanned QR pass codes at the gates.

* **URL**: `/api/checkin/qr-scan`
* **Method**: `POST`
* **Headers**:
  - `X-Device-Token`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b` (Cryptographic scanner key)
* **Request Body** (`qrScanCheckInSchema`):
  ```json
  {
    "event_id": 501,
    "pass_code": "EH-VIP-2902",
    "entry_gate_id": 2
  }
  ```
* **Success Response** (`200 OK` - `CheckInRecordResponseDTO`):
  ```json
  {
    "success": true,
    "message": "QR check-in validated successfully",
    "data": {
      "checkin_record_id": 1205,
      "guest_id": 401,
      "guest_name": "Marcus Wright",
      "guest_category": "VIP",
      "checkin_time": "19:42:01",
      "checkin_method": "QR Scan",
      "status": "Success",
      "gate_name": "Main Ballroom",
      "pass_code": "EH-VIP-2902"
    }
  }
  ```

---

## 4. Guest Security Flagging Endpoints

### 4.1 Flag Guest (Security Flag Alert)
Adds a security flag to a guest, marking any check-in record as 'Flagged'.

* **URL**: `/api/checkin/flags`
* **Method**: `POST`
* **Request Body** (`guestFlagCreateSchema`):
  ```json
  {
    "guest_id": 403,
    "event_id": 501,
    "flag_reason": "Suspected duplicate invitation token scanning attempt"
  }
  ```
* **Success Response** (`201 Created` - `GuestFlagResponseDTO`):
  ```json
  {
    "success": true,
    "message": "Guest flagged successfully",
    "data": {
      "flag_id": 14,
      "guest_id": 403,
      "guest_name": "James Rockford",
      "flag_reason": "Suspected duplicate invitation token scanning attempt",
      "flag_status": "Flagged",
      "created_at": "2026-06-22T19:40:58.000Z"
    }
  }
  ```

### 4.2 Review Guest Security Flag
Updates flag resolution status ('Reviewed' or 'Resolved').

* **URL**: `/api/checkin/flags/:flagId`
* **Method**: `PUT`
* **Request Body** (`guestFlagReviewSchema`):
  ```json
  {
    "flag_status": "Resolved"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Flag status reviewed successfully",
    "data": {
      "flag_id": 14,
      "flag_status": "Resolved",
      "reviewed_by": 1
    }
  }
  ```

---

## 5. Entry Gates Monitoring Endpoints

### 5.1 Read Entry Gates Metrics
Fetch gate statuses ('Clear Flow', 'Queuing') and 15-minute entrance velocities.

* **URL**: `/api/checkin/gates`
* **Method**: `GET`
* **Query Parameters**:
  - `event_id`: `INTEGER` (Mandatory)
* **Success Response** (`200 OK` - array of `EntryGateResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "entry_gate_id": 1,
        "gate_name": "North Gate",
        "gate_type": "Main Entrance",
        "capacity_limit": 500,
        "status": "Clear Flow",
        "current_flow_count": 412,
        "flowLabel": "Clear Flow"
      },
      {
        "entry_gate_id": 2,
        "gate_name": "Main Ballroom",
        "gate_type": "Ballroom Entrance",
        "capacity_limit": 1000,
        "status": "Queuing",
        "current_flow_count": 894,
        "flowLabel": "Queuing (12m)"
      },
      {
        "entry_gate_id": 3,
        "gate_name": "VIP Lounge",
        "gate_type": "VIP Gate",
        "capacity_limit": 200,
        "status": "Fast Lane",
        "current_flow_count": 142,
        "flowLabel": "Fast Lane"
      }
    ]
  }
  ```
