import { adkWorkflowAgent } from '../core/ADKWorkflowAgent.js';

async function testGoogleADKWorkflowEngine() {
  console.log('--- Testing Production Google ADK v2.5.0 Multi-Agent Framework ---');

  const testComplaintInput = {
    title: 'Severe water pipeline leakage flooding sidewalk on Avinashi Road',
    description: 'Fresh clean water continuously leaking from underground pipeline burst near Peelamedu bus stop.',
    category: 'Water & Sewage',
    latitude: 11.0212,
    longitude: 76.9601,
    address: 'Avinashi Road, Peelamedu, Coimbatore',
    mediaFiles: [{ url: 'https://example.com/water_leak.jpg', type: 'image' }]
  };

  try {
    const context = await adkWorkflowAgent.executeWorkflow(testComplaintInput);

    console.log('\n✅ [ADK WORKFLOW TEST SUCCESS] Shared Context Merged!');
    console.log('Workflow Status:', context.workflowStatus);
    console.log('Started At:', context.timestamps.startedAt);
    console.log('Completed At:', context.timestamps.completedAt);
    console.log('\n--- 1. Complaint Analysis ---', context.complaintAnalysis);
    console.log('\n--- 2. Vision Analysis ---', context.visionAnalysis);
    console.log('\n--- 3. Location Analysis ---', context.locationAnalysis);
    console.log('\n--- 4. Duplicate Analysis ---', context.duplicateAnalysis);
    console.log('\n--- 5. Community Validation ---', context.communityValidation);
    console.log('\n--- 6. Priority Assessment ---', context.priorityAssessment);
    console.log('\n--- 7. Department Recommendation ---', context.departmentRecommendation);
    console.log('\n--- Execution Log Timeline ---');
    context.executionHistory.forEach(log => {
      console.log(`[${log.timestamp}] ${log.agentName} -> ${log.status} (${log.durationMs}ms) [Conf: ${log.confidence * 100}%]`);
    });
  } catch (err) {
    console.error('❌ [ADK WORKFLOW TEST FAILED]:', err);
  }
}

testGoogleADKWorkflowEngine();
