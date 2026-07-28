import { VerificationService } from '../services/VerificationService.js';

export class VerificationController {
  constructor(verificationService = new VerificationService()) {
    this.verificationService = verificationService;
  }

  async submit(req, res, next) {
    try {
      const verification = await this.verificationService.submitForVerification(req.body);
      return res.status(201).json({
        success: true,
        message: 'Evidence submitted for supervisor verification.',
        data: verification,
      });
    } catch (err) { next(err); }
  }

  async review(req, res, next) {
    try {
      const updated = await this.verificationService.reviewEvidence(req.body);
      return res.status(200).json({
        success: true,
        message: `Verification review updated to "${updated.status}".`,
        data: updated,
      });
    } catch (err) { next(err); }
  }

  async approve(req, res, next) {
    try {
      const approved = await this.verificationService.approveEvidence(
        req.params.id,
        req.body.supervisorId || (req.govUser && req.govUser.id) || 'supervisor_pwd',
        req.body.reviewNotes
      );
      return res.status(200).json({ success: true, message: 'Evidence approved.', data: approved });
    } catch (err) { next(err); }
  }

  async reject(req, res, next) {
    try {
      const rejected = await this.verificationService.rejectEvidence(
        req.params.id,
        req.body.supervisorId || (req.govUser && req.govUser.id) || 'supervisor_pwd',
        req.body.reviewNotes
      );
      return res.status(200).json({ success: true, message: 'Evidence rejected.', data: rejected });
    } catch (err) { next(err); }
  }

  async requestRework(req, res, next) {
    try {
      const rework = await this.verificationService.requestRework(
        req.params.id,
        req.body.supervisorId || (req.govUser && req.govUser.id) || 'supervisor_pwd',
        req.body.reviewNotes
      );
      return res.status(200).json({ success: true, message: 'Rework requested.', data: rework });
    } catch (err) { next(err); }
  }

  async getHistory(req, res, next) {
    try {
      const history = await this.verificationService.getVerificationHistory(req.params.complaintId);
      return res.status(200).json({ success: true, data: history });
    } catch (err) { next(err); }
  }
}

export default VerificationController;
