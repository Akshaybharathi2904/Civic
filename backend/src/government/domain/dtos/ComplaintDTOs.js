export class IngestEnrichedComplaintDTO {
  constructor({ complaintId, title, category, priorityScore, priorityLevel, responsibleDepartment }) {
    if (!complaintId || !title) {
      throw new Error('IngestEnrichedComplaintDTO requires complaintId and title.');
    }
    this.complaintId = complaintId;
    this.title = title;
    this.category = category || 'General Civic Issue';
    this.priorityScore = priorityScore || 50;
    this.priorityLevel = priorityLevel || 'Medium';
    this.responsibleDepartment = responsibleDepartment || 'PWD';
  }
}

export default { IngestEnrichedComplaintDTO };
