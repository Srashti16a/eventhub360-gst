/**
 * Meal Preferences & Dietary Management Data Transfer Objects (DTOs)
 */

class DashboardMetricsDTO {
    /**
     * @param {Object} params
     * @param {number} params.totalGuests
     * @param {number} params.veganCount
     * @param {number} params.vegetarianCount
     * @param {number} params.nonVegCount
     * @param {number} params.allergyAlertCount
     */
    constructor({ totalGuests, veganCount, vegetarianCount, nonVegCount, allergyAlertCount }) {
        this.totalGuests = Number(totalGuests);
        this.vegan = {
            count: Number(veganCount),
            percentageOfTotal: totalGuests > 0 ? Math.round((veganCount / totalGuests) * 100) : 0
        };
        this.vegetarian = {
            count: Number(vegetarianCount),
            percentageOfTotal: totalGuests > 0 ? Math.round((vegetarianCount / totalGuests) * 100) : 0
        };
        this.nonVeg = {
            count: Number(nonVegCount),
            percentageOfTotal: totalGuests > 0 ? Math.round((nonVegCount / totalGuests) * 100) : 0
        };
        this.allergyAlerts = {
            count: Number(allergyAlertCount),
            status: allergyAlertCount > 0 ? 'Critical' : 'Nominal',
            label: `${allergyAlertCount} Allergy Alerts`
        };
        this.trends = {
            growthLabel: '+12% vs last month',
            veganLabel: `${this.vegan.percentageOfTotal}% of total`,
            vegetarianLabel: `${this.vegetarian.percentageOfTotal}% of total`,
            nonVegLabel: `${this.nonVeg.percentageOfTotal}% of total`
        };
    }
}

class GuestPreferenceLogResponseDTO {
    /**
     * @param {import('./MealPref')} mealPref 
     * @param {import('./GuestAllergy')[]} guestAllergies 
     */
    constructor(mealPref, guestAllergies = []) {
        this.guest_id = mealPref.guest_id;
        this.guest_name = mealPref.guest_name || 'Guest ID #' + mealPref.guest_id;
        this.guest_email = mealPref.guest_email || 'No email available';
        this.guest_category = mealPref.guest_category || 'Attendee';
        
        this.preferences = {
            meal_pref_id: mealPref.meal_pref_id,
            dietary_type: mealPref.dietary_type, // 'Vegan', 'Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Keto', 'Custom'
            custom_dietary_notes: mealPref.custom_dietary_notes,
            special_requests: mealPref.special_requests,
            updated_at: mealPref.updated_at ? mealPref.updated_at.toISOString() : null
        };

        this.allergies = guestAllergies.map(a => ({
            guest_allergy_id: a.guest_allergy_id,
            allergen_name: a.allergen_name,
            severity: a.severity, // 'Mild', 'Moderate', 'Severe'
            notes: a.notes
        }));
    }
}

class MealPrefUpsertDTO {
    constructor(data) {
        this.dietary_type = data.dietary_type || 'Non-Vegetarian';
        this.custom_dietary_notes = data.custom_dietary_notes || null;
        this.special_requests = data.special_requests || null;
        
        // Array of allergen objects: [ { allergen_name: 'Nuts', severity: 'Severe', notes: 'Peanuts only' } ]
        this.allergies = Array.isArray(data.allergies) 
            ? data.allergies.map(a => ({
                allergen_name: a.allergen_name,
                severity: a.severity || 'Mild',
                notes: a.notes || null
            }))
            : [];
    }
}

class ProcurementForecastResponseDTO {
    /**
     * @param {Object} counts - e.g. { vegan: 225, vegetarian: 402, nonVeg: 621 }
     * @param {Object[]} forecasts - DB rows of forecasted ingredients
     */
    constructor(counts, forecasts = []) {
        this.mealCategoryCounts = [
            { category: 'Poultry / Red Meat', count: Number(counts.nonVeg || 0), unit: 'units' },
            { category: 'Lacto-Ovo Vegetarian', count: Number(counts.vegetarian || 0), unit: 'units' },
            { category: 'Plant-Based / Vegan', count: Number(counts.vegan || 0), unit: 'units' }
        ];

        this.ingredientDemandForecast = forecasts.map(f => ({
            forecast_id: f.forecast_id,
            ingredient_name: f.ingredient_name,
            meal_category: f.meal_category,
            guest_count: Number(f.guest_count),
            buffer_percentage: Number(f.buffer_percentage || 10.00),
            forecast_quantity: Number(f.forecast_quantity),
            unit: f.unit || 'kg',
            status: f.status || 'Draft'
        }));
    }
}

class ChefSummaryResponseDTO {
    /**
     * @param {import('./ChefPrepSchedule')[]} schedules
     */
    constructor(schedules = []) {
        // Collect alerts for items whose stock is 'Low' or 'Critical'
        this.stockAlerts = schedules
            .filter(s => s.inventory_status === 'Low' || s.inventory_status === 'Critical')
            .map(s => ({
                item: s.stock_alert_item || s.menu_item_name || 'Ingredient',
                status: s.inventory_status
            }));

        // Default or aggregated preparation timings
        this.prepStartTime = schedules.length > 0 ? schedules[0].prep_start_time : '06:00 AM';
        
        // Sum total special requests
        this.specialRequestCount = schedules.reduce((sum, s) => sum + (s.special_request_count || 0), 0);

        this.prepSchedules = schedules.map(s => ({
            schedule_id: s.schedule_id,
            menu_item_id: s.menu_item_id,
            menu_item_name: s.menu_item_name,
            dietary_category: s.menu_item_dietary_category,
            prep_start_time: s.prep_start_time,
            special_request_count: s.special_request_count,
            inventory_status: s.inventory_status,
            stock_alert_item: s.stock_alert_item,
            notes: s.notes
        }));
    }
}

class MenuItemResponseDTO {
    /**
     * @param {import('./MenuItem')} item 
     */
    constructor(item) {
        this.menu_item_id = item.menu_item_id;
        this.name = item.name;
        this.description = item.description;
        this.dietary_category = item.dietary_category;
        this.allergens = item.allergens;
        this.is_daily_special = item.is_daily_special;
        this.price = item.price;
        this.is_active = item.is_active;
        this.created_at = item.created_at ? item.created_at.toISOString() : null;
    }
}

class MenuItemCreateDTO {
    constructor(data) {
        this.name = data.name;
        this.description = data.description || null;
        this.dietary_category = data.dietary_category; // 'Vegan' | 'Vegetarian' | 'Non-Vegetarian' | 'Gluten-Free' | 'Keto' | 'Custom'
        this.allergens = Array.isArray(data.allergens) ? data.allergens : [];
        this.is_daily_special = Boolean(data.is_daily_special);
        this.price = Number(data.price || 0.00);
        this.is_active = data.is_active !== undefined ? Boolean(data.is_active) : true;
    }
}

class MealRecommendationResponseDTO {
    /**
     * @param {import('./MealRecommendation')} rec 
     */
    constructor(rec) {
        this.suggestion_id = rec.suggestion_id;
        this.recommendation_type = rec.recommendation_type; // 'Dietary Trend' | 'Menu Optimization' | 'Allergy Risk Warning' | 'Smart Catering'
        this.message = rec.message;
        this.recommendation_metadata = rec.recommendation_metadata;
        this.status = rec.status;
        this.created_at = rec.created_at ? rec.created_at.toISOString() : null;
        this.applied_at = rec.applied_at ? rec.applied_at.toISOString() : null;
    }
}

module.exports = {
    DashboardMetricsDTO,
    GuestPreferenceLogResponseDTO,
    MealPrefUpsertDTO,
    ProcurementForecastResponseDTO,
    ChefSummaryResponseDTO,
    MenuItemResponseDTO,
    MenuItemCreateDTO,
    MealRecommendationResponseDTO
};
