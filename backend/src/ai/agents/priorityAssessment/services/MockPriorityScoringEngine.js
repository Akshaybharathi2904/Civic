import { PriorityScoringEngineContract } from './PriorityScoringEngineContract.js';
import { RuleEvaluator } from '../utils/RuleEvaluator.js';

export class MockPriorityScoringEngine extends PriorityScoringEngineContract {
  async calculatePriorityScore(inputDTO) {
    return RuleEvaluator.evaluateRules(inputDTO);
  }
}

export default MockPriorityScoringEngine;
