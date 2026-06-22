const http = require('http');

const PORT = 3000;

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
  console.log('Starting Guest Profile API End-to-End Verification tests...\n');

  try {
    // 1. Fetch profile details for Jameson Vanderbilt (event_guest_id: 5)
    console.log('--- 1. Testing GET /api/v1/profiles/5 ---');
    const profileRes = await request('GET', '/api/v1/profiles/5');
    console.log(`Status: ${profileRes.statusCode}`);
    console.log('Body:', JSON.stringify(profileRes.body, null, 2));
    if (profileRes.statusCode !== 200) throw new Error('GET /profiles/5 failed');
    if (profileRes.body.data.name !== 'Jameson Vanderbilt') {
      throw new Error(`Expected guest name to be Jameson Vanderbilt, got ${profileRes.body.data.name}`);
    }
    console.log('PASS\n');

    // 2. Add a new concierge note to Jameson Vanderbilt (event_guest_id: 5)
    console.log('--- 2. Testing POST /api/v1/profiles/5/notes ---');
    const notePayload = {
      content: 'Requesting a late check-out at 2:00 PM instead of 12:00 PM.',
      author: 'Sarah J., Head Concierge',
    };
    const addNoteRes = await request('POST', '/api/v1/profiles/5/notes', notePayload);
    console.log(`Status: ${addNoteRes.statusCode}`);
    console.log('Body:', JSON.stringify(addNoteRes.body, null, 2));
    if (addNoteRes.statusCode !== 201) throw new Error('POST /profiles/5/notes failed');
    console.log('PASS\n');

    // 3. Fetch notes for Jameson Vanderbilt (should contain both the initial note and the new note)
    console.log('--- 3. Testing GET /api/v1/profiles/5/notes ---');
    const notesRes = await request('GET', '/api/v1/profiles/5/notes');
    console.log(`Status: ${notesRes.statusCode}`);
    console.log('Body:', JSON.stringify(notesRes.body, null, 2));
    if (notesRes.statusCode !== 200) throw new Error('GET /profiles/5/notes failed');
    if (notesRes.body.data.length < 2) {
      throw new Error(`Expected at least 2 notes, got ${notesRes.body.data.length}`);
    }
    console.log('PASS\n');

    // 4. Update profile details (title, email, special requests, and room check-out time)
    console.log('--- 4. Testing PATCH /api/v1/profiles/5 ---');
    const updatePayload = {
      title: 'Managing Director, Vanderbilt Ventures',
      email: 'jameson.v@vge.com',
      special_requests: 'Requires unscented organic linens only.',
      accommodation: {
        hotel_name: 'The Ritz-Carlton, Manhattan',
        room_details: 'Executive Suite, Room 402',
        check_in: 'Oct 11, 3:00 PM',
        check_out: 'Oct 13, 2:00 PM', // Updated check-out
      },
    };
    const patchRes = await request('PATCH', '/api/v1/profiles/5', updatePayload);
    console.log(`Status: ${patchRes.statusCode}`);
    console.log('Body:', JSON.stringify(patchRes.body, null, 2));
    if (patchRes.statusCode !== 200) throw new Error('PATCH /profiles/5 failed');
    if (patchRes.body.data.title !== 'Managing Director, Vanderbilt Ventures') {
      throw new Error(`Expected updated title, got ${patchRes.body.data.title}`);
    }
    if (patchRes.body.data.accommodation.check_out !== 'Oct 13, 2:00 PM') {
      throw new Error(`Expected updated room check_out, got ${patchRes.body.data.accommodation.check_out}`);
    }
    console.log('PASS\n');

    // 5. Fetch updated profile to verify persistence of all cached parameters
    console.log('--- 5. Testing GET /api/v1/profiles/5 (Post-Update) ---');
    const finalProfileRes = await request('GET', '/api/v1/profiles/5');
    console.log(`Status: ${finalProfileRes.statusCode}`);
    console.log('Body:', JSON.stringify(finalProfileRes.body, null, 2));
    if (finalProfileRes.statusCode !== 200) throw new Error('GET /profiles/5 post-update failed');
    if (finalProfileRes.body.data.email !== 'jameson.v@vge.com') {
      throw new Error('Verification failed: cached fields did not persist correctly.');
    }
    console.log('PASS\n');

    console.log('All Guest Profile endpoints successfully verified!');
    process.exit(0);
  } catch (error) {
    console.error('VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

setTimeout(runTests, 1500);
