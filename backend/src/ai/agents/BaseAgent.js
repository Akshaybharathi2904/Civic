import { AgentResult } from '../models/AgentResult.js';
import { AgentExecutionError } from '../errors/AgentExecutionError.js';
import { AgentAuditLogger } from '../logging/AgentAuditLogger.js';

export class BaseAgent {
  constructor(name, stepNumber, resultKey) {
    if (new.target === BaseAgent) {
      throw new TypeError('Cannot instantiate abstract BaseAgent class directly.');
    }
    this.name = name;
    this.stepNumber = stepNumber;
    this.resultKey = resultKey; // Key in context.aiResults e.g. 'understanding', 'vision'
    this.orchestrator = null; // Set when registered with orchestrator
  }

  /**
   * Helper delay for realistic simulation
   */
  async delay(ms = 400) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Abstract method implemented by concrete agent subclasses
   */
  async runInternal(context) {
    throw new Error(`Subclass ${this.constructor.name} must implement runInternal(context)`);
  }

  /**
   * Standardized execute(context) function as per specifications:
   * - Sets status RUNNING
   * - Emits AGENT_STARTED & AGENT_PROGRESS
   * - Delegates to service layer via runInternal
   * - Updates context.aiResults[this.resultKey]
   * - Emits AGENT_COMPLETED
   * - Returns updated context
   */
  async execute(context) {
    const startTime = Date.now();

    if (!context) {
      throw new AgentExecutionError(this.name, 'WorkflowContext is required for execution.');
    }

    try {
      // 1. Emit AGENT_STARTED event
      if (this.orchestrator) {
        this.orchestrator.emitEvent('AGENT_STARTED', {
          agentName: this.name,
          stepNumber: this.stepNumber,
          complaintId: context.complaintId,
          status: 'RUNNING',
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Realistic processing delay simulation (e.g. 500-800ms)
      await this.delay(300 + Math.floor(Math.random() * 400));

      // 3. Emit AGENT_PROGRESS event
      if (this.orchestrator) {
        this.orchestrator.emitEvent('AGENT_PROGRESS', {
          agentName: this.name,
          stepNumber: this.stepNumber,
          complaintId: context.complaintId,
          status: 'RUNNING',
          progress: 50,
          timestamp: new Date().toISOString(),
        });
      }

      // 4. Delegate to subclass implementation
      const structuredOutput = await this.runInternal(context);
      const executionDurationMs = Date.now() - startTime;

      // 5. Save structured output into context
      if (this.resultKey) {
        context.setAgentResult(this.resultKey, structuredOutput);
      }

      // 6. Record step in context history
      context.logStep(this.name, 'COMPLETED', executionDurationMs, structuredOutput);

      // 7. Audit log payload
      await AgentAuditLogger.logAgentStep({
        complaintId: context.complaintId,
        agentName: this.name,
        stepNumber: this.stepNumber,
        status: 'success',
        confidence: structuredOutput?.confidence || 0.95,
        executionTime: executionDurationMs,
        output: JSON.stringify(structuredOutput),
      });

      // 8. Emit AGENT_COMPLETED event
      if (this.orchestrator) {
        this.orchestrator.emitEvent('AGENT_COMPLETED', {
          agentName: this.name,
          stepNumber: this.stepNumber,
          complaintId: context.complaintId,
          status: 'COMPLETED',
          executionDurationMs,
          confidence: structuredOutput?.confidence || 0.95,
          output: structuredOutput,
          timestamp: new Date().toISOString(),
        });
      }

      return context;
    } catch (err) {
      const executionDurationMs = Date.now() - startTime;

      context.logStep(this.name, 'FAILED', executionDurationMs, { error: err.message });

      if (this.orchestrator) {
        this.orchestrator.emitEvent('AGENT_FAILED', {
          agentName: this.name,
          stepNumber: this.stepNumber,
          complaintId: context.complaintId,
          status: 'FAILED',
          executionDurationMs,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      }

      throw new AgentExecutionError(this.name, err.message, err);
    }
  }
}

export default BaseAgent;
