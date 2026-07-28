import { BaseAgent } from '../BaseAgent.js';
import { PriorityAssessmentInputDTO } from './models/PriorityAssessmentInputDTO.js';
import { PriorityAssessmentResult } from './models/PriorityAssessmentResult.js';
import { MockPriorityScoringEngine } from './services/MockPriorityScoringEngine.js';
import { PriorityAssessmentError } from './errors/PriorityAssessmentError.js';

export class PriorityAssessmentAgent extends BaseAgent {
  constructor(scoringEngine = new MockPriorityScoringEngine()) {
    super('Priority Assessment Agent', 6);
    this.scoringEngine = scoringEngine;
  }

  /**
   * Assess complaint priority score (0-100), level, SLA, and escalation status
   */
  async assessPriority(inputData) {
    try {
      const inputDTO = new PriorityAssessmentInputDTO(inputData);
      const rawResult = await this.scoringEngine.calculatePriorityScore(inputDTO);
      const domainResult = new PriorityAssessmentResult(rawResult);
      return domainResult.toDomainPayload();
    } catch (err) {
      throw new PriorityAssessmentError(`Failed to process priority assessment: ${err.message}`, err, { inputData });
    }
  }

  async runInternal(context) {
    const inputData = {
      understandingResult: context.understanding?.output || { severity: 'Medium', keywords: [] },
      locationResult: context.location?.output || {},
      duplicateResult: context.duplicate?.output || { affectedCount: 1 },
      communityResult: context.community?.output || { communityConfidenceScore: 0.92, validationStatus: 'VERIFIED' },
    };

    const structuredResult = await this.assessPriority(inputData);

    return {
      status: 'success',
      confidence: 0.97,
      reasoning: structuredResult.reason,
      output: structuredResult,
      tokenUsage: { promptTokens: 95, completionTokens: 40, totalTokens: 135 },
    };
  }
}

export default PriorityAssessmentAgent;
