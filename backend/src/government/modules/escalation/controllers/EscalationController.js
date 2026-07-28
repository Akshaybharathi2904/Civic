import { EscalationService } from '../services/EscalationService.js';

export class EscalationController {
  constructor(escalationService = new EscalationService()) {
    this.escalationService = escalationService;
  }

  async trigger(req, res, next) {
    try {
      const record = await this.escalationService.triggerEscalation(req.body);
      return res.status(201).json({
        success: true,
        message: `Complaint escalated to level "${record.level}".`,
        data: record,
      });
    } catch (err) { next(err); }
  }

  async resolve(req, res, next) {
    try {
      const resolved = await this.escalationService.resolveEscalation(
        req.params.id,
        req.body.resolvedBy || (req.govUser && req.govUser.id) || 'commissioner_cbe',
        req.body.notes || req.body.resolutionNotes
      );
      return res.status(200).json({
        success: true,
        message: 'Escalation resolved successfully.',
        data: resolved,
      });
    } catch (err) { next(err); }
  }

  async getHistory(req, res, next) {
    try {
      const history = await this.escalationService.getEscalationHistory(req.params.complaintId);
      return res.status(200).json({ success: true, data: history });
    } catch (err) { next(err); }
  }
}

export default EscalationController;
