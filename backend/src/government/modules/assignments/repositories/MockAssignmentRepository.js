import { AssignmentRepositoryContract } from './AssignmentRepositoryContract.js';

export class MockAssignmentRepository extends AssignmentRepositoryContract {
  constructor() {
    super();
    this.assignments = new Map();
    this.historyStore = new Map(); // assignmentId -> Array<AssignmentHistory>
  }

  async save(assignment) {
    this.assignments.set(assignment.id, assignment);
    return assignment;
  }

  async findById(id) {
    return this.assignments.get(id) || null;
  }

  async findByComplaintId(complaintId) {
    return Array.from(this.assignments.values()).find(a => a.complaintId === complaintId) || null;
  }

  async saveHistory(historyEntry) {
    const list = this.historyStore.get(historyEntry.assignmentId) || [];
    list.push(historyEntry);
    this.historyStore.set(historyEntry.assignmentId, list);
    return historyEntry;
  }

  async getHistoryByAssignment(assignmentId) {
    return this.historyStore.get(assignmentId) || [];
  }
}

export default MockAssignmentRepository;
