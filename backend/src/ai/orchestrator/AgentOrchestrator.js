import { AgentContext } from '../models/AgentContext.js';
import { WorkflowEngine } from '../workflow/WorkflowEngine.js';
import { WorkflowStateEnum } from '../models/WorkflowState.js';
import { OrchestratorError } from '../errors/OrchestratorError.js';
import { ComplaintUnderstandingAgent } from '../agents/ComplaintUnderstandingAgent.js';
import { VisionAnalysisAgent } from '../agents/VisionAnalysisAgent.js';
import { LocationIntelligenceAgent } from '../agents/LocationIntelligenceAgent.js';
import { DuplicateDetectionAgent } from '../agents/DuplicateDetectionAgent.js';
import { DepartmentRoutingAgent } from '../agents/DepartmentRoutingAgent.js';
import { PriorityScoringAgent } from '../agents/PriorityScoringAgent.js';
import { GovernmentAnalyticsAgent } from '../agents/GovernmentAnalyticsAgent.js';
import { EscalationAgent } from '../agents/EscalationAgent.js';
import { WorkflowTrackingAgent } from '../agents/WorkflowTrackingAgent.js';
import { CitizenNotificationAgent } from '../agents/CitizenNotificationAgent.js';
import { emitAgentProgress } from '../../services/socket.service.js';

export class AgentOrchestrator {
  constructor() {
    this.workflowEngine = new WorkflowEngine();

    this.agents = {
      understanding: new ComplaintUnderstandingAgent(),
      vision: new VisionAnalysisAgent(),
      location: new LocationIntelligenceAgent(),
      duplicate: new DuplicateDetectionAgent(),
      routing: new DepartmentRoutingAgent(),
      priority: new PriorityScoringAgent(),
      analytics: new GovernmentAnalyticsAgent(),
      escalation: new EscalationAgent(),
      tracking: new WorkflowTrackingAgent(),
      notification: new CitizenNotificationAgent(),
    };
  }

  /**
   * Create & register a new workflow instance for a submitted complaint
   */
  async createWorkflow(complaintData = {}) {
    const context = new AgentContext(complaintData);
    const workflow = this.workflowEngine.createWorkflow(context.complaintId || context.ticketId);
    context.workflowId = workflow.id;
    return { workflow, context };
  }

  /**
   * Execute an agent step with automatic retry mechanism
   */
  async executeWithRetry(agent, context, maxRetries = 2) {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        return await agent.execute(context);
      } catch (err) {
        attempts++;
        if (attempts > maxRetries) {
          throw err;
        }
        console.warn(`[AgentOrchestrator] Retry attempt ${attempts}/${maxRetries} for ${agent.name}:`, err.message);
        await new Promise((resolve) => setTimeout(resolve, 200 * attempts));
      }
    }
  }

  /**
   * Execute full Multi-Agent Workflow DAG with Parallel Concurrency
   */
  async executeWorkflow(workflowOrContext, onStepCallback = null) {
    let context;
    let workflow;

    if (workflowOrContext instanceof AgentContext) {
      context = workflowOrContext;
      workflow = this.workflowEngine.getWorkflow(context.workflowId) || this.workflowEngine.createWorkflow(context.complaintId);
    } else if (typeof workflowOrContext === 'string') {
      workflow = this.workflowEngine.getWorkflow(workflowOrContext);
      if (!workflow) {
        throw new OrchestratorError(`Workflow with ID ${workflowOrContext} not found.`);
      }
      context = new AgentContext({ complaintId: workflow.complaintId, ticketId: workflow.complaintId });
    } else {
      const created = await this.createWorkflow(workflowOrContext);
      context = created.context;
      workflow = created.workflow;
    }

    try {
      // Stage 1: Complaint Understanding
      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.UNDERSTANDING, 'Executing Complaint Understanding Agent');
      const understandingResult = await this.executeWithRetry(this.agents.understanding, context);
      context.updateStepResult('understanding', understandingResult);
      this._emitStep(context.complaintId, understandingResult, onStepCallback);

      // Stage 2: Parallel Execution (Vision Analysis & Location Intelligence concurrently)
      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.VISION_ANALYSIS, 'Executing Vision & Location Agents concurrently');
      const [visionResult, locationResult] = await Promise.all([
        this.executeWithRetry(this.agents.vision, context),
        this.executeWithRetry(this.agents.location, context),
      ]);
      context.updateStepResult('vision', visionResult);
      this._emitStep(context.complaintId, visionResult, onStepCallback);

      context.updateStepResult('location', locationResult);
      this._emitStep(context.complaintId, locationResult, onStepCallback);

      // Stage 3: Duplicate Detection (Dependent on Location & Understanding)
      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.DUPLICATE_DETECTION, 'Executing Duplicate Detection Agent');
      const duplicateResult = await this.executeWithRetry(this.agents.duplicate, context);
      context.updateStepResult('duplicate', duplicateResult);
      this._emitStep(context.complaintId, duplicateResult, onStepCallback);

      // Stage 4: Department Routing & Priority Scoring
      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.DEPARTMENT_ROUTING, 'Executing Routing & Priority Agents');
      const routingResult = await this.executeWithRetry(this.agents.routing, context);
      context.updateStepResult('routing', routingResult);
      this._emitStep(context.complaintId, routingResult, onStepCallback);

      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.PRIORITY_SCORING, 'Executing Priority Scoring Agent');
      const priorityResult = await this.executeWithRetry(this.agents.priority, context);
      context.updateStepResult('priority', priorityResult);
      this._emitStep(context.complaintId, priorityResult, onStepCallback);

      // Stage 5: Analytics, Escalation, Tracking & Notification
      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.ANALYTICS_COMPUTATION, 'Finalizing Analytics & Notifications');
      const analyticsResult = await this.executeWithRetry(this.agents.analytics, context);
      context.updateStepResult('analytics', analyticsResult);
      this._emitStep(context.complaintId, analyticsResult, onStepCallback);

      const escalationResult = await this.executeWithRetry(this.agents.escalation, context);
      context.updateStepResult('escalation', escalationResult);
      this._emitStep(context.complaintId, escalationResult, onStepCallback);

      const trackingResult = await this.executeWithRetry(this.agents.tracking, context);
      context.updateStepResult('tracking', trackingResult);
      this._emitStep(context.complaintId, trackingResult, onStepCallback);

      const notificationResult = await this.executeWithRetry(this.agents.notification, context);
      context.updateStepResult('notification', notificationResult);
      this._emitStep(context.complaintId, notificationResult, onStepCallback);

      // Mark Workflow Completed
      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.COMPLETED, 'Workflow finished successfully');

      // Return merged enriched complaint
      return this.mergeEnrichedComplaint(context);
    } catch (err) {
      this.workflowEngine.transitionState(workflow.id, WorkflowStateEnum.FAILED, `Failed: ${err.message}`);
      console.error(`[AgentOrchestrator] Workflow ${workflow.id} failed:`, err.message);
      throw new OrchestratorError(`Workflow ${workflow.id} execution failed: ${err.message}`, workflow.currentState, null, err);
    }
  }

  /**
   * Merge outputs from all 10 agents into a single enriched complaint payload object
   */
  mergeEnrichedComplaint(context) {
    const understanding = context.understanding?.output || {};
    const vision = context.vision?.output || {};
    const location = context.location?.output || {};
    const duplicate = context.duplicate?.output || {};
    const routing = context.routing?.output || {};
    const priority = context.priority?.output || {};
    const escalation = context.escalation?.output || {};

    return {
      complaintId: context.complaintId,
      ticketId: context.ticketId,
      title: context.title,
      description: context.description,
      category: understanding.issueType || context.category || 'General Civic Issue',
      severity: understanding.severity || priority.priorityLevel || 'Medium',
      address: location.formattedAddress || context.address,
      ward: location.ward || 'Ward 72 - RS Puram',
      zone: location.zone || 'Central Zone',
      district: location.district || 'Coimbatore',
      city: location.city || 'Coimbatore',
      state: location.state || 'Tamil Nadu',
      coordinates: location.coordinates || context.coordinates || [76.9558, 11.0168],
      isDuplicate: duplicate.isDuplicate || false,
      duplicateDistanceMeters: duplicate.duplicateDistanceMeters || 0,
      affectedCount: duplicate.affectedCount || 1,
      assignedDepartment: {
        name: routing.departmentName || 'Public Works Department (PWD)',
        code: routing.departmentCode || 'PWD',
        officer: routing.assignedOfficer || 'Field Operations Inspector',
      },
      priorityScore: priority.priorityScore || 65,
      priorityLevel: priority.priorityLevel || 'Medium',
      slaHours: priority.slaHours || 48,
      isEscalated: escalation.isEscalated || false,
      escalationLevel: escalation.escalationLevel || 'Standard Queue',
      executionLogs: context.executionLogs,
      totalTokenUsage: context.totalTokenUsage,
      workflowHistory: this.workflowEngine.getHistory(context.workflowId || context.complaintId),
    };
  }

  _emitStep(complaintId, stepResult, onStepCallback) {
    if (complaintId) {
      try {
        emitAgentProgress(complaintId, stepResult);
      } catch (e) {
        console.warn('[Orchestrator Stream Notice]:', e.message);
      }
    }
    if (typeof onStepCallback === 'function') {
      onStepCallback(stepResult);
    }
  }
}

export default AgentOrchestrator;
