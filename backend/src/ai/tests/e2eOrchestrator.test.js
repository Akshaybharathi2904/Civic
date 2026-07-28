import { WorkflowOrchestrator } from '../orchestrator/WorkflowOrchestrator.js';
import { MockEventPublisher } from '../orchestrator/services/MockEventPublisher.js';
import { MockWorkflowRepository } from '../orchestrator/services/MockWorkflowRepository.js';
import { BaseAgent } from '../agents/BaseAgent.js';
import { assertPayloadStructure, assertHistorySequence, assertEventEmitted } from './testHelpers.js';
import { OrchestratorConfig } from '../orchestrator/config/orchestrator.config.js';

export async function testSuccessfulComplaintProcessing() {
  const publisher = new MockEventPublisher();
  const repo = new MockWorkflowRepository();
  const orch = new WorkflowOrchestrator(publisher, repo);

  const created = await orch.createWorkflow({
    complaintId: 'comp_e2e_01',
    title: 'Pothole on DB Road RS Puram',
    description: 'Vehicle wheel damaged due to deep pothole',
    category: 'Road Infrastructure',
    latitude: 11.0084,
    longitude: 76.9508,
  });

  const payload = await orch.executeWorkflow(created.instance.id);

  assertPayloadStructure(payload);
  assertHistorySequence(payload.workflowHistory, [
    OrchestratorConfig.WORKFLOW_STATUSES.CREATED,
    OrchestratorConfig.WORKFLOW_STATUSES.TRIAGE_PARALLEL,
    OrchestratorConfig.WORKFLOW_STATUSES.DUPLICATE_CHECK,
    OrchestratorConfig.WORKFLOW_STATUSES.COMMUNITY_VALIDATION,
    OrchestratorConfig.WORKFLOW_STATUSES.PRIORITY_ASSESSMENT,
    OrchestratorConfig.WORKFLOW_STATUSES.DEPARTMENT_RECOMMENDATION,
    OrchestratorConfig.WORKFLOW_STATUSES.COMPLETED,
  ]);
  assertEventEmitted(publisher.publishedEvents, OrchestratorConfig.EVENT_TYPES.WORKFLOW_COMPLETED);
  assertEventEmitted(publisher.publishedEvents, OrchestratorConfig.EVENT_TYPES.GOVERNMENT_HANDOVER_SUCCESS);

  if (payload.handoverStatus !== 'GOVERNMENT_HANDOVER_READY') {
    throw new Error('Handover status expected to be GOVERNMENT_HANDOVER_READY.');
  }

  return 'Scenario 1 Passed: Successful Standard Complaint Processing';
}

export async function testHighPriorityEmergencyComplaint() {
  const publisher = new MockEventPublisher();
  const repo = new MockWorkflowRepository();
  const orch = new WorkflowOrchestrator(publisher, repo);

  const created = await orch.createWorkflow({
    complaintId: 'comp_e2e_02',
    title: 'Open Manhole and Live Wire Sparking on Main Road',
    description: 'Emergency hazard! Open manhole with exposed live wire sparking after heavy rain',
    category: 'Public Lighting',
    latitude: 11.0084,
    longitude: 76.9508,
  });

  const payload = await orch.executeWorkflow(created.instance.id);

  assertPayloadStructure(payload);
  if (payload.priority.priorityLevel !== 'Critical') {
    throw new Error(`Expected Priority Level "Critical", got "${payload.priority.priorityLevel}".`);
  }
  if (!payload.priority.escalationFlag) {
    throw new Error('Expected escalationFlag to be true for emergency hazard.');
  }
  if (payload.priority.recommendedSLA !== 6) {
    throw new Error(`Expected 6h SLA, got ${payload.priority.recommendedSLA}h.`);
  }

  return 'Scenario 2 Passed: High-Priority Emergency Hazard Handling';
}

export async function testDuplicateComplaintDetection() {
  const publisher = new MockEventPublisher();
  const repo = new MockWorkflowRepository();
  const orch = new WorkflowOrchestrator(publisher, repo);

  const created = await orch.createWorkflow({
    complaintId: 'comp_e2e_03',
    title: 'Deep Hazardous Pothole on DB Road',
    description: 'Deep pothole causing vehicle damage near junction',
    category: 'Road Infrastructure',
    latitude: 11.0086,
    longitude: 76.9510,
  });

  const payload = await orch.executeWorkflow(created.instance.id);

  assertPayloadStructure(payload);
  if (!payload.duplicate.duplicateFound) {
    throw new Error('Expected duplicateFound to be true for matching candidate complaint.');
  }
  if (payload.duplicate.existingComplaintId !== 'CIV-9901') {
    throw new Error(`Expected existingComplaintId "CIV-9901", got "${payload.duplicate.existingComplaintId}".`);
  }

  return 'Scenario 3 Passed: Duplicate Complaint Detection & Merge Recommendation';
}

export async function testMissingLocationFallback() {
  const publisher = new MockEventPublisher();
  const repo = new MockWorkflowRepository();
  const orch = new WorkflowOrchestrator(publisher, repo);

  const created = await orch.createWorkflow({
    complaintId: 'comp_e2e_04',
    title: 'Uncollected Garbage Dump',
    description: 'Garbage pile left uncleaned',
    category: 'Solid Waste Management',
    latitude: 11.0084,
    longitude: 76.9508,
  });

  const payload = await orch.executeWorkflow(created.instance.id);

  assertPayloadStructure(payload);
  if (!payload.location.ward || !payload.location.zone) {
    throw new Error('Expected default ward and zone location fallbacks.');
  }

  return 'Scenario 4 Passed: Missing / Optional Location Fallback';
}

export async function testInvalidInputDataValidation() {
  const orch = new WorkflowOrchestrator();

  let titleErrorThrown = false;
  try {
    await orch.createWorkflow({ title: '', latitude: 11.0084, longitude: 76.9508 });
  } catch (err) {
    titleErrorThrown = true;
  }

  let coordErrorThrown = false;
  try {
    await orch.createWorkflow({ title: 'Valid Title', latitude: 'invalid_lat', longitude: 76.9508 });
  } catch (err) {
    coordErrorThrown = true;
  }

  if (!titleErrorThrown || !coordErrorThrown) {
    throw new Error('Invalid input validation failed to throw expected DTO errors.');
  }

  return 'Scenario 5 Passed: Invalid Input Data Validation';
}

export async function testRetryMechanismValidation() {
  const publisher = new MockEventPublisher();
  const repo = new MockWorkflowRepository();
  const orch = new WorkflowOrchestrator(publisher, repo);

  let attempts = 0;
  class FlakyAgent extends BaseAgent {
    constructor() { super('Flaky Department Agent', 5); }
    async runInternal() {
      attempts++;
      if (attempts === 1) {
        throw new Error('Transient network timeout');
      }
      return {
        status: 'success',
        confidence: 0.96,
        reasoning: 'Recovered after retry.',
        output: {
          responsibleDepartment: 'Public Works Department (PWD)',
          administrativeOffice: 'Central Office',
          suggestedAssignmentQueue: 'Standard Queue',
          confidenceScore: 0.96,
          recommendationReason: 'Recovered after 1 retry attempt.',
        },
      };
    }
  }

  orch.agents.department = new FlakyAgent();

  const created = await orch.createWorkflow({
    complaintId: 'comp_e2e_06',
    title: 'Flaky Network Retry Test',
    latitude: 11.0084,
    longitude: 76.9508,
  });

  const payload = await orch.executeWorkflow(created.instance.id);

  if (attempts !== 2) {
    throw new Error(`Expected agent to retry once (2 attempts), actual attempts: ${attempts}.`);
  }

  return 'Scenario 6 Passed: Retry Mechanism & Transient Recovery';
}

export async function testPersistentAgentFailureHandling() {
  const publisher = new MockEventPublisher();
  const repo = new MockWorkflowRepository();
  const orch = new WorkflowOrchestrator(publisher, repo);

  class FailingAgent extends BaseAgent {
    constructor() { super('Failing Test Agent', 99); }
    async runInternal() {
      throw new Error('Fatal persistent database crash');
    }
  }

  orch.agents.department = new FailingAgent();

  const created = await orch.createWorkflow({
    complaintId: 'comp_e2e_07',
    title: 'Persistent Failure Test',
    latitude: 11.0084,
    longitude: 76.9508,
  });

  let failureCaught = false;
  try {
    await orch.executeWorkflow(created.instance.id);
  } catch (err) {
    failureCaught = true;
  }

  const failedInstance = await repo.getWorkflowById(created.instance.id);
  if (!failureCaught || failedInstance.currentState !== OrchestratorConfig.WORKFLOW_STATUSES.FAILED) {
    throw new Error('Expected orchestrator to catch persistent failure and transition to FAILED state.');
  }

  return 'Scenario 7 Passed: Persistent Agent Failure & FAILED State Transition';
}

export default {
  testSuccessfulComplaintProcessing,
  testHighPriorityEmergencyComplaint,
  testDuplicateComplaintDetection,
  testMissingLocationFallback,
  testInvalidInputDataValidation,
  testRetryMechanismValidation,
  testPersistentAgentFailureHandling,
};
