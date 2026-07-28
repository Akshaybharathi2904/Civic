import { WorkflowOrchestrator } from '../ai/orchestrator/WorkflowOrchestrator.js';
import {
  ComplaintQueueService,
  AssignmentService,
  LifecycleService,
  WorkProgressService,
  EvidenceService,
  VerificationService,
  CitizenNotificationService,
  DashboardService,
  AnalyticsService,
} from '../government/index.js';

export class EndToEndPipeline {
  constructor() {
    this.aiOrchestrator = new WorkflowOrchestrator();
    this.queueService = new ComplaintQueueService();
    this.assignmentService = new AssignmentService();
    this.lifecycleService = new LifecycleService();
    this.workProgressService = new WorkProgressService();
    this.evidenceService = new EvidenceService();
    this.verificationService = new VerificationService();
    this.notificationService = new CitizenNotificationService();
    this.dashboardService = new DashboardService();
    this.analyticsService = new AnalyticsService();
  }

  async processCitizenComplaint(rawComplaintInput) {
    const pipelineLog = [];
    const recordStep = (stage, detail) => pipelineLog.push({ stage, detail, timestamp: new Date().toISOString() });

    // Stage 1: Citizen Complaint Submission
    recordStep('1_CITIZEN_SUBMISSION', { rawComplaintInput });

    // Stage 2: AI Multi-Agent Processing Pipeline
    const aiEnrichedPayload = await this.aiOrchestrator.executeWorkflow({
      title: rawComplaintInput.title,
      description: rawComplaintInput.description || rawComplaintInput.title,
      category: rawComplaintInput.category || 'Road Infrastructure',
      latitude: rawComplaintInput.latitude || (rawComplaintInput.location && rawComplaintInput.location.latitude) || 11.0084,
      longitude: rawComplaintInput.longitude || (rawComplaintInput.location && rawComplaintInput.location.longitude) || 76.9508,
      address: rawComplaintInput.address || 'Cross Cut Road, Coimbatore',
      citizenId: rawComplaintInput.citizenId || 'cit_101',
    });
    recordStep('2_AI_PROCESSING', { complaintId: aiEnrichedPayload.complaintId, aiEnrichedPayload });

    // Stage 3: Handover to Government Complaint Queue
    const queueItem = await this.queueService.ingestEnrichedComplaint(aiEnrichedPayload);
    await this.lifecycleService.updateStatus(queueItem.complaintId, 'UNDER_REVIEW', 'system_triage', 'AI-enriched complaint ingested into queue');
    recordStep('3_GOV_QUEUE_INGESTION', { complaintId: queueItem.complaintId, ticketId: queueItem.ticketId, status: queueItem.queueStatus });

    // Stage 4: Officer Recommendation & Assignment
    await this.lifecycleService.updateStatus(queueItem.complaintId, 'READY_FOR_ASSIGNMENT', 'supervisor_pwd', 'Supervisor review complete and ready for dispatch');

    const bestOfficer = await this.assignmentService.recommendBestOfficer(
      queueItem.complaintId,
      queueItem.recommendedDepartment.departmentName || 'PWD',
      queueItem.location.ward,
      queueItem.location.zone
    );

    const assignment = await this.assignmentService.assignComplaint({
      complaintId: queueItem.complaintId,
      officerId: bestOfficer ? bestOfficer.officerId : 'off_01',
      assignedBy: 'supervisor_pwd',
    });

    await this.assignmentService.acceptAssignment(assignment.id, assignment.officerId);
    await this.lifecycleService.updateStatus(queueItem.complaintId, 'ASSIGNED', 'dispatcher', 'Assigned to field officer');
    await this.lifecycleService.updateStatus(queueItem.complaintId, 'ACCEPTED', assignment.officerId, 'Officer accepted assignment');
    recordStep('4_OFFICER_ASSIGNMENT', { assignmentId: assignment.id, officerId: assignment.officerId, matchScore: bestOfficer ? bestOfficer.matchScore : 0.98 });

    // Stage 5: Officer Field Workspace & Progress Updates
    await this.workProgressService.startWork(queueItem.complaintId, assignment.officerId);
    await this.lifecycleService.updateStatus(queueItem.complaintId, 'IN_PROGRESS', assignment.officerId, 'Field repair work started');
    await this.workProgressService.updateProgress(queueItem.complaintId, assignment.officerId, 'REPAIR_IN_PROGRESS', 75, 'Asphalt repair underway');
    const completedProgress = await this.workProgressService.markCompleted(queueItem.complaintId, assignment.officerId, 'Physical repair finished on site');
    await this.lifecycleService.updateStatus(queueItem.complaintId, 'WORK_COMPLETED', assignment.officerId, 'Field work marked completed');
    recordStep('5_FIELD_WORKSPACE', { progressState: completedProgress.progressState, percentage: completedProgress.percentage });

    // Stage 6: Evidence Upload & Storage
    const beforeEv = await this.evidenceService.uploadEvidence({
      complaintId: queueItem.complaintId,
      officerId: assignment.officerId,
      type: 'BEFORE_IMAGE',
      fileName: 'before_damage.jpg',
    });
    const afterEv = await this.evidenceService.uploadEvidence({
      complaintId: queueItem.complaintId,
      officerId: assignment.officerId,
      type: 'AFTER_IMAGE',
      fileName: 'after_repair.jpg',
    });
    recordStep('6_EVIDENCE_UPLOAD', { beforeEvidence: beforeEv.fileUrl, afterEvidence: afterEv.fileUrl });

    // Stage 7: Supervisor Verification Sign-Off
    const verificationReq = await this.verificationService.submitForVerification(queueItem.complaintId, assignment.officerId, [beforeEv.id, afterEv.id]);
    const approvedVerification = await this.verificationService.approveEvidence(verificationReq.id, 'supervisor_pwd', 'Work quality inspected and verified');
    await this.lifecycleService.updateStatus(queueItem.complaintId, 'VERIFIED', 'supervisor_pwd', 'Supervisor verified evidence');
    recordStep('7_SUPERVISOR_VERIFICATION', { verificationId: approvedVerification.id, status: approvedVerification.status });

    // Stage 8: Complaint Closure
    const closedState = await this.lifecycleService.updateStatus(queueItem.complaintId, 'CLOSED', 'supervisor_pwd', 'Complaint officially closed and SLA fulfilled');
    recordStep('8_COMPLAINT_CLOSURE', { finalState: closedState.status });

    // Stage 9: Citizen Multi-Channel Notification
    const dispatchedNotifs = await this.notificationService.createAndSendNotification({
      recipientId: rawComplaintInput.citizenId || 'cit_101',
      complaintId: queueItem.complaintId,
      type: 'COMPLAINT_CLOSED',
      title: 'Complaint Resolved & Closed',
      message: `Your civic issue #${queueItem.ticketId} has been successfully resolved and verified.`,
      channels: ['IN_APP', 'EMAIL', 'SMS'],
    });
    recordStep('9_CITIZEN_NOTIFICATION', { countDispatched: dispatchedNotifs.length });

    // Stage 10: Operational Analytics Update
    const updatedSummary = await this.dashboardService.getExecutiveSummary();
    recordStep('10_ANALYTICS_UPDATE', { totalComplaints: updatedSummary.totalComplaints, slaComplianceRate: updatedSummary.slaComplianceRate });

    return {
      success: true,
      complaintId: queueItem.complaintId,
      ticketId: queueItem.ticketId,
      finalStatus: closedState.status,
      pipelineLog,
    };
  }
}

export default EndToEndPipeline;
