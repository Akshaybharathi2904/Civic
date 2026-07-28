export class CreateAssignmentDTO {
  constructor({ complaintId, officerId, assignedBy = 'SYSTEM' }) {
    if (!complaintId || !officerId) {
      throw new Error('CreateAssignmentDTO requires complaintId and officerId.');
    }
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.assignedBy = assignedBy;
  }
}

export default { CreateAssignmentDTO };
