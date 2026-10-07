import app from './src/app.js';
import { initFirestore } from './src/config/firestore.js';
import http from 'http';

async function testApi() {
  console.log('🚀 Initializing server for API contract validation...');
  await initFirestore();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Health check
    console.log('\n[API 1] Testing GET /api/health');
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log('Health response database:', healthRes.database);
    if (!healthRes.database?.connected || healthRes.database?.driver !== 'cloud-firestore') {
      throw new Error('Health check did not report connected cloud-firestore!');
    }
    console.log('✅ Health check confirms Cloud Firestore active.');

    // 2. Auth Register
    console.log('\n[API 2] Testing POST /api/auth/register');
    const testEmail = `operator_${Date.now()}@acme-corp.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Miller',
        email: testEmail,
        password: 'SecurePassWord99!',
        organization: 'Field Automation'
      })
    }).then(r => r.json());

    if (!regRes.success || !regRes.token || !regRes.user) {
      throw new Error(`Register failed: ${JSON.stringify(regRes)}`);
    }
    if (regRes.user.password) {
      throw new Error('SECURITY VIOLATION: Password hash exposed in register response!');
    }
    const token = regRes.token;
    console.log('✅ Registered successfully. Token received, password excluded.');

    // 3. Auth Me
    console.log('\n[API 3] Testing GET /api/auth/me');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    if (!meRes.success || meRes.user.email !== testEmail) {
      throw new Error(`Auth me failed: ${JSON.stringify(meRes)}`);
    }
    console.log('✅ Auth /me verified profile with JWT.');

    // 4. Auth Login
    console.log('\n[API 4] Testing POST /api/auth/login');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassWord99!'
      })
    }).then(r => r.json());
    if (!loginRes.success || !loginRes.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
    }
    console.log('✅ Login successfully verified with email + password.');

    // 5. Create Investigation
    console.log('\n[API 5] Testing POST /api/investigations');
    const invPayload = {
      title: 'Coolant Flow Decay Investigation',
      description: 'Coolant pump flow dropped below 15 LPM at Station B',
      scenario: 'cooling_failure',
      evidenceMetadata: [
        { modality: 'text', originalName: 'log.txt', size: 1024 }
      ],
      aiResult: {
        summary: 'Detected impeller cavitations from acoustic signatures',
        primaryIssue: { title: 'Cavitation', description: 'Impeller erosion suspected' },
        confidence: { score: 0.92, label: 'High', explanation: 'Flow telemetry confirms acoustic patterns' },
        contradictions: [],
        evidence: []
      }
    };
    const createInvRes = await fetch(`${baseUrl}/investigations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(invPayload)
    }).then(r => r.json());

    if (!createInvRes.success || !createInvRes.data?.id) {
      throw new Error(`Create investigation failed: ${JSON.stringify(createInvRes)}`);
    }
    const invId = createInvRes.data.id;
    console.log('✅ Created investigation with ID:', invId);

    // 6. List Investigations
    console.log('\n[API 6] Testing GET /api/investigations');
    const listRes = await fetch(`${baseUrl}/investigations`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    if (!listRes.success || !Array.isArray(listRes.data)) {
      throw new Error(`List investigations failed: ${JSON.stringify(listRes)}`);
    }
    const found = listRes.data.find(i => i.id === invId || i._id === invId);
    if (!found) throw new Error('Investigation not found in listing!');
    console.log(`✅ List investigations retrieved ${listRes.data.length} records.`);

    // 7. Get Investigation by ID
    console.log('\n[API 7] Testing GET /api/investigations/:id');
    const getRes = await fetch(`${baseUrl}/investigations/${invId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    if (!getRes.success || getRes.data?.title !== invPayload.title) {
      throw new Error(`Get investigation failed: ${JSON.stringify(getRes)}`);
    }
    console.log('✅ Investigation retrieved by ID matches created data.');

    // 8. Delete Investigation
    console.log('\n[API 8] Testing DELETE /api/investigations/:id');
    const delRes = await fetch(`${baseUrl}/investigations/${invId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    if (!delRes.success) {
      throw new Error(`Delete investigation failed: ${JSON.stringify(delRes)}`);
    }
    console.log('✅ Investigation deleted successfully.');

    console.log('\n✨ ALL EXPRESS API ENDPOINTS ARE FULLY OPERATIONAL WITH FIRESTORE!');
  } finally {
    server.close();
  }
}

testApi().catch(err => {
  console.error('❌ API Test Failed:', err);
  process.exit(1);
});
