export class PriorityTool {
  static async execute({ severity, damageAssessment, positiveVotes }) {
    let score = 50;

    if (severity === 'Critical') score += 35;
    else if (severity === 'High') score += 25;
    else if (severity === 'Medium') score += 10;

    if (damageAssessment && (damageAssessment.includes('Severe') || damageAssessment.includes('Hazard'))) {
      score += 15;
    }

    if ((positiveVotes || 0) > 3) {
      score += 10;
    }

    const priorityScore = Math.min(100, Math.max(10, score));

    let priorityLevel = 'Low';
    let slaHours = 48;

    if (priorityScore >= 80) {
      priorityLevel = 'Critical';
      slaHours = 12;
    } else if (priorityScore >= 65) {
      priorityLevel = 'High';
      slaHours = 24;
    } else if (priorityScore >= 40) {
      priorityLevel = 'Medium';
      slaHours = 48;
    }

    return {
      priorityScore,
      priorityLevel,
      urgency: priorityLevel,
      slaHours,
      estimatedSLADate: new Date(Date.now() + slaHours * 3600 * 1000).toISOString(),
      reasoning: `Calculated priority matrix score ${priorityScore}/100 based on ${severity} severity, damage analysis, and public safety exposure.`,
      confidence: 0.96,
    };
  }
}

export default PriorityTool;
