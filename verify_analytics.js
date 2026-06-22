const http = require('http');

const PORT = 3000;

function request(method, path) {
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

    req.end();
  });
}

async function runTests() {
  console.log('Starting Attendance Analytics API End-to-End Verification tests...\n');

  try {
    // 1. Get dashboard summary
    console.log('--- 1. Testing GET /api/v1/analytics/dashboard?event=200 ---');
    const dashboardRes = await request('GET', '/api/v1/analytics/dashboard?event=200');
    console.log(`Status: ${dashboardRes.statusCode}`);
    console.log('Body:', JSON.stringify(dashboardRes.body, null, 2));
    if (dashboardRes.statusCode !== 200) throw new Error('GET /analytics/dashboard failed');
    console.log('PASS\n');

    // 2. Get attendance hourly trends
    console.log('--- 2. Testing GET /api/v1/analytics/attendance-trends?event=200 ---');
    const trendsRes = await request('GET', '/api/v1/analytics/attendance-trends?event=200');
    console.log(`Status: ${trendsRes.statusCode}`);
    console.log('Body length:', trendsRes.body.data.length);
    console.log('Sample Trend Row:', JSON.stringify(trendsRes.body.data[0], null, 2));
    if (trendsRes.statusCode !== 200) throw new Error('GET /analytics/attendance-trends failed');
    console.log('PASS\n');

    // 3. Get RSVP funnel breakdown
    console.log('--- 3. Testing GET /api/v1/analytics/rsvp-funnel?event=200 ---');
    const funnelRes = await request('GET', '/api/v1/analytics/rsvp-funnel?event=200');
    console.log(`Status: ${funnelRes.statusCode}`);
    console.log('Body:', JSON.stringify(funnelRes.body, null, 2));
    if (funnelRes.statusCode !== 200) throw new Error('GET /analytics/rsvp-funnel failed');
    console.log('PASS\n');

    // 4. Get gate arrival heatmap grid
    console.log('--- 4. Testing GET /api/v1/analytics/arrival-heatmap?event=200 ---');
    const heatmapRes = await request('GET', '/api/v1/analytics/arrival-heatmap?event=200');
    console.log(`Status: ${heatmapRes.statusCode}`);
    console.log('Body length:', heatmapRes.body.data.length);
    console.log('Sample Heatmap Row:', JSON.stringify(heatmapRes.body.data[0], null, 2));
    if (heatmapRes.statusCode !== 200) throw new Error('GET /analytics/arrival-heatmap failed');
    console.log('PASS\n');

    // 5. Get guest categories breakdown
    console.log('--- 5. Testing GET /api/v1/analytics/guest-breakdown?event=200 ---');
    const breakdownRes = await request('GET', '/api/v1/analytics/guest-breakdown?event=200');
    console.log(`Status: ${breakdownRes.statusCode}`);
    console.log('Body:', JSON.stringify(breakdownRes.body, null, 2));
    if (breakdownRes.statusCode !== 200) throw new Error('GET /analytics/guest-breakdown failed');
    console.log('PASS\n');

    // 6. Get no-show segments analysis
    console.log('--- 6. Testing GET /api/v1/analytics/no-show-analysis?event=200 ---');
    const noshowRes = await request('GET', '/api/v1/analytics/no-show-analysis?event=200');
    console.log(`Status: ${noshowRes.statusCode}`);
    console.log('Body:', JSON.stringify(noshowRes.body, null, 2));
    if (noshowRes.statusCode !== 200) throw new Error('GET /analytics/no-show-analysis failed');
    console.log('PASS\n');

    // 7. Get concierge insights textual checklist
    console.log('--- 7. Testing GET /api/v1/analytics/concierge-insights?event=200 ---');
    const insightsRes = await request('GET', '/api/v1/analytics/concierge-insights?event=200');
    console.log(`Status: ${insightsRes.statusCode}`);
    console.log('Body:', JSON.stringify(insightsRes.body, null, 2));
    if (insightsRes.statusCode !== 200) throw new Error('GET /analytics/concierge-insights failed');
    console.log('PASS\n');

    console.log('All Attendance Analytics endpoints successfully verified!');
    process.exit(0);
  } catch (error) {
    console.error('VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

setTimeout(runTests, 1500);
