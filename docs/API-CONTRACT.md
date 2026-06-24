# EventHub360 GST — API Contract

> **Base URL:** `http://localhost:3000/api`
>
> **Content-Type:** `application/json` (unless noted otherwise)

---

## Response Envelope

All endpoints return a consistent JSON envelope.

### Success

```json
{
  "success": true,
  "message": "Optional success message",
  "data": { }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "details": []
  }
}
```

### Paginated List (Guest list only)

```json
{
  "success": true,
  "meta": {
    "totalGuests": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12
  },
  "data": []
}
```

---

## 1. Dashboard

### `GET /api/dashboard/stats`

Returns aggregate guest statistics.

| Field | Type | Description |
|-------|------|-------------|
| — | — | No request body or query params |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "totalGuests": { "value": 120, "growth": "+4.2%" },
    "confirmed": { "value": 92, "growth": "+12%" },
    "pendingRsvp": { "value": 18, "growth": "-2%" },
    "vipStatus": { "value": 15, "growth": null }
  }
}
```

---

## 2. Guests

### `GET /api/guests`

List guests with filtering, search, pagination, and sorting.

**Query Parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search by name, email, or phone |
| `rsvpStatus` | string | `ALL` | Filter: `CONFIRMED`, `PENDING`, `DECLINED`, or `ALL` |
| `eventCategory` | string | `All Events` | Filter by event category |
| `vipOnly` | string | `false` | `"true"` to show VIP guests only |
| `page` | string (numeric) | `1` | Page number |
| `limit` | string (numeric) | `10` | Items per page |
| `sortBy` | string | `name` | One of: `name`, `status`, `email`, `createdAt` |
| `sortOrder` | string | `asc` | `asc` or `desc` |

**Response `200`** — Paginated list (see envelope above)

**Response `400`** — Validation error (invalid query params)

---

### `GET /api/guests/:id`

Get a single guest by UUID.

**Path Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID string | Guest ID |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "avatar": "string (URL)",
    "email": "string",
    "phone": "string",
    "status": "CONFIRMED | PENDING | DECLINED",
    "isVip": false,
    "isSpeaker": false,
    "isBridalParty": false,
    "isPrimaryGuest": false,
    "assignedHotelId": "uuid | null",
    "assignedHotel": { "id": "uuid", "name": "string" },
    "eventId": "uuid",
    "event": { "id": "uuid", "title": "string", "category": "string", "date": "ISO" },
    "tableId": "uuid | null",
    "table": { "id": "uuid", "name": "string", "capacity": 10 },
    "seatNumber": "number | null",
    "createdAt": "ISO",
    "updatedAt": "ISO"
  }
}
```

**Response `400`** — Invalid UUID format

**Response `404`** — Guest not found

---

### `POST /api/guests`

Create a new guest.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Guest full name (min 1 char) |
| `email` | string | ✅ | Valid email address |
| `phone` | string | ✅ | Phone number (min 5 chars) |
| `status` | string | ✅ | `CONFIRMED`, `PENDING`, or `DECLINED` |
| `eventId` | UUID | ✅ | Must reference an existing Event |
| `avatar` | string | ❌ | URL; defaults to placeholder |
| `isVip` | boolean | ❌ | Default `false` |
| `isSpeaker` | boolean | ❌ | Default `false` |
| `isBridalParty` | boolean | ❌ | Default `false` |
| `isPrimaryGuest` | boolean | ❌ | Default `false` |
| `assignedHotelId` | UUID | ❌ | Must reference an existing Hotel |
| `tableId` | UUID | ❌ | Must reference an existing Table |
| `seatNumber` | integer | ❌ | Positive integer |

**Response `201`** — Created guest object

**Response `400`** — Validation error or invalid foreign key

---

### `PUT /api/guests/:id`

Update an existing guest. All body fields are optional.

**Path Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID string | Guest ID |

**Request Body** — Same fields as `POST`, all optional.

**Response `200`** — Updated guest object

**Response `400`** — Validation error or invalid foreign key

**Response `404`** — Guest not found

---

### `DELETE /api/guests/:id`

Hard-delete a guest record.

**Path Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID string | Guest ID |

**Response `200`**

```json
{
  "success": true,
  "message": "Guest deleted successfully"
}
```

**Response `400`** — Invalid UUID format

**Response `404`** — Guest not found

---

## 3. Bulk Guest Operations

### `GET /api/guests/export`

Export filtered guests as a CSV file download.

**Query Parameters** — Same filters as `GET /api/guests` (search, rsvpStatus, eventCategory, vipOnly).

**Response `200`** — `Content-Type: text/csv`

---

### `POST /api/guests/import`

Import guests from JSON array or CSV text.

**JSON Import** (`Content-Type: application/json`)

```json
[
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "status": "CONFIRMED",
    "eventcategory": "Corporate Gala"
  }
]
```

**CSV Import** (`Content-Type: text/csv`)

```
Name,Email,Phone,Status,EventCategory
Jane Doe,jane@example.com,+1234567890,CONFIRMED,Corporate Gala
```

**Response `200`**

```json
{
  "success": true,
  "summary": {
    "totalProcessed": 1,
    "successfullyImported": 1,
    "failed": 0
  },
  "imported": [ ],
  "errors": [ ]
}
```

**Response `400`** — Invalid format or missing required fields

---

## 4. Events

### `GET /api/events`

List all events sorted by title.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Corporate Gala",
      "category": "Corporate Gala",
      "date": "ISO",
      "createdAt": "ISO",
      "updatedAt": "ISO"
    }
  ]
}
```

---

### `POST /api/events`

Create a new event.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Event title |
| `category` | string | ✅ | Event category |
| `date` | string (ISO) | ❌ | Defaults to current date |

**Response `201`** — Created event object

**Response `400`** — Missing title or category

---

## 5. Hotels

### `GET /api/hotels`

List all hotels sorted by name.

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Grand Hotel", "createdAt": "ISO", "updatedAt": "ISO" }
  ]
}
```

---

### `POST /api/hotels`

Create a new hotel.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Hotel name |

**Response `201`** — Created hotel object

**Response `400`** — Missing name

---

## 6. Seating

### `GET /api/seating/tables`

List all tables with their assigned guests.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Table 1",
      "capacity": 10,
      "guests": [
        { "id": "uuid", "name": "...", "email": "...", "avatar": "...", "status": "...", "isVip": false, "seatNumber": 1 }
      ]
    }
  ]
}
```

---

### `PUT /api/seating/assign`

Assign or unassign a guest to/from a table.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `guestId` | UUID | ✅ | Guest to assign |
| `tableId` | UUID | ❌ | Table to assign to (omit or `null` to unassign) |
| `seatNumber` | integer | ❌ | Specific seat at the table |

**Response `200`**

```json
{
  "success": true,
  "message": "Guest assigned to Table 1 successfully",
  "data": { }
}
```

**Response `400`** — Missing guestId, table at capacity, or seat already taken

**Response `404`** — Guest or table not found

---

## 7. Campaigns

### `POST /api/campaigns/send-rsvp`

Trigger an RSVP reminder or itinerary campaign (simulated).

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `campaignType` | string | ❌ | `RSVP_REMINDER` (default) or `ITINERARY` |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "campaignName": "RSVP Pending Reminders Campaign",
    "type": "RSVP_REMINDER",
    "recipientCount": 18,
    "status": "SENT",
    "sentAt": "ISO",
    "message": "Successfully broadcasted campaign to 18 recipients."
  }
}
```

**Response `400`** — Invalid campaignType

---

## Swagger UI

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```
