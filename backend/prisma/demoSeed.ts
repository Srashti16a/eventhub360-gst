import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Demo Dataset Seeding ---');

  // 1. Temporarily drop triggers so we can clean up old demo data
  console.log('Temporarily dropping triggers...');
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_guests ON "Guest"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_events ON "Event"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_hotels ON "Hotel"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_tables ON "Table"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_drivers ON "Driver"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_vehicles ON "Vehicle"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_routes ON "TransportRoute"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_schedules ON "TransferSchedule"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_assignments ON "FleetAssignment"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_activity_logs ON "FleetActivityLog"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_maintenances ON "VehicleMaintenance"`);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_protect_demo_analytics ON "FleetAnalytics"`);

  // 2. Clear previous demo data
  console.log('Clearing old demo data...');
  
  // Child tables first
  await prisma.transferSchedule.deleteMany({
    where: {
      OR: [
        { guest: { email: { endsWith: '@demoseed.com' } } },
        { event: { title: { startsWith: '[Demo]' } } }
      ]
    }
  });

  await prisma.fleetAssignment.deleteMany({
    where: {
      event: { title: { startsWith: '[Demo]' } }
    }
  });

  await prisma.fleetActivityLog.deleteMany({
    where: {
      vehicle: { name: { startsWith: '[Demo]' } }
    }
  });

  await prisma.vehicleMaintenance.deleteMany({
    where: {
      vehicle: { name: { startsWith: '[Demo]' } }
    }
  });

  await prisma.fleetAnalytics.deleteMany({
    where: {
      event: { title: { startsWith: '[Demo]' } }
    }
  });

  // Parent tables
  await prisma.guest.deleteMany({ where: { email: { endsWith: '@demoseed.com' } } });
  await prisma.event.deleteMany({ where: { title: { startsWith: '[Demo]' } } });
  await prisma.hotel.deleteMany({ where: { name: { startsWith: '[Demo]' } } });
  await prisma.table.deleteMany({ where: { name: { startsWith: '[Demo]' } } });
  await prisma.driver.deleteMany({ where: { fullName: { startsWith: '[Demo]' } } });
  await prisma.vehicle.deleteMany({ where: { name: { startsWith: '[Demo]' } } });
  await prisma.transportRoute.deleteMany({ where: { routeName: { startsWith: '[Demo]' } } });

  // 3. Create Demo Events
  console.log('Creating demo events...');
  const eventExecutive = await prisma.event.create({
    data: {
      title: '[Demo] VIP Executive Retrospective',
      category: 'Corporate Gala',
      date: new Date('2026-10-05T18:00:00Z'),
    }
  });

  const eventLuxury = await prisma.event.create({
    data: {
      title: '[Demo] Luxury Brand Unveiling',
      category: 'Product Launch',
      date: new Date('2026-08-12T19:30:00Z'),
    }
  });

  const demoEvents = [eventExecutive, eventLuxury];

  // 4. Create Demo Hotels
  console.log('Creating demo hotels...');
  const hotelResort = await prisma.hotel.create({ data: { name: '[Demo] Grand Palace Resort' } });
  const hotelSuites = await prisma.hotel.create({ data: { name: '[Demo] Elite Executive Suites' } });
  const demoHotels = [hotelResort, hotelSuites];

  // 5. Create Demo Tables
  console.log('Creating demo tables...');
  const tableAlpha = await prisma.table.create({ data: { name: '[Demo] Table Alpha', capacity: 8 } });
  const tableBeta = await prisma.table.create({ data: { name: '[Demo] Table Beta', capacity: 8 } });
  const tableGamma = await prisma.table.create({ data: { name: '[Demo] Table Gamma', capacity: 8 } });
  const demoTables = [tableAlpha, tableBeta, tableGamma];

  // 6. Create Demo Guests (~60 guests)
  console.log('Generating 60 demo guests...');
  const firstNames = ['Marcus', 'Helena', 'Dmitri', 'Aria', 'Julian', 'Seraphina', 'Silas', 'Clara', 'Arthur', 'Valerie', 'Cassius', 'Diana'];
  const lastNames = ['Sterling', 'Vance', 'Blackwood', 'Montague', 'Kensington', 'Sinclair', 'Fairfax', 'St. James', 'Hawthorne'];

  const generatedNames = new Set<string>();
  const getName = () => {
    while (true) {
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${first} ${last}`;
      if (!generatedNames.has(fullName)) {
        generatedNames.add(fullName);
        return fullName;
      }
    }
  };

  const guestsToCreate = [];

  // Generate 30 guests for Executive Retrospective
  for (let i = 1; i <= 30; i++) {
    const name = getName();
    const isVip = i <= 6; // 6 VIPs
    const status = i <= 20 ? 'CONFIRMED' : i <= 27 ? 'PENDING' : 'DECLINED';
    const hotel = isVip ? hotelResort : (i % 2 === 0 ? hotelSuites : null);
    const table = status === 'CONFIRMED' ? (i <= 8 ? tableAlpha : (i <= 16 ? tableBeta : tableGamma)) : null;
    const seatNumber = table ? (i % 8) + 1 : null;

    guestsToCreate.push({
      name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@demoseed.com`,
      phone: `+1 (555) 900-${1000 + i}`,
      status,
      isVip,
      isSpeaker: isVip && i % 2 === 0,
      isBridalParty: false,
      isPrimaryGuest: !isVip && i % 4 === 0,
      eventId: eventExecutive.id,
      assignedHotelId: hotel ? hotel.id : null,
      tableId: table ? table.id : null,
      seatNumber
    });
  }

  // Generate 30 guests for Luxury Brand Unveiling
  for (let i = 1; i <= 30; i++) {
    const name = getName();
    const isVip = i <= 4; // 4 VIPs
    const status = i <= 18 ? 'CONFIRMED' : i <= 26 ? 'PENDING' : 'DECLINED';
    const hotel = isVip ? hotelSuites : (i % 3 === 0 ? hotelResort : null);
    
    guestsToCreate.push({
      name,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@demoseed.com`,
      phone: `+1 (555) 911-${2000 + i}`,
      status,
      isVip,
      isSpeaker: false,
      isBridalParty: false,
      isPrimaryGuest: isVip,
      eventId: eventLuxury.id,
      assignedHotelId: hotel ? hotel.id : null,
      tableId: null,
      seatNumber: null
    });
  }

  // Bulk create in database
  for (const g of guestsToCreate) {
    await prisma.guest.create({ data: g });
  }

  // 7. Create Demo Transportation Module Data
  console.log('Creating demo transportation details...');
  const driver1 = await prisma.driver.create({ data: { fullName: '[Demo] Driver Alan Probst', phoneNumber: '+1 (555) 880-1111', status: 'Active' } });
  const driver2 = await prisma.driver.create({ data: { fullName: '[Demo] Driver Lisa Vance', phoneNumber: '+1 (555) 880-2222', status: 'Available' } });

  const vehicle1 = await prisma.vehicle.create({ data: { name: '[Demo] Tesla Model Y', type: 'SUV', licenseNumber: 'DEMO-001', capacity: 5, status: 'Available', driverId: driver1.id } });
  const vehicle2 = await prisma.vehicle.create({ data: { name: '[Demo] Executive Sprinter', type: 'Van', licenseNumber: 'DEMO-002', capacity: 9, status: 'Available', driverId: driver2.id } });

  const route1 = await prisma.transportRoute.create({ data: { routeName: '[Demo] Airport Shuttle', startLocation: 'Airport Terminal A', endLocation: 'Grand Palace Resort', distanceKm: 12.8, durationMins: 20, status: 'Active' } });

  // Create Assignment
  await prisma.fleetAssignment.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      eventId: eventExecutive.id,
      status: 'Active'
    }
  });

  // Create schedule for first VIP guest
  const vipGuest = await prisma.guest.findFirst({ where: { isVip: true, email: { endsWith: '@demoseed.com' } } });
  if (vipGuest) {
    await prisma.transferSchedule.create({
      data: {
        guestId: vipGuest.id,
        eventId: eventExecutive.id,
        transferType: 'VIP Transport',
        pickupLocation: 'Airport Terminal A VIP Suite',
        dropoffLocation: 'Grand Palace Resort Penthouse',
        scheduledTime: new Date(Date.now() + 1800000), // in 30 mins
        routeId: route1.id,
        vehicleId: vehicle1.id,
        driverId: driver1.id,
        status: 'Scheduled'
      }
    });
  }

  // 8. Re-register triggers to protect demo data from future deletes
  console.log('Re-registering database triggers...');
  
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_events()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF OLD.title LIKE '%[Demo]%' THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_events
    BEFORE DELETE ON "Event"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_events();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_hotels()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF OLD.name LIKE '%[Demo]%' THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_hotels
    BEFORE DELETE ON "Hotel"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_hotels();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_tables()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF OLD.name LIKE '%[Demo]%' THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_tables
    BEFORE DELETE ON "Table"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_tables();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_guests()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF OLD.email LIKE '%@demoseed.com' THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_guests
    BEFORE DELETE ON "Guest"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_guests();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_drivers()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF OLD."fullName" LIKE '%[Demo]%' THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_drivers
    BEFORE DELETE ON "Driver"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_drivers();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_vehicles()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF OLD.name LIKE '%[Demo]%' THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_vehicles
    BEFORE DELETE ON "Vehicle"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_vehicles();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_routes()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF OLD."routeName" LIKE '%[Demo]%' THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_routes
    BEFORE DELETE ON "TransportRoute"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_routes();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_schedules()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF EXISTS (SELECT 1 FROM "Guest" WHERE id = OLD."guestId" AND email LIKE '%@demoseed.com') THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_schedules
    BEFORE DELETE ON "TransferSchedule"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_schedules();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_assignments()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF EXISTS (SELECT 1 FROM "Event" WHERE id = OLD."eventId" AND title LIKE '%[Demo]%') THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_assignments
    BEFORE DELETE ON "FleetAssignment"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_assignments();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_activity_logs()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF EXISTS (SELECT 1 FROM "Vehicle" WHERE id = OLD."vehicleId" AND name LIKE '%[Demo]%') THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_activity_logs
    BEFORE DELETE ON "FleetActivityLog"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_activity_logs();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_maintenances()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF EXISTS (SELECT 1 FROM "Vehicle" WHERE id = OLD."vehicleId" AND name LIKE '%[Demo]%') THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_maintenances
    BEFORE DELETE ON "VehicleMaintenance"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_maintenances();
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION protect_demo_analytics()
    RETURNS TRIGGER AS $$
    BEGIN
        IF current_setting('app.bypass_demo_protection', true) = 'true' THEN
            RETURN OLD;
        END IF;
        IF EXISTS (SELECT 1 FROM "Event" WHERE id = OLD."eventId" AND title LIKE '%[Demo]%') THEN
            RETURN NULL;
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE TRIGGER trigger_protect_demo_analytics
    BEFORE DELETE ON "FleetAnalytics"
    FOR EACH ROW
    EXECUTE FUNCTION protect_demo_analytics();
  `);

  console.log('--- Demo Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
