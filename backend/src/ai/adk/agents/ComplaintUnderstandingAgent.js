import { ADKAgent } from '../core/ADKAgent.js';

export class ComplaintUnderstandingAgent extends ADKAgent {
  constructor() {
    super('Complaint Understanding Agent', 1, 'complaintAnalysis');
  }

  async process(context) {
    const complaint = context.complaint;
    const prompt = `Analyze citizen complaint submission:
Title: "${complaint.title}"
Description: "${complaint.description}"
Category: "${complaint.category}"

Return JSON:
- category: primary civic category
- issueType: specific hazard name
- severity: 'Low' | 'Medium' | 'High' | 'Critical'
- summary: concise 1-sentence summary
- keywords: string array of key search terms
- confidence: float 0.85 to 0.99`;

    const systemInstruction = 'You are the ADK Complaint Understanding Agent powered by Gemini 2.5 Flash.';

    const fallbackFn = () => {
      const text = `${complaint.title} ${complaint.description}`.toLowerCase();
      let issueType = complaint.category || 'General Civic Hazard';
      let severity = 'Medium';

      if (text.includes('pothole') || text.includes('road') || text.includes('asphalt')) {
        issueType = 'Potholes & Damaged Road';
        severity = 'High';
      } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) {
        issueType = 'Garbage Accumulation & Waste';
        severity = 'Medium';
      } else if (text.includes('water') || text.includes('leak') || text.includes('drain')) {
        issueType = 'Water Leakage & Drainage';
        severity = 'High';
      } else if (text.includes('light') || text.includes('dark') || text.includes('electric')) {
        issueType = 'Broken Streetlights & Electrical';
        severity = 'Medium';
      }

      return {
        category: complaint.category || 'Infrastructure',
        issueType,
        severity,
        summary: (complaint.title || 'Civic issue report').slice(0, 100),
        keywords: ['civic', 'hazard', 'repair'],
        confidence: 0.95,
      };
    };

    const data = await this.callGemini(prompt, systemInstruction, fallbackFn);

    return {
      category: data.category || complaint.category || 'General Civic Hazard',
      issueType: data.issueType || complaint.title || 'Civic Hazard',
      severity: data.severity || 'Medium',
      summary: data.summary || complaint.title || 'Complaint submitted',
      keywords: Array.isArray(data.keywords) ? data.keywords : ['civic', 'hazard'],
      confidence: Number(data.confidence || 0.95),
    };
  }
}

export default ComplaintUnderstandingAgent;
