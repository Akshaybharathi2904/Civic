import { DashboardMetric } from '../models/DashboardMetric.js';

export class AnalyticsRepositoryContract {
  async saveMetric(metric) { throw new Error('AnalyticsRepositoryContract.saveMetric must be implemented.'); }
  async getMetricsByCategory(category) { throw new Error('AnalyticsRepositoryContract.getMetricsByCategory must be implemented.'); }
}

export class MockAnalyticsRepository extends AnalyticsRepositoryContract {
  constructor() {
    super();
    this.metrics = new Map();
    this.seedMetrics();
  }

  seedMetrics() {
    const defaults = [
      new DashboardMetric({ metricKey: 'total_complaints', metricName: 'Total Complaints Submitted', category: 'EXECUTIVE', value: 1480, changePercentage: 12.5 }),
      new DashboardMetric({ metricKey: 'resolved_complaints', metricName: 'Total Complaints Resolved', category: 'EXECUTIVE', value: 1290, changePercentage: 15.2 }),
      new DashboardMetric({ metricKey: 'sla_compliance_rate', metricName: 'SLA Compliance Rate (%)', category: 'EXECUTIVE', value: 91.8, changePercentage: 3.4 }),
      new DashboardMetric({ metricKey: 'avg_resolution_hours', metricName: 'Average Resolution Time (hrs)', category: 'EXECUTIVE', value: 18.4, changePercentage: -8.1 }),
    ];
    defaults.forEach(m => this.metrics.set(m.metricKey, m));
  }

  async saveMetric(metric) {
    this.metrics.set(metric.metricKey, metric);
    return metric;
  }

  async getMetricsByCategory(category) {
    return Array.from(this.metrics.values()).filter(m => m.category === category);
  }
}

export default { AnalyticsRepositoryContract, MockAnalyticsRepository };
