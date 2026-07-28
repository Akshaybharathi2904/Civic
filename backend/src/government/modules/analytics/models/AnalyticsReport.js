export class AnalyticsReport {
  constructor({
    id = `rpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    reportType = 'EXECUTIVE_SUMMARY',
    title,
    parameters = {},
    format = 'PDF', // PDF, CSV
    downloadUrl = null,
    status = 'GENERATED', // PENDING, GENERATED, FAILED
    scheduled = false,
    generatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.reportType = reportType;
    this.title = title || `${reportType.replace(/_/g, ' ')} Report`;
    this.parameters = parameters;
    this.format = format.toUpperCase();
    this.downloadUrl = downloadUrl || `https://gov-analytics.local/reports/${this.id}.${format.toLowerCase()}`;
    this.status = status;
    this.scheduled = Boolean(scheduled);
    this.generatedAt = generatedAt;
  }
}

export default AnalyticsReport;
