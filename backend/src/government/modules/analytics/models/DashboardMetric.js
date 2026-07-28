export class DashboardMetric {
  constructor({
    id = `metric_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    metricKey,
    metricName,
    category = 'GENERAL',
    value,
    changePercentage = 0,
    period = 'MONTHLY',
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.metricKey = metricKey;
    this.metricName = metricName;
    this.category = category;
    this.value = value;
    this.changePercentage = changePercentage;
    this.period = period;
    this.updatedAt = updatedAt;
  }
}

export default DashboardMetric;
