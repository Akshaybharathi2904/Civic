import { runE2eWorkflowTest } from './e2eWorkflow.test.js';
import { runFailureScenariosTest } from './failureScenarios.test.js';
import { runSecurityAndRbacTest } from './securityAndRbac.test.js';
import { runApiIntegrationTest } from './apiIntegration.test.js';

export const runMasterIntegrationTestSuite = async () => {
  console.log('================================================================');
  console.log('🚀 STARTING MASTER INTEGRATION & END-TO-END TEST SUITE');
  console.log('   Civic AI Multi-Agent & Government Operations Platform');
  console.log('================================================================\n');

  const startTime = Date.now();
  let passedSuites = 0;
  const totalSuites = 4;

  try {
    await runE2eWorkflowTest();
    passedSuites++;

    await runFailureScenariosTest();
    passedSuites++;

    await runSecurityAndRbacTest();
    passedSuites++;

    await runApiIntegrationTest();
    passedSuites++;

    const durationMs = Date.now() - startTime;
    console.log('\n================================================================');
    console.log(`🎉 ALL INTEGRATION SUITES PASSED! (${passedSuites}/${totalSuites})`);
    console.log(`⏱ Total Execution Time: ${durationMs}ms`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ MASTER TEST SUITE FAILED:', err);
    process.exit(1);
  }
};

runMasterIntegrationTestSuite();
