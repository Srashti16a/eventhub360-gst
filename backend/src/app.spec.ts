import request from 'supertest';
import app from './app';
import prisma from './config/prisma';

describe('EventHub360 API Integration Tests', () => {
  let createdGuestId: string;
  let testEventId: string;
  let testHotelId: string;
  let testTableId: string;

  beforeAll(async () => {
    // Retrieve reference IDs generated from seed
    const event = await prisma.event.findFirst();
    testEventId = event!.id;

    const hotel = await prisma.hotel.findFirst();
    testHotelId = hotel!.id;

    const table = await prisma.table.findFirst();
    testTableId = table!.id;
  });

  afterAll(async () => {
    // Clean up test items we added
    if (createdGuestId) {
      await prisma.guest.deleteMany({
        where: {
          id: createdGuestId
        }
      });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/dashboard/stats', () => {
    it('should retrieve correct guest counts matching mock stats', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalGuests.value).toBe(1248);
      expect(res.body.data.confirmed.value).toBe(892);
      expect(res.body.data.pendingRsvp.value).toBe(315);
      expect(res.body.data.vipStatus.value).toBe(42);
      expect(res.body.data.totalGuests.growth).toBe('+4.2%');
      expect(res.body.data.confirmed.growth).toBe('+12%');
      expect(res.body.data.pendingRsvp.growth).toBe('-2%');
    });
  });

  describe('GET /api/events and /api/hotels', () => {
    it('should list all events', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should list all hotels', async () => {
      const res = await request(app).get('/api/hotels');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Guest CRUD Operations', () => {
    it('should create a new guest', async () => {
      const res = await request(app)
        .post('/api/guests')
        .send({
          name: 'Test Guest VIP',
          email: 'test.vip@example.com',
          phone: '+1 (555) 999-8888',
          status: 'CONFIRMED',
          isVip: true,
          isSpeaker: true,
          eventId: testEventId,
          assignedHotelId: testHotelId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Guest VIP');
      expect(res.body.data.isVip).toBe(true);
      expect(res.body.data.isSpeaker).toBe(true);
      
      createdGuestId = res.body.data.id;
    });

    it('should list guests with pagination', async () => {
      const res = await request(app).get('/api/guests?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(5);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
    });

    it('should filter guests by VIP status', async () => {
      const res = await request(app).get('/api/guests?vipOnly=true&limit=100');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Mockup counts 42 VIPs + 1 we created = 43
      expect(res.body.meta.totalGuests).toBe(43);
      res.body.data.forEach((guest: any) => {
        expect(guest.isVip).toBe(true);
      });
    });

    it('should search guests by name query', async () => {
      const res = await request(app).get('/api/guests?search=Jameson');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toContain('Jameson');
    });

    it('should retrieve guest by ID', async () => {
      const res = await request(app).get(`/api/guests/${createdGuestId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdGuestId);
    });

    it('should update guest details', async () => {
      const res = await request(app)
        .put(`/api/guests/${createdGuestId}`)
        .send({
          name: 'Updated Test Guest VIP',
          status: 'PENDING'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Test Guest VIP');
      expect(res.body.data.status).toBe('PENDING');
    });

    it('should delete guest by ID', async () => {
      const res = await request(app).delete(`/api/guests/${createdGuestId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const checkRes = await request(app).get(`/api/guests/${createdGuestId}`);
      expect(checkRes.status).toBe(404);
    });
  });

  describe('Seating Arranger', () => {
    it('should list tables with their occupants', async () => {
      const res = await request(app).get('/api/seating/tables');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should assign a guest to a table', async () => {
      // Find a guest
      const guest = await prisma.guest.findFirst({ where: { status: 'CONFIRMED' } });
      const guestId = guest!.id;

      const res = await request(app)
        .put('/api/seating/assign')
        .send({
          guestId,
          tableId: testTableId,
          seatNumber: 8
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tableId).toBe(testTableId);
      expect(res.body.data.seatNumber).toBe(8);
    });
  });

  describe('Marketing Campaigns', () => {
    it('should trigger RSVP campaign reminders to pending guests', async () => {
      const res = await request(app)
        .post('/api/campaigns/send-rsvp')
        .send({
          campaignType: 'RSVP_REMINDER'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recipientCount).toBeGreaterThan(0);
      expect(res.body.data.type).toBe('RSVP_REMINDER');
    });
  });

  describe('Import/Export Operations', () => {
    it('should export the filtered guest list to CSV', async () => {
      const res = await request(app).get('/api/guests/export?vipOnly=true');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('ID,Name,Email,Phone,Status,VIP');
      // Count CSV lines: header + 42 records = 43 lines (excluding empty lines)
      const lines = res.text.split('\n').filter(l => l.trim() !== '');
      expect(lines.length).toBe(43);
    });

    it('should import guests in bulk via JSON', async () => {
      const res = await request(app)
        .post('/api/guests/import')
        .set('Content-Type', 'application/json')
        .send([
          {
            name: 'Bulk JSON Guest 1',
            email: 'json.guest1@example.com',
            phone: '+1 (555) 777-6666',
            status: 'CONFIRMED',
            vip: 'YES',
            category: 'Corporate Gala'
          },
          {
            name: 'Bulk JSON Guest 2',
            email: 'json.guest2@example.com',
            phone: '+1 (555) 777-5555',
            status: 'PENDING',
            category: 'Spring Wedding'
          }
        ]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.successfullyImported).toBe(2);
      
      // Cleanup imported items
      const emails = ['json.guest1@example.com', 'json.guest2@example.com'];
      await prisma.guest.deleteMany({
        where: { email: { in: emails } }
      });
    });

    it('should import guests in bulk via CSV raw text', async () => {
      const csvData = [
        'name,email,phone,status,vip,category',
        'Bulk CSV Guest 1,csv.guest1@example.com,+1 (555) 222-1111,CONFIRMED,YES,Corporate Gala',
        'Bulk CSV Guest 2,csv.guest2@example.com,+1 (555) 222-3333,PENDING,NO,Spring Wedding'
      ].join('\n');

      const res = await request(app)
        .post('/api/guests/import')
        .set('Content-Type', 'text/csv')
        .send(csvData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.successfullyImported).toBe(2);

      // Cleanup imported items
      const emails = ['csv.guest1@example.com', 'csv.guest2@example.com'];
      await prisma.guest.deleteMany({
        where: { email: { in: emails } }
      });
    });
  });

  describe('Catering and Dietary Management APIs', () => {
    it('should retrieve catering summary stats with exact seeded values', async () => {
      const res = await request(app).get('/api/catering/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalGuests.value).toBe(1248);
      expect(res.body.data.totalGuests.allergyAlerts).toBe(42);
      expect(res.body.data.vegan.value).toBe(225);
      expect(res.body.data.vegan.percentage).toBe(18);
      expect(res.body.data.vegetarian.value).toBe(402);
      expect(res.body.data.vegetarian.percentage).toBe(32);
      expect(res.body.data.nonVeg.value).toBe(621);
      expect(res.body.data.nonVeg.percentage).toBe(50);
    });

    it('should list catering preferences with search and filters', async () => {
      // Search for Julianne
      const resSearch = await request(app).get('/api/catering/preferences?search=Julianne');
      expect(resSearch.status).toBe(200);
      expect(resSearch.body.success).toBe(true);
      expect(resSearch.body.data.length).toBeGreaterThan(0);
      expect(resSearch.body.data[0].name).toBe('Julianne Smith');
      expect(resSearch.body.data[0].mealPreference).toBe('Vegan');
      expect(resSearch.body.data[0].allergies).toBe('Nuts (Severe)');
      expect(resSearch.body.data[0].guestCategory).toBe('Speaker');

      // Filter by mealCategory=Vegetarian
      const resFilter = await request(app).get('/api/catering/preferences?mealCategory=Vegetarian&limit=1000');
      expect(resFilter.status).toBe(200);
      expect(resFilter.body.success).toBe(true);
      expect(resFilter.body.data.length).toBe(402);
    });

    it('should retrieve procurement analytics matching seeded values', async () => {
      const res = await request(app).get('/api/catering/procurement');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUnits).toBe(1248);
      
      const categories = res.body.data.categories;
      const nonVegCat = categories.find((c: any) => c.name === 'Poultry / Red Meat');
      const vegCat = categories.find((c: any) => c.name === 'Lacto-Ovo Vegetarian');
      const veganCat = categories.find((c: any) => c.name === 'Plant-Based / Vegan');

      expect(nonVegCat.units).toBe(621);
      expect(nonVegCat.percentage).toBe(50);
      expect(vegCat.units).toBe(402);
      expect(vegCat.percentage).toBe(32);
      expect(veganCat.units).toBe(225);
      expect(veganCat.percentage).toBe(18);
    });

    it('should retrieve chef summary with valid requests count', async () => {
      const res = await request(app).get('/api/catering/chef-summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.preparationStartTime).toBe('06:00 AM');
      expect(res.body.data.specialRequestCount).toBeGreaterThan(0);
      expect(res.body.data.inventoryAlerts.length).toBeGreaterThan(0);
    });

    it('should generate smart suggestions based on statistics', async () => {
      const res = await request(app).get('/api/catering/suggestions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      
      const nutAllergySuggestion = res.body.data.find((s: any) => s.title === 'High Nut Allergy Overlap');
      expect(nutAllergySuggestion).toBeDefined();
      expect(nutAllergySuggestion.priority).toBe('HIGH');
    });

    it('should export all catering preferences for PDF report', async () => {
      const res = await request(app).get('/api/catering/export');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1248);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('mealPreference');
      expect(res.body.data[0]).toHaveProperty('allergies');
    });
  });

  describe('Check-in & Live Dashboard APIs', () => {
    let testGuestId: string;
    let testEntranceId: string;
    let testStaffId: string;
    let testEventId: string;

    beforeAll(async () => {
      // Find a confirmed guest who is registered for eventProduct
      const event = await prisma.event.findFirst({
        where: { category: 'Product Launch' }
      });
      testEventId = event!.id;
      const guest = await prisma.guest.findFirst({
        where: { eventId: testEventId, status: 'CONFIRMED' }
      });
      testGuestId = guest!.id;

      const entrance = await prisma.entrance.findFirst({
        where: { eventId: testEventId }
      });
      testEntranceId = entrance!.id;

      const staff = await prisma.staff.findFirst();
      testStaffId = staff!.id;

      // Clean up any existing check-in for this test guest so scanQR test is clean
      await prisma.checkIn.deleteMany({
        where: { guestId: testGuestId }
      });
    });

    it('should successfully check in a guest via scanQR and record check-in', async () => {
      const res = await request(app)
        .post('/api/checkin/scan')
        .send({
          qrData: testGuestId,
          entranceId: testEntranceId,
          staffId: testStaffId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.guestId).toBe(testGuestId);
      expect(res.body.data.entrance).toBeDefined();
    });

    it('should prevent duplicate check-in scans and return 400', async () => {
      const res = await request(app)
        .post('/api/checkin/scan')
        .send({
          qrData: testGuestId,
          entranceId: testEntranceId,
          staffId: testStaffId
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already checked in');
    });

    it('should handle manual check-in override successfully', async () => {
      // Find another guest who is not checked in
      const event = await prisma.event.findFirst({
        where: { category: 'Product Launch' }
      });
      const guest = await prisma.guest.findFirst({
        where: {
          eventId: event!.id,
          status: 'CONFIRMED',
          checkIns: { none: {} }
        }
      });
      const otherGuestId = guest!.id;

      const res = await request(app)
        .post('/api/checkin/manual')
        .send({
          guestId: otherGuestId,
          entranceId: testEntranceId,
          staffId: testStaffId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SUCCESS');
    });

    it('should retrieve check-in summary metrics', async () => {
      const checkInRes = await request(app).get(`/api/checkin/summary?eventId=${testEventId}`);
      expect(checkInRes.status).toBe(200);
      expect(checkInRes.body.success).toBe(true);
      expect(checkInRes.body.data.totalExpected.value).toBeGreaterThan(0);
      expect(checkInRes.body.data.currentAttendance.value).toBeGreaterThan(0);
      expect(checkInRes.body.data.vipsOnSite.checkedIn).toBeDefined();
      expect(checkInRes.body.data.peakFlowRate.value).toBeDefined();
    });

    it('should retrieve hourly check-in trend and load capacity', async () => {
      const res = await request(app).get(`/api/checkin/trend?eventId=${testEventId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trend.length).toBeGreaterThan(0);
      expect(res.body.data.capacityPercentage).toBeGreaterThan(0);
    });

    it('should retrieve statistics for all event entrances', async () => {
      const res = await request(app).get(`/api/checkin/gates?eventId=${testEventId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('count');
      expect(res.body.data[0]).toHaveProperty('status');
    });

    it('should retrieve live VIP arrival alert feed', async () => {
      const res = await request(app).get(`/api/checkin/vip-alerts?eventId=${testEventId}&limit=3`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it('should query paged history logs with search and entrance filters', async () => {
      const res = await request(app).get(`/api/checkin/logs?eventId=${testEventId}&entranceId=${testEntranceId}&page=1&limit=5`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
    });

    it('should list all active staff members and processed scans count', async () => {
      const res = await request(app).get('/api/checkin/staff');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('scansCount');
    });
  });

  describe('Communications & Comm Center APIs', () => {
    let testLogId: string;

    beforeAll(async () => {
      // Find a seeded communication log
      const log = await prisma.communicationLog.findFirst({
        where: { recipientName: 'Julian Thorne' }
      });
      testLogId = log!.id;
    });

    it('should retrieve communications summary statistics', async () => {
      const res = await request(app).get('/api/communications/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalLogs.value).toBeGreaterThan(0);
      expect(res.body.data.successfulDeliveries.value).toBeDefined();
      expect(res.body.data.activeFailures.value).toBeDefined();
      expect(res.body.data.averageLatency.value).toBeDefined();
    });

    it('should retrieve paged and filtered communication logs', async () => {
      const res = await request(app).get('/api/communications/logs?channel=EMAIL&page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].channel).toBe('EMAIL');
    });

    it('should query details for a specific communication log by ID', async () => {
      const res = await request(app).get(`/api/communications/${testLogId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recipientName).toBe('Julian Thorne');
      expect(res.body.data.headerInfo).toHaveProperty('subject');
    });

    it('should return 404 for non-existent communication log ID', async () => {
      const res = await request(app).get('/api/communications/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('not found');
    });

    it('should retrieve failures alerts status', async () => {
      const res = await request(app).get('/api/communications/alerts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('triggered');
      expect(res.body.data).toHaveProperty('count');
    });

    it('should toggle channel active provider on reroute request', async () => {
      const res = await request(app)
        .post('/api/communications/reroute')
        .send({ channel: 'SMS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRerouted).toBe(true);
      expect(res.body.data.activeProvider).toBe('SECONDARY');
    });

    it('should export filtered communications logs matching query', async () => {
      const res = await request(app).get('/api/communications/export?channel=WHATSAPP');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].channel).toBe('WHATSAPP');
    });
  });
});
