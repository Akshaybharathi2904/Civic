import { SlaService } from '../services/SlaService.js';

export class SlaController {
  constructor(slaService = new SlaService()) {
    this.slaService = slaService;
  }

  async configure(req, res, next) {
    try {
      const config = await this.slaService.configureRule(req.body);
      return res.status(201).json({
        success: true,
        message: 'SLA rule configured successfully.',
        data: config,
      });
    } catch (err) { next(err); }
  }

  async getDeadline(req, res, next) {
    try {
      const { category, priority, startTime } = req.query;
      const deadline = await this.slaService.calculateDeadline(category, priority, startTime);
      return res.status(200).json({ success: true, data: { deadline: deadline.toISOString() } });
    } catch (err) { next(err); }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await this.slaService.getMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (err) { next(err); }
  }
}

export default SlaController;
