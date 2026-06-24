# EventHub360 Communication Monitoring & Logs REST API Contract

## Global Headers
- `x-company-id` (Required, Integer): Scope of multi-tenant database queries.
- `x-branch-id` (Optional, Integer): Optional branch scope.
- `x-user-id` (Optional, Integer): ID of active operator context.
- `Content-Type` (Required, String): `application/json`

---

## 1. Real-Time Communication Dashboard

### Fetch Dashboard Aggregate Statistics
- **URL**: `/api/v1/communication-monitoring/dashboard/stats`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "total_logs": 45280,
      "successful_deliveries_pct": 98.2,
      "active_failures": 12,
      "avg_latency_sec": 1.2
    }
  }
  ```

---

## 2. Delivery Logs & Monitoring

### List and Filter Delivery Logs
- **URL**: `/api/v1/communication-monitoring/logs`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (Optional, Default: 1)
  - `limit` (Optional, Default: 10)
  - `search` (Optional, Search string on address, guest, or campaign name)
  - `channel` (Optional, `Email` | `WhatsApp` | `SMS`)
  - `status` (Optional, `Pending` | `Sent` | `Delivered` | `Failed` | `Read`)
  - `startDate` (Optional, ISO string start date)
  - `endDate` (Optional, ISO string end date)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "pagination": {
      "total": 45280,
      "page": 1,
      "limit": 10,
      "pages": 4528
    },
    "data": [
      {
        "id": 1024,
        "company_id": 1,
        "campaign_id": 3,
        "guest_id": 101,
        "channel": "Email",
        "recipient_address": "julian@company.com",
        "status": "Delivered",
        "delivery_result": "Accepted by SMTP, bounce check passed.",
        "sent_at": "2026-06-23T12:00:00.000Z",
        "delivered_at": "2026-06-23T12:00:01.200Z",
        "read_at": null,
        "created_at": "2026-06-23T11:59:59.000Z",
        "guest_name": "Julian Thorne",
        "campaign_name": "Gala Invitation Blast",
        "failures": [],
        "retries": [],
        "latency": {
          "id": 50,
          "log_id": 1024,
          "channel": "Email",
          "queue_latency_ms": 1000,
          "delivery_latency_ms": 1200,
          "total_latency_ms": 2200,
          "created_at": "2026-06-23T12:00:01.200Z"
        }
      }
    ]
  }
  ```

### Get Delivery Log Details
- **URL**: `/api/v1/communication-monitoring/logs/:id`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1025,
      "company_id": 1,
      "campaign_id": 3,
      "guest_id": 102,
      "channel": "SMS",
      "recipient_address": "+44 7700 900123",
      "status": "Failed",
      "delivery_result": "Invalid Number: Carrier reported 404.",
      "sent_at": "2026-06-23T12:05:00.000Z",
      "delivered_at": null,
      "read_at": null,
      "created_at": "2026-06-23T12:04:59.000Z",
      "guest_name": "David Kincaid",
      "campaign_name": "Gala Invitation Blast",
      "failures": [
        {
          "id": 12,
          "log_id": 1025,
          "gateway_name": "Twilio SMS",
          "error_code": "30008",
          "error_message": "Invalid Destination Address Context",
          "failure_time": "2026-06-23T12:05:01.000Z"
        }
      ],
      "retries": [
        {
          "id": 8,
          "log_id": 1025,
          "retry_count": 1,
          "retry_time": "2026-06-23T12:05:05.000Z",
          "status": "Failed",
          "gateway_response": "Twilio: Destination block detected"
        }
      ],
      "latency": null
    }
  }
  ```

---

## 3. Webhooks & Receipt Tracking

### Track Delivery / Read Receipt (Webhook Mock)
- **URL**: `/api/v1/communication-monitoring/webhooks/track`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "log_id": 1024,
    "status": "Read",
    "delivery_result": "Read by Recipient (Double Blue Tick)",
    "read_at": "2026-06-23T12:10:00.000Z"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1024,
      "status": "Read",
      "delivery_result": "Read by Recipient (Double Blue Tick)",
      "read_at": "2026-06-23T12:10:00.000Z"
    }
  }
  ```

---

## 4. Retries & Failures

### Record Retry Attempt
- **URL**: `/api/v1/communication-monitoring/logs/retry`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "log_id": 1025,
    "retry_count": 2,
    "status": "Retrying",
    "gateway_response": "Carrier Delay: Retrying in 5 minutes."
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 9,
      "log_id": 1025,
      "retry_count": 2,
      "status": "Retrying",
      "retry_time": "2026-06-23T12:12:00.000Z",
      "gateway_response": "Carrier Delay: Retrying in 5 minutes."
    }
  }
  ```

---

## 5. Traffic Rerouting

### Propose / Execute Traffic Reroute
- **URL**: `/api/v1/communication-monitoring/reroute`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "channel": "SMS",
    "from_gateway": "Twilio SMS",
    "to_gateway": "Nexmo/Vonage SMS",
    "reroute_reason": "Automated switch due to high failure rate on primary gateway"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "company_id": 1,
      "channel": "SMS",
      "from_gateway": "Twilio SMS",
      "to_gateway": "Nexmo/Vonage SMS",
      "reroute_reason": "Automated switch due to high failure rate on primary gateway",
      "rerouted_at": "2026-06-23T12:15:00.000Z",
      "is_active": true
    }
  }
  ```

### List Rerouting Logs
- **URL**: `/api/v1/communication-monitoring/reroute`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "channel": "SMS",
        "from_gateway": "Twilio SMS",
        "to_gateway": "Nexmo/Vonage SMS",
        "reroute_reason": "Automated switch due to high failure rate on primary gateway",
        "rerouted_at": "2026-06-23T12:15:00.000Z",
        "is_active": true
      }
    ]
  }
  ```

---

## 6. Automation Alerts

### Fetch Active Automation Alerts
- **URL**: `/api/v1/communication-monitoring/alerts`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "company_id": 1,
        "alert_type": "High Failure Rate",
        "severity": "Critical",
        "message": "We detected 12 delivery failures in the last 15 minutes. Would you like to re-route via secondary SMS gateway?",
        "status": "Active",
        "created_at": "2026-06-23T12:14:00.000Z"
      }
    ]
  }
  ```

### Resolve / Dismiss Alert Warning
- **URL**: `/api/v1/communication-monitoring/alerts/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "Resolved"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 5,
      "status": "Resolved"
    }
  }
  ```

---

## 7. Export Monitoring Logs

### Export Logs CSV
- **URL**: `/api/v1/communication-monitoring/logs/export`
- **Method**: `GET`
- **Query Parameters**:
  - `channel` (Optional)
  - `status` (Optional)
- **Response** (200 OK):
  Returns file content of content-type `text/csv`:
  ```csv
  Timestamp,Channel,Recipient,Status,Result
  "2026-06-23T12:00:00.000Z","Email","julian@company.com","Delivered","Accepted by SMTP, bounce check passed."
  ```
