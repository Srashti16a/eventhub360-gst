import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia',
  'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper',
  'Mason', 'Camila', 'Michael', 'Gianna', 'Ethan', 'Abigail', 'Daniel', 'Luna', 'Jacob', 'Ella',
  'Logan', 'Elizabeth', 'Jackson', 'Sofia', 'Levi', 'Emily', 'Sebastian', 'Avery', 'Mateo', 'Mila',
  'Jack', 'Scarlett', 'Owen', 'Eleanor', 'Theodore', 'Madison', 'Aiden', 'Layla', 'Samuel', 'Penelope'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
];

async function main() {
  console.log('Clearing database...');
  await prisma.fleetAssignment.deleteMany();
  await prisma.transferSchedule.deleteMany();
  await prisma.fleetActivityLog.deleteMany();
  await prisma.vehicleMaintenance.deleteMany();
  await prisma.routeOptimizationLog.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.transportRoute.deleteMany();
  await prisma.fleetAnalytics.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.table.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.event.deleteMany();

  console.log('Creating events...');
  const eventGala = await prisma.event.create({
    data: {
      title: 'Executive Forum 2026',
      category: 'Corporate Gala',
      date: new Date('2026-09-15T18:00:00Z'),
    },
  });

  const eventWedding = await prisma.event.create({
    data: {
      title: 'Smith & Jones Wedding',
      category: 'Spring Wedding',
      date: new Date('2026-05-20T16:00:00Z'),
    },
  });

  const eventCharity = await prisma.event.create({
    data: {
      title: "Children's Hospital Gala",
      category: 'Charity Gala',
      date: new Date('2026-11-10T19:00:00Z'),
    },
  });

  const eventProduct = await prisma.event.create({
    data: {
      title: 'Annual Tech Summit',
      category: 'Product Launch',
      date: new Date('2026-07-08T10:00:00Z'),
    },
  });

  const events = [eventGala, eventWedding, eventCharity, eventProduct];

  console.log('Creating hotels...');
  const ritz = await prisma.hotel.create({ data: { name: 'The Ritz-Carlton' } });
  const manor = await prisma.hotel.create({ data: { name: 'Boutique Manor' } });
  const hyatt = await prisma.hotel.create({ data: { name: 'Hyatt Regency' } });
  const fourSeasons = await prisma.hotel.create({ data: { name: 'Four Seasons' } });
  const hotels = [ritz, manor, hyatt, fourSeasons];

  console.log('Creating tables...');
  const tables = [];
  for (let i = 1; i <= 20; i++) {
    const table = await prisma.table.create({
      data: {
        name: `Table ${i}`,
        capacity: 10,
      },
    });
    tables.push(table);
  }

  console.log('Creating specific mockup guests...');
  
  // 1. Jameson Vanderbilt
  const guestJameson = await prisma.guest.create({
    data: {
      name: 'Jameson Vanderbilt',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      email: 'j.vanderbilt@luxmail.com',
      phone: '+1 (555) 012-3456',
      status: 'CONFIRMED',
      isVip: false,
      isSpeaker: true,
      isBridalParty: false,
      isPrimaryGuest: false,
      eventId: eventGala.id,
      assignedHotelId: ritz.id,
      tableId: tables[0].id,
      seatNumber: 1,
    },
  });

  // 2. Eleanor Fitzwilliam
  const guestEleanor = await prisma.guest.create({
    data: {
      name: 'Eleanor Fitzwilliam',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      email: 'eleanor.f@gmail.com',
      phone: '+1 (555) 987-6543',
      status: 'PENDING',
      isVip: false,
      isSpeaker: false,
      isBridalParty: true,
      isPrimaryGuest: false,
      eventId: eventWedding.id,
      assignedHotelId: manor.id,
      tableId: tables[1].id,
      seatNumber: 2,
    },
  });

  // 3. Dr. Julian Thorne
  const guestJulian = await prisma.guest.create({
    data: {
      name: 'Dr. Julian Thorne',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      email: 'thorne.med@hospital.org',
      phone: '+44 20 7123 4567',
      status: 'DECLINED',
      isVip: false,
      isSpeaker: false,
      isBridalParty: false,
      isPrimaryGuest: true,
      eventId: eventCharity.id,
      assignedHotelId: null,
    },
  });

  // 4. Samantha Reed
  const guestSamantha = await prisma.guest.create({
    data: {
      name: 'Samantha Reed',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      email: 'sam.reed@techcorp.io',
      phone: '+1 (555) 444-2222',
      status: 'CONFIRMED',
      isVip: true,
      isSpeaker: false,
      isBridalParty: false,
      isPrimaryGuest: false,
      eventId: eventProduct.id,
      assignedHotelId: hyatt.id,
      tableId: tables[2].id,
      seatNumber: 4,
    },
  });

  console.log('Generating remaining guests to match mockup stats...');
  // Total to generate: 1248. Currently created: 4.
  // We need exactly:
  // - Confirmed: 892 total. (Currently: Jameson, Samantha = 2). Need 890.
  // - Pending: 315 total. (Currently: Eleanor = 1). Need 314.
  // - Declined: 41 total. (Currently: Julian = 1). Need 40.
  // - VIP: 42 total. (Currently: Jameson, Samantha = 2). Need 40.
  
  const targetConfirmedCount = 890;
  const targetPendingCount = 314;
  const targetDeclinedCount = 40;
  const targetVipsNeeded = 40;

  let vipsCreated = 0;
  
  // Helper to generate a random phone number
  const generatePhone = () => {
    const area = Math.floor(100 + Math.random() * 900);
    const mid = Math.floor(100 + Math.random() * 900);
    const line = Math.floor(1000 + Math.random() * 9000);
    return `+1 (${area}) ${mid}-${line}`;
  };

  // Helper to generate a unique-ish name
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

  interface GuestInput {
    name: string;
    avatar: string;
    email: string;
    phone: string;
    status: string;
    isVip: boolean;
    isSpeaker: boolean;
    isBridalParty: boolean;
    isPrimaryGuest: boolean;
    eventId: string;
    assignedHotelId: string | null;
  }

  const guestsData: GuestInput[] = [];

  // Generate Confirmed
  for (let i = 0; i < targetConfirmedCount; i++) {
    const fullName = getName();
    let isVip = false;
    let isSpeaker = false;
    let isBridalParty = false;
    let isPrimaryGuest = false;

    if (vipsCreated < targetVipsNeeded) {
      isVip = true;
      vipsCreated++;
    } else if (i % 14 === 0) {
      isBridalParty = true; // Sponsor
    } else if (i % 17 === 0) {
      isPrimaryGuest = true; // Media
    } else if (i % 23 === 0) {
      isBridalParty = true;
      isPrimaryGuest = true; // Staff
    } else if (i % 29 === 0) {
      isSpeaker = true;
    }

    // Randomize event & hotel
    const event = events[Math.floor(Math.random() * events.length)];
    const hotel = hotels[Math.floor(Math.random() * hotels.length)];

    guestsData.push({
      name: fullName,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      email: `${fullName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: generatePhone(),
      status: 'CONFIRMED',
      isVip,
      isSpeaker,
      isBridalParty,
      isPrimaryGuest,
      eventId: event.id,
      assignedHotelId: hotel.id
    });
  }

  // Generate Pending
  for (let i = 0; i < targetPendingCount; i++) {
    const fullName = getName();
    let isVip = false;
    let isSpeaker = false;
    let isBridalParty = false;
    let isPrimaryGuest = false;

    if (vipsCreated < targetVipsNeeded) {
      isVip = true;
      vipsCreated++;
    } else if (i % 14 === 0) {
      isBridalParty = true; // Sponsor
    } else if (i % 17 === 0) {
      isPrimaryGuest = true; // Media
    } else if (i % 23 === 0) {
      isBridalParty = true;
      isPrimaryGuest = true; // Staff
    } else if (i % 29 === 0) {
      isSpeaker = true;
    }

    const event = events[Math.floor(Math.random() * events.length)];
    const hotel = Math.random() > 0.5 ? hotels[Math.floor(Math.random() * hotels.length)] : null;

    guestsData.push({
      name: fullName,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      email: `${fullName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: generatePhone(),
      status: 'PENDING',
      isVip,
      isSpeaker,
      isBridalParty,
      isPrimaryGuest,
      eventId: event.id,
      assignedHotelId: hotel ? hotel.id : null
    });
  }

  // Generate Declined
  for (let i = 0; i < targetDeclinedCount; i++) {
    const fullName = getName();
    let isVip = false;
    let isSpeaker = false;
    let isBridalParty = false;
    let isPrimaryGuest = false;

    if (vipsCreated < targetVipsNeeded) {
      isVip = true;
      vipsCreated++;
    } else if (i % 10 === 0) {
      isSpeaker = true;
    } else if (i % 8 === 0) {
      isBridalParty = true;
      isPrimaryGuest = true; // Staff
    } else if (i % 5 === 0) {
      isBridalParty = true; // Sponsor
    } else if (i % 7 === 0) {
      isPrimaryGuest = true; // Media
    }

    const event = events[Math.floor(Math.random() * events.length)];

    guestsData.push({
      name: fullName,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      email: `${fullName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: generatePhone(),
      status: 'DECLINED',
      isVip,
      isSpeaker,
      isBridalParty,
      isPrimaryGuest,
      eventId: event.id,
      assignedHotelId: null
    });
  }

  console.log(`Inserting ${guestsData.length} records in batches...`);
  // Insert in chunks to avoid SQLite limits / memory overflow
  const chunkSize = 100;
  for (let i = 0; i < guestsData.length; i += chunkSize) {
    const chunk = guestsData.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map((g) =>
        prisma.guest.create({
          data: g,
        })
      )
    );
  }

  const finalTotal = await prisma.guest.count();
  const finalConfirmed = await prisma.guest.count({ where: { status: 'CONFIRMED' } });
  const finalPending = await prisma.guest.count({ where: { status: 'PENDING' } });
  const finalDeclined = await prisma.guest.count({ where: { status: 'DECLINED' } });
  const finalVips = await prisma.guest.count({ where: { isVip: true } });

  console.log('--- Database Seeding Report ---');
  console.log(`Total Guests:     ${finalTotal} (Target: 1248)`);
  console.log(`Confirmed:        ${finalConfirmed} (Target: 892)`);
  console.log(`Pending:          ${finalPending} (Target: 315)`);
  console.log(`Declined:         ${finalDeclined} (Target: 41)`);
  console.log(`VIP Status:       ${finalVips} (Target: 42)`);

  console.log('Creating transportation seed data...');
  // 1. Create Drivers
  const driver1 = await prisma.driver.create({ data: { fullName: 'James Whitaker', phoneNumber: '+1 (555) 019-2831', status: 'Active' } });
  const driver2 = await prisma.driver.create({ data: { fullName: 'Sarah Jenkins', phoneNumber: '+1 (555) 021-9872', status: 'Resting' } });
  const driver3 = await prisma.driver.create({ data: { fullName: "Michael O'Brien", phoneNumber: '+1 (555) 034-7711', status: 'On Break' } });
  const driver4 = await prisma.driver.create({ data: { fullName: 'David Chen', phoneNumber: '+1 (555) 012-4433', status: 'Active' } });

  // 2. Create Vehicles linked to Drivers
  const vehicle1 = await prisma.vehicle.create({ data: { name: 'Mercedes V-Class (2024)', type: 'Van', licenseNumber: 'EH-092', capacity: 7, status: 'On Route', driverId: driver1.id } });
  const vehicle2 = await prisma.vehicle.create({ data: { name: 'Tesla Model X (White)', type: 'SUV', licenseNumber: 'EH-104', capacity: 5, status: 'Available', driverId: driver2.id } });
  const vehicle3 = await prisma.vehicle.create({ data: { name: 'Sprinter Exec-Bus B12', type: 'Minibus', licenseNumber: 'EH-058', capacity: 15, status: 'Available', driverId: driver3.id } });
  const vehicle4 = await prisma.vehicle.create({ data: { name: 'Executive Sedan S1', type: 'Sedan', licenseNumber: 'EH-112', capacity: 4, status: 'On Route', driverId: driver4.id } });

  // 3. Create Transport Routes
  const route1 = await prisma.transportRoute.create({ data: { routeName: 'Airport ➔ Grand Hall', startLocation: 'Airport', endLocation: 'Grand Hall', distanceKm: 25.5, durationMins: 35, status: 'Active' } });
  const route2 = await prisma.transportRoute.create({ data: { routeName: 'Terminal 1 ➔ Main Gate', startLocation: 'Terminal 1', endLocation: 'Main Gate', distanceKm: 8.2, durationMins: 15, status: 'Active' } });
  const route3 = await prisma.transportRoute.create({ data: { routeName: 'Shuttle Loop C', startLocation: 'Hotel Area', endLocation: 'Convention Center', distanceKm: 3.5, durationMins: 10, status: 'Active' } });

  // 4. Create Fleet Assignments
  await prisma.fleetAssignment.create({ data: { vehicleId: vehicle1.id, driverId: driver1.id, eventId: eventGala.id, status: 'Active' } });
  await prisma.fleetAssignment.create({ data: { vehicleId: vehicle4.id, driverId: driver4.id, eventId: eventGala.id, status: 'Active' } });

  // 5. Create Transfer Schedules for Vips/Guests
  const allVips = await prisma.guest.findMany({ where: { isVip: true }, take: 20 });
  const vehiclesList = [vehicle1, vehicle2, vehicle3, vehicle4];
  const routesList = [route1, route2, route3];
  const transferTypes = ['VIP Transport', 'Airport Pickup', 'Airport Dropoff', 'Hotel Transfer'];

  // Create transfers across the last 7 days to populate chart analytics
  for (let i = 0; i < 7; i++) {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() - i);
    
    // Create 3 transfers on each day to populate the chart
    for (let j = 0; j < 3; j++) {
      const vipIndex = (i * 3 + j) % allVips.length;
      const vehicle = vehiclesList[j % vehiclesList.length];
      const route = routesList[j % routesList.length];
      
      await prisma.transferSchedule.create({
        data: {
          guestId: allVips[vipIndex].id,
          eventId: eventGala.id,
          transferType: transferTypes[j % transferTypes.length],
          pickupLocation: 'Airport Terminal ' + ((j % 3) + 1),
          dropoffLocation: 'Four Seasons Room ' + (100 + j * 10),
          scheduledTime: scheduledDate,
          routeId: route.id,
          vehicleId: vehicle.id,
          driverId: vehicle.driverId || driver1.id,
          status: i === 0 ? (j === 0 ? 'In Transit' : 'Scheduled') : 'Completed'
        }
      });
    }
  }

  // 6. Create Fleet Activity Logs
  await prisma.fleetActivityLog.create({ data: { activityType: 'Route Completed', severity: 'Info', message: 'Fleet 12 arrived at Venue A', vehicleId: vehicle1.id, driverId: driver1.id } });
  await prisma.fleetActivityLog.create({ data: { activityType: 'Dispatch Alert', severity: 'Warning', message: 'New arrival scheduled for 15:30', vehicleId: vehicle2.id, driverId: driver2.id } });
  await prisma.fleetActivityLog.create({ data: { activityType: 'Maintenance Alert', severity: 'Critical', message: 'Vehicle #240 fuel warning', vehicleId: vehicle3.id, driverId: driver3.id } });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
