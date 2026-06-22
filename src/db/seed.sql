-- Seed Data for Guest Management Module

-- 1. Insert Guests
INSERT INTO guest (guest_id, company_id, name, phone, category, tenant_id, branch_id) VALUES
(1, 100, 'Sharma Family', '+919876543210', 'Family', 1, 10),
(2, 100, 'Mr. Mehta', '+919876543211', 'VIP', 1, 10),
(3, 101, 'TechCorp Delegation', '+15550199', 'Corporate', 1, 11),
(4, 102, 'Alice Smith', '+15550188', 'VIP', 1, 10);

-- Adjust guest sequence to avoid primary key collisions on auto-increment
SELECT setval(pg_get_serial_sequence('guest', 'guest_id'), coalesce(max(guest_id), 1)) FROM guest;

-- 2. Insert Guest Groups
INSERT INTO guest_group (group_id, event_id, name, tenant_id, company_id, branch_id) VALUES
(1, 200, 'Sharma Group', 1, 100, 10),
(2, 200, 'VIP Table 1', 1, 100, 10),
(3, 201, 'Corporate Guests', 1, 101, 11);

SELECT setval(pg_get_serial_sequence('guest_group', 'group_id'), coalesce(max(group_id), 1)) FROM guest_group;

-- 3. Insert Event Guests (attending Event 200 and 201)
INSERT INTO event_guest (event_guest_id, event_id, guest_id, group_id, invited, rsvp_token, tenant_id, company_id, branch_id) VALUES
(1, 200, 1, 1, TRUE, 'rsvp-token-sharma', 1, 100, 10),
(2, 200, 2, 2, TRUE, 'rsvp-token-mehta', 1, 100, 10),
(3, 201, 3, 3, TRUE, 'rsvp-token-techcorp', 1, 101, 11),
(4, 200, 4, NULL, TRUE, 'rsvp-token-alice', 1, 102, 10);

SELECT setval(pg_get_serial_sequence('event_guest', 'event_guest_id'), coalesce(max(event_guest_id), 1)) FROM event_guest;

-- 4. Insert Seating
INSERT INTO seating (seating_id, event_guest_id, table_no, seat_no, tenant_id, company_id, branch_id) VALUES
(1, 1, 'T7', 'S1', 1, 100, 10),
(2, 2, 'T1', 'S5', 1, 100, 10);

SELECT setval(pg_get_serial_sequence('seating', 'seating_id'), coalesce(max(seating_id), 1)) FROM seating;

-- 5. Insert Meal Preferences
INSERT INTO meal_pref (meal_pref_id, event_guest_id, preference, tenant_id, company_id, branch_id) VALUES
(1, 1, 'Veg', 1, 100, 10),
(2, 1, 'Allergy: Peanuts', 1, 100, 10),
(3, 2, 'Non-veg', 1, 100, 10);

SELECT setval(pg_get_serial_sequence('meal_pref', 'meal_pref_id'), coalesce(max(meal_pref_id), 1)) FROM meal_pref;

-- 6. Insert RSVPs (Initially only Sharma Family has responded)
INSERT INTO rsvp (rsvp_id, event_guest_id, status, pax, responded_at, tenant_id, company_id, branch_id) VALUES
(1, 1, 'yes', 4, NOW() - INTERVAL '1 DAY', 1, 100, 10);

SELECT setval(pg_get_serial_sequence('rsvp', 'rsvp_id'), coalesce(max(rsvp_id), 1)) FROM rsvp;

-- 7. Insert Guest Check-ins (Sharma Family checked in earlier)
INSERT INTO guest_checkin (checkin_id, event_guest_id, checked_in_at, qr_code, tenant_id, company_id, branch_id) VALUES
(1, 1, NOW() - INTERVAL '2 HOURS', 'qr-sharma-123', 1, 100, 10);

SELECT setval(pg_get_serial_sequence('guest_checkin', 'checkin_id'), coalesce(max(checkin_id), 1)) FROM guest_checkin;
