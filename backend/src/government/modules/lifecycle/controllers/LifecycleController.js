import { LifecycleService } from '../services/LifecycleService.js';

export class LifecycleController {
  constructor(lifecycleService = new LifecycleService()) {
    this.lifecycleService = lifecycleService;
  }

  async updateStatus(req, res, next) {
    try {
      const result = await this.lifecycleService.updateStatus(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: `Complaint status updated to "${result.status}".`,
        data: result,
      });
    } catch (err) { next(err); }
  }

  async reopen(req, res, next) {
    try {
      const result = await this.lifecycleService.reopenComplaint(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Complaint reopened successfully and placed UNDER_REVIEW.',
        data: result,
      });
    } catch (err) { next(err); }
  }

  async getTimeline(req, res, next) {
    try {
      const timeline = await this.lifecycleService.getComplaintTimeline(req.params.id);
      return res.status(200).json({ success: true, data: timeline });
    } catch (err) { next(err); }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await this.lifecycleService.calculateProcessingMetrics(req.params.id);
      return res.status(200).json({ success: true, data: metrics });
    } catch (err) { next(err); }
  }
}

export default LifecycleController;
