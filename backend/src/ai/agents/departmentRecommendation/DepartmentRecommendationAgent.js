import { BaseAgent } from '../BaseAgent.js';
import { DepartmentRecommendationInputDTO } from './models/DepartmentRecommendationInputDTO.js';
import { DepartmentRecommendationResult } from './models/DepartmentRecommendationResult.js';
import { MockDepartmentRepository } from './services/MockDepartmentRepository.js';
import { MockDepartmentRuleEngine } from './services/MockDepartmentRuleEngine.js';
import { DepartmentRecommendationError } from './errors/DepartmentRecommendationError.js';

export class DepartmentRecommendationAgent extends BaseAgent {
  constructor(
    repository = new MockDepartmentRepository(),
    ruleEngine = new MockDepartmentRuleEngine()
  ) {
    super('Department Recommendation Agent', 5);
    this.repository = repository;
    this.ruleEngine = ruleEngine;
  }

  /**
   * Recommend responsible government department, office, and assignment queue
   */
  async recommendDepartment(inputData) {
    try {
      const inputDTO = new DepartmentRecommendationInputDTO(inputData);
      const rawResult = await this.ruleEngine.evaluateDepartmentRules(inputDTO);
      const domainResult = new DepartmentRecommendationResult(rawResult);
      return domainResult.toDomainPayload();
    } catch (err) {
      throw new DepartmentRecommendationError(`Failed to process department recommendation: ${err.message}`, err, { inputData });
    }
  }

  async runInternal(context) {
    const inputData = {
      understandingResult: context.understanding?.output || { issueCategory: 'Road Infrastructure', issueType: 'Pothole' },
      locationResult: context.location?.output || { zone: 'Central Zone' },
      duplicateResult: context.duplicate?.output || {},
      communityResult: context.community?.output || {},
      priorityResult: context.priority?.output || { priorityLevel: 'Medium' },
    };

    const structuredResult = await this.recommendDepartment(inputData);

    return {
      status: 'success',
      confidence: structuredResult.confidenceScore,
      reasoning: structuredResult.recommendationReason,
      output: structuredResult,
      tokenUsage: { promptTokens: 100, completionTokens: 35, totalTokens: 135 },
    };
  }
}

export default DepartmentRecommendationAgent;
