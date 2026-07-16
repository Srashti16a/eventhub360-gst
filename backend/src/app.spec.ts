import request from 'supertest';
import app from './app';
import prisma from './config/prisma';
import { randomUUID } from 'crypto';

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

    const table = (await prisma.table.findMany({ include: { guests: true } }))
      .find(t => t.guests.length < t.capacity && !t.guests.some(g => g.seatNumber === 8)) || (await prisma.table.findFirst())!;
    testTableId = table.id;
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
      expect(res.body.data.totalGuests.value).toBe(1308);
      expect(res.body.data.confirmed.value).toBe(930);
      expect(res.body.data.pendingRsvp.value).toBe(330);
      expect(res.body.data.vipStatus.value).toBe(48);
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
      // Mockup counts 47 VIPs + 1 we created = 48
      expect(res.body.meta.totalGuests).toBe(48);
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
      // Count CSV lines: header + 47 records = 48 lines (excluding empty lines)
      const lines = res.text.split('\n').filter(l => l.trim() !== '');
      expect(lines.length).toBe(49);
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
      expect(res.body.data.totalGuests.value).toBe(1308);
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
      expect(res.body.data.totalUnits).toBe(1308);
      
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
      expect(res.body.data.length).toBe(1308);
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

  describe('Communication Center APIs', () => {
    let createdCampaignId: string;

    it('should retrieve campaign dashboard stats', async () => {
      const res = await request(app).get('/api/campaigns/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('deliverabilityRate');
      expect(res.body.data).toHaveProperty('avgOpenRate');
      expect(res.body.data).toHaveProperty('activeCampaigns');
    });

    it('should retrieve campaign analytics', async () => {
      const res = await request(app).get('/api/campaigns/analytics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('deliveryRate');
      expect(res.body.data).toHaveProperty('openRate');
      expect(res.body.data).toHaveProperty('clickRate');
    });

    it('should retrieve audience segments (derived)', async () => {
      const res = await request(app).get('/api/campaigns/segments');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('memberCount');
    });

    it('should create a new campaign', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .send({
          title: 'Test Campaign Integration',
          subject: 'Test Subject',
          description: 'Test Body',
          channel: 'EMAIL',
          targetType: 'VIP',
          status: 'DRAFT'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Campaign Integration');
      
      createdCampaignId = res.body.data.id;
    });

    it('should retrieve campaigns list with filters', async () => {
      const res = await request(app).get('/api/campaigns?channel=EMAIL');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should retrieve campaign by id', async () => {
      const res = await request(app).get(`/api/campaigns/${createdCampaignId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Campaign Integration');
    });

    it('should delete campaign by id', async () => {
      const res = await request(app).delete(`/api/campaigns/${createdCampaignId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await request(app).get(`/api/campaigns/${createdCampaignId}`);
      expect(check.status).toBe(404);
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

  describe('QR Pass Center APIs', () => {
    let createdQRPassId: string;
    let qrToken: string;
    let testGuestId: string;

    beforeAll(async () => {
      // Find a test guest
      const guest = await prisma.guest.findFirst();
      testGuestId = guest!.id;
    });

    it('should retrieve qr pass stats', async () => {
      const res = await request(app).get('/api/qr-passes/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalPassesGenerated');
      expect(res.body.data).toHaveProperty('securityHealthRate');
    });

    it('should retrieve security health stats', async () => {
      const res = await request(app).get('/api/qr-passes/security-health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('validPasses');
      expect(res.body.data).toHaveProperty('healthPercentage');
    });

    it('should create a new QR Pass', async () => {
      // First ensure no duplicate pass exists
      await prisma.qRPass.deleteMany({
        where: { guestId: testGuestId, eventId: testEventId }
      });

      const res = await request(app)
        .post('/api/qr-passes')
        .send({
          guestId: testGuestId,
          eventId: testEventId,
          passType: 'VIP'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passType).toBe('VIP');
      expect(res.body.data.status).toBe('ACTIVE');

      createdQRPassId = res.body.data.id;
      qrToken = res.body.data.qrCode;
    });

    it('should list QR passes with query filter', async () => {
      const res = await request(app).get('/api/qr-passes?passType=VIP');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should verify / scan a QR pass', async () => {
      const res = await request(app)
        .post('/api/qr-passes/verify')
        .send({
          qrToken,
          scanLocation: 'Main Entrance Gate A',
          scannerName: 'Guard 1'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.securityValidation).toBe('VALID_ACCESS');
    });

    it('should retrieve recent scan logs', async () => {
      const res = await request(app).get('/api/qr-passes/recent-scans');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].scanLocation).toBe('Main Entrance Gate A');
    });

    it('should get pass details by ID', async () => {
      const res = await request(app).get(`/api/qr-passes/${createdQRPassId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.guestDetails.id).toBe(testGuestId);
    });

    it('should download a pass and increment download count', async () => {
      const res = await request(app).get(`/api/qr-passes/${createdQRPassId}/download`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.downloadCount).toBe(1);
    });

    it('should send pass through simulated channel and create delivery logs', async () => {
      const res = await request(app)
        .post(`/api/qr-passes/${createdQRPassId}/send`)
        .send({ channel: 'EMAIL' });

      expect(res.status).toBe(200);
      expect(res.body.data.qrPassId).toBe(createdQRPassId);
    });

    describe('New QR Pass Center Features', () => {
      let extraPassIds: string[] = [];

      beforeAll(async () => {
        // Let's create a few extra QR passes to test pagination
        const guests = await prisma.guest.findMany({
          where: {
            id: { not: testGuestId },
            eventId: testEventId
          },
          take: 3
        });

        for (let i = 0; i < guests.length; i++) {
          const pass = await prisma.qRPass.create({
            data: {
              guestId: guests[i].id,
              eventId: testEventId,
              passType: 'VIP',
              status: i === 0 ? 'PENDING' : 'ACTIVE', // One pending, others active
              qrCode: randomUUID(),
              passNumber: `PASS-TEST-${Date.now()}-${i}`
            }
          });
          extraPassIds.push(pass.id);
        }
      });

      afterAll(async () => {
        if (extraPassIds.length > 0) {
          await prisma.qRPass.deleteMany({
            where: { id: { in: extraPassIds } }
          });
        }
      });

      it('should list QR passes with pagination', async () => {
        const res = await request(app).get('/api/qr-passes?limit=2&page=1');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.limit).toBe(2);
        expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
        expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(2);
        expect(res.body.pagination.hasNext).toBe(true);
      });

      it('should list QR passes with PENDING status filter', async () => {
        const res = await request(app).get('/api/qr-passes?status=PENDING');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data[0].status).toBe('PENDING');
      });

      it('should export logs with query filters', async () => {
        const res = await request(app).get(`/api/qr-passes/export-logs?eventId=${testEventId}`);
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toContain('text/csv');
        expect(res.header['content-disposition']).toContain('attachment');
        expect(res.text).toContain('Log Type');
      });

      it('should retrieve help information', async () => {
        const res = await request(app).get('/api/qr-passes/help');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('QR Pass Center Help');
        expect(res.body.data.sections).toContain('Export Logs');
      });

      it('should retrieve notifications with unread count', async () => {
        const res = await request(app).get('/api/qr-passes/notifications');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.unreadCount).toBeDefined();
        expect(res.body.data.notifications).toBeDefined();
      });

      it('should retrieve QR pass activity history', async () => {
        const res = await request(app).get('/api/qr-passes/history');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    it('should delete pass by id', async () => {
      const res = await request(app).delete(`/api/qr-passes/${createdQRPassId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await request(app).get(`/api/qr-passes/${createdQRPassId}`);
      expect(check.status).toBe(404);
    });
  });
});

