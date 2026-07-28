import { WorkflowOrchestratorContract } from './WorkflowOrchestratorContract.js';
import { AgentContext } from '../models/AgentContext.js';
import { CreateWorkflowInputDTO } from './models/CreateWorkflowInputDTO.js';
import { OrchestratorConfig } from './config/orchestrator.config.js';
import { WorkflowOrchestrationError } from './errors/WorkflowOrchestrationError.js';
import { MockEventPublisher } from './services/MockEventPublisher.js';
import { MockWorkflowRepository } from './services/MockWorkflowRepository.js';
import { WorkflowStateManager } from './utils/WorkflowStateManager.js';
import { AgentExecutor } from './utils/AgentExecutor.js';
import { ResultAggregator } from './utils/ResultAggregator.js';

// Import All 6 Core Agents
import { ComplaintUnderstandingAgent } from '../agents/ComplaintUnderstandingAgent.js';
import { LocationIntelligenceAgent } from '../agents/LocationIntelligenceAgent.js';
import { DuplicateDetectionAgent } from '../agents/DuplicateDetectionAgent.js';
import { CommunityValidationAgent } from '../agents/CommunityValidationAgent.js';
import { PriorityAssessmentAgent } from '../agents/PriorityScoringAgent.js';
import { DepartmentRecommendationAgent } from '../agents/DepartmentRoutingAgent.js';

export class WorkflowOrchestrator extends WorkflowOrchestratorContract {
  constructor(
    eventPublisher = new MockEventPublisher(),
    workflowRepository = new MockWorkflowRepository()
  ) {
    super();
    this.eventPublisher = eventPublisher;
    this.stateManager = new WorkflowStateManager(workflowRepository);

    this.agents = {
      understanding: new ComplaintUnderstandingAgent(),
      location: new LocationIntelligenceAgent(),
      duplicate: new DuplicateDetectionAgent(),
      community: new CommunityValidationAgent(),
      priority: new PriorityAssessmentAgent(),
      department: new DepartmentRecommendationAgent(),
    };
  }

  /**
   * Step 1: Create Workflow instance
   */
  async createWorkflow(rawInput) {
    const inputDTO = new CreateWorkflowInputDTO(rawInput);
    const instance = await this.stateManager.createWorkflow(inputDTO.complaintId, rawInput);
    
    await this.eventPublisher.publishEvent(OrchestratorConfig.EVENT_TYPES.WORKFLOW_STARTED, {
      workflowId: instance.id,
      complaintId: instance.complaintId,
      title: inputDTO.title,
    });

    return { instance, inputDTO };
  }

  /**
   * Complete 10-Step AI Workflow Pipeline
   */
  async executeWorkflow(inputOrWorkflowId, onStepCallback = null) {
    let instance;
    let inputDTO;

    if (typeof inputOrWorkflowId === 'string') {
      instance = await this.stateManager.getWorkflow(inputOrWorkflowId);
      if (!instance) {
        throw new WorkflowOrchestrationError(`Workflow with ID ${inputOrWorkflowId} not found.`);
      }
      inputDTO = new CreateWorkflowInputDTO(instance.rawInput || { complaintId: instance.complaintId, title: 'Civic Issue', latitude: 11.0084, longitude: 76.9508 });
    } else {
      const created = await this.createWorkflow(inputOrWorkflowId);
      instance = created.instance;
      inputDTO = created.inputDTO;
    }

    const context = new AgentContext({
      complaintId: inputDTO.complaintId,
      ticketId: inputDTO.complaintId,
      title: inputDTO.title,
      description: inputDTO.description,
      category: inputDTO.category,
      coordinates: [inputDTO.longitude, inputDTO.latitude],
      address: inputDTO.address,
      mediaFiles: inputDTO.images,
      anonymous: inputDTO.anonymous,
    });

    try {
      // Step 2 & 3: Execute Complaint Understanding & Location Intelligence in Parallel and Wait
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.TRIAGE_PARALLEL,
        'Executing Complaint Understanding & Location Intelligence Agents concurrently'
      );

      const [understandingResult, locationResult] = await Promise.all([
        AgentExecutor.executeAgentStep(this.agents.understanding, context, context.complaintId, onStepCallback),
        AgentExecutor.executeAgentStep(this.agents.location, context, context.complaintId, onStepCallback),
      ]);

      context.updateStepResult('understanding', understandingResult);
      context.updateStepResult('location', locationResult);

      await this.eventPublisher.publishEvent(OrchestratorConfig.EVENT_TYPES.AGENT_STEP_COMPLETED, {
        workflowId: instance.id,
        steps: ['Complaint Understanding', 'Location Intelligence'],
      });

      // Step 4: Execute Duplicate Detection Agent
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.DUPLICATE_CHECK,
        'Executing Duplicate Detection Agent'
      );
      const duplicateResult = await AgentExecutor.executeAgentStep(this.agents.duplicate, context, context.complaintId, onStepCallback);
      context.updateStepResult('duplicate', duplicateResult);

      // Step 5: Execute Community Validation Agent
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.COMMUNITY_VALIDATION,
        'Executing Community Validation Agent'
      );
      const communityResult = await AgentExecutor.executeAgentStep(this.agents.community, context, context.complaintId, onStepCallback);
      context.updateStepResult('community', communityResult);

      // Step 6: Execute Priority Assessment Agent
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.PRIORITY_ASSESSMENT,
        'Executing Priority Assessment Agent'
      );
      const priorityResult = await AgentExecutor.executeAgentStep(this.agents.priority, context, context.complaintId, onStepCallback);
      context.updateStepResult('priority', priorityResult);

      // Step 7: Execute Department Recommendation Agent
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.DEPARTMENT_RECOMMENDATION,
        'Executing Department Recommendation Agent'
      );
      const departmentResult = await AgentExecutor.executeAgentStep(this.agents.department, context, context.complaintId, onStepCallback);
      context.updateStepResult('routing', departmentResult);
      context.updateStepResult('department', departmentResult);

      // Step 8: Merge all agent outputs into final AI-enriched complaint
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.OUTPUT_MERGED,
        'Merging outputs into AI-enriched complaint payload'
      );
      const updatedInstance = await this.stateManager.getWorkflow(instance.id);
      const enrichedDTO = ResultAggregator.aggregate(context, updatedInstance.history, 'GOVERNMENT_HANDOVER_READY');

      // Step 9: Publish Workflow Completed Event
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.EVENT_PUBLISHED,
        'Publishing WorkflowCompleted event'
      );
      await this.eventPublisher.publishEvent(OrchestratorConfig.EVENT_TYPES.WORKFLOW_COMPLETED, {
        workflowId: instance.id,
        complaintId: context.complaintId,
        priorityLevel: enrichedDTO.priorityLevel,
        responsibleDepartment: enrichedDTO.responsibleDepartment,
      });

      // Step 10: Hand over enriched complaint to Government Platform
      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.GOVERNMENT_HANDOVER,
        'Handing over enriched complaint payload to Government Platform'
      );
      await this.eventPublisher.publishEvent(OrchestratorConfig.EVENT_TYPES.GOVERNMENT_HANDOVER_SUCCESS, {
        complaintId: context.complaintId,
        department: enrichedDTO.responsibleDepartment,
        queue: enrichedDTO.suggestedAssignmentQueue,
        handoverTimestamp: new Date().toISOString(),
      });

      await this.stateManager.transitionState(
        instance.id,
        OrchestratorConfig.WORKFLOW_STATUSES.COMPLETED,
        'Workflow lifecycle successfully completed'
      );

      return enrichedDTO.toJSON();
    } catch (err) {
      await this.stateManager.transitionState(instance.id, OrchestratorConfig.WORKFLOW_STATUSES.FAILED, `Halted: ${err.message}`);
      throw new WorkflowOrchestrationError(`AI Workflow execution failed: ${err.message}`, instance.currentState, null, err);
    }
  }
}

export default WorkflowOrchestrator;
