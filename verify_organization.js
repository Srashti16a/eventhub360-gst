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
  console.log('Starting Organization Settings API End-to-End Verification tests...\n');

  try {
    // 1. Get Initial Organization Configuration
    console.log('--- 1. Testing GET /api/v1/organization ---');
    const orgRes = await request('GET', '/api/v1/organization');
    console.log(`Status: ${orgRes.statusCode}`);
    console.log('Body:', JSON.stringify(orgRes.body, null, 2));
    if (orgRes.statusCode !== 200) throw new Error('GET /organization failed');
    if (orgRes.body.data.company_name !== 'Grand Hyatt Grand Regency') {
      throw new Error(`Expected company name to be Grand Hyatt Grand Regency, got ${orgRes.body.data.company_name}`);
    }
    console.log('PASS\n');

    // 2. Update Organization Configuration details
    console.log('--- 2. Testing PATCH /api/v1/organization ---');
    const updatePayload = {
      company_name: 'Regency Grand Hyatt Luxury Resort',
      tax_id: 'US-99-9876543',
      address: '777 Luxury Boulevard, Las Vegas, NV 89109',
      timezone: 'Eastern Standard Time (EST)',
      currency: 'USD ($)',
    };
    const updateRes = await request('PATCH', '/api/v1/organization', updatePayload);
    console.log(`Status: ${updateRes.statusCode}`);
    console.log('Body:', JSON.stringify(updateRes.body, null, 2));
    if (updateRes.statusCode !== 200) throw new Error('PATCH /organization failed');
    if (updateRes.body.data.company_name !== 'Regency Grand Hyatt Luxury Resort') {
      throw new Error(`Expected updated company name, got ${updateRes.body.data.company_name}`);
    }
    if (updateRes.body.data.tax_id !== 'US-99-9876543') {
      throw new Error(`Expected updated tax ID, got ${updateRes.body.data.tax_id}`);
    }
    console.log('PASS\n');

    // 3. Replace/Upload Organization Logo
    console.log('--- 3. Testing POST /api/v1/organization/logo ---');
    const logoPayload = {
      logo: 'https://images.eventhub360.com/regency-luxury-logo.svg',
    };
    const logoRes = await request('POST', '/api/v1/organization/logo', logoPayload);
    console.log(`Status: ${logoRes.statusCode}`);
    console.log('Body:', JSON.stringify(logoRes.body, null, 2));
    if (logoRes.statusCode !== 200) throw new Error('POST /organization/logo failed');
    if (logoRes.body.data.logo !== 'https://images.eventhub360.com/regency-luxury-logo.svg') {
      throw new Error(`Expected updated logo, got ${logoRes.body.data.logo}`);
    }
    console.log('PASS\n');

    // 4. Retrieve Organization Config to assert updates persist correctly
    console.log('--- 4. Testing GET /api/v1/organization (Post-Updates) ---');
    const finalRes = await request('GET', '/api/v1/organization');
    console.log(`Status: ${finalRes.statusCode}`);
    console.log('Body:', JSON.stringify(finalRes.body, null, 2));
    if (finalRes.statusCode !== 200) throw new Error('GET /organization post-update failed');
    if (finalRes.body.data.company_name !== 'Regency Grand Hyatt Luxury Resort' || finalRes.body.data.logo !== 'https://images.eventhub360.com/regency-luxury-logo.svg') {
      throw new Error('Database updates did not persist correctly.');
    }
    console.log('PASS\n');

    console.log('All Organization Settings endpoints successfully verified!');
    process.exit(0);
  } catch (error) {
    console.error('VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

setTimeout(runTests, 1500);
