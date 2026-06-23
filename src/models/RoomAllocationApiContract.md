# EventHub360 Room Allocation Matrix Module API Contract Documentation

This document defines the REST API contract for the **Room Allocation Matrix** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing `created_by` / `updated_by`)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping maps to `company_id`)
* `X-Branch-ID`: `BIGINT` (Optional, maps to `branch_id`)

---

## 1. Floors Endpoints

### 1.1 List Floors
Get the matrix of floors and rooms linked to a specific hotel.

* **URL**: `/api/floors`
* **Method**: `GET`
* **Query Parameters** (`floorQuerySchema`):
  - `hotel_id`: `INTEGER` (Mandatory, scoped hotel identifier)
* **Success Response** (`200 OK` - array of `FloorResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "floor_id": 5,
        "hotel_id": 1,
        "floor_name": "Floor 5",
        "floor_number": 5,
        "total_rooms": 16,
        "assigned_rooms": 12,
        "available_rooms": 3,
        "conflict_count": 1,
        "rooms": [
          {
            "room_id": 501,
            "room_number": "501",
            "room_type": "Executive Suite",
            "room_status": "Occupied",
            "has_conflict": false,
            "guest": {
              "guest_id": 143,
              "guest_name": "Amara Okafor",
              "guest_category": "Speaker",
              "vip_placement": true,
              "check_in_date": "2023-10-12",
              "check_out_date": "2023-10-18"
            }
          },
          {
            "room_id": 502,
            "room_number": "502",
            "room_type": "King Deluxe",
            "room_status": "Occupied",
            "has_conflict": true,
            "conflict_message": "Double Booking Detected",
            "guest": {
              "guest_id": 144,
              "guest_name": "Conflict User",
              "guest_category": "Attendee",
              "vip_placement": false
            }
          },
          {
            "room_id": 503,
            "room_number": "503",
            "room_type": "King Bed",
            "room_status": "Available",
            "has_conflict": false,
            "guest": null
          },
          {
            "room_id": 504,
            "room_number": "504",
            "room_type": "Executive Suite",
            "room_status": "Reserved",
            "has_conflict": false,
            "guest": {
              "guest_id": 145,
              "guest_name": "Holding for Delegation...",
              "guest_category": "Attendee",
              "vip_placement": false
            }
          }
        ]
      }
    ]
  }
  ```

### 1.2 Read Floor
* **URL**: `/api/floors/:id`
* **Method**: `GET`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "floor_id": 5,
      "hotel_id": 1,
      "floor_name": "Floor 5",
      "floor_number": 5,
      "total_rooms": 16
    }
  }
  ```

---

## 2. Room Allocations Endpoints

### 2.1 List Allocations
* **URL**: `/api/room-allocations`
* **Method**: `GET`
* **Query Parameters** (`roomAllocationQuerySchema`):
  - `page`, `limit`, `search`
* **Success Response** (`200 OK`):
  ```json
  {
    "pagination": { "total": 84, "page": 1, "limit": 10, "pages": 9 },
    "data": [
      {
        "allocation_id": 101,
        "room_id": 401,
        "room_number": "401",
        "guest_id": 302,
        "guest_name": "Jameson Blake",
        "guest_category": "Attendee",
        "reservation_id": 9012,
        "check_in_date": "2023-10-12",
        "check_out_date": "2023-10-15",
        "allocation_status": "Assigned",
        "assigned_by": 10,
        "assigned_at": "2026-06-19T20:30:00.000Z"
      }
    ]
  }
  ```

### 2.2 Read Allocation Details
* **URL**: `/api/room-allocations/:id`
* **Method**: `GET`
* **Success Response** (`200 OK` - `RoomAllocationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "allocation_id": 101,
      "room_id": 401,
      "room_number": "401",
      "guest_id": 302,
      "guest_name": "Jameson Blake",
      "guest_category": "Attendee",
      "reservation_id": 9012,
      "allocation_status": "Assigned"
    }
  }
  ```

### 2.3 Create Allocation
* **URL**: `/api/room-allocations`
* **Method**: `POST`
* **Request Body** (`RoomAllocationRequestDTO`):
  ```json
  {
    "room_id": 401,
    "guest_id": 302,
    "reservation_id": 9012,
    "allocation_status": "Assigned"
  }
  ```
* **Success Response** (`201 Created` - `RoomAllocationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "allocation_id": 101,
      "room_id": 401,
      "guest_id": 302,
      "allocation_status": "Assigned"
    }
  }
  ```

### 2.4 Update Allocation
* **URL**: `/api/room-allocations/:id`
* **Method**: `PUT`
* **Request Body** (`roomAllocationUpdateSchema`):
  ```json
  {
    "room_id": 402,
    "allocation_status": "Checked In"
  }
  ```
* **Success Response** (`200 OK` - `RoomAllocationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "allocation_id": 101,
      "room_id": 402,
      "allocation_status": "Checked In"
    }
  }
  ```

### 2.5 Delete Allocation
* **URL**: `/api/room-allocations/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Room allocation deleted successfully"
  }
  ```

### 2.6 Save Changes (Bulk Save Allocation Matrix)
Bulk persist multiple room assignments made in the matrix interface.

* **URL**: `/api/room-allocations/save`
* **Method**: `POST`
* **Request Body** (`RoomAllocationBulkSaveDTO`):
  ```json
  {
    "allocations": [
      { "room_id": 401, "guest_id": 302, "allocation_status": "Assigned" },
      { "room_id": 402, "guest_id": 303, "allocation_status": "Assigned" }
    ]
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Room allocations saved successfully",
    "updated_count": 2
  }
  ```

---

## 3. Unassigned Guests Endpoints

### 3.1 List Unassigned Guests (Guest Panel)
Fetch unallocated guests to populate the sidebar Guest Panel.

* **URL**: `/api/unassigned-guests`
* **Method**: `GET`
* **Query Parameters** (`roomAllocationQuerySchema`):
  - `page`, `limit`, `search`
* **Success Response** (`200 OK` - array of `UnassignedGuestDTO`):
  ```json
  {
    "pagination": { "total": 12, "page": 1, "limit": 10, "pages": 2 },
    "data": [
      {
        "guest_id": 501,
        "guest_name": "Dr. Marcus Vance",
        "guest_category": "Speaker",
        "request_details": "Request: High Floor",
        "check_in_date": "2023-10-12",
        "check_out_date": "2023-10-15"
      }
    ]
  }
  ```

---

## 4. Auto Assignment Endpoints

### 4.1 Trigger Auto Allocation Rule
Run business rules to automatically allocate unassigned guests to rooms.

* **URL**: `/api/auto-assign`
* **Method**: `POST`
* **Request Body** (`autoAssignSchema`):
  ```json
  {
    "hotel_id": 1,
    "rules": {
      "vip_preferred_floors": [5],
      "auto_resolve_conflicts": false,
      "match_guest_requests": true
    }
  }
  ```
* **Success Response** (`200 OK` - `AutoAssignResultDTO`):
  ```json
  {
    "success": true,
    "assigned_count": 8,
    "logs": [
      {
        "log_id": 1,
        "guest_id": 501,
        "room_id": 501,
        "assignment_rule": "VIP Placement rule matched guest category 'Speaker' to Floor 5",
        "created_at": "2026-06-19T23:30:00.000Z"
      }
    ]
  }
  ```

---

## 5. Conflicts Endpoints

### 5.1 List Room Conflicts
Fetch overlapping stay conflicts or double bookings.

* **URL**: `/api/conflicts`
* **Method**: `GET`
* **Query Parameters** (`roomAllocationQuerySchema`):
  - `resolved`: `BOOLEAN` (Optional filter, e.g. `false`)
* **Success Response** (`200 OK` - array of `ConflictResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "conflict_id": 1,
        "room_id": 502,
        "room_number": "502",
        "guest_id": 144,
        "guest_name": "Conflict User",
        "conflict_type": "Double Booking",
        "conflict_message": "Double Booking Detected: Room 502 has overlapping stays.",
        "resolved": false,
        "resolved_at": null,
        "created_at": "2026-06-19T23:00:00.000Z"
      }
    ]
  }
  ```

### 5.2 Resolve Conflict
* **URL**: `/api/conflicts/:id/resolve`
* **Method**: `PUT`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Conflict resolved successfully",
    "data": {
      "conflict_id": 1,
      "resolved": true,
      "resolved_at": "2026-06-19T23:30:00.000Z"
    }
  }
  ```

---

## 6. Guest Requests Endpoints

### 6.1 List Requests
* **URL**: `/api/guest-requests`
* **Method**: `GET`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "request_id": 1,
        "guest_id": 501,
        "request_type": "High Floor",
        "request_value": "High Floor",
        "created_at": "2026-06-19T18:00:00.000Z"
      }
    ]
  }
  ```

### 6.2 Create Guest Request
* **URL**: `/api/guest-requests`
* **Method**: `POST`
* **Request Body** (`GuestRequestCreateDTO`):
  ```json
  {
    "guest_id": 501,
    "request_type": "High Floor",
    "request_value": "High Floor"
  }
  ```
* **Success Response** (`201 Created` - `GuestRequestDTO`):
  ```json
  {
    "success": true,
    "data": {
      "request_id": 1,
      "guest_id": 501,
      "request_type": "High Floor",
      "request_value": "High Floor",
      "created_at": "2026-06-19T23:00:00.000Z"
    }
  }
  ```

### 6.3 Update Guest Request
* **URL**: `/api/guest-requests/:id`
* **Method**: `PUT`
* **Request Body** (`guestRequestUpdateSchema`):
  ```json
  {
    "request_value": "Prefer Floor 5 if possible"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "request_id": 1,
      "request_type": "High Floor",
      "request_value": "Prefer Floor 5 if possible"
    }
  }
  ```

### 6.4 Delete Guest Request
* **URL**: `/api/guest-requests/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Guest request deleted successfully"
  }
  ```
