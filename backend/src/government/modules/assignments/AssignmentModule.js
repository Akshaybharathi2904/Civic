import { Assignment } from '../../domain/entities/Assignment.js';

export class AssignmentContract {
  async assignComplaint(assignmentDTO) { throw new Error('AssignmentContract.assignComplaint must be implemented.'); }
}

export class MockAssignmentService extends AssignmentContract {
  async assignComplaint(assignmentDTO) {
    return new Assignment({
      complaintId: assignmentDTO.complaintId,
      officerId: assignmentDTO.officerId,
      assignedBy: assignmentDTO.assignedBy || 'DISPATCHER',
      status: 'ASSIGNED',
    });
  }
}

export default { AssignmentContract, MockAssignmentService };
