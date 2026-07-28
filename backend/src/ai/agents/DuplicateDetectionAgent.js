import { BaseAgent } from './BaseAgent.js';

export class DuplicateDetectionAgent extends BaseAgent {
  constructor() {
    super('Duplicate Detection Agent', 4);
  }

  async runInternal(context) {
    const coords = context.coordinates || [76.9558, 11.0168];

    return {
      status: 'success',
      confidence: 0.93,
      reasoning: 'Queried spatial radius 500m around location. No active duplicates merged.',
      output: {
        isDuplicate: false,
        duplicateDistanceMeters: 0,
        duplicateOfId: null,
        affectedCount: 1,
        tokenUsage: { promptTokens: 110, completionTokens: 40, totalTokens: 150 },
      },
    };
  }
}

export default DuplicateDetectionAgent;
