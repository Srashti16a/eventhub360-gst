# EventHub360 Guest Reporting & Analytics REST API Contract

## Global Headers
- `x-company-id` (Required, Integer): Scope of multi-tenant database queries.
- `x-branch-id` (Optional, Integer): Optional branch scope.
- `x-user-id` (Optional, Integer): ID of active operator context.
- `Content-Type` (Required, String): `application/json`

---

## 1. Saved Report Templates

### Create Report Template
- **URL**: `/api/v1/guest-reporting/templates`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Weekly VIP Summary",
    "description": "Standard weekly catering and room summaries for VIP category",
    "group_by_column": "hotel_selection",
    "filter_criteria": {
      "category": "VIP"
    },
    "sort_criteria": {
      "column": "guest_name",
      "direction": "ASC"
    },
    "columns": [
      { "column_name": "guest_name", "display_label": "Guest Name" },
      { "column_name": "guest_email", "display_label": "Email Address" },
      { "column_name": "rsvp_status", "display_label": "RSVP Status" },
      { "column_name": "meal_preference", "display_label": "Meal Preference" },
      { "column_name": "hotel_selection", "display_label": "Hotel Selection" }
    ]
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "company_id": 1,
      "name": "Weekly VIP Summary",
      "description": "Standard weekly catering and room summaries for VIP category",
      "group_by_column": "hotel_selection",
      "filter_criteria": { "category": "VIP" },
      "sort_criteria": { "column": "guest_name", "direction": "ASC" },
      "created_at": "2026-06-23T12:00:00.000Z",
      "columns": [
        { "id": 10, "template_id": 1, "column_name": "guest_name", "display_label": "Guest Name", "column_order": 0 }
      ]
    }
  }
  ```

### List Report Templates
- **URL**: `/api/v1/guest-reporting/templates`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "company_id": 1,
        "name": "Weekly VIP Summary",
        "group_by_column": "hotel_selection",
        "filter_criteria": { "category": "VIP" }
      }
    ]
  }
  ```

---

## 2. Dynamic Report Builder Previews

### Preview Dynamic Report (Ad-Hoc / Template Based)
- **URL**: `/api/v1/guest-reporting/preview/:eventId`
- **Method**: `POST`
- **Query Parameters**:
  - `template_id` (Optional, saved template to auto-populate layout)
- **Request Body** (Required only for ad-hoc custom builder layouts):
  ```json
  {
    "filter_criteria": {
      "rsvp_status": "Accepted"
    },
    "sort_criteria": {
      "column": "guest_name",
      "direction": "DESC"
    },
    "columns": [
      { "column_name": "guest_name", "display_label": "Guest Name" },
      { "column_name": "rsvp_status", "display_label": "RSVP Status" }
    ]
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "headers": [
        { "column_name": "guest_name", "display_label": "Guest Name" },
        { "column_name": "rsvp_status", "display_label": "RSVP Status" }
      ],
      "rows": [
        {
          "guest_id": 12,
          "guest_name": "Alex Harrison",
          "rsvp_status": "Confirmed"
        }
      ]
    }
  }
  ```

---

## 3. Reports & Auditable Snapshots

### Generate & Save Report (Freezes snapshot details)
- **URL**: `/api/v1/guest-reporting/reports`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "event_id": 1,
    "name": "Tech Summit 2026 VIP Catering Breakdown",
    "description": "Frozen snapshot details of catering preferences",
    "template_id": 1
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 5,
      "company_id": 1,
      "event_id": 1,
      "name": "Tech Summit 2026 VIP Catering Breakdown",
      "description": "Frozen snapshot details of catering preferences",
      "template_id": 1,
      "created_at": "2026-06-23T12:00:00.000Z"
    }
  }
  ```

### Get Generated Report Details (Including frozen snapshots)
- **URL**: `/api/v1/guest-reporting/reports/:id`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 5,
      "company_id": 1,
      "name": "Tech Summit 2026 VIP Catering Breakdown",
      "template_id": 1,
      "snapshots": [
        {
          "id": 201,
          "report_id": 5,
          "guest_id": 12,
          "snapshot_data": {
            "name": "Alex Harrison",
            "email": "alex.h@techvision.com",
            "category": "VIP",
            "rsvp_status": "Confirmed",
            "meal_preference": "Vegetarian",
            "hotel_selection": "Grand Hyatt",
            "room_number": "504"
          }
        }
      ]
    }
  }
  ```

---

## 4. Reports CSV Exports

### Export Report Data as CSV File
- **URL**: `/api/v1/guest-reporting/reports/:id/export`
- **Method**: `GET`
- **Response** (200 OK):
  Returns file content with content-type `text/csv`:
  ```csv
  Guest ID,Guest Name,Email,Phone,Tier,RSVP,Meal Pref,Hotel Room,Flight,Checkin Time
  "12","Alex Harrison","alex.h@techvision.com","+1555101","VIP","Confirmed","Vegetarian","Grand Hyatt 504","LH-404","2026-06-23T12:00:00.000Z"
  ```

---

## 5. Export Histories

### Log Report Export Action
- **URL**: `/api/v1/guest-reporting/exports/log`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "report_id": 5,
    "export_type": "Excel",
    "file_url": "https://s3.amazonaws.com/eventhub360/reports/report_5_export.xlsx"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "company_id": 1,
      "report_id": 5,
      "export_type": "Excel",
      "file_url": "https://s3.amazonaws.com/eventhub360/reports/report_5_export.xlsx",
      "performed_by": 999,
      "created_at": "2026-06-23T12:05:00.000Z"
    }
  }
  ```

### List Export Logs
- **URL**: `/api/v1/guest-reporting/exports/history`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "export_type": "Excel",
        "file_url": "https://s3.amazonaws.com/eventhub360/reports/report_5_export.xlsx",
        "created_at": "2026-06-23T12:05:00.000Z"
      }
    ]
  }
  ```

---

## 6. Dashboard Analytics Summaries

### Get Dashboard Overview Analytics
- **URL**: `/api/v1/guest-reporting/dashboard/overview/:eventId`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "reports_generated": 1284,
      "avg_attendance_pct": 94.2,
      "satisfaction_score": 4.8,
      "unique_data_points": 45200
    }
  }
  ```

### Get Guest Categories Rings Analytics
- **URL**: `/api/v1/guest-reporting/dashboard/categories/:eventId`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "category": "VIP",
        "total_count": 50,
        "confirmed_count": 45,
        "checked_in_count": 42
      },
      {
        "category": "Speaker",
        "total_count": 25,
        "confirmed_count": 20,
        "checked_in_count": 18
      }
    ]
  }
  ```

### Get Attendance Checkin Trend Timeline Analytics
- **URL**: `/api/v1/guest-reporting/dashboard/trends/:eventId`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "time_bucket": "Monday",
        "checkin_count": 150
      },
      {
        "time_bucket": "Tuesday",
        "checkin_count": 185
      }
    ]
  }
  ```

### Refresh Aggregated Caches (Manual update triggers)
- **URL**: `/api/v1/guest-reporting/dashboard/refresh/:eventId`
- **Method**: `POST`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Analytics caches updated successfully"
  }
  ```
