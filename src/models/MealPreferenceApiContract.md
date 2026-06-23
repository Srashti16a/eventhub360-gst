# EventHub360 Meal Preferences & Dietary Management Module API Contract Documentation

This document defines the REST API contract for the **Meal Preferences & Dietary Management** module of the **EventHub360** backend application.

## Authentication & Context Headers
All administrative endpoints require the following headers for multi-tenancy and audit context:
* `Authorization`: `Bearer <token>` (JWT token mapping to the user ID for auditing `created_by` / `updated_by`)
* `X-Company-ID`: `BIGINT` (Mandatory, multi-tenant scoping maps to `company_id`)
* `X-Branch-ID`: `BIGINT` (Optional, maps to `branch_id`)

---

## 1. Dashboard Metrics Endpoints

### 1.1 Read Meal Preference Dashboard Metrics
Retrieve high-level metrics card counts and allergy alarms for the dashboard.

* **URL**: `/api/meal-preferences/dashboard`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
* **Success Response** (`200 OK` - `DashboardMetricsDTO`):
  ```json
  {
    "success": true,
    "data": {
      "totalGuests": 1248,
      "vegan": {
        "count": 225,
        "percentageOfTotal": 18
      },
      "vegetarian": {
        "count": 402,
        "percentageOfTotal": 32
      },
      "nonVeg": {
        "count": 621,
        "percentageOfTotal": 50
      },
      "allergyAlerts": {
        "count": 42,
        "status": "Critical",
        "label": "42 Allergy Alerts"
      },
      "trends": {
        "growthLabel": "+12% vs last month",
        "veganLabel": "18% of total",
        "vegetarianLabel": "32% of total",
        "nonVegLabel": "50% of total"
      }
    }
  }
  ```

---

## 2. Guest Preference Log Endpoints

### 2.1 List Guest Meal Preferences
Get a paginated, searchable, and filterable log of guest meal preferences and allergen statuses.

* **URL**: `/api/meal-preferences/guests`
* **Method**: `GET`
* **Query Parameters** (`mealPreferenceQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
  - `page`: `INTEGER` (Default: `1`)
  - `limit`: `INTEGER` (Default: `10`)
  - `search`: `STRING` (Optional: Search by guest name or email)
  - `dietary_type`: `STRING` (Optional: `Vegan` | `Vegetarian` | `Non-Vegetarian` | `Gluten-Free` | `Keto` | `Custom`)
  - `category`: `STRING` (Optional: `Speaker` | `VIP` | `Attendee` | `Media`)
* **Success Response** (`200 OK` - Paginated array of `GuestPreferenceLogResponseDTO`):
  ```json
  {
    "success": true,
    "pagination": {
      "total": 1248,
      "page": 1,
      "limit": 4,
      "pages": 312
    },
    "data": [
      {
        "guest_id": 1401,
        "guest_name": "Julianne Smith",
        "guest_email": "j.smith@techcorp.com",
        "guest_category": "Speaker",
        "preferences": {
          "meal_pref_id": 51,
          "dietary_type": "Vegan",
          "custom_dietary_notes": null,
          "special_requests": null,
          "updated_at": "2026-06-21T18:30:00.000Z"
        },
        "allergies": [
          {
            "guest_allergy_id": 101,
            "allergen_name": "Nuts",
            "severity": "Severe",
            "notes": "Severe peanut allergy, requires EpiPen awareness"
          }
        ]
      },
      {
        "guest_id": 1402,
        "guest_name": "Marcus Wright",
        "guest_email": "marcus.w@global.io",
        "guest_category": "VIP",
        "preferences": {
          "meal_pref_id": 52,
          "dietary_type": "Non-Vegetarian",
          "custom_dietary_notes": null,
          "special_requests": null,
          "updated_at": "2026-06-22T09:12:00.000Z"
        },
        "allergies": []
      },
      {
        "guest_id": 1403,
        "guest_name": "Sarah Chen",
        "guest_email": "s.chen@innovate.net",
        "guest_category": "Attendee",
        "preferences": {
          "meal_pref_id": 53,
          "dietary_type": "Gluten-Free",
          "custom_dietary_notes": null,
          "special_requests": "Prefers warm meals",
          "updated_at": "2026-06-22T10:15:00.000Z"
        },
        "allergies": [
          {
            "guest_allergy_id": 102,
            "allergen_name": "Shellfish",
            "severity": "Mild",
            "notes": "Avoid shrimp/lobster cross-contamination"
          }
        ]
      },
      {
        "guest_id": 1404,
        "guest_name": "David Miller",
        "guest_email": "d.miller@exective.com",
        "guest_category": "VIP",
        "preferences": {
          "meal_pref_id": 54,
          "dietary_type": "Keto",
          "custom_dietary_notes": null,
          "special_requests": null,
          "updated_at": "2026-06-22T11:22:00.000Z"
        },
        "allergies": []
      }
    ]
  }
  ```

### 2.2 Upsert Guest Meal Preferences & Allergies
Create or update dietary preferences and allergen tracking details for a specific guest.

* **URL**: `/api/meal-preferences/guests/:id`
* **Method**: `PUT`
* **Request Body** (`mealPrefUpsertSchema`):
  ```json
  {
    "dietary_type": "Vegan",
    "custom_dietary_notes": "Prefers organic tofu products",
    "special_requests": "Serve meals 15 minutes before presentations",
    "allergies": [
      {
        "allergen_name": "Nuts",
        "severity": "Severe",
        "notes": "Anaphylactic reaction to peanuts and walnuts"
      }
    ]
  }
  ```
* **Success Response** (`200 OK` - `GuestPreferenceLogResponseDTO`):
  ```json
  {
    "success": true,
    "message": "Guest meal preferences and allergy profile upserted successfully",
    "data": {
      "guest_id": 1401,
      "guest_name": "Julianne Smith",
      "guest_email": "j.smith@techcorp.com",
      "guest_category": "Speaker",
      "preferences": {
        "meal_pref_id": 51,
        "dietary_type": "Vegan",
        "custom_dietary_notes": "Prefers organic tofu products",
        "special_requests": "Serve meals 15 minutes before presentations",
        "updated_at": "2026-06-22T14:30:00.000Z"
      },
      "allergies": [
        {
          "guest_allergy_id": 101,
          "allergen_name": "Nuts",
          "severity": "Severe",
          "notes": "Anaphylactic reaction to peanuts and walnuts"
        }
      ]
    }
  }
  ```

---

## 3. Procurement Forecast Endpoints

### 3.1 Get Procurement Forecast Matrix
Retrieve forecasted ingredient requirements and category counts calculated from guest dietary distributions.

* **URL**: `/api/meal-preferences/procurement`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
* **Success Response** (`200 OK` - `ProcurementForecastResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "mealCategoryCounts": [
        {
          "category": "Poultry / Red Meat",
          "count": 621,
          "unit": "units"
        },
        {
          "category": "Lacto-Ovo Vegetarian",
          "count": 402,
          "unit": "units"
        },
        {
          "category": "Plant-Based / Vegan",
          "count": 225,
          "unit": "units"
        }
      ],
      "ingredientDemandForecast": [
        {
          "forecast_id": 12,
          "ingredient_name": "Chicken Breast",
          "meal_category": "Poultry / Red Meat",
          "guest_count": 621,
          "buffer_percentage": 10.00,
          "forecast_quantity": 683.10,
          "unit": "kg",
          "status": "Approved"
        },
        {
          "forecast_id": 13,
          "ingredient_name": "Tofu Block",
          "meal_category": "Plant-Based / Vegan",
          "guest_count": 225,
          "buffer_percentage": 15.00,
          "forecast_quantity": 258.75,
          "unit": "units"
        }
      ]
    }
  }
  ```

---

## 4. Chef Summary & Prep Schedules Endpoints

### 4.1 Read Chef Summary
Fetch prep schedule metrics, special request counts, and urgent stock alert alarms.

* **URL**: `/api/meal-preferences/chef-summary`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
* **Success Response** (`200 OK` - `ChefSummaryResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "stockAlerts": [
        {
          "item": "Chicken Breast",
          "status": "Low"
        }
      ],
      "prepStartTime": "06:00 AM",
      "specialRequestCount": 18,
      "prepSchedules": [
        {
          "schedule_id": 301,
          "menu_item_id": 81,
          "menu_item_name": "Heritage Carrot & Miso Puree",
          "dietary_category": "Vegan",
          "prep_start_time": "06:00 AM",
          "special_request_count": 5,
          "inventory_status": "Adequate",
          "stock_alert_item": null,
          "notes": "Puree carrots extra fine. Serve with roasted sesame oil seeds."
        },
        {
          "schedule_id": 302,
          "menu_item_id": 82,
          "menu_item_name": "Pan-Seared Organic Chicken",
          "dietary_category": "Non-Vegetarian",
          "prep_start_time": "06:00 AM",
          "special_request_count": 13,
          "inventory_status": "Low",
          "stock_alert_item": "Chicken Breast",
          "notes": "Ensure strict separation from gluten products during prep."
        }
      ]
    }
  }
  ```

### 4.2 Update Chef Prep Schedule / Inventory Warning
Update preparation metrics, start time, or inventory alert levels for a dish.

* **URL**: `/api/meal-preferences/chef-summary/:id`
* **Method**: `PUT`
* **Request Body** (`chefScheduleUpdateSchema`):
  ```json
  {
    "prep_start_time": "05:30 AM",
    "inventory_status": "Critical",
    "stock_alert_item": "Chicken Breast",
    "notes": "Run urgent procurement request for fresh poultry supplies"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Chef preparation schedule updated successfully",
    "data": {
      "schedule_id": 302,
      "menu_item_id": 82,
      "prep_start_time": "05:30 AM",
      "special_request_count": 13,
      "inventory_status": "Critical",
      "stock_alert_item": "Chicken Breast",
      "notes": "Run urgent procurement request for fresh poultry supplies"
    }
  }
  ```

---

## 5. Menu Items Management Endpoints

### 5.1 List Menu Items
* **URL**: `/api/meal-preferences/menu`
* **Method**: `GET`
* **Query Parameters**:
  - `event_id`: `INTEGER` (Optional)
  - `is_active`: `BOOLEAN` (Optional)
* **Success Response** (`200 OK` - array of `MenuItemResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "menu_item_id": 81,
        "name": "Heritage Carrot & Miso Puree",
        "description": "Roasted heirloom carrots pureed with red miso and toasted almonds.",
        "dietary_category": "Vegan",
        "allergens": ["Nuts"],
        "is_daily_special": true,
        "price": 14.50,
        "is_active": true,
        "created_at": "2026-06-22T08:00:00.000Z"
      }
    ]
  }
  ```

### 5.2 Create Menu Item
* **URL**: `/api/meal-preferences/menu`
* **Method**: `POST`
* **Request Body** (`menuItemCreateSchema`):
  ```json
  {
    "name": "Heritage Carrot & Miso Puree",
    "description": "Roasted heirloom carrots pureed with red miso and toasted almonds.",
    "dietary_category": "Vegan",
    "allergens": ["Nuts"],
    "is_daily_special": true,
    "price": 14.50,
    "is_active": true
  }
  ```
* **Success Response** (`201 Created` - `MenuItemResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "menu_item_id": 81,
      "name": "Heritage Carrot & Miso Puree",
      "description": "Roasted heirloom carrots pureed with red miso and toasted almonds.",
      "dietary_category": "Vegan",
      "allergens": ["Nuts"],
      "is_daily_special": true,
      "price": 14.50,
      "is_active": true,
      "created_at": "2026-06-22T08:00:00.000Z"
    }
  }
  ```

### 5.3 Update Menu Item
* **URL**: `/api/meal-preferences/menu/:id`
* **Method**: `PUT`
* **Request Body** (`menuItemUpdateSchema`):
  ```json
  {
    "price": 15.00,
    "is_daily_special": false
  }
  ```
* **Success Response** (`200 OK` - `MenuItemResponseDTO`):
  ```json
  {
    "success": true,
    "data": {
      "menu_item_id": 81,
      "name": "Heritage Carrot & Miso Puree",
      "price": 15.00,
      "is_daily_special": false,
      "is_active": true
    }
  }
  ```

### 5.4 Delete Menu Item
* **URL**: `/api/meal-preferences/menu/:id`
* **Method**: `DELETE`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Menu item deleted successfully"
  }
  ```

---

## 6. Smart Recommendations Endpoints

### 6.1 List Active Recommendations & Warnings
Fetch AI-driven recommendations, allergy risk alerts, or catering suggestions based on guest data overlap.

* **URL**: `/api/meal-preferences/recommendations`
* **Method**: `GET`
* **Query Parameters** (`dashboardQuerySchema`):
  - `event_id`: `INTEGER` (Mandatory, scoped event identifier)
* **Success Response** (`200 OK` - array of `MealRecommendationResponseDTO`):
  ```json
  {
    "success": true,
    "data": [
      {
        "suggestion_id": 1,
        "recommendation_type": "Smart Catering",
        "message": "Based on current data, we recommend increasing the **Nut-Free** appetizer count by 15% due to high severe allergy overlap.",
        "recommendation_metadata": {
          "allergy_overlap": "Nuts",
          "increase_percentage": 15,
          "target_appetizer_ids": [105, 107]
        },
        "status": "Active",
        "created_at": "2026-06-22T12:00:00.000Z",
        "applied_at": null
      }
    ]
  }
  ```

### 6.2 Apply or Dismiss Recommendation
Perform actions on a recommendation warning to apply or dismiss it.

* **URL**: `/api/meal-preferences/recommendations/action`
* **Method**: `POST`
* **Request Body** (`recommendationActionSchema`):
  ```json
  {
    "suggestion_id": 1,
    "action": "Apply"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Recommendation successfully Applied",
    "data": {
      "suggestion_id": 1,
      "status": "Applied",
      "applied_at": "2026-06-22T14:35:00.000Z"
    }
  }
  ```
