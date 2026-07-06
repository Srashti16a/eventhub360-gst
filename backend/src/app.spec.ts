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
      expect(res.body.data.vipStatus.value).toBe(47);
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
      expect(lines.length).toBe(48);
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
});
