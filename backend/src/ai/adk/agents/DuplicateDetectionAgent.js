import { ADKAgent } from '../core/ADKAgent.js';
import { DuplicateSearchTool } from '../tools/DuplicateSearchTool.js';

export class DuplicateDetectionAgent extends ADKAgent {
  constructor() {
    super('Duplicate Detection Agent', 4, 'duplicateAnalysis');
  }

  async process(context) {
    const res = await DuplicateSearchTool.execute({
      latitude: context.gpsLocation?.latitude,
      longitude: context.gpsLocation?.longitude,
      complaintId: context.complaintId,
      title: context.complaint?.title,
      category: context.complaintAnalysis?.category || context.complaint?.category,
    });

    return {
      duplicates: res.duplicates,
      duplicateScore: res.duplicateScore,
      isDuplicateFound: res.isDuplicateFound,
      semanticSimilarity: res.duplicateScore > 0 ? res.duplicateScore : 0.15,
      imageSimilarity: res.duplicateScore > 0 ? Math.min(0.95, res.duplicateScore + 0.05) : 0.10,
      confidence: res.confidence,
    };
  }
}

export default DuplicateDetectionAgent;
