import { AnalyticsService } from '../services/AnalyticsService.js';
import { ReportGenerationService } from '../services/ReportGenerationService.js';

export class AnalyticsController {
  constructor(
    analyticsService = new AnalyticsService(),
    reportService = new ReportGenerationService()
  ) {
    this.analyticsService = analyticsService;
    this.reportService = reportService;
  }

  async getComplaints(req, res, next) {
    try {
      const data = await this.analyticsService.getComplaintAnalytics(req.query);
      return res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getGeographic(req, res, next) {
    try {
      const data = await this.analyticsService.getGeographicAnalytics(req.query);
      return res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getDepartments(req, res, next) {
    try {
      const data = await this.analyticsService.getDepartmentPerformance(req.query);
      return res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getOfficers(req, res, next) {
    try {
      const data = await this.analyticsService.getOfficerPerformance(req.query);
      return res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getSla(req, res, next) {
    try {
      const data = await this.analyticsService.getSlaAnalytics(req.query);
      return res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getAi(req, res, next) {
    try {
      const data = await this.analyticsService.getAiPerformance(req.query);
      return res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getTrends(req, res, next) {
    try {
      const data = await this.analyticsService.getTrendAnalysis(req.query);
      return res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async generateReport(req, res, next) {
    try {
      const report = await this.reportService.generateReport(req.body);
      return res.status(201).json({ success: true, message: 'Analytics report generated.', data: report });
    } catch (err) { next(err); }
  }

  async exportReport(req, res, next) {
    try {
      const exported = await this.reportService.exportReport(req.params.id, req.body.format || 'PDF');
      return res.status(200).json({ success: true, message: 'Report exported.', data: exported });
    } catch (err) { next(err); }
  }

  async scheduleReport(req, res, next) {
    try {
      const scheduled = await this.reportService.scheduleReport(req.body, req.body.cronExpression);
      return res.status(201).json({ success: true, message: 'Report scheduled.', data: scheduled });
    } catch (err) { next(err); }
  }

  async getReportHistory(req, res, next) {
    try {
      const history = await this.reportService.getReportHistory();
      return res.status(200).json({ success: true, data: history });
    } catch (err) { next(err); }
  }
}

export default AnalyticsController;
