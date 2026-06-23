# EventHub360 Logistics Matrix Module API Contract Documentation

This document defines the REST API contract for the **Logistics Matrix** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing `created_by` / `updated_by`)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping maps to `company_id`)
* `X-Branch-ID`: `BIGINT` (Optional, maps to `branch_id`)

---

## 1. Vehicles Endpoints

### 1.1 List Vehicles (Matrix View)
Get a paginated list of transport vehicles including assigned drivers, active guest lists, capacity indicators, and warnings. Supports pagination and infinite scroll.

* **URL**: `/api/logistics/vehicles`
* **Method**: `GET`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Query Parameters** (`vehicleQuerySchema`):
  - `page`: `INTEGER` (Default: `1`)
  - `limit`: `INTEGER` (Default: `10`)
  - `status`: `STRING` (Optional: `On Route` | `Staged` | `Maintenance` | `Available`)
  - `vehicle_type`: `STRING` (Optional: e.g. `SUV`)
  - `search`: `STRING` (Optional: Search vehicle name/license)
* **Success Response** (`200 OK` - array of `VehicleAllocationMatrixDTO`):
  ```json
  {
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "pages": 5
    },
    "data": [
      {
        "vehicle_id": 1,
        "vehicle_name": "Mercedes V-Class",
        "vehicle_type": "Minibus",
        "license_number": "VH-402",
        "capacity": 7,
        "status": "On Route",
        "driver": {
          "driver_id": 3,
          "full_name": "James Whitaker",
          "phone_number": "+15550201"
        },
        "assigned_guests": [
          {
            "guest_id": 412,
            "guest_name": "Eleanor Rigby",
            "guest_category": "VIP",
            "allocation_id": 1001,
            "allocation_status": "Checked In",
            "vip_placement": true
          },
          {
            "guest_id": 413,
            "guest_name": "Thomas Muller",
            "guest_category": "Attendee",
            "allocation_id": 1002,
            "allocation_status": "Assigned",
            "vip_placement": false
          }
        ],
        "occupancy_count": 2,
        "is_over_capacity": false,
        "has_conflict": false,
        "conflict_warnings": []
      },
      {
        "vehicle_id": 2,
        "vehicle_name": "Tesla Model X",
        "vehicle_type": "SUV",
        "license_number": "VH-108",
        "capacity": 5,
        "status": "Staged",
        "driver": {
          "driver_id": 4,
          "full_name": "Sarah Jenkins",
          "phone_number": "+15550205"
        },
        "assigned_guests": [
          {
            "guest_id": 414,
            "guest_name": "Marcus Vane",
            "guest_category": "Speaker",
            "allocation_id": 1003,
            "allocation_status": "Assigned",
            "vip_placement": true
          },
          { "guest_id": 415, "guest_name": "Guest 2", "guest_category": "Attendee", "allocation_id": 1004 },
          { "guest_id": 416, "guest_name": "Guest 3", "guest_category": "Attendee", "allocation_id": 1005 },
          { "guest_id": 417, "guest_name": "Guest 4", "guest_category": "Attendee", "allocation_id": 1006 },
          { "guest_id": 418, "guest_name": "Guest 5", "guest_category": "Attendee", "allocation_id": 1007 },
          { "guest_id": 419, "guest_name": "Guest 6", "guest_category": "Attendee", "allocation_id": 1008 }
        ],
        "occupancy_count": 6,
        "is_over_capacity": true,
        "has_conflict": true,
        "conflict_warnings": [
          {
            "conflict_id": 24,
            "conflict_type": "Capacity Conflict",
            "conflict_message": "Warning: 1 Over-capacity guest attempted. Max capacity is 5."
          }
        ]
      }
    ]
  }
  ```

### 1.2 Read Vehicle Details
* **URL**: `/api/logistics/vehicles/:id`
* **Method**: `GET`
* **Success Response** (`200 OK` - `VehicleResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "vehicle_id": 1,
      "vehicle_name": "Mercedes V-Class",
      "vehicle_type": "Minibus",
      "license_number": "VH-402",
      "capacity": 7,
      "status": "On Route",
      "driver_id": 3
    }
  }
  ```

---

## 2. Guest Queue Endpoints

### 2.1 Read Guest Queue (Unassigned Sidebar Panel)
Fetch unassigned guests with delay alerts, categories, ETAs, and priority tags. Supports pagination and infinite scroll.

* **URL**: `/api/logistics/guest-queue`
* **Method**: `GET`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Query Parameters** (`guestQueueQuerySchema`):
  - `page`: `INTEGER` (Default: `1`)
  - `limit`: `INTEGER` (Default: `10`)
  - `search`: `STRING` (Optional: Search guest name)
  - `category`: `STRING` (Optional: `VIP` | `Speaker` | `Staff` | `Attendee`)
  - `priority_level`: `STRING` (Optional: `Critical` | `High` | `Standard` | `Low`)
* **Success Response** (`200 OK` - array of `GuestQueueDTO`):
  ```json
  {
    "pagination": {
      "total": 18,
      "page": 1,
      "limit": 10,
      "pages": 2
    },
    "data": [
      {
        "guest_id": 501,
        "guest_name": "Sarah Connor",
        "guest_category": "VIP",
        "eta": "2026-06-19T11:30:00.000Z",
        "priority_level": "High",
        "flight_delay_minutes": 45,
        "flight_delay_alert": "Flight delayed by 45 mins",
        "is_waitlisted": false,
        "notes": "Requires IMMEDIATE ACTION"
      },
      {
        "guest_id": 502,
        "guest_name": "Robert Pattinson",
        "guest_category": "Speaker",
        "eta": "2026-06-19T12:15:00.000Z",
        "priority_level": "Standard",
        "flight_delay_minutes": null,
        "flight_delay_alert": null,
        "is_waitlisted": false,
        "notes": "Arriving at Grand Hyatt Hotel"
      }
    ]
  }
  ```

---

## 3. Allocation Actions Endpoints

### 3.1 Assign Guest to Vehicle
Create a transport allocation mapping.

* **URL**: `/api/logistics/assign`
* **Method**: `POST`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Request Body** (`assignRequestSchema`):
  ```json
  {
    "guest_id": 501,
    "vehicle_id": 1,
    "allocation_status": "Assigned"
  }
  ```
* **Success Response** (`201 Created` - `GuestTransportAllocationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "allocation_id": 1009,
      "guest_id": 501,
      "guest_name": "Sarah Connor",
      "vehicle_id": 1,
      "vehicle_name": "Mercedes V-Class",
      "allocation_status": "Assigned"
    }
  }
  ```

### 3.2 Reassign Guest to Another Vehicle
Reallocate an active assignment to a different vehicle.

* **URL**: `/api/logistics/reassign`
* **Method**: `PUT`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Request Body** (`reassignRequestSchema`):
  ```json
  {
    "allocation_id": 1009,
    "target_vehicle_id": 2,
    "allocation_status": "Reserved"
  }
  ```
* **Success Response** (`200 OK` - `GuestTransportAllocationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "allocation_id": 1009,
      "guest_id": 501,
      "guest_name": "Sarah Connor",
      "vehicle_id": 2,
      "vehicle_name": "Tesla Model X",
      "allocation_status": "Reserved"
    }
  }
  ```

### 3.3 Unassign Guest (Remove allocation)
Delete an active transport allocation.

* **URL**: `/api/logistics/unassign/:allocationId`
* **Method**: `DELETE`
* **Request Headers**:
  - `X-Company-ID: 10`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Guest unassigned from vehicle successfully",
    "unassigned_allocation_id": 1009
  }
  ```

---

## 4. Conflict Management Endpoints

### 4.1 List Transport Conflicts
Get active capacity warnings, timing conflicts, or route mismatch alerts.

* **URL**: `/api/logistics/conflicts`
* **Method**: `GET`
* **Query Parameters** (`conflictQuerySchema`):
  - `status`: `STRING` (Default: `Unresolved`)
  - `conflict_type`: `STRING` (Optional: `Capacity Conflict` | `Timing Conflict` | `Route Conflict`)
* **Success Response** (`200 OK` - array of `ConflictResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "conflict_id": 24,
        "allocation_id": 1008,
        "guest_name": "Marcus Vane",
        "vehicle_name": "Tesla Model X",
        "conflict_type": "Capacity Conflict",
        "conflict_message": "Warning: 1 Over-capacity guest attempted. Max capacity is 5.",
        "status": "Unresolved"
      }
    ]
  }
  ```

---

## 5. Route Optimization Endpoints

### 5.1 Trigger Route Optimization
Run optimization logic for selected vehicles.

* **URL**: `/api/logistics/optimize-routes`
* **Method**: `POST`
* **Request Body** (`optimizeRoutesSchema`):
  ```json
  {
    "vehicle_ids": [1, 2],
    "optimization_rule": "Shortest Time"
  }
  ```
* **Success Response** (`200 OK` - array of `RouteOptimizationResultDTO`):
  ```json
  {
    "success": true,
    "message": "Routes optimized successfully",
    "data": [
      {
        "log_id": 52,
        "vehicle_id": 1,
        "optimized_route_details": {
          "total_stops": 3,
          "waypoints": ["Airport Terminal 3", "Grand Hyatt Hotel", "Event Arena"],
          "estimated_duration_mins": 34
        },
        "generated_by": 10,
        "created_at": "2026-06-19T23:55:00.000Z"
      }
    ]
  }
  ```

---

## 6. Waitlist Endpoints

### 6.1 List Waitlist Guests
Get a list of guests waiting in queue.

* **URL**: `/api/logistics/waitlist`
* **Method**: `GET`
* **Query Parameters** (`waitlistQuerySchema`):
  - `page`, `limit`, `priority_level`
* **Success Response** (`200 OK` - array of `WaitlistResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "waitlist_id": 12,
        "guest_id": 501,
        "guest_name": "Sarah Connor",
        "guest_category": "VIP",
        "priority_level": "High",
        "eta": "2026-06-19T11:30:00.000Z",
        "notes": "Flight delayed by 45 mins"
      }
    ]
  }
  ```

### 6.2 Generate Waitlist Report
Trigger generation of the waitlist log file.

* **URL**: `/api/logistics/waitlist-report`
* **Method**: `POST`
* **Request Body** (`waitlistReportSchema`):
  ```json
  {
    "format": "CSV",
    "priority_level": "High"
  }
  ```
* **Success Response** (`200 OK`):
  - **Headers**:
    - `Content-Type: text/csv`
    - `Content-Disposition: attachment; filename=waitlist_report.csv`
  - **Body**:
    ```csv
    Waitlist ID,Guest Name,Guest Category,Priority,ETA,Notes
    12,"Sarah Connor","VIP","High","2026-06-19T11:30:00.000Z","Flight delayed by 45 mins"
    ```
