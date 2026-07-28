import { Complaint } from '../../domain/entities/Complaint.js';

export class GovernmentComplaintContract {
  async receiveEnrichedComplaint(enrichedPayload) { throw new Error('GovernmentComplaintContract.receiveEnrichedComplaint must be implemented.'); }
  async getComplaintById(id) { throw new Error('GovernmentComplaintContract.getComplaintById must be implemented.'); }
}

export class MockGovernmentComplaintService extends GovernmentComplaintContract {
  constructor() {
    super();
    this.complaints = new Map();
  }

  async receiveEnrichedComplaint(enrichedPayload) {
    const complaint = new Complaint({
      id: enrichedPayload.complaintId || `gov_${Date.now()}`,
      ticketId: enrichedPayload.ticketId || `CIV-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: enrichedPayload.title || 'Enriched Civic Issue',
      description: enrichedPayload.description || '',
      category: enrichedPayload.category || 'Road Infrastructure',
      priorityScore: enrichedPayload.priorityScore || 75,
      priorityLevel: enrichedPayload.priorityLevel || 'High',
      departmentId: enrichedPayload.responsibleDepartment || 'PWD',
      status: 'TRIAGED',
    });

    this.complaints.set(complaint.id, complaint);
    return complaint;
  }

  async getComplaintById(id) {
    return this.complaints.get(id) || null;
  }
}

export default { GovernmentComplaintContract, MockGovernmentComplaintService };
