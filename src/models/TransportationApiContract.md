# EventHub360 Transportation & Fleet Management REST API Contract

## Global Headers
- `x-company-id` (Required, Integer): Scope of multi-tenant database queries.
- `x-branch-id` (Optional, Integer): Optional branch scope.
- `x-user-id` (Optional, Integer): ID of active operator context.
- `Content-Type` (Required, String): `application/json`

---

## 1. Fleet Assignments

### Assign Driver and Vehicle to Event
- **URL**: `/api/v1/transportation/assignments`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "vehicle_id": 1,
    "driver_id": 2,
    "event_id": 1,
    "status": "Active"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 10,
      "company_id": 1,
      "vehicle_id": 1,
      "driver_id": 2,
      "event_id": 1,
      "status": "Active",
      "assigned_at": "2026-06-23T12:00:00.000Z",
      "vehicle_name": "Mercedes V-Class (2024)",
      "driver_name": "James Whitaker",
      "event_name": "Tech Summit 2026"
    }
  }
  ```

### List Fleet Assignments
- **URL**: `/api/v1/transportation/assignments`
- **Method**: `GET`
- **Query Parameters**:
  - `event_id` (Optional, filter assignments by event)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 10,
        "company_id": 1,
        "vehicle_id": 1,
        "driver_id": 2,
        "event_id": 1,
        "status": "Active",
        "assigned_at": "2026-06-23T12:00:00.000Z",
        "vehicle_name": "Mercedes V-Class (2024)",
        "driver_name": "James Whitaker",
        "event_name": "Tech Summit 2026"
      }
    ]
  }
  ```

### Remove Fleet Assignment
- **URL**: `/api/v1/transportation/assignments/:id`
- **Method**: `DELETE`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Fleet assignment deleted successfully"
  }
  ```

---

## 2. Transport Routes

### Create Route
- **URL**: `/api/v1/transportation/routes`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "route_name": "Airport Shuttle Express",
    "start_location": "Airport Terminal 2",
    "end_location": "Grand Hall North",
    "distance_km": 18.50,
    "duration_mins": 35
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 5,
      "company_id": 1,
      "route_name": "Airport Shuttle Express",
      "start_location": "Airport Terminal 2",
      "end_location": "Grand Hall North",
      "distance_km": 18.5,
      "duration_mins": 35,
      "status": "Active",
      "created_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

### List Routes
- **URL**: `/api/v1/transportation/routes`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "route_name": "Airport Shuttle Express",
        "start_location": "Airport Terminal 2",
        "end_location": "Grand Hall North",
        "distance_km": 18.5,
        "duration_mins": 35,
        "status": "Active"
      }
    ]
  }
  ```

### Optimize Route
- **URL**: `/api/v1/transportation/routes/:id/optimize`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 5,
      "route_name": "Airport Shuttle Express",
      "optimized_at": "2026-06-23T12:05:00.000Z"
    }
  }
  ```

---

## 3. Arrivals & Departures Transfers

### Schedule Guest Transfer
- **URL**: `/api/v1/transportation/transfers`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "guest_id": 101,
    "event_id": 1,
    "transfer_type": "Airport Pickup",
    "pickup_location": "Airport Terminal 2",
    "dropoff_location": "Grand Hyatt Hotel",
    "scheduled_time": "2026-06-23T14:20:00.000Z",
    "route_id": 5,
    "vehicle_id": 1,
    "driver_id": 2
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "company_id": 1,
      "guest_id": 101,
      "event_id": 1,
      "transfer_type": "Airport Pickup",
      "pickup_location": "Airport Terminal 2",
      "dropoff_location": "Grand Hyatt Hotel",
      "scheduled_time": "2026-06-23T14:20:00.000Z",
      "route_id": 5,
      "vehicle_id": 1,
      "driver_id": 2,
      "status": "Scheduled",
      "guest_name": "Alex Harrison",
      "vehicle_name": "Mercedes V-Class (2024)",
      "driver_name": "James Whitaker"
    }
  }
  ```
- **Response** (409 Conflict):
  Returned if the driver or vehicle has overlapping transfers within +/- 1 hour.
  ```json
  {
    "success": false,
    "error": "Conflict Detected: Driver James Whitaker has overlapping transfer scheduled around 14:20:00"
  }
  ```

### List Guest Transfers
- **URL**: `/api/v1/transportation/transfers`
- **Method**: `GET`
- **Query Parameters**:
  - `event_id` (Optional, filter transfers by event)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "transfer_type": "Airport Pickup",
        "pickup_location": "Airport Terminal 2",
        "dropoff_location": "Grand Hyatt Hotel",
        "scheduled_time": "2026-06-23T14:20:00.000Z",
        "status": "Scheduled",
        "guest_name": "Alex Harrison"
      }
    ]
  }
  ```

### Update Transfer (Status / Assignments)
- **URL**: `/api/v1/transportation/transfers/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "In Transit"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "status": "In Transit",
      "guest_name": "Alex Harrison"
    }
  }
  ```

---

## 4. Drivers Status Management

### Update Driver Status
- **URL**: `/api/v1/transportation/drivers/:id/status`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "Resting"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Driver status successfully updated to Resting"
  }
  ```

---

## 5. Vehicle Status Management

### Update Vehicle Status
- **URL**: `/api/v1/transportation/vehicles/:id/status`
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
    "message": "Vehicle status successfully updated to Maintenance"
  }
  ```

---

## 6. Vehicle Maintenance

### Schedule Maintenance
- **URL**: `/api/v1/transportation/maintenance`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "vehicle_id": 1,
    "maintenance_type": "Routine Inspection",
    "description": "Annual fleet check-up",
    "scheduled_date": "2026-06-30"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "vehicle_id": 1,
      "maintenance_type": "Routine Inspection",
      "status": "Scheduled",
      "scheduled_date": "2026-06-30",
      "vehicle_name": "Mercedes V-Class (2024)"
    }
  }
  ```

### Complete Maintenance Log
- **URL**: `/api/v1/transportation/maintenance/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "Completed",
    "cost": 150.00
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "status": "Completed",
      "cost": 150.0
    }
  }
  ```

---

## 7. Fleet Activity Logs

### Get Recent Activity logs
- **URL**: `/api/v1/transportation/activity-logs`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 101,
        "activity_type": "Route Completed",
        "severity": "Info",
        "message": "Route Completed: Transfer completed for guest Alex Harrison",
        "created_at": "2026-06-23T12:05:00.000Z",
        "vehicle_name": "Mercedes V-Class (2024)",
        "driver_name": "James Whitaker"
      }
    ]
  }
  ```

---

## 8. Dashboard Overview

### Get Fleet Overview Metrics
- **URL**: `/api/v1/transportation/dashboard/overview/:eventId`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "total_vehicles": 42,
      "active_drivers": 38,
      "on_route_vehicles": 14,
      "efficiency_rating": 94.5
    }
  }
  ```

### Force Recalculate Metrics Cache
- **URL**: `/api/v1/transportation/dashboard/refresh/:eventId`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Fleet analytics caches updated successfully"
  }
  ```
