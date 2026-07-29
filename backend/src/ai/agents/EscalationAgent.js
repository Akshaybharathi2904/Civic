import { BaseAgent } from './BaseAgent.js';

export class EscalationAgent extends BaseAgent {
  constructor() {
    super('Escalation Agent', 9, 'escalation');
  }

  async runInternal(context) {
    const isCritical = context.aiResults.priority?.priorityLevel === 'Critical';
    return {
      isEscalated: isCritical,
      escalationReason: isCritical ? 'Emergency critical hazard flagged for immediate supervisor intervention.' : 'Standard priority triage, no immediate escalation required.',
      confidence: 0.96
    };
  }
}

export default EscalationAgent;
