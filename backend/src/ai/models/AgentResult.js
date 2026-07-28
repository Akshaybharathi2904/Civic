export class AgentResult {
  constructor({
    agentName,
    stepNumber,
    status = 'success',
    confidence = 0.95,
    reasoning = '',
    output = {},
    executionTimeMs = 0,
    tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    error = null,
  }) {
    this.agentName = agentName;
    this.stepNumber = stepNumber;
    this.status = status;
    this.confidence = confidence;
    this.reasoning = reasoning;
    this.output = output;
    this.executionTimeMs = executionTimeMs;
    this.tokenUsage = tokenUsage;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  toLogPayload(complaintId = null) {
    return {
      complaintId,
      stepNumber: this.stepNumber,
      agentName: this.agentName,
      confidence: this.confidence,
      reasoning: this.reasoning,
      status: this.status,
      executionTime: this.executionTimeMs,
      input: null,
      output: typeof this.output === 'object' ? JSON.stringify({ ...this.output, tokenUsage: this.tokenUsage }) : this.output,
      error: this.error ? this.error.message || String(this.error) : null,
    };
  }
}

export default AgentResult;
