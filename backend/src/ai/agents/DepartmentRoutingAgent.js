import { BaseAgent } from './BaseAgent.js';

export class DepartmentRoutingAgent extends BaseAgent {
  constructor() {
    super('Department Routing Agent', 5);
  }

  async runInternal(context) {
    const category = context.category || context.understanding?.output?.issueType || 'General';

    let departmentName = 'Public Works Department (PWD)';
    let departmentCode = 'PWD';

    if (/water|leak|sewage|drain/i.test(category)) {
      departmentName = 'Water Supply & Sewerage Board';
      departmentCode = 'WSSB';
    } else if (/light|street|electric|power/i.test(category)) {
      departmentName = 'Electricity & Street Lighting Dept';
      departmentCode = 'ESLD';
    } else if (/waste|garbage|dumping|clean/i.test(category)) {
      departmentName = 'Solid Waste Management Dept';
      departmentCode = 'SWMD';
    }

    return {
      status: 'success',
      confidence: 0.96,
      reasoning: `Auto-routed complaint category "${category}" to ${departmentName} [${departmentCode}].`,
      output: {
        departmentName,
        departmentCode,
        assignedOfficer: 'Field Operations Inspector',
        tokenUsage: { promptTokens: 100, completionTokens: 35, totalTokens: 135 },
      },
    };
  }
}

export default DepartmentRoutingAgent;
