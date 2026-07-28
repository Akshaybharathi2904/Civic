import { BaseAgent } from './BaseAgent.js';

export class EscalationAgent extends BaseAgent {
  constructor() {
    super('Escalation Agent', 8);
  }

  async runInternal(context) {
    const isCritical = context.priority?.output?.priorityLevel === 'Critical';

    return {
      status: 'success',
      confidence: 0.96,
      reasoning: isCritical
        ? 'Critical hazard detected. Triggered emergency department head alert.'
        : 'Standard SLA monitoring active. No escalation required.',
      output: {
        isEscalated: isCritical,
        escalationLevel: isCritical ? 'Tier 1 Executive Alert' : 'Standard Queue',
        tokenUsage: { promptTokens: 85, completionTokens: 30, totalTokens: 115 },
      },
    };
  }
}

export default EscalationAgent;
