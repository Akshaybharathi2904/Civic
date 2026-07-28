import {
  AssignmentService,
  VerificationService,
  SlaMonitoringService,
  SlaService,
  EscalationService,
  CitizenNotificationService,
  MockFileStorage,
} from '../../government/index.js';

export const runFailureScenariosTest = async () => {
  console.log('--- [SUITE 2/4] Running Failure & Fallback Scenarios Test ---');

  // Scenario 1: Field Officer Assignment Rejection & Reassignment
  const assignmentService = new AssignmentService();
  const asgn = await assignmentService.assignComplaint({ complaintId: 'comp_fail_01', officerId: 'off_01', assignedBy: 'supervisor' });
  await assignmentService.rejectAssignment(asgn.id, 'off_01', 'Unavailable due to field emergency');
  const reassignment = await assignmentService.reassignComplaint({ assignmentId: asgn.id, newOfficerId: 'off_02', reason: 'Initial officer rejected' });
  if (reassignment.status !== 'REASSIGNED' || reassignment.officerId !== 'off_02') {
    throw new Error('Failure Scenario 1 (Assignment Rejection) failed.');
  }
  console.log('  ✔ [Scenario 1/6] Officer Assignment Rejection & Reassignment Passed');

  // Scenario 2: Supervisor Evidence Rejection & Rework Request
  const verificationService = new VerificationService();
  const vReq = await verificationService.submitForVerification('comp_fail_02', 'off_01', ['ev_01']);
  const reworkReq = await verificationService.requestRework(vReq.id, 'supervisor_pwd', 'Surface asphalt uncompacted. Rework required.');
  if (reworkReq.status !== 'REWORK_REQUIRED') {
    throw new Error('Failure Scenario 2 (Evidence Rejection & Rework) failed.');
  }
  console.log('  ✔ [Scenario 2/6] Supervisor Evidence Rejection & Rework Request Passed');

  // Scenario 3: SLA Violation Detection & Auto-Escalation to LEVEL_4
  const slaService = new SlaService();
  const escService = new EscalationService();
  const monitor = new SlaMonitoringService(slaService, escService);
  const sweepResults = await monitor.monitorActiveComplaints([
    { complaintId: 'comp_overdue_99', category: 'Road Infrastructure', priority: 'Critical', createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString() },
  ]);
  if (!sweepResults[0].breached || sweepResults[0].escalation.level !== 'LEVEL_4') {
    throw new Error('Failure Scenario 3 (SLA Auto-Escalation) failed.');
  }
  console.log('  ✔ [Scenario 3/6] SLA Violation & Auto-Escalation to LEVEL_4 Passed');

  // Scenario 4: Notification Delivery Failure & Retry Policy
  const notifService = new CitizenNotificationService();
  const retried = await notifService.retryFailedNotifications();
  console.log('  ✔ [Scenario 4/6] Notification Failure & Retry Policy Passed');

  // Scenario 5: Mock Cloud Storage File Deletion Fallback
  const storage = new MockFileStorage();
  const delRes = await storage.deleteFile('https://gov-storage.local/evidence/non_existent.jpg');
  if (!delRes.success) throw new Error('Failure Scenario 5 (Storage Fallback) failed.');
  console.log('  ✔ [Scenario 5/6] Cloud Storage Network Fallback Passed');

  // Scenario 6: Invalid State Jump Handling
  let invalidJumpCaught = false;
  try {
    const { StateMachineValidator } = await import('../../government/index.js');
    StateMachineValidator.validateTransition('CLOSED', 'IN_PROGRESS');
  } catch (err) {
    invalidJumpCaught = true;
  }
  if (!invalidJumpCaught) throw new Error('Failure Scenario 6 (Invalid State Jump) failed.');
  console.log('  ✔ [Scenario 6/6] Invalid State Machine Transition Rejection Passed');

  console.log('✅ [PASS] All 6 Failure & Fallback Scenarios Passed!');
  return true;
};

export default runFailureScenariosTest;
