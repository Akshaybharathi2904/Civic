export class QueueStatsDTO {
  constructor({
    totalCount = 0,
    byPriority = { Critical: 0, High: 0, Medium: 0, Low: 0 },
    byStatus = { NEW: 0, UNDER_REVIEW: 0, READY_FOR_ASSIGNMENT: 0, ASSIGNED: 0, REJECTED: 0, CLOSED: 0 },
    byDepartment = {},
    escalationCount = 0,
  }) {
    this.totalCount = totalCount;
    this.byPriority = byPriority;
    this.byStatus = byStatus;
    this.byDepartment = byDepartment;
    this.escalationCount = escalationCount;
    this.updatedAt = new Date().toISOString();
  }
}

export default QueueStatsDTO;
