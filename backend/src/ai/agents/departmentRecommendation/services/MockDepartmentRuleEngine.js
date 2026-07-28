import { DepartmentRuleEngineContract } from './DepartmentRuleEngineContract.js';
import { DepartmentConfig } from '../config/department.config.js';

export class MockDepartmentRuleEngine extends DepartmentRuleEngineContract {
  async evaluateDepartmentRules(inputDTO) {
    const understanding = inputDTO.understandingResult || {};
    const location = inputDTO.locationResult || {};
    const priority = inputDTO.priorityResult || {};

    const category = (understanding.issueCategory || understanding.category || '').toLowerCase();
    const issueType = (understanding.issueType || '').toLowerCase();
    const keywords = (understanding.keywords || []).map(k => k.toLowerCase());
    const zone = location.zone || 'Central Zone';
    const isCritical = priority.priorityLevel === 'Critical' || priority.escalationFlag;

    let matchedDeptKey = 'PWD'; // Default fallback

    // Match configurable rules
    for (const [deptKey, deptMeta] of Object.entries(DepartmentConfig.DEPARTMENTS)) {
      const categoryMatch = deptMeta.categories.some(c => category.includes(c.toLowerCase()) || issueType.includes(c.toLowerCase()));
      const keywordMatch = deptMeta.keywords.some(kw => keywords.includes(kw) || issueType.includes(kw));

      if (categoryMatch || keywordMatch) {
        matchedDeptKey = deptKey;
        break;
      }
    }

    const deptMeta = DepartmentConfig.DEPARTMENTS[matchedDeptKey];
    const administrativeOffice = `${zone} - ${deptMeta.defaultOffice}`;
    const suggestedAssignmentQueue = isCritical ? deptMeta.emergencyQueue : deptMeta.standardQueue;

    const recommendationReason = `Complaint classified under category "${understanding.issueCategory || 'Civic Hazard'}" matched ${deptMeta.name} routing rule. Assigned to ${administrativeOffice} (${suggestedAssignmentQueue}).`;

    return {
      responsibleDepartment: deptMeta.name,
      administrativeOffice,
      suggestedAssignmentQueue,
      confidenceScore: DepartmentConfig.DEFAULT_CONFIDENCE,
      recommendationReason,
    };
  }
}

export default MockDepartmentRuleEngine;
