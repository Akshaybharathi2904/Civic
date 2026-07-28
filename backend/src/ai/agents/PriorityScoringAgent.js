import { BaseAgent } from './BaseAgent.js';

export class PriorityScoringAgent extends BaseAgent {
  constructor() {
    super('Priority Scoring Agent', 6);
  }

  async runInternal(context) {
    const severity = context.understanding?.output?.severity || 'Medium';

    let priorityScore = 65;
    let priorityLevel = 'Medium';
    let slaHours = 48;

    if (severity === 'Critical') {
      priorityScore = 92;
      priorityLevel = 'Critical';
      slaHours = 6;
    } else if (severity === 'High') {
      priorityScore = 78;
      priorityLevel = 'High';
      slaHours = 24;
    }

    return {
      status: 'success',
      confidence: 0.97,
      reasoning: `Calculated priority score ${priorityScore}/100 [Level: ${priorityLevel}] with ${slaHours}h resolution SLA.`,
      output: {
        priorityScore,
        priorityLevel,
        slaHours,
        tokenUsage: { promptTokens: 95, completionTokens: 40, totalTokens: 135 },
      },
    };
  }
}

export default PriorityScoringAgent;
