import { DashboardService } from '../services/DashboardService.js';

export class DashboardController {
  constructor(dashboardService = new DashboardService()) {
    this.dashboardService = dashboardService;
  }

  async getExecutive(req, res, next) {
    try {
      const summary = await this.dashboardService.getExecutiveSummary(req.query);
      return res.status(200).json({ success: true, data: summary });
    } catch (err) { next(err); }
  }

  async getLive(req, res, next) {
    try {
      const live = await this.dashboardService.getLiveOperationsDashboard();
      return res.status(200).json({ success: true, data: live });
    } catch (err) { next(err); }
  }
}

export default DashboardController;
