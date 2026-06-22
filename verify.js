const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make HTTP requests using Node's native http module
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Starting API End-to-End Verification tests...\n');

  try {
    // 1. Check Status Endpoint
    console.log('--- 1. Testing GET /status ---');
    const statusRes = await request('GET', '/status');
    console.log(`Status: ${statusRes.statusCode}`);
    console.log('Body:', JSON.stringify(statusRes.body, null, 2));
    if (statusRes.statusCode !== 200) throw new Error('Status endpoint failed');
    console.log('PASS\n');

    // 2. Get Guests for Event 200 (Initial State)
    console.log('--- 2. Testing GET /api/v1/guests?event=200 ---');
    const guestsRes = await request('GET', '/api/v1/guests?event=200');
    console.log(`Status: ${guestsRes.statusCode}`);
    console.log(`Guests Found: ${guestsRes.body.count}`);
    console.log('First Guest Details (Initial):', JSON.stringify(guestsRes.body.data[0], null, 2));
    if (guestsRes.statusCode !== 200) throw new Error('GET /guests failed');
    console.log('PASS\n');

    // 3. Submit RSVP for Mr. Mehta (token: rsvp-token-mehta)
    console.log('--- 3. Testing POST /api/v1/rsvp/rsvp-token-mehta ---');
    const rsvpBody = {
      status: 'yes',
      pax: 2,
      meal_preferences: ['Veg', 'Allergy: Shellfish']
    };
    const rsvpRes = await request('POST', '/api/v1/rsvp/rsvp-token-mehta', rsvpBody);
    console.log(`Status: ${rsvpRes.statusCode}`);
    console.log('RSVP Response Body:', JSON.stringify(rsvpRes.body, null, 2));
    if (rsvpRes.statusCode !== 200) throw new Error('POST /rsvp/:token failed');
    console.log('PASS\n');

    // 4. Update Seating Assignment for seating_id 1
    console.log('--- 4. Testing PATCH /api/v1/seating/1 ---');
    const seatingBody = {
      table_no: 'T8',
      seat_no: 'S12'
    };
    const seatingRes = await request('PATCH', '/api/v1/seating/1', seatingBody);
    console.log(`Status: ${seatingRes.statusCode}`);
    console.log('Seating Response Body:', JSON.stringify(seatingRes.body, null, 2));
    if (seatingRes.statusCode !== 200) throw new Error('PATCH /seating/:id failed');
    console.log('PASS\n');

    // 5. Register Check-in for Mr. Mehta using QR code (matches rsvp_token)
    console.log('--- 5. Testing POST /api/v1/checkin ---');
    const checkinBody = {
      qr_code: 'rsvp-token-mehta'
    };
    const checkinRes = await request('POST', '/api/v1/checkin', checkinBody);
    console.log(`Status: ${checkinRes.statusCode}`);
    console.log('Check-in Response Body (Includes Badge details):', JSON.stringify(checkinRes.body, null, 2));
    if (checkinRes.statusCode !== 201) throw new Error('POST /checkin failed');
    console.log('PASS\n');

    // 6. Get Guests for Event 200 again to verify changes are persisted and joined
    console.log('--- 6. Testing GET /api/v1/guests?event=200 (Post-Updates) ---');
    const finalGuestsRes = await request('GET', '/api/v1/guests?event=200');
    console.log(`Status: ${finalGuestsRes.statusCode}`);
    
    // Find Mr. Mehta's updated record
    const mehta = finalGuestsRes.body.data.find(g => g.rsvp_token === 'rsvp-token-mehta');
    console.log('Mr. Mehta (Updated Guest Info):', JSON.stringify(mehta, null, 2));
    
    if (!mehta || mehta.rsvp_status !== 'yes' || mehta.checkins.length === 0) {
      throw new Error('Persisted updates verification failed');
    }
    console.log('PASS\n');

    console.log('All API endpoints successfully verified!');
    process.exit(0);
  } catch (error) {
    console.error('VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

// Introduce a small delay to make sure server is fully listening
setTimeout(runTests, 1500);
