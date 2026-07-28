export class AssignComplaintDTO {
  constructor({ complaintId, officerId, assignedBy = 'DISPATCHER', notes = '' }) {
    if (!complaintId || !officerId) {
      throw new Error('AssignComplaintDTO requires complaintId and officerId.');
    }
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.assignedBy = assignedBy;
    this.notes = notes;
  }
}

export class ReassignComplaintDTO {
  constructor({ assignmentId, newOfficerId, reassignedBy = 'SUPERVISOR', reason = '' }) {
    if (!assignmentId || !newOfficerId) {
      throw new Error('ReassignComplaintDTO requires assignmentId and newOfficerId.');
    }
    this.assignmentId = assignmentId;
    this.newOfficerId = newOfficerId;
    this.reassignedBy = reassignedBy;
    this.reason = reason;
  }
}

export class AssignmentDecisionDTO {
  constructor({ assignmentId, officerId, action, reason = '' }) {
    if (!assignmentId || !action) {
      throw new Error('AssignmentDecisionDTO requires assignmentId and action.');
    }
    this.assignmentId = assignmentId;
    this.officerId = officerId;
    this.action = action.toUpperCase(); // ACCEPT, REJECT
    this.reason = reason;
  }
}

export class OfficerRecommendationDTO {
  constructor({ officerId, officerName, badgeNumber, departmentId, matchScore, activeCases, capacityRatio, matchReason }) {
    this.officerId = officerId;
    this.officerName = officerName;
    this.badgeNumber = badgeNumber;
    this.departmentId = departmentId;
    this.matchScore = Number(Number(matchScore).toFixed(2));
    this.activeCases = activeCases;
    this.capacityRatio = Number(Number(capacityRatio).toFixed(2));
    this.matchReason = matchReason;
  }
}

export default {
  AssignComplaintDTO,
  ReassignComplaintDTO,
  AssignmentDecisionDTO,
  OfficerRecommendationDTO,
};
