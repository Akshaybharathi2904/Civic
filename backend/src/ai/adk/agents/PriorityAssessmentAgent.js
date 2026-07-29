import { ADKAgent } from '../core/ADKAgent.js';
import { PriorityTool } from '../tools/PriorityTool.js';

export class PriorityAssessmentAgent extends ADKAgent {
  constructor() {
    super('Priority Assessment Agent', 6, 'priorityAssessment');
  }

  async process(context) {
    const res = await PriorityTool.execute({
      severity: context.complaintAnalysis?.severity || 'Medium',
      damageAssessment: context.visionAnalysis?.damageAssessment || '',
      positiveVotes: context.communityValidation?.positiveVotes || 1,
    });

    return {
      priorityScore: res.priorityScore,
      priorityLevel: res.priorityLevel,
      urgency: res.urgency,
      slaHours: res.slaHours,
      estimatedSLADate: res.estimatedSLADate,
      reasoning: res.reasoning,
      confidence: res.confidence,
    };
  }
}

export default PriorityAssessmentAgent;
