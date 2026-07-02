-- Create trigger bypass check function
CREATE OR REPLACE FUNCTION check_bypass_demo_protection()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN current_setting('app.bypass_demo_protection', true) = 'true';
END;
$$ LANGUAGE plpgsql;

-- 1. Protect Event
CREATE OR REPLACE FUNCTION protect_demo_events()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF OLD.title LIKE '%[Demo]%' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_events
BEFORE DELETE ON "Event"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_events();

-- 2. Protect Hotel
CREATE OR REPLACE FUNCTION protect_demo_hotels()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF OLD.name LIKE '%[Demo]%' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_hotels
BEFORE DELETE ON "Hotel"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_hotels();

-- 3. Protect Table
CREATE OR REPLACE FUNCTION protect_demo_tables()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF OLD.name LIKE '%[Demo]%' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_tables
BEFORE DELETE ON "Table"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_tables();

-- 4. Protect Guest
CREATE OR REPLACE FUNCTION protect_demo_guests()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF OLD.email LIKE '%@demoseed.com' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_guests
BEFORE DELETE ON "Guest"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_guests();

-- 5. Protect Driver
CREATE OR REPLACE FUNCTION protect_demo_drivers()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF OLD."fullName" LIKE '%[Demo]%' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_drivers
BEFORE DELETE ON "Driver"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_drivers();

-- 6. Protect Vehicle
CREATE OR REPLACE FUNCTION protect_demo_vehicles()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF OLD.name LIKE '%[Demo]%' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_vehicles
BEFORE DELETE ON "Vehicle"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_vehicles();

-- 7. Protect TransportRoute
CREATE OR REPLACE FUNCTION protect_demo_routes()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF OLD."routeName" LIKE '%[Demo]%' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_routes
BEFORE DELETE ON "TransportRoute"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_routes();

-- 8. Protect TransferSchedule
CREATE OR REPLACE FUNCTION protect_demo_schedules()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF EXISTS (SELECT 1 FROM "Guest" WHERE id = OLD."guestId" AND email LIKE '%@demoseed.com') THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_schedules
BEFORE DELETE ON "TransferSchedule"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_schedules();

-- 9. Protect FleetAssignment
CREATE OR REPLACE FUNCTION protect_demo_assignments()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF EXISTS (SELECT 1 FROM "Event" WHERE id = OLD."eventId" AND title LIKE '%[Demo]%') THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_assignments
BEFORE DELETE ON "FleetAssignment"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_assignments();

-- 10. Protect FleetActivityLog
CREATE OR REPLACE FUNCTION protect_demo_activity_logs()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF EXISTS (SELECT 1 FROM "Vehicle" WHERE id = OLD."vehicleId" AND name LIKE '%[Demo]%') THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_activity_logs
BEFORE DELETE ON "FleetActivityLog"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_activity_logs();

-- 11. Protect VehicleMaintenance
CREATE OR REPLACE FUNCTION protect_demo_maintenances()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF EXISTS (SELECT 1 FROM "Vehicle" WHERE id = OLD."vehicleId" AND name LIKE '%[Demo]%') THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_maintenances
BEFORE DELETE ON "VehicleMaintenance"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_maintenances();

-- 12. Protect FleetAnalytics
CREATE OR REPLACE FUNCTION protect_demo_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF check_bypass_demo_protection() THEN
        RETURN OLD;
    END IF;
    IF EXISTS (SELECT 1 FROM "Event" WHERE id = OLD."eventId" AND title LIKE '%[Demo]%') THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_protect_demo_analytics
BEFORE DELETE ON "FleetAnalytics"
FOR EACH ROW
EXECUTE FUNCTION protect_demo_analytics();