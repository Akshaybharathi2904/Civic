import { EndToEndPipeline } from '../e2ePipeline.js';

export const runE2eWorkflowTest = async () => {
  console.log('--- [SUITE 1/4] Running Happy-Path E2E Workflow Test ---');
  const pipeline = new EndToEndPipeline();

  const result = await pipeline.processCitizenComplaint({
    title: 'Severe Road Pothole on Cross Cut Road',
    description: 'Deep hazardous pothole causing traffic obstruction.',
    category: 'Road Infrastructure',
    location: { ward: 'Ward 72 - RS Puram', zone: 'Central Zone' },
    citizenId: 'cit_happy_01',
  });

  if (!result.success || result.finalStatus !== 'CLOSED' || result.pipelineLog.length !== 10) {
    throw new Error(`E2E Workflow Test Failed! Result: ${JSON.stringify(result)}`);
  }

  console.log(`✅ [PASS] Happy-Path E2E Workflow Test Passed! Ticket: ${result.ticketId}, Pipeline Steps: ${result.pipelineLog.length}`);
  return true;
};

export default runE2eWorkflowTest;
