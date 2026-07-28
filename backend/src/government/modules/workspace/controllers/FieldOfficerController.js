import { WorkspaceService } from '../services/WorkspaceService.js';
import { WorkProgressService } from '../services/WorkProgressService.js';
import { InternalNotesService } from '../services/InternalNotesService.js';

export class FieldOfficerController {
  constructor(
    workspaceService = new WorkspaceService(),
    progressService = new WorkProgressService(),
    notesService = new InternalNotesService()
  ) {
    this.workspaceService = workspaceService;
    this.progressService = progressService;
    this.notesService = notesService;
  }

  async listAssigned(req, res, next) {
    try {
      const officerId = req.query.officerId || (req.govUser && req.govUser.id) || 'off_01';
      const complaints = await this.workspaceService.getOfficerAssignedComplaints(officerId);
      return res.status(200).json({ success: true, data: complaints });
    } catch (err) { next(err); }
  }

  async getDetails(req, res, next) {
    try {
      const details = await this.workspaceService.getComplaintWorkspaceDetails(req.params.id);
      return res.status(200).json({ success: true, data: details });
    } catch (err) { next(err); }
  }

  async startWork(req, res, next) {
    try {
      const officerId = req.body.officerId || (req.govUser && req.govUser.id) || 'off_01';
      const progress = await this.progressService.startWork(req.params.id, officerId);
      return res.status(200).json({ success: true, message: 'Work started en route.', data: progress });
    } catch (err) { next(err); }
  }

  async pauseWork(req, res, next) {
    try {
      const officerId = req.body.officerId || (req.govUser && req.govUser.id) || 'off_01';
      const progress = await this.progressService.pauseWork(req.params.id, officerId, req.body.remarks);
      return res.status(200).json({ success: true, message: 'Work paused.', data: progress });
    } catch (err) { next(err); }
  }

  async resumeWork(req, res, next) {
    try {
      const officerId = req.body.officerId || (req.govUser && req.govUser.id) || 'off_01';
      const progress = await this.progressService.resumeWork(req.params.id, officerId);
      return res.status(200).json({ success: true, message: 'Work resumed.', data: progress });
    } catch (err) { next(err); }
  }

  async updateProgress(req, res, next) {
    try {
      const officerId = req.body.officerId || (req.govUser && req.govUser.id) || 'off_01';
      const progress = await this.progressService.updateProgress(
        req.params.id,
        officerId,
        req.body.progressState,
        req.body.percentage,
        req.body.remarks
      );
      return res.status(200).json({ success: true, message: 'Work progress updated.', data: progress });
    } catch (err) { next(err); }
  }

  async completeWork(req, res, next) {
    try {
      const officerId = req.body.officerId || (req.govUser && req.govUser.id) || 'off_01';
      const progress = await this.progressService.markCompleted(req.params.id, officerId, req.body.remarks);
      return res.status(200).json({ success: true, message: 'Work marked completed.', data: progress });
    } catch (err) { next(err); }
  }

  async addNote(req, res, next) {
    try {
      const note = await this.notesService.addNote(req.params.id, req.body);
      return res.status(201).json({ success: true, message: 'Internal note added.', data: note });
    } catch (err) { next(err); }
  }

  async getNotes(req, res, next) {
    try {
      const notes = await this.notesService.getNotesForComplaint(req.params.id);
      return res.status(200).json({ success: true, data: notes });
    } catch (err) { next(err); }
  }

  async requestReassignment(req, res, next) {
    try {
      const officerId = req.body.officerId || (req.govUser && req.govUser.id) || 'off_01';
      const result = await this.workspaceService.requestReassignment(req.params.id, officerId, req.body.reason);
      return res.status(200).json({ success: true, message: 'Reassignment requested.', data: result });
    } catch (err) { next(err); }
  }

  async getSla(req, res, next) {
    try {
      const sla = await this.workspaceService.calculateSlaCountdown(req.params.id);
      return res.status(200).json({ success: true, data: sla });
    } catch (err) { next(err); }
  }
}

export default FieldOfficerController;
