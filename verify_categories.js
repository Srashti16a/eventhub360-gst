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
  console.log('Starting Guest Categories API End-to-End Verification tests...\n');

  try {
    // 1. Check Dashboard stats initially
    console.log('--- 1. Testing GET /api/v1/categories/dashboard ---');
    const dashboardRes = await request('GET', '/api/v1/categories/dashboard');
    console.log(`Status: ${dashboardRes.statusCode}`);
    console.log('Body:', JSON.stringify(dashboardRes.body, null, 2));
    if (dashboardRes.statusCode !== 200) throw new Error('Dashboard stats initial call failed');
    
    // We expect 5 total guests (from the seed database + Jameson Vanderbilt)
    if (dashboardRes.body.data.total_guests !== 5) {
      throw new Error(`Expected 5 total guests, got ${dashboardRes.body.data.total_guests}`);
    }
    console.log('PASS\n');

    // 2. List all categories
    console.log('--- 2. Testing GET /api/v1/categories ---');
    const listRes = await request('GET', '/api/v1/categories');
    console.log(`Status: ${listRes.statusCode}`);
    console.log('Body:', JSON.stringify(listRes.body, null, 2));
    if (listRes.statusCode !== 200) throw new Error('List categories failed');
    console.log('PASS\n');

    // 3. Get category details for 'VIP'
    console.log('--- 3. Testing GET /api/v1/categories/VIP ---');
    const vipRes = await request('GET', '/api/v1/categories/VIP');
    console.log(`Status: ${vipRes.statusCode}`);
    console.log('Body:', JSON.stringify(vipRes.body, null, 2));
    if (vipRes.statusCode !== 200) throw new Error('Get VIP category details failed');
    if (vipRes.body.data.count !== 3) {
      throw new Error(`Expected 3 guests in VIP category, got ${vipRes.body.data.count}`);
    }
    console.log('PASS\n');

    // 4. Assign new category 'Speaker' to Alice Smith (guest_id: 4)
    console.log('--- 4. Testing PATCH /api/v1/categories/assign/4 ---');
    const updatePayload = { category: 'Speaker' };
    const assignRes = await request('PATCH', '/api/v1/categories/assign/4', updatePayload);
    console.log(`Status: ${assignRes.statusCode}`);
    console.log('Body:', JSON.stringify(assignRes.body, null, 2));
    if (assignRes.statusCode !== 200) throw new Error('Assign category to guest failed');
    if (assignRes.body.data.category !== 'Speaker') {
      throw new Error(`Expected updated category to be 'Speaker', got ${assignRes.body.data.category}`);
    }
    console.log('PASS\n');

    // 5. Get category details for 'Speaker' (should now contain Alice Smith)
    console.log('--- 5. Testing GET /api/v1/categories/Speaker ---');
    const speakerRes = await request('GET', '/api/v1/categories/Speaker');
    console.log(`Status: ${speakerRes.statusCode}`);
    console.log('Body:', JSON.stringify(speakerRes.body, null, 2));
    if (speakerRes.statusCode !== 200) throw new Error('Get Speaker category details failed');
    if (speakerRes.body.data.count !== 1) {
      throw new Error(`Expected 1 guest in Speaker category, got ${speakerRes.body.data.count}`);
    }
    console.log('PASS\n');

    // 6. Check Dashboard stats again to verify counts updated correctly
    console.log('--- 6. Testing GET /api/v1/categories/dashboard (After Updates) ---');
    const postDashboardRes = await request('GET', '/api/v1/categories/dashboard');
    console.log(`Status: ${postDashboardRes.statusCode}`);
    console.log('Body:', JSON.stringify(postDashboardRes.body, null, 2));
    if (postDashboardRes.statusCode !== 200) throw new Error('Post-update dashboard call failed');
    
    const vipDist = postDashboardRes.body.data.distribution.find(d => d.category === 'VIP');
    const speakerDist = postDashboardRes.body.data.distribution.find(d => d.category === 'Speaker');
    
    if (vipDist.attendee_count !== 2 || speakerDist.attendee_count !== 1) {
      throw new Error('Dashboard stats verification failed: category counts did not update correctly.');
    }
    console.log('PASS\n');

    // 7. Test event scoping for dashboard stats (event 200 vs event 201)
    console.log('--- 7. Testing GET /api/v1/categories/dashboard?event=201 (Event-scoped query) ---');
    const scopedRes = await request('GET', '/api/v1/categories/dashboard?event=201');
    console.log(`Status: ${scopedRes.statusCode}`);
    console.log('Body:', JSON.stringify(scopedRes.body, null, 2));
    if (scopedRes.statusCode !== 200) throw new Error('Scoped dashboard call failed');
    // Event 201 only has TechCorp Delegation (category: Corporate)
    if (scopedRes.body.data.total_guests !== 1) {
      throw new Error(`Expected 1 total guest for event 201, got ${scopedRes.body.data.total_guests}`);
    }
    const corporateDist = scopedRes.body.data.distribution.find(d => d.category === 'Corporate');
    if (!corporateDist || corporateDist.attendee_count !== 1) {
      throw new Error('Scoped distribution did not filter correctly for event 201');
    }
    console.log('PASS\n');

    console.log('All Guest Categories endpoints successfully verified!');
    process.exit(0);
  } catch (error) {
    console.error('VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

setTimeout(runTests, 1500);
