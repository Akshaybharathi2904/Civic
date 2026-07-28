import { AgentResult } from '../models/AgentResult.js';
import { AgentExecutionError } from '../errors/AgentExecutionError.js';
import { AgentAuditLogger } from '../logging/AgentAuditLogger.js';

export class BaseAgent {
  constructor(name, stepNumber) {
    if (new.target === BaseAgent) {
      throw new TypeError('Cannot instantiate abstract BaseAgent class directly.');
    }
    this.name = name;
    this.stepNumber = stepNumber;
  }

  /**
   * Validate input context before execution
   */
  validateInput(context) {
    if (!context) {
      throw new AgentExecutionError(this.name, 'AgentContext is required for execution.');
    }
    return true;
  }

  /**
   * Abstract method implemented by concrete agent subclasses
   */
  async runInternal(context) {
    throw new Error(`Subclass ${this.constructor.name} must implement runInternal(context)`);
  }

  /**
   * Execute agent with timing, validation, error handling, and audit logging
   */
  async execute(context) {
    const startTime = Date.now();

    try {
      this.validateInput(context);
      const rawOutput = await this.runInternal(context);
      const executionTimeMs = Date.now() - startTime;

      const agentResult = new AgentResult({
        agentName: this.name,
        stepNumber: this.stepNumber,
        status: rawOutput.status || 'success',
        confidence: rawOutput.confidence ?? 0.95,
        reasoning: rawOutput.reasoning || `${this.name} completed successfully.`,
        output: rawOutput.output || rawOutput,
        executionTimeMs,
        tokenUsage: rawOutput.tokenUsage || { promptTokens: 100, completionTokens: 40, totalTokens: 140 },
      });

      // Audit log step
      const logPayload = agentResult.toLogPayload(context.complaintId);
      await AgentAuditLogger.logAgentStep(logPayload);

      return agentResult;
    } catch (err) {
      const executionTimeMs = Date.now() - startTime;
      const agentError = err instanceof AgentExecutionError
        ? err
        : new AgentExecutionError(this.name, err.message, err);

      const failedResult = new AgentResult({
        agentName: this.name,
        stepNumber: this.stepNumber,
        status: 'failed',
        confidence: 0,
        reasoning: `Execution failed: ${err.message}`,
        executionTimeMs,
        error: agentError,
      });

      await AgentAuditLogger.logAgentStep(failedResult.toLogPayload(context.complaintId));
      throw agentError;
    }
  }
}

export default BaseAgent;
