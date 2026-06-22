# EventHub360 Accommodation Module API Contract Documentation

This document defines the REST API contract for the **Accommodation Dashboard** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing `created_by` / `updated_by`)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping maps to `company_id`)
* `X-Branch-ID`: `BIGINT` (Optional, maps to `branch_id`)

---

## 1. Dashboard Endpoints

### 1.1 Read Accommodation Dashboard Metrics
Retrieve high-level metrics cards and utilization analytics.

* **URL**: `/api/accommodation/dashboard`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `start_date`: `DATE` (ISO-8601, Optional)
  - `end_date`: `DATE` (ISO-8601, Optional)
* **Success Response** (`200 OK` - `AccommodationDashboardDTO`):
  ```json
  {
    "success": true,
    "data": {
      "totalOccupancy": 84.2,
      "roomsAssigned": 412,
      "totalRoomsCapacity": 500,
      "unassignedGuests": 88,
      "vipSuitesBooked": 12,
      "vipSuitesCapacity": 15,
      "hotelUtilizationTrends": [
        { "hotelName": "Grand Ballroom Hotel", "occupancy": 120, "capacity": 150 },
        { "hotelName": "Azure Heights Resort", "occupancy": 95, "capacity": 120 },
        { "hotelName": "The Ritz-Central", "occupancy": 140, "capacity": 140 },
        { "hotelName": "Harbor View", "occupancy": 48, "capacity": 80 },
        { "hotelName": "Summit Lodge", "occupancy": 115, "capacity": 125 }
      ],
      "metricsTrends": {
        "totalOccupancyChange": "+3.2%",
        "totalOccupancyLabel": "vs. last week",
        "roomsAssignedCap": "82% Cap",
        "unassignedGuestsLabel": "Requires allocation",
        "unassignedGuestsPriority": "Priority",
        "vipSuitesRemainingLabel": "3 Ultra-luxury remaining"
      }
    }
  }
  ```

---

## 2. Hotels Endpoints

### 2.1 List Hotels
Get a paginated and filterable list of hotels.

* **URL**: `/api/hotels`
* **Method**: `GET`
* **Query Parameters** (`accommodationQuerySchema`):
  - `page`: `INTEGER` (Default: `1`)
  - `limit`: `INTEGER` (Default: `10`)
  - `search`: `STRING` (Optional: Search hotel name)
* **Success Response** (`200 OK`):
  ```json
  {
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "pages": 2
    },
    "data": [
      {
        "hotel_id": 1,
        "hotel_name": "Grand Ballroom Hotel",
        "hotel_type": "Luxury",
        "address": "456 Prestige Avenue, Central District",
        "total_rooms": 150,
        "available_rooms": 30,
        "occupancy_percentage": 80.00,
        "created_at": "2026-06-19T20:00:00.000Z",
        "updated_at": "2026-06-19T20:00:00.000Z"
      }
    ]
  }
  ```

### 2.2 Read Hotel details
Fetch a specific hotel by ID.

* **URL**: `/api/hotels/:id`
* **Method**: `GET`
* **Success Response** (`200 OK` - `HotelResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "hotel_id": 1,
      "hotel_name": "Grand Ballroom Hotel",
      "hotel_type": "Luxury",
      "address": "456 Prestige Avenue, Central District",
      "total_rooms": 150,
      "available_rooms": 30,
      "occupancy_percentage": 80.00,
      "created_at": "2026-06-19T20:00:00.000Z"
    }
  }
  ```

### 2.3 Create Hotel
* **URL**: `/api/hotels`
* **Method**: `POST`
* **Request Body** (`HotelRequestDTO`):
  ```json
  {
    "hotel_name": "Azure Heights Resort",
    "hotel_type": "Resort",
    "address": "789 Coastal Highway, Beachside",
    "total_rooms": 120
  }
  ```
* **Success Response** (`201 Created` - `HotelResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "hotel_id": 2,
      "hotel_name": "Azure Heights Resort",
      "hotel_type": "Resort",
      "address": "789 Coastal Highway, Beachside",
      "total_rooms": 120,
      "available_rooms": 120,
      "occupancy_percentage": 0.00
    }
  }
  ```

### 2.4 Update Hotel
* **URL**: `/api/hotels/:id`
* **Method**: `PUT`
* **Request Body** (`HotelUpdateSchema`):
  ```json
  {
    "hotel_name": "Azure Heights Beach Resort",
    "total_rooms": 125
  }
  ```
* **Success Response** (`200 OK` - `HotelResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "hotel_id": 2,
      "hotel_name": "Azure Heights Beach Resort",
      "hotel_type": "Resort",
      "address": "789 Coastal Highway, Beachside",
      "total_rooms": 125,
      "available_rooms": 125,
      "occupancy_percentage": 0.00
    }
  }
  ```

### 2.5 Delete Hotel
* **URL**: `/api/hotels/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Hotel deleted successfully"
  }
  ```

---

## 3. Rooms Endpoints

### 3.1 List Rooms
* **URL**: `/api/rooms`
* **Method**: `GET`
* **Query Parameters** (`accommodationQuerySchema`):
  - `page`, `limit`, `search`
  - `hotel_id`: `INTEGER` (Optional filter)
  - `room_type`: `STRING` (Optional filter)
  - `status`: `STRING` (Optional: `Available` | `Reserved` | `Occupied` | `Maintenance`)
* **Success Response** (`200 OK`):
  ```json
  {
    "pagination": { "total": 150, "page": 1, "limit": 10, "pages": 15 },
    "data": [
      {
        "room_id": 101,
        "hotel_id": 1,
        "hotel_name": "Grand Ballroom Hotel",
        "room_number": "412A",
        "room_type": "Deluxe Double",
        "room_status": "Available",
        "capacity": 2
      }
    ]
  }
  ```

### 3.2 Read Room Details
* **URL**: `/api/rooms/:id`
* **Method**: `GET`
* **Success Response** (`200 OK` - `RoomResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "room_id": 101,
      "hotel_id": 1,
      "hotel_name": "Grand Ballroom Hotel",
      "room_number": "412A",
      "room_type": "Deluxe Double",
      "room_status": "Available",
      "capacity": 2
    }
  }
  ```

### 3.3 Create Room
* **URL**: `/api/rooms`
* **Method**: `POST`
* **Request Body** (`RoomRequestDTO`):
  ```json
  {
    "hotel_id": 1,
    "room_number": "412A",
    "room_type": "Deluxe Double",
    "capacity": 2
  }
  ```
* **Success Response** (`201 Created` - `RoomResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "room_id": 101,
      "hotel_id": 1,
      "room_number": "412A",
      "room_type": "Deluxe Double",
      "room_status": "Available",
      "capacity": 2
    }
  }
  ```

### 3.4 Update Room
* **URL**: `/api/rooms/:id`
* **Method**: `PUT`
* **Request Body** (`RoomUpdateSchema`):
  ```json
  {
    "room_status": "Maintenance"
  }
  ```
* **Success Response** (`200 OK` - `RoomResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "room_id": 101,
      "hotel_id": 1,
      "room_number": "412A",
      "room_type": "Deluxe Double",
      "room_status": "Maintenance",
      "capacity": 2
    }
  }
  ```

### 3.5 Delete Room
* **URL**: `/api/rooms/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Room deleted successfully"
  }
  ```

---

## 4. Reservations Endpoints

### 4.1 List Reservations
Get a paginated list of allocations. Supports search by guest name or hotel name, and filters.

* **URL**: `/api/reservations`
* **Method**: `GET`
* **Query Parameters** (`accommodationQuerySchema`):
  - `page`, `limit`
  - `search`: `STRING` (Optional: Search guest name or hotel name)
  - `hotel_id`: `INTEGER` (Optional filter)
  - `room_type`: `STRING` (Optional filter)
  - `status`: `STRING` (Optional: `Pending` | `Confirmed` | `Checked In` | `Checked Out` | `Cancelled`)
* **Success Response** (`200 OK`):
  ```json
  {
    "pagination": { "total": 284, "page": 1, "limit": 10, "pages": 29 },
    "data": [
      {
        "reservation_id": 9012,
        "guest_id": 412,
        "guest_name": "Jordan Smith",
        "guest_phone": "+15550291",
        "hotel_id": 1,
        "hotel_name": "Grand Ballroom Hotel",
        "room_id": 101,
        "room_number": "412A",
        "check_in_date": "2023-10-14",
        "check_out_date": "2023-10-18",
        "reservation_status": "Checked In"
      }
    ]
  }
  ```

### 4.2 Read Reservation Details
* **URL**: `/api/reservations/:id`
* **Method**: `GET`
* **Success Response** (`200 OK` - `ReservationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "reservation_id": 9012,
      "guest_id": 412,
      "guest_name": "Jordan Smith",
      "hotel_id": 1,
      "hotel_name": "Grand Ballroom Hotel",
      "room_id": 101,
      "room_number": "412A",
      "check_in_date": "2023-10-14",
      "check_out_date": "2023-10-18",
      "reservation_status": "Checked In"
    }
  }
  ```

### 4.3 Create Reservation (Room Booking)
Creates a room booking or guest assignment.

* **URL**: `/api/reservations`
* **Method**: `POST`
* **Request Body** (`ReservationRequestDTO`):
  ```json
  {
    "guest_id": 413,
    "hotel_id": 2,
    "room_id": 805,
    "check_in_date": "2023-10-15",
    "check_out_date": "2023-10-20",
    "reservation_status": "Confirmed"
  }
  ```
* **Success Response** (`201 Created` - `ReservationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "reservation_id": 9013,
      "guest_id": 413,
      "guest_name": "Amara Okafor",
      "hotel_id": 2,
      "hotel_name": "Azure Heights Beach Resort",
      "room_id": 805,
      "room_number": "805",
      "check_in_date": "2023-10-15",
      "check_out_date": "2023-10-20",
      "reservation_status": "Confirmed"
    }
  }
  ```

### 4.4 Update Reservation (Room Reassignment & Tracking)
Reassigns rooms, check-in dates, check-out dates, or updates checkout statuses.

* **URL**: `/api/reservations/:id`
* **Method**: `PUT`
* **Request Body** (`reservationUpdateSchema`):
  ```json
  {
    "room_id": 806,
    "reservation_status": "Checked In"
  }
  ```
* **Success Response** (`200 OK` - `ReservationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "reservation_id": 9013,
      "guest_id": 413,
      "guest_name": "Amara Okafor",
      "hotel_id": 2,
      "hotel_name": "Azure Heights Beach Resort",
      "room_id": 806,
      "room_number": "806",
      "check_in_date": "2023-10-15",
      "check_out_date": "2023-10-20",
      "reservation_status": "Checked In"
    }
  }
  ```

### 4.5 Delete Reservation
* **URL**: `/api/reservations/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Reservation deleted successfully"
  }
  ```

---

## 5. VIP Allocations Endpoints

### 5.1 List VIP Allocations
* **URL**: `/api/vip-allocations`
* **Method**: `GET`
* **Query Parameters** (`accommodationQuerySchema`):
  - `status`: `STRING` (Optional: `Assigned` | `Pending`)
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "allocation_id": 1,
        "guest_id": 901,
        "guest_name": "Eleanor Vance",
        "guest_phone": "+15550882",
        "hotel_id": 1,
        "hotel_name": "Grand Ballroom Hotel",
        "room_id": 12,
        "room_number": "401",
        "room_type": "Royal Suite",
        "allocation_status": "Assigned",
        "assigned_at": "2026-06-19T21:00:00.000Z"
      },
      {
        "allocation_id": 2,
        "guest_id": 902,
        "guest_name": "Marcus Thorne",
        "guest_phone": "+15550885",
        "hotel_id": 1,
        "hotel_name": "Grand Ballroom Hotel",
        "room_id": 15,
        "room_number": "902",
        "room_type": "Penthouse",
        "allocation_status": "Pending",
        "assigned_at": "2026-06-19T21:05:00.000Z"
      }
    ]
  }
  ```

### 5.2 Create VIP Allocation
* **URL**: `/api/vip-allocations`
* **Method**: `POST`
* **Request Body** (`VipAllocationRequestDTO`):
  ```json
  {
    "guest_id": 902,
    "hotel_id": 1,
    "room_id": 15,
    "allocation_status": "Assigned"
  }
  ```
* **Success Response** (`201 Created` - `VipAllocationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "allocation_id": 2,
      "guest_id": 902,
      "guest_name": "Marcus Thorne",
      "hotel_id": 1,
      "hotel_name": "Grand Ballroom Hotel",
      "room_id": 15,
      "room_number": "902",
      "room_type": "Penthouse",
      "allocation_status": "Assigned",
      "assigned_at": "2026-06-19T21:05:00.000Z"
    }
  }
  ```

### 5.3 Update VIP Allocation
* **URL**: `/api/vip-allocations/:id`
* **Method**: `PUT`
* **Request Body** (`vipAllocationUpdateSchema`):
  ```json
  {
    "allocation_status": "Assigned"
  }
  ```
* **Success Response** (`200 OK` - `VipAllocationResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "allocation_id": 2,
      "allocation_status": "Assigned"
    }
  }
  ```

### 5.4 Delete VIP Allocation
* **URL**: `/api/vip-allocations/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "VIP allocation deleted successfully"
  }
  ```

---

## 6. Reports Endpoints

### 6.1 List Exported Reports
* **URL**: `/api/reports`
* **Method**: `GET`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "report_id": 5,
        "report_type": "Utilization",
        "generated_by": 10,
        "generated_at": "2026-06-19T22:30:00.000Z",
        "file_url": "https://s3.amazonaws.com/eventhub360-reports/utilization_export_1687213800.csv"
      }
    ]
  }
  ```

### 6.2 Export Reports
Trigger report generation and return file details.

* **URL**: `/api/reports/export`
* **Method**: `POST`
* **Request Body** (`ReportExportRequestDTO`):
  ```json
  {
    "format": "CSV",
    "report_type": "Utilization",
    "filters": {
      "hotel_id": 1,
      "room_type": "Deluxe Double"
    }
  }
  ```
* **Success Response** (`200 OK` - `ReportResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "report_id": 6,
      "report_type": "Utilization",
      "generated_by": 10,
      "generated_at": "2026-06-19T23:00:00.000Z",
      "file_url": "https://s3.amazonaws.com/eventhub360-reports/utilization_export_1687215600.csv"
    }
  }
  ```
