export class Complaint {
  constructor({
    id = `gov_comp_${Date.now()}`,
    ticketId,
    title,
    description = '',
    category,
    priorityScore = 50,
    priorityLevel = 'Medium',
    departmentId = null,
    status = 'RECEIVED',
  }) {
    this.id = id;
    this.ticketId = ticketId || `CIV-${Math.floor(Math.random() * 9000 + 1000)}`;
    this.title = title;
    this.description = description;
    this.category = category;
    this.priorityScore = priorityScore;
    this.priorityLevel = priorityLevel;
    this.departmentId = departmentId;
    this.status = status;
    this.createdAt = new Date().toISOString();
  }
}

export default Complaint;
