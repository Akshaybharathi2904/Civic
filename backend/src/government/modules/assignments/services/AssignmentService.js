import { Assignment } from '../models/Assignment.js';
import { AssignmentHistory } from '../models/AssignmentHistory.js';
import { AssignmentStatusEnum } from '../models/AssignmentStatusEnum.js';
import { AssignComplaintDTO, ReassignComplaintDTO, AssignmentDecisionDTO } from '../dtos/AssignmentDTOs.js';
import { MockAssignmentRepository } from '../repositories/MockAssignmentRepository.js';
import { OfficerAvailabilityService } from './helpers/OfficerAvailabilityService.js';
import { RecommendationService } from './helpers/RecommendationService.js';
import { MockAssignmentNotificationService } from '../notifications/MockAssignmentNotificationService.js';

export class AssignmentServiceContract {
  async getEligibleOfficers(departmentId, ward, zone) { throw new Error('AssignmentServiceContract.getEligibleOfficers must be implemented.'); }
  async recommendBestOfficer(complaintId, departmentId, ward, zone) { throw new Error('AssignmentServiceContract.recommendBestOfficer must be implemented.'); }
  async assignComplaint(assignDTO) { throw new Error('AssignmentServiceContract.assignComplaint must be implemented.'); }
  async reassignComplaint(reassignDTO) { throw new Error('AssignmentServiceContract.reassignComplaint must be implemented.'); }
  async cancelAssignment(assignmentId, cancelledBy, reason) { throw new Error('AssignmentServiceContract.cancelAssignment must be implemented.'); }
  async acceptAssignment(assignmentId, officerId) { throw new Error('AssignmentServiceContract.acceptAssignment must be implemented.'); }
  async rejectAssignment(assignmentId, officerId, reason) { throw new Error('AssignmentServiceContract.rejectAssignment must be implemented.'); }
  async getAssignmentHistory(assignmentId) { throw new Error('AssignmentServiceContract.getAssignmentHistory must be implemented.'); }
}

export class AssignmentService extends AssignmentServiceContract {
  constructor(
    repository = new MockAssignmentRepository(),
    availabilityService = new OfficerAvailabilityService(),
    notificationService = new MockAssignmentNotificationService()
  ) {
    super();
    this.repository = repository;
    this.availabilityService = availabilityService;
    this.notificationService = notificationService;
  }

  async getEligibleOfficers(departmentId, ward = null, zone = null) {
    return await this.availabilityService.getEligibleOfficers(departmentId, ward, zone);
  }

  async recommendBestOfficer(complaintId, departmentId, ward = null, zone = null) {
    const eligible = await this.getEligibleOfficers(departmentId, ward, zone);
    const ranked = RecommendationService.rankOfficers(eligible, departmentId, ward, zone);
    return ranked[0] || null;
  }

  async assignComplaint(assignInput) {
    const dto = new AssignComplaintDTO(assignInput);
    const assignment = new Assignment({
      complaintId: dto.complaintId,
      officerId: dto.officerId,
      assignedBy: dto.assignedBy,
      status: AssignmentStatusEnum.ASSIGNED,
      notes: dto.notes,
    });

    await this.repository.save(assignment);

    const history = new AssignmentHistory({
      assignmentId: assignment.id,
      complaintId: assignment.complaintId,
      officerId: assignment.officerId,
      fromStatus: AssignmentStatusEnum.PENDING,
      toStatus: AssignmentStatusEnum.ASSIGNED,
      performedBy: dto.assignedBy,
      notes: dto.notes || 'Complaint assigned to officer.',
    });
    await this.repository.saveHistory(history);

    await this.notificationService.sendAssignmentAlert(
      dto.officerId,
      dto.complaintId,
      `New complaint #${dto.complaintId} assigned to your queue.`
    );

    return assignment;
  }

  async reassignComplaint(reassignInput) {
    const dto = new ReassignComplaintDTO(reassignInput);
    const assignment = await this.repository.findById(dto.assignmentId);
    if (!assignment) throw new Error(`Assignment with ID ${dto.assignmentId} not found.`);

    const oldOfficer = assignment.officerId;
    const oldStatus = assignment.status;

    assignment.officerId = dto.newOfficerId;
    assignment.updateStatus(AssignmentStatusEnum.REASSIGNED, dto.reason);
    await this.repository.save(assignment);

    const history = new AssignmentHistory({
      assignmentId: assignment.id,
      complaintId: assignment.complaintId,
      officerId: dto.newOfficerId,
      fromStatus: oldStatus,
      toStatus: AssignmentStatusEnum.REASSIGNED,
      performedBy: dto.reassignedBy,
      notes: `Reassigned from officer #${oldOfficer} to #${dto.newOfficerId}. Reason: ${dto.reason}`,
    });
    await this.repository.saveHistory(history);

    await this.notificationService.sendAssignmentAlert(
      dto.newOfficerId,
      assignment.complaintId,
      `Complaint #${assignment.complaintId} reassigned to your queue.`
    );

    return assignment;
  }

  async acceptAssignment(assignmentId, officerId) {
    const assignment = await this.repository.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment with ID ${assignmentId} not found.`);

    const oldStatus = assignment.status;
    assignment.updateStatus(AssignmentStatusEnum.ACCEPTED, 'Field officer accepted assignment.');
    await this.repository.save(assignment);

    const history = new AssignmentHistory({
      assignmentId: assignment.id,
      complaintId: assignment.complaintId,
      officerId: officerId || assignment.officerId,
      fromStatus: oldStatus,
      toStatus: AssignmentStatusEnum.ACCEPTED,
      performedBy: officerId || assignment.officerId,
      notes: 'Officer accepted assignment for resolution.',
    });
    await this.repository.saveHistory(history);

    return assignment;
  }

  async rejectAssignment(assignmentId, officerId, reason = '') {
    const assignment = await this.repository.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment with ID ${assignmentId} not found.`);

    const oldStatus = assignment.status;
    assignment.updateStatus(AssignmentStatusEnum.REJECTED, reason);
    await this.repository.save(assignment);

    const history = new AssignmentHistory({
      assignmentId: assignment.id,
      complaintId: assignment.complaintId,
      officerId: officerId || assignment.officerId,
      fromStatus: oldStatus,
      toStatus: AssignmentStatusEnum.REJECTED,
      performedBy: officerId || assignment.officerId,
      notes: `Officer rejected assignment. Reason: ${reason}`,
    });
    await this.repository.saveHistory(history);

    return assignment;
  }

  async cancelAssignment(assignmentId, cancelledBy = 'SUPERVISOR', reason = '') {
    const assignment = await this.repository.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment with ID ${assignmentId} not found.`);

    const oldStatus = assignment.status;
    assignment.updateStatus(AssignmentStatusEnum.CANCELLED, reason);
    await this.repository.save(assignment);

    const history = new AssignmentHistory({
      assignmentId: assignment.id,
      complaintId: assignment.complaintId,
      officerId: assignment.officerId,
      fromStatus: oldStatus,
      toStatus: AssignmentStatusEnum.CANCELLED,
      performedBy: cancelledBy,
      notes: `Assignment cancelled. Reason: ${reason}`,
    });
    await this.repository.saveHistory(history);

    return assignment;
  }

  async getAssignmentHistory(assignmentId) {
    return await this.repository.getHistoryByAssignment(assignmentId);
  }
}

export default { AssignmentServiceContract, AssignmentService };
