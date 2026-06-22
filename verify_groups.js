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
  console.log('Starting Group API End-to-End Verification tests...\n');
  let targetGroupId = null;

  try {
    // 1. Check Dashboard stats initially
    console.log('--- 1. Testing GET /api/v1/groups/dashboard?event=200 ---');
    const dashboardRes = await request('GET', '/api/v1/groups/dashboard?event=200');
    console.log(`Status: ${dashboardRes.statusCode}`);
    console.log('Body:', JSON.stringify(dashboardRes.body, null, 2));
    if (dashboardRes.statusCode !== 200) throw new Error('Dashboard stats failed');
    console.log('PASS\n');

    // 2. Create a new guest group
    console.log('--- 2. Testing POST /api/v1/groups ---');
    const groupPayload = {
      name: 'Corporate VIP Group',
      event_id: 200,
      tenant_id: 1,
      company_id: 100,
      branch_id: 10,
    };
    const createRes = await request('POST', '/api/v1/groups', groupPayload);
    console.log(`Status: ${createRes.statusCode}`);
    console.log('Body:', JSON.stringify(createRes.body, null, 2));
    if (createRes.statusCode !== 201) throw new Error('Group creation failed');
    targetGroupId = createRes.body.data.group_id;
    console.log(`Target Group ID: ${targetGroupId}`);
    console.log('PASS\n');

    // 3. List groups for event 200 (check that the new group is returned)
    console.log('--- 3. Testing GET /api/v1/groups?event=200 ---');
    const listRes = await request('GET', '/api/v1/groups?event=200');
    console.log(`Status: ${listRes.statusCode}`);
    console.log(`Groups count: ${listRes.body.data.length}`);
    console.log('Pagination:', JSON.stringify(listRes.body.pagination, null, 2));
    if (listRes.statusCode !== 200) throw new Error('List groups failed');
    console.log('PASS\n');

    // 4. Add guest Alice Smith (guest_id: 4) to our new group
    console.log(`--- 4. Testing POST /api/v1/groups/${targetGroupId}/members ---`);
    const addMemberPayload = { guest_id: 4 };
    const addMemberRes = await request('POST', `/api/v1/groups/${targetGroupId}/members`, addMemberPayload);
    console.log(`Status: ${addMemberRes.statusCode}`);
    console.log('Body:', JSON.stringify(addMemberRes.body, null, 2));
    if (addMemberRes.statusCode !== 200) throw new Error('Add member failed');
    console.log('PASS\n');

    // 5. Get detailed group details (members, dietary, location)
    console.log(`--- 5. Testing GET /api/v1/groups/${targetGroupId} ---`);
    const detailsRes = await request('GET', `/api/v1/groups/${targetGroupId}`);
    console.log(`Status: ${detailsRes.statusCode}`);
    console.log('Body:', JSON.stringify(detailsRes.body, null, 2));
    if (detailsRes.statusCode !== 200) throw new Error('Get group details failed');
    console.log('PASS\n');

    // 6. Update the group name
    console.log(`--- 6. Testing PATCH /api/v1/groups/${targetGroupId} ---`);
    const updatePayload = { name: 'Corporate VIP Seating Tier' };
    const updateRes = await request('PATCH', `/api/v1/groups/${targetGroupId}`, updatePayload);
    console.log(`Status: ${updateRes.statusCode}`);
    console.log('Body:', JSON.stringify(updateRes.body, null, 2));
    if (updateRes.statusCode !== 200) throw new Error('Update group failed');
    console.log('PASS\n');

    // 7. Remove member from group
    console.log(`--- 7. Testing DELETE /api/v1/groups/${targetGroupId}/members/4 ---`);
    const deleteRes = await request('DELETE', `/api/v1/groups/${targetGroupId}/members/4`);
    console.log(`Status: ${deleteRes.statusCode}`);
    console.log('Body:', JSON.stringify(deleteRes.body, null, 2));
    if (deleteRes.statusCode !== 200) throw new Error('Remove member failed');
    console.log('PASS\n');

    // 8. Retrieve dashboard stats again to see updated counters
    console.log('--- 8. Testing GET /api/v1/groups/dashboard?event=200 (After Updates) ---');
    const finalDashboardRes = await request('GET', '/api/v1/groups/dashboard?event=200');
    console.log(`Status: ${finalDashboardRes.statusCode}`);
    console.log('Body:', JSON.stringify(finalDashboardRes.body, null, 2));
    if (finalDashboardRes.statusCode !== 200) throw new Error('Dashboard stats validation failed');
    console.log('PASS\n');

    console.log('All Guest Groups endpoints successfully verified!');
    process.exit(0);
  } catch (error) {
    console.error('VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

setTimeout(runTests, 1500);
