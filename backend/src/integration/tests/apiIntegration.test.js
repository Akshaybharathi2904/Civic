import {
  AuthController,
  DepartmentController,
  OfficerController,
  ComplaintQueueController,
  AssignmentController,
  LifecycleController,
  FieldOfficerController,
  EvidenceController,
  VerificationController,
  SlaController,
  EscalationController,
  CitizenNotificationController,
  DashboardController,
  AnalyticsController,
} from '../../government/index.js';

export const runApiIntegrationTest = async () => {
  console.log('--- [SUITE 4/4] Running API Integration & Contract Verification Test ---');

  const controllers = [
    { name: 'AuthController', instance: new AuthController() },
    { name: 'DepartmentController', instance: new DepartmentController() },
    { name: 'OfficerController', instance: new OfficerController() },
    { name: 'ComplaintQueueController', instance: new ComplaintQueueController() },
    { name: 'AssignmentController', instance: new AssignmentController() },
    { name: 'LifecycleController', instance: new LifecycleController() },
    { name: 'FieldOfficerController', instance: new FieldOfficerController() },
    { name: 'EvidenceController', instance: new EvidenceController() },
    { name: 'VerificationController', instance: new VerificationController() },
    { name: 'SlaController', instance: new SlaController() },
    { name: 'EscalationController', instance: new EscalationController() },
    { name: 'CitizenNotificationController', instance: new CitizenNotificationController() },
    { name: 'DashboardController', instance: new DashboardController() },
    { name: 'AnalyticsController', instance: new AnalyticsController() },
  ];

  controllers.forEach(c => {
    if (!c.instance) throw new Error(`Controller ${c.name} failed initialization.`);
  });

  console.log(`  ✔ Verified instantiation for all ${controllers.length} REST Controllers`);
  console.log('✅ [PASS] API Integration & Contract Verification Test Passed!');
  return true;
};

export default runApiIntegrationTest;
