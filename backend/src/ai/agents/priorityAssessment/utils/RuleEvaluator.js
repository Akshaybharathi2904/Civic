import { PriorityConfig } from '../config/priority.config.js';

export class RuleEvaluator {
  static evaluateRules(inputDTO) {
    const understanding = inputDTO.understandingResult || {};
    const duplicate = inputDTO.duplicateResult || {};
    const community = inputDTO.communityResult || {};

    const severity = understanding.severity || 'Medium';
    let baseScore = PriorityConfig.BASE_SEVERITY_SCORES[severity] || 45;

    const keywords = (understanding.keywords || []).map(k => k.toLowerCase());
    const aiSummary = (understanding.aiSummary || '').toLowerCase();

    // Check emergency hazard keywords
    const hasEmergencyKeyword = PriorityConfig.EMERGENCY_HAZARD_KEYWORDS.some(
      kw => keywords.includes(kw) || aiSummary.includes(kw)
    );
    const emergencyBoost = hasEmergencyKeyword ? PriorityConfig.BOOSTS.EMERGENCY_KEYWORD : 0;

    // Check duplicate count boost
    const affectedCount = duplicate.affectedCount || 1;
    const duplicateBoost = Math.min(
      PriorityConfig.BOOSTS.MAX_DUPLICATE_BOOST,
      Math.max(0, (affectedCount - 1) * PriorityConfig.BOOSTS.DUPLICATE_PER_TICKET)
    );

    // Check community validation boost
    const communityBoost = (community.validationStatus === 'VERIFIED' || (community.communityConfidenceScore || 0) >= 0.85)
      ? PriorityConfig.BOOSTS.COMMUNITY_VERIFIED
      : 0;

    const rawTotal = baseScore + emergencyBoost + duplicateBoost + communityBoost;
    const priorityScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

    let priorityLevel = 'Low';
    let recommendedSLA = PriorityConfig.SLA_HOURS.Low;

    if (priorityScore >= PriorityConfig.PRIORITY_BOUNDARIES.Critical) {
      priorityLevel = 'Critical';
      recommendedSLA = PriorityConfig.SLA_HOURS.Critical;
    } else if (priorityScore >= PriorityConfig.PRIORITY_BOUNDARIES.High) {
      priorityLevel = 'High';
      recommendedSLA = PriorityConfig.SLA_HOURS.High;
    } else if (priorityScore >= PriorityConfig.PRIORITY_BOUNDARIES.Medium) {
      priorityLevel = 'Medium';
      recommendedSLA = PriorityConfig.SLA_HOURS.Medium;
    }

    const escalationFlag = priorityLevel === 'Critical';

    const reasons = [
      `Base severity "${severity}" (${baseScore} pts)`,
    ];
    if (hasEmergencyKeyword) reasons.push(`Emergency hazard keyword detected (+${emergencyBoost} pts)`);
    if (duplicateBoost > 0) reasons.push(`High affected citizen volume (+${duplicateBoost} pts)`);
    if (communityBoost > 0) reasons.push(`Community verified consensus (+${communityBoost} pts)`);

    return {
      priorityScore,
      priorityLevel,
      reason: `Calculated priority score ${priorityScore}/100 [Level: ${priorityLevel}] based on: ${reasons.join(', ')}. Assigned ${recommendedSLA}h SLA.`,
      recommendedSLA,
      escalationFlag,
    };
  }
}

export default RuleEvaluator;
