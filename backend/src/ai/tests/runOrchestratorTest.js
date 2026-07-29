import AgentOrchestrator from '../orchestrator/AgentOrchestrator.js';

async function testAutonomousSwarmEngine() {
  console.log('--- Testing Autonomous Multi-Agent Execution Engine ---');

  const orchestrator = new AgentOrchestrator();

  const testComplaint = {
    title: 'Pothole on Main Cross Road causing severe traffic hazard',
    description: 'Deep pothole filled with rainwater near Avinashi road signal, vehicles swerving unexpectedly.',
    category: 'Road Infrastructure',
    latitude: 11.0168,
    longitude: 76.9558,
    address: 'Avinashi Road Signal, Peelamedu, Coimbatore',
    mediaFiles: [{ url: 'https://example.com/pothole.jpg', type: 'image' }]
  };

  try {
    const context = await orchestrator.executeWorkflow(testComplaint);
    const report = context.toFinalAIReport();

    console.log('\n✅ [TEST SUCCESS] Workflow Context Completed!');
    console.log('Status:', context.workflowStatus);
    console.log('Total Duration:', context.metadata.totalExecutionTimeMs, 'ms');
    console.log('Summary:', JSON.stringify(report.summary, null, 2));
    console.log('Executed Steps Count:', context.metadata.history.length);
  } catch (err) {
    console.error('❌ [TEST FAILED]:', err);
  }
}

testAutonomousSwarmEngine();
