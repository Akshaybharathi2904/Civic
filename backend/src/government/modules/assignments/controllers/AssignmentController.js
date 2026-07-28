import { AssignmentService } from '../services/AssignmentService.js';

export class AssignmentController {
  constructor(assignmentService = new AssignmentService()) {
    this.assignmentService = assignmentService;
  }

  async getEligible(req, res, next) {
    try {
      const { departmentId, ward, zone } = req.query;
      const officers = await this.assignmentService.getEligibleOfficers(departmentId, ward, zone);
      return res.status(200).json({ success: true, data: officers });
    } catch (err) { next(err); }
  }

  async recommend(req, res, next) {
    try {
      const { complaintId, departmentId, ward, zone } = req.query;
      const recommendation = await this.assignmentService.recommendBestOfficer(complaintId, departmentId, ward, zone);
      return res.status(200).json({ success: true, data: recommendation });
    } catch (err) { next(err); }
  }

  async assign(req, res, next) {
    try {
      const assignment = await this.assignmentService.assignComplaint(req.body);
      return res.status(201).json({
        success: true,
        message: 'Complaint assigned to field officer successfully.',
        data: assignment,
      });
    } catch (err) { next(err); }
  }

  async reassign(req, res, next) {
    try {
      const reassignment = await this.assignmentService.reassignComplaint(req.body);
      return res.status(200).json({
        success: true,
        message: 'Complaint reassigned to new officer successfully.',
        data: reassignment,
      });
    } catch (err) { next(err); }
  }

  async accept(req, res, next) {
    try {
      const accepted = await this.assignmentService.acceptAssignment(req.params.id, req.body.officerId);
      return res.status(200).json({
        success: true,
        message: 'Assignment accepted.',
        data: accepted,
      });
    } catch (err) { next(err); }
  }

  async reject(req, res, next) {
    try {
      const rejected = await this.assignmentService.rejectAssignment(req.params.id, req.body.officerId, req.body.reason);
      return res.status(200).json({
        success: true,
        message: 'Assignment rejected.',
        data: rejected,
      });
    } catch (err) { next(err); }
  }

  async cancel(req, res, next) {
    try {
      const cancelled = await this.assignmentService.cancelAssignment(req.params.id, req.body.cancelledBy, req.body.reason);
      return res.status(200).json({
        success: true,
        message: 'Assignment cancelled.',
        data: cancelled,
      });
    } catch (err) { next(err); }
  }

  async getHistory(req, res, next) {
    try {
      const history = await this.assignmentService.getAssignmentHistory(req.params.id);
      return res.status(200).json({ success: true, data: history });
    } catch (err) { next(err); }
  }
}

export default AssignmentController;
