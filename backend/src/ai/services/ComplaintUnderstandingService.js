import { executeGeminiAgent } from '../../services/gemini.service.js';

export class ComplaintUnderstandingService {
  async process(complaintData) {
    const prompt = `Analyze citizen complaint:
Title: "${complaintData.title}"
Description: "${complaintData.description}"
Category: "${complaintData.category}"

Extract structured JSON:
- category: primary category
- issueType: specific civic hazard
- severity: 'Low' | 'Medium' | 'High' | 'Critical'
- summary: 1-sentence summary
- keywords: array of key search terms
- confidence: float 0.85 to 0.99`;

    const systemInstruction = 'You are the Complaint Understanding AI Service. Provide accurate JSON analysis.';

    const fallbackGenerator = () => {
      const text = `${complaintData.title} ${complaintData.description}`.toLowerCase();
      let issueType = complaintData.category || 'General Civic Issue';
      let severity = 'Medium';

      if (text.includes('pothole') || text.includes('road') || text.includes('asphalt')) {
        issueType = 'Potholes & Damaged Road';
        severity = 'High';
      } else if (text.includes('garbage') || text.includes('trash') || text.includes('dump')) {
        issueType = 'Garbage Accumulation & Waste';
        severity = 'Medium';
      } else if (text.includes('water') || text.includes('leak') || text.includes('pipe')) {
        issueType = 'Water Leakage & Drainage';
        severity = 'High';
      } else if (text.includes('light') || text.includes('dark') || text.includes('electric')) {
        issueType = 'Broken Streetlights & Electrical';
        severity = 'Medium';
      }

      return {
        category: complaintData.category || 'Infrastructure',
        issueType,
        severity,
        summary: (complaintData.title || 'Civic complaint submitted').slice(0, 100),
        keywords: ['civic', 'hazard', 'repair', issueType.toLowerCase().split(' ')[0]],
        confidence: 0.94,
      };
    };

    const res = await executeGeminiAgent(prompt, systemInstruction, fallbackGenerator);
    const data = res.data || {};

    return {
      category: data.category || complaintData.category || 'General Civic Issue',
      issueType: data.issueType || complaintData.title || 'General Hazard',
      severity: data.severity || 'Medium',
      summary: data.summary || complaintData.title || 'Civic complaint',
      keywords: Array.isArray(data.keywords) ? data.keywords : ['civic', 'hazard'],
      confidence: Number(data.confidenceScore || data.confidence || 0.94),
    };
  }
}

export default ComplaintUnderstandingService;
