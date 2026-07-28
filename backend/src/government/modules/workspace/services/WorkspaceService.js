import { SlaCountdownDTO } from '../dtos/WorkspaceDTOs.js';
import { WorkProgressService } from './WorkProgressService.js';
import { InternalNotesService } from './InternalNotesService.js';

export class WorkspaceServiceContract {
  async getOfficerAssignedComplaints(officerId) { throw new Error('WorkspaceServiceContract.getOfficerAssignedComplaints must be implemented.'); }
  async getComplaintWorkspaceDetails(complaintId) { throw new Error('WorkspaceServiceContract.getComplaintWorkspaceDetails must be implemented.'); }
  async calculateSlaCountdown(complaintId) { throw new Error('WorkspaceServiceContract.calculateSlaCountdown must be implemented.'); }
  async requestReassignment(complaintId, officerId, reason) { throw new Error('WorkspaceServiceContract.requestReassignment must be implemented.'); }
}

export class WorkspaceService extends WorkspaceServiceContract {
  constructor(
    progressService = new WorkProgressService(),
    notesService = new InternalNotesService()
  ) {
    super();
    this.progressService = progressService;
    this.notesService = notesService;
    this.mockAssignedComplaints = new Map();
    this.seedMockCases();
  }

  seedMockCases() {
    const cases = [
      {
        complaintId: 'comp_ws_01',
        ticketId: 'CIV-9011',
        title: 'Deep Asphalt Damage & Pothole on DB Road',
        category: 'Road Infrastructure',
        priority: 'Critical',
        assignedOfficerId: 'off_01',
        ward: 'Ward 72 - RS Puram',
        zone: 'Central Zone',
        targetSLAHours: 24,
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4h ago
      },
      {
        complaintId: 'comp_ws_02',
        ticketId: 'CIV-9012',
        title: 'Water Pipe Burst near Cross Cut Junction',
        category: 'Water & Sanitation',
        priority: 'High',
        assignedOfficerId: 'off_01',
        ward: 'Ward 72 - RS Puram',
        zone: 'Central Zone',
        targetSLAHours: 48,
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12h ago
      },
    ];

    cases.forEach(c => this.mockAssignedComplaints.set(c.complaintId, c));
  }

  async getOfficerAssignedComplaints(officerId) {
    return Array.from(this.mockAssignedComplaints.values()).filter(
      c => c.assignedOfficerId === officerId
    );
  }

  async getComplaintWorkspaceDetails(complaintId) {
    const complaint = this.mockAssignedComplaints.get(complaintId);
    if (!complaint) throw new Error(`Workspace complaint with ID "${complaintId}" not found.`);

    const progress = await this.progressService.getProgress(complaintId);
    const notes = await this.notesService.getNotesForComplaint(complaintId);
    const sla = await this.calculateSlaCountdown(complaintId);

    return {
      complaint,
      progress,
      notes,
      sla,
    };
  }

  async calculateSlaCountdown(complaintId) {
    const complaint = this.mockAssignedComplaints.get(complaintId) || {
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      targetSLAHours: 48,
    };

    const createdTime = new Date(complaint.createdAt).getTime();
    const slaTargetMs = (complaint.targetSLAHours || 48) * 3600 * 1000;
    const slaDueDate = new Date(createdTime + slaTargetMs);

    const nowTime = Date.now();
    const diffMs = slaDueDate.getTime() - nowTime;

    const breached = diffMs <= 0;
    const hoursRemaining = Math.max(0, diffMs / (1000 * 3600));
    const minutesRemaining = Math.max(0, (diffMs % (1000 * 3600)) / (1000 * 60));

    return new SlaCountdownDTO({
      complaintId,
      slaDueDate: slaDueDate.toISOString(),
      hoursRemaining,
      minutesRemaining,
      breached,
      targetSLA: complaint.targetSLAHours,
    });
  }

  async requestReassignment(complaintId, officerId, reason) {
    const complaint = this.mockAssignedComplaints.get(complaintId);
    if (!complaint) throw new Error(`Complaint with ID "${complaintId}" not found.`);

    await this.notesService.addNote(
      complaintId,
      officerId,
      'Field Officer',
      'FIELD_OFFICER',
      `REASSIGNMENT REQUEST: ${reason}`
    );

    return {
      complaintId,
      officerId,
      reassignmentRequested: true,
      reason,
      requestedAt: new Date().toISOString(),
    };
  }
}

export default { WorkspaceServiceContract, WorkspaceService };
