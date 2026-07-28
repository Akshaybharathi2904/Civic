export class AnalyticsFilterDTO {
  constructor(query = {}) {
    this.startDate = query.startDate || null;
    this.endDate = query.endDate || null;
    this.department = query.department ? query.department.trim() : null;
    this.category = query.category ? query.category.trim() : null;
    this.priority = query.priority ? query.priority.trim() : null;
    this.region = query.region ? query.region.trim() : null;
    this.officerId = query.officerId ? query.officerId.trim() : null;
    this.status = query.status ? query.status.trim() : null;
  }
}

export class GenerateReportDTO {
  constructor({ reportType = 'EXECUTIVE_SUMMARY', parameters = {}, format = 'PDF', scheduled = false }) {
    this.reportType = reportType.toUpperCase();
    this.parameters = parameters;
    this.format = (format || 'PDF').toUpperCase();
    this.scheduled = Boolean(scheduled);
  }
}

export class DashboardSummaryDTO {
  constructor({ executiveSummary, complaintAnalytics, geographicAnalytics, departmentPerformance, officerPerformance, slaAnalytics, aiPerformance, trendAnalysis, liveOperations }) {
    this.executiveSummary = executiveSummary;
    this.complaintAnalytics = complaintAnalytics;
    this.geographicAnalytics = geographicAnalytics;
    this.departmentPerformance = departmentPerformance;
    this.officerPerformance = officerPerformance;
    this.slaAnalytics = slaAnalytics;
    this.aiPerformance = aiPerformance;
    this.trendAnalysis = trendAnalysis;
    this.liveOperations = liveOperations;
    this.generatedAt = new Date().toISOString();
  }
}

export default { AnalyticsFilterDTO, GenerateReportDTO, DashboardSummaryDTO };
