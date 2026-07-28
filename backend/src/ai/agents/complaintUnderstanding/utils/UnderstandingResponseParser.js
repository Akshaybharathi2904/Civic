import { ComplaintUnderstandingResultDTO } from '../models/ComplaintUnderstandingResultDTO.js';

export class UnderstandingResponseParser {
  static parseResponse(rawResponse) {
    if (typeof rawResponse === 'string') {
      try {
        const clean = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        rawResponse = JSON.parse(clean);
      } catch (e) {
        throw new Error(`Failed to parse AI JSON response: ${e.message}`);
      }
    }

    return new ComplaintUnderstandingResultDTO({
      issueCategory: rawResponse.issueCategory || 'Road Infrastructure',
      issueType: rawResponse.issueType || 'General Civic Issue',
      aiSummary: rawResponse.aiSummary || rawResponse.summary || '',
      keywords: Array.isArray(rawResponse.keywords) ? rawResponse.keywords : [],
      confidenceScore: rawResponse.confidenceScore || rawResponse.confidence || 0.95,
      severity: rawResponse.severity || 'Medium',
    });
  }
}

export default UnderstandingResponseParser;
