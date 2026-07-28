import {
  testSuccessfulComplaintProcessing,
  testHighPriorityEmergencyComplaint,
  testDuplicateComplaintDetection,
  testMissingLocationFallback,
  testInvalidInputDataValidation,
  testRetryMechanismValidation,
  testPersistentAgentFailureHandling,
} from './e2eOrchestrator.test.js';

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🤖 AI MULTI-AGENT PLATFORM - END-TO-END INTEGRATION TEST SUITE');
  console.log('=============================================================\n');

  const tests = [
    { name: 'Scenario 1: Standard Complaint Processing', fn: testSuccessfulComplaintProcessing },
    { name: 'Scenario 2: High-Priority Emergency Hazard', fn: testHighPriorityEmergencyComplaint },
    { name: 'Scenario 3: Duplicate Complaint Detection', fn: testDuplicateComplaintDetection },
    { name: 'Scenario 4: Missing/Optional Location Fallback', fn: testMissingLocationFallback },
    { name: 'Scenario 5: Invalid Input Data Validation', fn: testInvalidInputDataValidation },
    { name: 'Scenario 6: Retry Mechanism & Recovery', fn: testRetryMechanismValidation },
    { name: 'Scenario 7: Persistent Agent Failure Handling', fn: testPersistentAgentFailureHandling },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const test of tests) {
    try {
      const msg = await test.fn();
      console.log(`✅ [PASS] ${msg}`);
      passedCount++;
    } catch (err) {
      console.error(`❌ [FAIL] ${test.name}:`, err.message);
      failedCount++;
    }
  }

  console.log('\n=============================================================');
  console.log(`📊 TEST RESULTS SUMMARY: ${passedCount}/${tests.length} PASSED (${failedCount} Failed)`);
  console.log('=============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
