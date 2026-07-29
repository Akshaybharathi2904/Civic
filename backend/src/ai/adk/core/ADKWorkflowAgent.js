import { WorkflowContext } from '../models/WorkflowContext.js';
import { sessionStore } from './ADKSessionStore.js';
import { NotificationTool } from '../tools/NotificationTool.js';
import { ComplaintUnderstandingAgent } from '../agents/ComplaintUnderstandingAgent.js';
import { VisionAnalysisAgent } from '../agents/VisionAnalysisAgent.js';
import { LocationIntelligenceAgent } from '../agents/LocationIntelligenceAgent.js';
import { DuplicateDetectionAgent } from '../agents/DuplicateDetectionAgent.js';
import { CommunityValidationAgent } from '../agents/CommunityValidationAgent.js';
import { PriorityAssessmentAgent } from '../agents/PriorityAssessmentAgent.js';
import { DepartmentRecommendationAgent } from '../agents/DepartmentRecommendationAgent.js';

export class ADKWorkflowAgent {
  constructor() {
    this.pipeline = [
      new ComplaintUnderstandingAgent(),
      new VisionAnalysisAgent(),
      new LocationIntelligenceAgent(),
      new DuplicateDetectionAgent(),
      new CommunityValidationAgent(),
      new PriorityAssessmentAgent(),
      new DepartmentRecommendationAgent(),
    ];
  }

  /**
   * Execute an ADK Agent with automatic retry handling
   */
  async executeAgentWithRetry(agent, context, maxRetries = 2) {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        await NotificationTool.publishWorkflowEvent('AGENT_STARTED', {
          complaintId: context.complaintId,
          ticketId: context.ticketId,
          stepNumber: agent.stepNumber,
          agentName: agent.name,
          status: 'RUNNING',
          timestamp: new Date().toISOString(),
        });

        await agent.execute(context);

        const lastLog = context.executionHistory[context.executionHistory.length - 1];

        await NotificationTool.publishWorkflowEvent('AGENT_COMPLETED', {
          complaintId: context.complaintId,
          ticketId: context.ticketId,
          stepNumber: agent.stepNumber,
          agentName: agent.name,
          status: 'COMPLETED',
          confidence: lastLog?.confidence || 0.95,
          durationMs: lastLog?.durationMs || 300,
          output: context[agent.contextKey],
          timestamp: new Date().toISOString(),
        });

        sessionStore.saveSession(context);
        return context;
      } catch (err) {
        attempts++;
        if (attempts > maxRetries) {
          await NotificationTool.publishWorkflowEvent('AGENT_FAILED', {
            complaintId: context.complaintId,
            ticketId: context.ticketId,
            stepNumber: agent.stepNumber,
            agentName: agent.name,
            status: 'FAILED',
            error: err.message,
            timestamp: new Date().toISOString(),
          });
          throw err;
        }

        context.logExecutionEvent(agent.name, 'RETRYING', 0, { attempt: attempts, error: err.message });
        await new Promise((resolve) => setTimeout(resolve, 300 * attempts));
      }
    }
  }

  /**
   * Execute full ADK Workflow pipeline sequentially
   */
  async executeWorkflow(inputData, options = {}) {
    const context = inputData instanceof WorkflowContext
      ? inputData
      : new WorkflowContext(inputData);

    context.markStarted();
    sessionStore.saveSession(context);

    await NotificationTool.publishWorkflowEvent('WORKFLOW_STARTED', {
      complaintId: context.complaintId,
      ticketId: context.ticketId,
      totalAgents: this.pipeline.length,
      timestamp: new Date().toISOString(),
    });

    const startIndex = options.startFromIndex || 0;

    try {
      for (let i = startIndex; i < this.pipeline.length; i++) {
        const agent = this.pipeline[i];
        await this.executeAgentWithRetry(agent, context, options.maxRetries || 2);
      }

      context.markCompleted();
      sessionStore.saveSession(context);

      await NotificationTool.publishWorkflowEvent('WORKFLOW_COMPLETED', {
        complaintId: context.complaintId,
        ticketId: context.ticketId,
        status: 'COMPLETED',
        context,
        timestamp: new Date().toISOString(),
      });

      return context;
    } catch (err) {
      context.markFailed(context.failedStage || 'ADK Workflow', err);
      sessionStore.saveSession(context);
      throw err;
    }
  }

  /**
   * Resume workflow execution from a failed stage
   */
  async resumeWorkflow(complaintId, maxRetries = 2) {
    const existingContext = sessionStore.getSession(complaintId);
    if (!existingContext) {
      throw new Error(`Session with ID ${complaintId} not found in ADKSessionStore.`);
    }

    const failedAgentName = existingContext.failedStage;
    let resumeIndex = 0;

    if (failedAgentName) {
      const idx = this.pipeline.findIndex((a) => a.name === failedAgentName);
      if (idx !== -1) resumeIndex = idx;
    }

    return await this.executeWorkflow(existingContext, { startFromIndex: resumeIndex, maxRetries });
  }
}

export const adkWorkflowAgent = new ADKWorkflowAgent();
export default adkWorkflowAgent;
