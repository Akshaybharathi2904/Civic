import { EventEmitter } from 'events';
import { WorkflowContext } from '../models/WorkflowContext.js';
import { ComplaintUnderstandingAgent } from '../agents/ComplaintUnderstandingAgent.js';
import { VisionAnalysisAgent } from '../agents/VisionAnalysisAgent.js';
import { LocationIntelligenceAgent } from '../agents/LocationIntelligenceAgent.js';
import { DuplicateDetectionAgent } from '../agents/DuplicateDetectionAgent.js';
import { CommunityValidationAgent } from '../agents/CommunityValidationAgent.js';
import { PriorityAssessmentAgent } from '../agents/PriorityAssessmentAgent.js';
import { DepartmentRecommendationAgent } from '../agents/DepartmentRecommendationAgent.js';
import { WorkflowTrackingAgent } from '../agents/WorkflowTrackingAgent.js';
import { EscalationAgent } from '../agents/EscalationAgent.js';
import { CitizenNotificationAgent } from '../agents/CitizenNotificationAgent.js';
import { GovernmentAnalyticsAgent } from '../agents/GovernmentAnalyticsAgent.js';

let socketIoService = null;
try {
  socketIoService = await import('../../services/socket.service.js');
} catch (e) {
  console.warn('[AgentOrchestrator] Socket service optional import notice:', e.message);
}

export class AgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.pipeline = [];
    this.registerDefaultAgents();
  }

  /**
   * Register default 11 autonomous agents in sequential workflow order
   */
  registerDefaultAgents() {
    this.registerAgent(new ComplaintUnderstandingAgent());
    this.registerAgent(new VisionAnalysisAgent());
    this.registerAgent(new LocationIntelligenceAgent());
    this.registerAgent(new DuplicateDetectionAgent());
    this.registerAgent(new CommunityValidationAgent());
    this.registerAgent(new PriorityAssessmentAgent());
    this.registerAgent(new DepartmentRecommendationAgent());
    this.registerAgent(new WorkflowTrackingAgent());
    this.registerAgent(new EscalationAgent());
    this.registerAgent(new CitizenNotificationAgent());
    this.registerAgent(new GovernmentAnalyticsAgent());
  }

  /**
   * Register a new agent into the execution pipeline (Extensibility requirement #11)
   */
  registerAgent(agent) {
    agent.orchestrator = this;
    this.pipeline.push(agent);
  }

  /**
   * Emit event locally over EventEmitter and broadcast over Socket.io
   */
  emitEvent(eventName, payload) {
    this.emit(eventName, payload);

    // Broadcast over Socket.io to frontend subscribers
    try {
      if (socketIoService && socketIoService.emitAgentProgress) {
        socketIoService.emitAgentProgress(payload.complaintId, {
          agentName: payload.agentName,
          stepNumber: payload.stepNumber,
          status: payload.status,
          agentOutput: payload.output || payload,
          confidence: payload.confidence || 0.95,
          executionTimeMs: payload.executionDurationMs || 300,
          ticketId: payload.ticketId,
          timestamp: payload.timestamp,
        });
      }
    } catch (err) {
      console.warn('[AgentOrchestrator Socket Emit Warning]:', err.message);
    }
  }

  /**
   * Execute an individual agent with automatic retry mechanism
   */
  async executeAgentWithRetry(agent, context, maxRetries = 2) {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        return await agent.execute(context);
      } catch (err) {
        attempts++;
        if (attempts > maxRetries) {
          console.error(`[AgentOrchestrator] Agent ${agent.name} failed after ${maxRetries} retries:`, err.message);
          throw err;
        }
        console.warn(`[AgentOrchestrator] Retry ${attempts}/${maxRetries} for ${agent.name}: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 300 * attempts));
      }
    }
  }

  /**
   * Execute autonomous multi-agent pipeline sequentially
   */
  async executeWorkflow(inputComplaint, maxRetries = 2) {
    const context = inputComplaint instanceof WorkflowContext
      ? inputComplaint
      : new WorkflowContext(inputComplaint);

    context.workflowStatus = 'RUNNING';

    this.emitEvent('WORKFLOW_STARTED', {
      complaintId: context.complaintId,
      ticketId: context.ticketId,
      totalAgents: this.pipeline.length,
      timestamp: new Date().toISOString(),
    });

    try {
      for (const agent of this.pipeline) {
        await this.executeAgentWithRetry(agent, context, maxRetries);
      }

      context.markCompleted();

      const finalReport = context.toFinalAIReport();

      this.emitEvent('WORKFLOW_COMPLETED', {
        complaintId: context.complaintId,
        ticketId: context.ticketId,
        status: 'COMPLETED',
        finalReport,
        totalExecutionTimeMs: context.metadata.totalExecutionTimeMs,
        timestamp: new Date().toISOString(),
      });

      return context;
    } catch (error) {
      context.markFailed(error);

      this.emitEvent('WORKFLOW_FAILED', {
        complaintId: context.complaintId,
        ticketId: context.ticketId,
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }
}

export default AgentOrchestrator;
