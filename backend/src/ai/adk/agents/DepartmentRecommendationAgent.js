import { ADKAgent } from '../core/ADKAgent.js';
import { DepartmentTool } from '../tools/DepartmentTool.js';

export class DepartmentRecommendationAgent extends ADKAgent {
  constructor() {
    super('Department Recommendation Agent', 7, 'departmentRecommendation');
  }

  async process(context) {
    const res = await DepartmentTool.execute({
      category: context.complaintAnalysis?.category || context.complaint?.category,
      issueType: context.complaintAnalysis?.issueType || context.complaint?.title,
      ward: context.locationAnalysis?.ward,
    });

    return {
      department: res.department,
      office: res.office,
      reasoning: res.reasoning,
      confidence: res.confidence,
    };
  }
}

export default DepartmentRecommendationAgent;
