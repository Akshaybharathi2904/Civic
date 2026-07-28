import { ComplaintQueueService } from '../services/ComplaintQueueService.js';

export class ComplaintQueueController {
  constructor(queueService = new ComplaintQueueService()) {
    this.queueService = queueService;
  }

  async ingest(req, res, next) {
    try {
      const queuedItem = await this.queueService.ingestEnrichedComplaint(req.body);
      return res.status(201).json({
        success: true,
        message: 'AI-enriched complaint ingested into Government Queue successfully.',
        data: queuedItem,
      });
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const result = await this.queueService.getPendingQueue(req.query);
      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) { next(err); }
  }

  async getStats(req, res, next) {
    try {
      const stats = await this.queueService.getQueueStatistics();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const complaint = await this.queueService.getComplaintDetails(req.params.id);
      return res.status(200).json({
        success: true,
        data: complaint,
      });
    } catch (err) { next(err); }
  }

  async updateStatus(req, res, next) {
    try {
      const updated = await this.queueService.updateQueueStatus(req.params.id, req.body.status || req.body.queueStatus);
      return res.status(200).json({
        success: true,
        message: `Queue status updated to "${updated.queueStatus}".`,
        data: updated,
      });
    } catch (err) { next(err); }
  }
}

export default ComplaintQueueController;
