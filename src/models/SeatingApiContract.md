# EventHub360 Seating & Table Layout Designer Module API Contract Documentation

This document defines the REST API contract for the **Seating / Table Layout Designer** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing context)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping)
* `X-Branch-ID`: `BIGINT` (Optional)

---

## 1. Seating Dashboard Endpoints

### 1.1 Read Layout Analytics Dashboard Metrics
Retrieve seating capacity analytics and efficiency ratios.

* **URL**: `/api/seating/dashboard`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
* **Success Response** (`200 OK` - `SeatingDashboardAnalyticsDTO`):
  ```json
  {
    "success": true,
    "data": {
      "totalTables": 32,
      "activeTables": {
        "count": 4,
        "label": "+4 active"
      },
      "maxCapacity": {
        "value": 320,
        "label": "320 pax"
      },
      "assignments": {
        "assigned": 248,
        "total": 320,
        "label": "248/320"
      },
      "unassigned": {
        "count": 72
      },
      "layoutEfficiency": {
        "percentage": 88,
        "label": "88%",
        "status": "Optimized"
      }
    }
  }
  ```

---

## 2. Table Layout Management Endpoints

### 2.1 Read Seating Layout Details
Fetch a layout's coordinate matrix, zoning partitions, event tables, and active seat guest allocations.

* **URL**: `/api/seating/layouts/:layoutId`
* **Method**: `GET`
* **Success Response** (`200 OK` - `TableLayoutResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "layout_id": 12,
      "event_id": 501,
      "name": "Winter Gala 2024 Layout",
      "version": "1.0.2",
      "status": "Draft",
      "is_active": true,
      "updated_at": "2026-06-22T15:00:00.000Z",
      "zones": [
        {
          "zone_id": 1,
          "layout_id": 12,
          "name": "Zone A",
          "color_code": "#FF5733"
        },
        {
          "zone_id": 2,
          "layout_id": 12,
          "name": "Zone B",
          "color_code": "#33FF57"
        }
      ],
      "tables": [
        {
          "table_id": 101,
          "layout_id": 12,
          "table_number": "01",
          "shape": "Round",
          "capacity": 10,
          "is_vip": false,
          "position": {
            "x": 150.00,
            "y": 200.00,
            "rotation": 0.00
          },
          "dimensions": {
            "width": null,
            "height": null
          },
          "zone": {
            "zone_id": 1,
            "name": "Zone A",
            "color_code": "#FF5733"
          },
          "assigned_seats_count": 8,
          "seats": [
            {
              "seat_id": 1001,
              "seat_number": 1,
              "offset_x": 0.00,
              "offset_y": 50.00,
              "is_blocked": false,
              "guest": {
                "guest_id": 301,
                "guest_name": "Alexander Thorne",
                "guest_category": "VIP"
              }
            },
            {
              "seat_id": 1002,
              "seat_number": 2,
              "offset_x": 35.36,
              "offset_y": 35.36,
              "is_blocked": false,
              "guest": null
            }
          ]
        }
      ]
    }
  }
  ```

### 2.2 Update Seating Layout Settings (Save Layout)
Modify details or save layout progress.

* **URL**: `/api/seating/layouts/:layoutId`
* **Method**: `PUT`
* **Request Body** (`layoutSaveSchema`):
  ```json
  {
    "name": "Winter Gala 2024 Final Draft",
    "status": "Saved"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Layout details saved successfully",
    "data": {
      "layout_id": 12,
      "name": "Winter Gala 2024 Final Draft",
      "status": "Saved",
      "version": "1.0.2"
    }
  }
  ```

### 2.3 Clone Seating Layout (Versioning)
Clones an existing layout, generating a minor patch version copy of zones, tables, and seat definitions under a new version configuration.

* **URL**: `/api/seating/layouts/clone`
* **Method**: `POST`
* **Request Body** (`layoutVersionSchema`):
  ```json
  {
    "target_layout_id": 12,
    "new_version_name": "Winter Gala 2024 - Rev 2"
  }
  ```
* **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "New layout version cloned successfully",
    "data": {
      "layout_id": 13,
      "event_id": 501,
      "name": "Winter Gala 2024 - Rev 2",
      "version": "1.0.3",
      "status": "Draft"
    }
  }
  ```

### 2.4 Trigger Rule Checker (Validate Rules)
Run the layout engine checker to test table spacing clearances and capacities.

* **URL**: `/api/seating/layouts/:layoutId/validate`
* **Method**: `POST`
* **Query Parameters**:
  - `event_id`: `INTEGER` (Mandatory, event context identifier)
* **Success Response** (`200 OK` - `LayoutRuleValidationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "isValid": false,
      "summary": "Detected 0 critical issues and 1 warnings.",
      "logs": [
        {
          "log_id": 45,
          "rule_id": 10,
          "rule_name": "Standard 2-meter Clearance",
          "severity": "Warning",
          "message": "VIP Table Clearance Conflict: Table 01 and Table 02 are too close (1.5m). Minimum required is 2.0m.",
          "details": {
            "table_a_id": 101,
            "table_b_id": 102,
            "distance_meters": 1.5
          },
          "resolved": false,
          "created_at": "2026-06-22T15:10:00.000Z"
        }
      ]
    }
  }
  ```

---

## 3. Tables Management Endpoints

### 3.1 Create Table
Add a table and auto-generate seat offset coordinate vectors.

* **URL**: `/api/seating/tables`
* **Method**: `POST`
* **Request Body** (`tableCreateSchema`):
  ```json
  {
    "layout_id": 12,
    "zone_id": 1,
    "table_number": "03",
    "shape": "Square",
    "capacity": 8,
    "is_vip": true,
    "x_coordinate": 250.00,
    "y_coordinate": 300.00
  }
  ```
* **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Table created successfully",
    "data": {
      "table_id": 103,
      "layout_id": 12,
      "table_number": "03",
      "shape": "Square",
      "capacity": 8,
      "is_vip": true,
      "x_coordinate": 250.00,
      "y_coordinate": 300.00
    }
  }
  ```

### 3.2 Update Table Settings
Modify capacity, VIP status, shape, or zoning.

* **URL**: `/api/seating/tables/:tableId`
* **Method**: `PUT`
* **Request Body** (`tableUpdateSchema`):
  ```json
  {
    "is_vip": false,
    "capacity": 10
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Table updated successfully",
    "data": {
      "table_id": 103,
      "layout_id": 12,
      "table_number": "03",
      "shape": "Square",
      "capacity": 10,
      "is_vip": false
    }
  }
  ```

### 3.3 Delete Table
* **URL**: `/api/seating/tables/:tableId`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Table deleted successfully"
  }
  ```

### 3.4 Save Bulk Placements (Drag & Drop Sync)
Commit layout coordinates changes made visually on the frontend canvas.

* **URL**: `/api/seating/tables/bulk-positions`
* **Method**: `POST`
* **Request Body** (`dragAndDropBulkSaveSchema`):
  ```json
  {
    "tables": [
      { "table_id": 101, "x_coordinate": 155.50, "y_coordinate": 202.00, "rotation": 5.00 },
      { "table_id": 102, "x_coordinate": 280.00, "y_coordinate": 300.00, "rotation": 0.00 }
    ]
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Table layout coordinates saved successfully"
  }
  ```

---

## 4. Seating Mappings & Assignments Endpoints

### 4.1 Seating Guest
Assign a guest to a table seat.

* **URL**: `/api/seating/assignments`
* **Method**: `POST`
* **Request Body** (`seatAssignmentSchema`):
  ```json
  {
    "guest_id": 415,
    "table_id": 101,
    "seat_id": 1002
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Guest seated successfully",
    "data": {
      "assignment_id": 501,
      "layout_id": 12,
      "table_id": 101,
      "seat_id": 1002,
      "guest_id": 415
    }
  }
  ```

### 4.2 Unseating Guest
Remove a guest's layout seat assignment.

* **URL**: `/api/seating/layouts/:layoutId/guests/:guestId`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Guest unseated successfully"
  }
  ```
