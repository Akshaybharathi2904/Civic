import { AnalyticsReport } from '../models/AnalyticsReport.js';
import { GenerateReportDTO } from '../dtos/AnalyticsDTOs.js';
import { MockReportRepository } from '../repositories/MockReportRepository.js';

export class ReportGenerationServiceContract {
  async generateReport(generateDTO) { throw new Error('ReportGenerationServiceContract.generateReport must be implemented.'); }
  async exportReport(reportId, format) { throw new Error('ReportGenerationServiceContract.exportReport must be implemented.'); }
  async scheduleReport(generateDTO, cronExpression) { throw new Error('ReportGenerationServiceContract.scheduleReport must be implemented.'); }
  async getReportHistory() { throw new Error('ReportGenerationServiceContract.getReportHistory must be implemented.'); }
}

export class ReportGenerationService extends ReportGenerationServiceContract {
  constructor(repository = new MockReportRepository()) {
    super();
    this.repository = repository;
  }

  async generateReport(reportInput) {
    const dto = new GenerateReportDTO(reportInput);
    const report = new AnalyticsReport({
      reportType: dto.reportType,
      parameters: dto.parameters,
      format: dto.format,
      status: 'GENERATED',
      scheduled: dto.scheduled,
    });

    return await this.repository.save(report);
  }

  async exportReport(reportId, format = 'PDF') {
    const report = await this.repository.findById(reportId);
    if (!report) throw new Error(`Analytics Report #${reportId} not found.`);

    report.format = format.toUpperCase();
    report.downloadUrl = `https://gov-analytics.local/reports/${report.id}.${format.toLowerCase()}`;
    return await this.repository.save(report);
  }

  async scheduleReport(reportInput, cronExpression = '0 0 * * 1') {
    const dto = new GenerateReportDTO({ ...reportInput, scheduled: true });
    const report = new AnalyticsReport({
      reportType: dto.reportType,
      parameters: { ...dto.parameters, cronExpression },
      format: dto.format,
      status: 'SCHEDULED',
      scheduled: true,
    });

    return await this.repository.save(report);
  }

  async getReportHistory() {
    return await this.repository.findAll();
  }
}

export default { ReportGenerationServiceContract, ReportGenerationService };
