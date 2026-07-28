import { MockAnalyticsRepository } from '../repositories/MockAnalyticsRepository.js';

export class DashboardServiceContract {
  async getExecutiveSummary(filters) { throw new Error('DashboardServiceContract.getExecutiveSummary must be implemented.'); }
  async getLiveOperationsDashboard() { throw new Error('DashboardServiceContract.getLiveOperationsDashboard must be implemented.'); }
}

export class DashboardService extends DashboardServiceContract {
  constructor(repository = new MockAnalyticsRepository()) {
    super();
    this.repository = repository;
  }

  async getExecutiveSummary(filters = {}) {
    return {
      totalComplaints: 1480,
      activeComplaints: 190,
      resolvedComplaints: 1290,
      slaComplianceRate: 91.8,
      avgResolutionHours: 18.4,
      customerSatisfactionScore: 4.6,
      topCategory: 'Road Infrastructure',
      activeDepartmentCount: 5,
    };
  }

  async getLiveOperationsDashboard() {
    return {
      queuedComplaintsCount: 14,
      officersOnFieldCount: 28,
      inProgressRepairsCount: 42,
      pendingVerificationsCount: 9,
      activeEscalationsCount: 2,
      lastIngestedAt: new Date().toISOString(),
    };
  }
}

export default { DashboardServiceContract, DashboardService };
