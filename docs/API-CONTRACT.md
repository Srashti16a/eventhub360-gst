# API Contract

## Base URL
`/api`

---

## Guest Management APIs

### 1. GET /api/guests
**Purpose**: Retrieve a paginated list of guests.
**HTTP Method**: GET
**Required fields**: None (supports query params like `page`, `limit`, `search`, `sortBy`, `sortOrder`).
**Request body example**: None
**Success response example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "CONFIRMED",
      "isVip": false,
      "isSpeaker": false,
      "isBridalParty": false,
      "isPrimaryGuest": false,
      "eventId": "event-uuid-here"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```
**Error response example**:
```json
{
  "success": false,
  "error": {
    "message": "Failed to fetch guests"
  }
}
```

---

### 2. GET /api/guests/:id
**Purpose**: Retrieve a specific guest by their ID.
**HTTP Method**: GET
**Required fields**: `id` (in URL parameters)
**Request body example**: None
**Success response example**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "status": "CONFIRMED",
    "eventId": "event-uuid-here"
  }
}
```
**Error response example**:
```json
{
  "success": false,
  "error": {
    "message": "Guest not found"
  }
}
```

---

### 3. POST /api/guests
**Purpose**: Create a new guest.
**HTTP Method**: POST
**Required fields**: `name`, `email`, `phone`, `status`, `eventId`
**Request body example**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "555-0199",
  "status": "PENDING",
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "isVip": true
}
```
**Success response example**:
```json
{
  "success": true,
  "data": {
    "id": "987e6543-e21b-34d3-b456-426614174111",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "555-0199",
    "status": "PENDING",
    "isVip": true,
    "eventId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```
**Error response example**:
```json
{
  "success": false,
  "error": {
    "message": "Validation Error: Email is required"
  }
}
```

---

### 4. PUT /api/guests/:id
**Purpose**: Update an existing guest.
**HTTP Method**: PUT
**Required fields**: `id` (in URL parameters). Request body fields are optional.
**Request body example**:
```json
{
  "status": "CONFIRMED",
  "isVip": false
}
```
**Success response example**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "status": "CONFIRMED"
  }
}
```
**Error response example**:
```json
{
  "success": false,
  "error": {
    "message": "Guest not found"
  }
}
```

---

### 5. DELETE /api/guests/:id
**Purpose**: Delete an existing guest.
**HTTP Method**: DELETE
**Required fields**: `id` (in URL parameters)
**Request body example**: None
**Success response example**:
```json
{
  "success": true,
  "message": "Guest deleted successfully"
}
```
**Error response example**:
```json
{
  "success": false,
  "error": {
    "message": "Guest not found"
  }
}
```

---

## Dashboard APIs

### 6. GET /api/dashboard/stats
*(Note: Exists as `/api/dashboard/stats` instead of `/api/dashboard/summary`)*
**Purpose**: Retrieve dashboard statistics for total guests, confirmed, pending, and VIP.
**HTTP Method**: GET
**Required fields**: None
**Request body example**: None
**Success response example**:
```json
{
  "success": true,
  "data": {
    "totalGuests": { "value": 150, "growth": "+4.2%" },
    "confirmed": { "value": 120, "growth": "+12%" },
    "pendingRsvp": { "value": 30, "growth": "-2%" },
    "vipStatus": { "value": 15, "growth": null }
  }
}
```
**Error response example**:
```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error"
  }
}
```

---

## Missing Endpoints
The following endpoints were requested but do **not exist** in the primary Guest Management backend:
- `POST /api/rsvp`
- `GET /api/rsvp`
- `POST /api/qr/generate`
- `POST /api/checkin`

*(Note: Similar endpoints like `/api/v1/analytics/rsvp`, `/api/v1/qr-pass/generate`, and `/api/v1/checkin/qr-scan` exist in other microservice branches, but not in the core Guest module.)*
