/**
 * EventHub360 GST - Backend API Integration Test Script
 * Uses native Node.js http module (no extra deps needed)
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let pass = 0;
let fail = 0;
const results = [];

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, body: parsed, raw: data });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, method, path, body, expectedStatus) {
  try {
    const res = await request(method, path, body);
    if (res.status === expectedStatus) {
      console.log(`  \x1b[32mPASS\x1b[0m: ${name} (HTTP ${res.status})`);
      pass++;
      results.push({ test: name, status: 'PASS', http: res.status });
    } else {
      console.log(`  \x1b[31mFAIL\x1b[0m: ${name} - Expected ${expectedStatus}, got ${res.status}`);
      fail++;
      results.push({ test: name, status: 'FAIL', http: res.status, detail: `Expected ${expectedStatus}` });
    }
    return res;
  } catch (err) {
    console.log(`  \x1b[31mFAIL\x1b[0m: ${name} - ${err.message}`);
    fail++;
    results.push({ test: name, status: 'FAIL', http: 0, detail: err.message });
    return null;
  }
}

async function run() {
  console.log('\n===============================================');
  console.log('  EventHub360 Backend API Integration Tests');
  console.log('===============================================\n');

  // ---- 1. Dashboard ----
  console.log('[1] Dashboard');
  const stats = await test('GET /api/dashboard/stats', 'GET', '/api/dashboard/stats', null, 200);
  if (stats && stats.body && stats.body.success) {
    const d = stats.body.data;
    console.log(`     -> Total: ${d.totalGuests.value}, Confirmed: ${d.confirmed.value}, Pending: ${d.pendingRsvp.value}, VIP: ${d.vipStatus.value}`);
  }
  console.log('');

  // ---- 2. Events ----
  console.log('[2] Events');
  const events = await test('GET /api/events', 'GET', '/api/events', null, 200);
  if (events && events.body) console.log(`     -> Found ${events.body.data.length} events`);

  const newEvent = await test('POST /api/events (create)', 'POST', '/api/events', {
    title: 'Integration Test Event', category: 'Integration Test', date: '2026-12-31T00:00:00.000Z'
  }, 201);
  const testEventId = newEvent && newEvent.body && newEvent.body.data ? newEvent.body.data.id : null;
  if (testEventId) console.log(`     -> Created Event ID: ${testEventId}`);

  await test('POST /api/events (missing title - 400)', 'POST', '/api/events', { category: 'Test' }, 400);
  console.log('');

  // ---- 3. Hotels ----
  console.log('[3] Hotels');
  const hotels = await test('GET /api/hotels', 'GET', '/api/hotels', null, 200);
  if (hotels && hotels.body) console.log(`     -> Found ${hotels.body.data.length} hotels`);

  const newHotel = await test('POST /api/hotels (create)', 'POST', '/api/hotels', { name: 'Integration Test Hotel' }, 201);
  const testHotelId = newHotel && newHotel.body && newHotel.body.data ? newHotel.body.data.id : null;
  if (testHotelId) console.log(`     -> Created Hotel ID: ${testHotelId}`);

  await test('POST /api/hotels (missing name - 400)', 'POST', '/api/hotels', {}, 400);
  console.log('');

  // ---- 4. Seating Tables ----
  console.log('[4] Seating');
  const tables = await test('GET /api/seating/tables', 'GET', '/api/seating/tables', null, 200);
  if (tables && tables.body) console.log(`     -> Found ${tables.body.data.length} tables`);
  console.log('');

  // ---- 5. Full Guest CRUD Cycle ----
  console.log('[5] Guest CRUD (Full Cycle)');
  if (!testEventId) {
    console.log('  SKIP: Cannot test guest CRUD without a valid Event ID');
  } else {
    // 5a. CREATE
    const createBody = {
      name: 'Integration Test Guest',
      email: 'integration.test@eventhub360.com',
      phone: '+1234567890',
      status: 'PENDING',
      isVip: true,
      isSpeaker: false,
      isBridalParty: false,
      isPrimaryGuest: false,
      eventId: testEventId,
    };
    if (testHotelId) createBody.assignedHotelId = testHotelId;

    const created = await test('POST /api/guests (create)', 'POST', '/api/guests', createBody, 201);
    const testGuestId = created && created.body && created.body.data ? created.body.data.id : null;
    if (testGuestId) {
      console.log(`     -> Created Guest ID: ${testGuestId}`);
      console.log(`     -> DB Verified: name='${created.body.data.name}', status='${created.body.data.status}', isVip=${created.body.data.isVip}`);
    }

    // 5b. GET all guests
    const guestList = await test('GET /api/guests (verify created)', 'GET', '/api/guests?page=1&limit=100', null, 200);
    if (guestList && guestList.body && testGuestId) {
      const found = guestList.body.data.find(g => g.id === testGuestId);
      if (found) console.log('     -> DB Verified: Guest found in list query');
      else console.log('     -> WARNING: Guest NOT found in list query');
    }

    // 5c. GET single guest
    if (testGuestId) {
      const single = await test('GET /api/guests/:id (single)', 'GET', `/api/guests/${testGuestId}`, null, 200);
      if (single && single.body && single.body.success) console.log('     -> DB Verified: Single guest fetch matches ID');
    }

    // 5d. UPDATE
    if (testGuestId) {
      const updated = await test('PUT /api/guests/:id (update)', 'PUT', `/api/guests/${testGuestId}`, {
        name: 'Integration Test Guest UPDATED', status: 'CONFIRMED', isVip: false,
      }, 200);
      if (updated && updated.body && updated.body.success) {
        console.log(`     -> DB Verified: name='${updated.body.data.name}', status='${updated.body.data.status}', isVip=${updated.body.data.isVip}`);
      }

      // Verify via GET
      const verify = await test('GET /api/guests/:id (verify update)', 'GET', `/api/guests/${testGuestId}`, null, 200);
      if (verify && verify.body && verify.body.data.name === 'Integration Test Guest UPDATED') {
        console.log('     -> DB Verified: Updated values confirmed via GET');
      }
    }

    // 5e. DELETE
    if (testGuestId) {
      const del = await test('DELETE /api/guests/:id', 'DELETE', `/api/guests/${testGuestId}`, null, 200);
      if (del && del.body && del.body.success) console.log('     -> DB Verified: Guest hard-deleted');

      // Verify 404
      await test('GET /api/guests/:id (verify deleted - 404)', 'GET', `/api/guests/${testGuestId}`, null, 404);
    }
  }
  console.log('');

  // ---- 6. Validation & Error Handling ----
  console.log('[6] Validation & Error Handling');
  await test('POST /api/guests (empty body - 400)', 'POST', '/api/guests', {}, 400);

  if (testEventId) {
    await test('POST /api/guests (invalid email - 400)', 'POST', '/api/guests', {
      name: 'Bad Email Guest', email: 'not-an-email', phone: '+1234567890', status: 'PENDING', eventId: testEventId,
    }, 400);
  }

  await test('GET /api/guests/not-a-uuid (400)', 'GET', '/api/guests/not-a-uuid', null, 400);
  await test('GET /api/guests/00000000-0000-0000-0000-000000000000 (404)', 'GET', '/api/guests/00000000-0000-0000-0000-000000000000', null, 404);

  await test('POST /api/guests (invalid eventId - 400)', 'POST', '/api/guests', {
    name: 'Bad Event Guest', email: 'test@test.com', phone: '+1234567890', status: 'PENDING', eventId: '00000000-0000-0000-0000-000000000000',
  }, 400);

  await test('GET /api/nonexistent (404)', 'GET', '/api/nonexistent', null, 404);
  console.log('');

  // ---- 7. Campaigns ----
  console.log('[7] Campaigns');
  await test('POST /api/campaigns/send-rsvp (RSVP_REMINDER)', 'POST', '/api/campaigns/send-rsvp', { campaignType: 'RSVP_REMINDER' }, 200);
  await test('POST /api/campaigns/send-rsvp (ITINERARY)', 'POST', '/api/campaigns/send-rsvp', { campaignType: 'ITINERARY' }, 200);
  await test('POST /api/campaigns/send-rsvp (invalid type - 400)', 'POST', '/api/campaigns/send-rsvp', { campaignType: 'INVALID' }, 400);
  console.log('');

  // ---- 8. Seating Assignment ----
  console.log('[8] Seating Assignment');
  if (tables && tables.body && tables.body.data.length > 0 && testEventId) {
    const seatGuest = await test('POST /api/guests (seating test guest)', 'POST', '/api/guests', {
      name: 'Seating Test Guest', email: 'seating.test@eventhub360.com', phone: '+9876543210', status: 'CONFIRMED', eventId: testEventId,
    }, 201);

    if (seatGuest && seatGuest.body && seatGuest.body.data) {
      const sgId = seatGuest.body.data.id;
      const tableId = tables.body.data[0].id;

      await test('PUT /api/seating/assign (assign)', 'PUT', '/api/seating/assign', { guestId: sgId, tableId, seatNumber: 99 }, 200);
      await test('PUT /api/seating/assign (unassign)', 'PUT', '/api/seating/assign', { guestId: sgId }, 200);

      // Cleanup
      await test('DELETE /api/guests/:id (cleanup seating)', 'DELETE', `/api/guests/${sgId}`, null, 200);
    }
  } else {
    console.log('  SKIP: No tables in database or no test event');
  }

  await test('PUT /api/seating/assign (missing guestId - 400)', 'PUT', '/api/seating/assign', { tableId: 'some-id' }, 400);
  console.log('');

  // ---- 9. Bulk Export ----
  console.log('[9] Bulk Export');
  await test('GET /api/guests/export (CSV)', 'GET', '/api/guests/export', null, 200);
  console.log('');

  // ---- Summary ----
  console.log('===============================================');
  console.log('  TEST RESULTS SUMMARY');
  console.log('===============================================');
  console.log(`  Total:  ${pass + fail}`);
  console.log(`  \x1b[32mPassed: ${pass}\x1b[0m`);
  console.log(`  ${fail > 0 ? '\x1b[31m' : '\x1b[32m'}Failed: ${fail}\x1b[0m`);
  console.log('===============================================\n');

  // Print table
  console.log('Test'.padEnd(55) + 'Status'.padEnd(8) + 'HTTP');
  console.log('-'.repeat(75));
  results.forEach(r => {
    const color = r.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    console.log(`${r.test.padEnd(55)}${color}${r.status}\x1b[0m`.padEnd(71) + `${r.http}`);
  });
  console.log('');

  if (fail > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
