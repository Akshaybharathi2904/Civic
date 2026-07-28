import { EvidenceService } from '../services/EvidenceService.js';

export class EvidenceController {
  constructor(evidenceService = new EvidenceService()) {
    this.evidenceService = evidenceService;
  }

  async upload(req, res, next) {
    try {
      const evidence = await this.evidenceService.uploadEvidence(req.body);
      return res.status(201).json({
        success: true,
        message: 'Evidence uploaded successfully.',
        data: evidence,
      });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await this.evidenceService.deleteEvidence(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Evidence deleted successfully.',
      });
    } catch (err) { next(err); }
  }

  async getByComplaint(req, res, next) {
    try {
      const evidenceList = await this.evidenceService.getEvidenceByComplaint(req.params.complaintId);
      return res.status(200).json({ success: true, data: evidenceList });
    } catch (err) { next(err); }
  }
}

export default EvidenceController;
