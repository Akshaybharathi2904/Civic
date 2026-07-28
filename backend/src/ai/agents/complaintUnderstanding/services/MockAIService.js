import { AIServiceContract } from './AIServiceContract.js';
import { UnderstandingConfig } from '../config/understanding.config.js';

export class MockAIService extends AIServiceContract {
  async processComplaintAnalysis({ title, description, category, images = [] }) {
    const text = `${title} ${description}`.toLowerCase();

    let issueCategory = 'Road Infrastructure';
    let issueType = category || 'Pothole / Road Hazard';
    let severity = 'Medium';

    if (/water|leak|pipe|sewage|drain/i.test(text)) {
      issueCategory = 'Water & Sanitation';
      issueType = 'Water Leakage / Drainage Block';
    } else if (/light|lamp|dark|electric|power/i.test(text)) {
      issueCategory = 'Public Lighting';
      issueType = 'Streetlight Outage';
    } else if (/garbage|dump|trash|waste|smell/i.test(text)) {
      issueCategory = 'Solid Waste Management';
      issueType = 'Garbage Overflow / Waste';
    } else if (/pothole|road|asphalt|tar|crack/i.test(text)) {
      issueCategory = 'Road Infrastructure';
      issueType = 'Pothole / Surface Damage';
    }

    // Determine severity
    for (const [lvl, keywords] of Object.entries(UnderstandingConfig.SEVERITY_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        severity = lvl;
        break;
      }
    }

    const aiSummary = `AI analysis identified "${title}". Issue classified under ${issueCategory} with ${severity} severity level.`;
    const keywords = Array.from(
      new Set(
        [issueCategory, issueType, severity, ...title.split(/\s+/)]
          .map((w) => w.replace(/[^a-z0-9]/gi, '').trim())
          .filter((w) => w.length > 3)
      )
    );

    return {
      issueCategory,
      issueType,
      aiSummary,
      keywords,
      confidenceScore: UnderstandingConfig.DEFAULT_CONFIDENCE,
      severity,
      mediaCountProcessed: images.length,
      tokenUsage: { promptTokens: 110, completionTokens: 45, totalTokens: 155 },
    };
  }
}

export default MockAIService;
