import { AgentContext } from '../models/AgentContext.js';
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
   * Run complete 10-Agent Pipeline sequentially with DAG state propagation
   */
  async runPipeline(initialComplaintData, onStepCallback = null) {
    const context = new AgentContext(initialComplaintData);

    const pipelineSteps = [
      { key: 'understanding', agent: this.agents.understanding },
      { key: 'vision', agent: this.agents.vision },
      { key: 'location', agent: this.agents.location },
      { key: 'duplicate', agent: this.agents.duplicate },
      { key: 'routing', agent: this.agents.routing },
      { key: 'priority', agent: this.agents.priority },
      { key: 'analytics', agent: this.agents.analytics },
      { key: 'escalation', agent: this.agents.escalation },
      { key: 'tracking', agent: this.agents.tracking },
      { key: 'notification', agent: this.agents.notification },
    ];

    for (const step of pipelineSteps) {
      try {
        const stepResult = await step.agent.execute(context);
        context.updateStepResult(step.key, stepResult);

        // Emit real-time WebSocket stream event
        if (context.complaintId) {
          try {
            emitAgentProgress(context.complaintId, stepResult);
          } catch (e) {
            console.warn('[Orchestrator WebSocket Notice]:', e.message);
          }
        }

        if (typeof onStepCallback === 'function') {
          onStepCallback(stepResult);
        }
      } catch (err) {
        console.error(`[AgentOrchestrator] Step ${step.key} failed:`, err.message);
        throw new OrchestratorError(`Pipeline execution halted at step "${step.key}"`, step.key, step.agent.name, err);
      }
    }

    return context;
  }
}

export default AgentOrchestrator;
