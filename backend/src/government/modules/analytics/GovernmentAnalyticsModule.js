export class GovernmentAnalyticsContract {
  async getDepartmentMetrics(departmentId) { throw new Error('GovernmentAnalyticsContract.getDepartmentMetrics must be implemented.'); }
}

export class MockGovernmentAnalyticsService extends GovernmentAnalyticsContract {
  async getDepartmentMetrics(departmentId = 'PWD') {
    return {
      departmentId,
      totalAssigned: 42,
      resolvedCount: 38,
      avgResolutionHours: 14.5,
      slaComplianceRate: 0.95,
      timestamp: new Date().toISOString(),
    };
  }
}

export default { GovernmentAnalyticsContract, MockGovernmentAnalyticsService };
