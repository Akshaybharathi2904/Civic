export class QueueFilterDTO {
  constructor(query = {}) {
    this.department = query.department ? query.department.trim() : null;
    this.priority = query.priority ? query.priority.trim() : null;
    this.zone = query.zone ? query.zone.trim() : null;
    this.ward = query.ward ? query.ward.trim() : null;
    this.queueStatus = query.queueStatus ? query.queueStatus.trim() : null;
    this.search = query.search ? query.search.trim().toLowerCase() : null;
    this.sortBy = query.sortBy || 'priorityScore'; // priorityScore, submissionTimestamp, aiConfidence, departmentName
    this.sortOrder = (query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    this.page = Math.max(1, parseInt(query.page || '1', 10));
    this.limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  }
}

export default QueueFilterDTO;
