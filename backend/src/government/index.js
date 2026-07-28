// Domain Entities
export { GovernmentUser } from './domain/entities/GovernmentUser.js';
export { Role } from './domain/entities/Role.js';
export { Permission } from './domain/entities/Permission.js';
export { Department } from './domain/entities/Department.js';
export { Office } from './domain/entities/Office.js';
export { Officer } from './domain/entities/Officer.js';
export { RegionAssignment } from './domain/entities/RegionAssignment.js';
export { Complaint } from './domain/entities/Complaint.js';
export { Assignment } from './domain/entities/Assignment.js';
export { Workflow } from './domain/entities/Workflow.js';
export { StatusHistory } from './domain/entities/StatusHistory.js';
export { Evidence } from './domain/entities/Evidence.js';
export { Notification } from './domain/entities/Notification.js';
export { AuditLog } from './domain/entities/AuditLog.js';

// Repository Contracts
export { GovernmentUserRepositoryContract } from './domain/repositories/GovernmentUserRepositoryContract.js';
export { RoleRepositoryContract } from './domain/repositories/RoleRepositoryContract.js';
export { DepartmentRepositoryContract } from './domain/repositories/DepartmentRepositoryContract.js';
export { OfficeRepositoryContract } from './domain/repositories/OfficeRepositoryContract.js';
export { OfficerRepositoryContract } from './domain/repositories/OfficerRepositoryContract.js';
export { RegionAssignmentRepositoryContract } from './domain/repositories/RegionAssignmentRepositoryContract.js';
export { GovernmentComplaintRepositoryContract } from './domain/repositories/GovernmentComplaintRepositoryContract.js';
export { AssignmentRepositoryContract } from './domain/repositories/AssignmentRepositoryContract.js';
export { GovernmentWorkflowRepositoryContract } from './domain/repositories/GovernmentWorkflowRepositoryContract.js';
export { NotificationRepositoryContract } from './domain/repositories/NotificationRepositoryContract.js';
export { AuditLogRepositoryContract } from './domain/repositories/AuditLogRepositoryContract.js';

// Feature Modules
export {
  AuthConfig,
  PermissionEnum,
  RoleMatrix,
  GovernmentUserAuth,
  BCryptPasswordEncoder,
  JwtService,
  UserDetailsService,
  AuthService,
  AuthController,
  createJwtAuthenticationFilter,
  requireAuth,
  requireRole,
  requirePermission,
  AuthenticationException,
  AccessDeniedException,
} from './modules/auth/index.js';

export { RoleContract, MockRoleService } from './modules/roles/RoleModule.js';
export { DepartmentServiceContract, DepartmentService, DepartmentController } from './modules/departments/DepartmentModule.js';
export { OfficeServiceContract, OfficeService, OfficeController } from './modules/offices/index.js';
export { OfficerServiceContract, OfficerService, OfficerController } from './modules/officers/index.js';

export {
  QueueStatusEnum,
  QueuedComplaint,
  QueueFilterDTO,
  IngestQueueComplaintDTO,
  QueueStatsDTO,
  ComplaintQueueRepositoryContract,
  MockComplaintQueueRepository,
  ComplaintQueueServiceContract,
  ComplaintQueueService,
  ComplaintQueueController,
} from './modules/queue/index.js';

export {
  AssignmentStatusEnum,
  AssignComplaintDTO,
  ReassignComplaintDTO,
  AssignmentDecisionDTO,
  OfficerRecommendationDTO,
  WorkloadCalculator,
  OfficerAvailabilityService,
  RecommendationService,
  MockAssignmentNotificationService,
  MockAssignmentRepository,
  AssignmentServiceContract,
  AssignmentService,
  AssignmentController,
} from './modules/assignments/index.js';

export {
  ComplaintStateEnum,
  ComplaintStatusHistory,
  LifecycleEvent,
  InvalidStateTransitionException,
  UpdateStatusDTO,
  ReopenComplaintDTO,
  ProcessingMetricsDTO,
  StateMachineValidator,
  MockLifecycleEventPublisher,
  StatusHistoryRepositoryContract,
  MockStatusHistoryRepository,
  LifecycleServiceContract,
  LifecycleService,
  LifecycleController,
} from './modules/lifecycle/index.js';

export {
  WorkProgressStateEnum,
  WorkProgress,
  InternalNote,
  UpdateProgressDTO,
  AddInternalNoteDTO,
  SlaCountdownDTO,
  WorkProgressRepositoryContract,
  MockWorkProgressRepository,
  InternalNoteRepositoryContract,
  MockInternalNoteRepository,
  WorkProgressServiceContract,
  WorkProgressService,
  InternalNotesServiceContract,
  InternalNotesService,
  WorkspaceServiceContract,
  WorkspaceService,
  FieldOfficerController,
} from './modules/workspace/index.js';

export {
  EvidenceTypeEnum,
  VerificationStatusEnum,
  FileStorageContract,
  MockFileStorage,
  UploadEvidenceDTO,
  EvidenceSubmissionDTO,
  ReviewVerificationDTO,
  EvidenceRepositoryContract,
  MockEvidenceRepository,
  VerificationRepositoryContract,
  MockVerificationRepository,
  EvidenceServiceContract,
  EvidenceService,
  VerificationServiceContract,
  VerificationService,
  EvidenceController,
  VerificationController,
} from './modules/evidence/index.js';

export { GovernmentComplaintContract, MockGovernmentComplaintService } from './modules/complaints/GovernmentComplaintModule.js';
export { ResolutionWorkflowContract, MockResolutionWorkflowService } from './modules/workflow/ResolutionWorkflowModule.js';
export { GovernmentNotificationContract, MockGovernmentNotificationService } from './modules/notifications/GovernmentNotificationModule.js';
export { GovernmentAnalyticsContract, MockGovernmentAnalyticsService } from './modules/analytics/GovernmentAnalyticsModule.js';
export { AuditContract, MockAuditService } from './modules/audit/AuditModule.js';

// Config, Errors, Logging, Mocks
export { GovernmentConfig } from './infrastructure/config/government.config.js';
export { GovernmentPlatformError } from './errors/GovernmentPlatformError.js';
export { GovernmentLogger } from './logging/GovernmentLogger.js';
export {
  MockGovernmentUserRepository,
  MockDepartmentRepository,
  MockOfficeRepository,
  MockRegionAssignmentRepository,
  MockGovernmentComplaintRepository,
} from './infrastructure/mocks/MockGovernmentRepositories.js';
