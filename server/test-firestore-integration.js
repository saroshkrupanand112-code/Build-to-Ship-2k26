import { initFirestore, getFirestore, getFirestoreStatus } from './src/config/firestore.js';
import { UserRepo } from './src/models/User.js';
import { InvestigationRepo } from './src/models/Investigation.js';
import { DocumentRepo } from './src/models/Document.js';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('🧪 Starting FieldSense AI - Firestore Integration Tests...\n');

  // Test 1: Connect to Firestore
  console.log('[Test 1] Initializing Firestore connection...');
  await initFirestore();
  const status = getFirestoreStatus();
  console.log('Firestore Status:', status);
  if (!status.connected) {
    console.error('❌ Failed to connect to Firestore!');
    process.exit(1);
  }
  console.log('✅ Firestore connected successfully.\n');

  const testEmail = `tech_${Date.now()}@industrial-sense.org`;
  const testPassword = 'Password123!';

  // Test 2: User Registration
  console.log('[Test 2] Creating user via UserRepo...');
  const createdUser = await UserRepo.create({
    name: 'Sarah Connor',
    email: testEmail,
    password: testPassword,
    role: 'technician',
    organization: 'Apex Robotics'
  });
  console.log('Created user record (safe):', {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role
  });

  if (!createdUser.id || !createdUser.password) {
    throw new Error('User creation missing id or password hash');
  }
  if (createdUser.password === testPassword) {
    throw new Error('SECURITY VIOLATION: Password stored in plaintext!');
  }
  if (!createdUser.password.startsWith('$2')) {
    throw new Error('Password is not a valid bcrypt hash!');
  }
  console.log('✅ User registered with bcrypt hash and unique ID.\n');

  // Test 3: Duplicate Email Rejection
  console.log('[Test 3] Testing duplicate email rejection...');
  try {
    await UserRepo.create({
      name: 'Duplicate Sarah',
      email: testEmail,
      password: testPassword
    });
    throw new Error('Failed to block duplicate email!');
  } catch (err) {
    if (err.code === 11000 || err.message?.includes('already registered')) {
      console.log('✅ Duplicate email successfully rejected (code: 11000).\n');
    } else {
      throw err;
    }
  }

  // Test 4: User Lookup & Password Compare
  console.log('[Test 4] Finding user by email and comparing password...');
  const foundUser = await UserRepo.findByEmail(testEmail);
  if (!foundUser) throw new Error('User not found by email');

  const passwordMatches = await foundUser.comparePassword(testPassword);
  const badPasswordFails = !(await foundUser.comparePassword('WrongPassword!'));
  if (!passwordMatches || !badPasswordFails) {
    throw new Error('Password comparison failed!');
  }
  console.log('✅ User authentication and password verification succeeded.\n');

  // Test 5: Find User By ID (Password excluded)
  console.log('[Test 5] Finding user by ID (safe)...');
  const safeUser = await UserRepo.findById(foundUser.id);
  if (safeUser.password) {
    throw new Error('SECURITY VIOLATION: Password hash returned from findById!');
  }
  console.log('✅ findById excluded password hash successfully.\n');

  // Test 6: Create Investigation
  console.log('[Test 6] Creating Investigation record in Firestore...');
  const invData = {
    title: 'Hydraulic Press Overpressure Anomaly',
    description: 'Unit #4 exhibiting high pressure pulses during cycle 3',
    scenario: 'hydraulic_anomaly',
    evidenceMetadata: [
      { modality: 'image', originalName: 'valve_sensor.jpg', mimeType: 'image/jpeg', size: 104200 },
      { modality: 'audio', originalName: 'pulsing_hum.wav', mimeType: 'audio/wav', size: 450300 }
    ],
    aiResult: {
      summary: 'High pressure anomaly traced to faulty relief valve solenoid.',
      primaryIssue: {
        title: 'Relief Valve Sticking',
        description: 'Sensor data shows pressure spikes correlate with solenoid activation delay.'
      },
      confidence: {
        score: 0.88,
        label: 'High',
        explanation: 'Audio frequency analysis corroborates pressure telemetry.'
      },
      evidence: [
        { modality: 'image', observation: 'No visual leakage detected', type: 'supporting', impact: 'medium' }
      ],
      contradictions: [],
      nextBestQuestion: {
        question: 'Check the solenoid coil resistance with multimeter?',
        reason: 'Rules out electrical degradation'
      },
      recommendations: [
        { action: 'Clean and inspect relief valve seat', priority: 'high', reason: 'Prevent pump damage' }
      ]
    },
    confidenceScore: 0.88,
    confidenceLabel: 'High',
    contradictionsCount: 0,
    userId: foundUser.id
  };

  const createdInv = await InvestigationRepo.create(invData);
  console.log('Created Investigation ID:', createdInv.id);
  if (!createdInv.id || !createdInv._id) throw new Error('Investigation creation missing ID');
  console.log('✅ Investigation created in Firestore.\n');

  // Test 7: List Investigations
  console.log('[Test 7] Listing investigations...');
  const allInvs = await InvestigationRepo.findAll();
  console.log(`Found ${allInvs.length} investigations in Firestore`);
  const foundInList = allInvs.find(i => i.id === createdInv.id || i._id === createdInv.id);
  if (!foundInList) throw new Error('Created investigation not found in list');
  console.log('✅ Investigation found in list query.\n');

  // Test 8: Get Investigation by ID
  console.log('[Test 8] Fetching investigation by ID...');
  const fetchedInv = await InvestigationRepo.findById(createdInv.id);
  if (!fetchedInv || fetchedInv.title !== invData.title) {
    throw new Error('Failed to retrieve investigation by ID');
  }
  console.log('✅ Investigation retrieved by ID with full fields.\n');

  // Test 9: Delete Investigation
  console.log('[Test 9] Deleting investigation...');
  const deleted = await InvestigationRepo.deleteById(createdInv.id);
  if (!deleted) throw new Error('Failed to delete investigation');
  const verifyDeleted = await InvestigationRepo.findById(createdInv.id);
  if (verifyDeleted) throw new Error('Investigation still exists after deletion');
  console.log('✅ Investigation successfully deleted from Firestore.\n');

  // Test 10: Documents and Chunks (RAG)
  console.log('[Test 10] Testing Document & Chunk persistence...');
  const testDocId = `doc_${Date.now()}`;
  const doc = await DocumentRepo.createDocument({
    documentId: testDocId,
    originalName: 'Hydraulics_Maintenance_Manual.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1048576,
    status: 'INDEXING'
  });
  console.log('Created doc record in Firestore:', doc.documentId);

  await DocumentRepo.storeChunks(testDocId, [
    { chunkIndex: 0, text: 'Safety procedures for hydraulic press operations...', pageNumber: 1 },
    { chunkIndex: 1, text: 'Relief valve maintenance and calibration specifications...', pageNumber: 2 }
  ]);

  const chunks = await DocumentRepo.getAllChunksByDocId(testDocId);
  if (chunks.length !== 2) throw new Error(`Expected 2 chunks, got ${chunks.length}`);
  console.log(`Retrieved ${chunks.length} chunks for document ${testDocId}`);

  await DocumentRepo.updateDocumentStatus(testDocId, 'READY', { chunkCount: 2 });
  const allDocs = await DocumentRepo.findAllDocuments();
  const updatedDoc = allDocs.find(d => d.documentId === testDocId);
  if (!updatedDoc || updatedDoc.status !== 'READY') throw new Error('Document status update failed');
  console.log('✅ Document and Chunk storage in Firestore verified.\n');

  console.log('🎉 ALL 10 FIRESTORE INTEGRATION TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
