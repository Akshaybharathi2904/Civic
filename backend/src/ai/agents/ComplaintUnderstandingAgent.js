import { BaseAgent } from './BaseAgent.js';

export class ComplaintUnderstandingAgent extends BaseAgent {
  constructor() {
    super('Complaint Understanding Agent', 1);
  }

  async runInternal(context) {
    const title = context.title || 'Civic Issue';
    const description = context.description || '';
    const category = context.category || 'General Civic Issue';

    let severity = 'Medium';
    if (/danger|hazard|emergency|spark|manhole|open|flood|collapse/i.test(`${title} ${description}`)) {
      severity = 'Critical';
    } else if (/pothole|leak|broken|overflow|garbage/i.test(`${title} ${description}`)) {
      severity = 'High';
    }

    return {
      status: 'success',
      confidence: 0.96,
      reasoning: `Extracted issue category "${category}" and calculated hazard severity "${severity}".`,
      output: {
        issueType: category,
        severity,
        extractedKeywords: [category, severity, 'Civic Incident'],
        summary: title,
        tokenUsage: { promptTokens: 120, completionTokens: 45, totalTokens: 165 },
      },
    };
  }
}

export default ComplaintUnderstandingAgent;
