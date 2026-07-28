export const PermissionEnum = Object.freeze({
  COMPLAINT_READ: 'complaint:read',
  COMPLAINT_WRITE: 'complaint:write',
  COMPLAINT_ASSIGN: 'complaint:assign',
  COMPLAINT_ESCALATE: 'complaint:escalate',
  COMPLAINT_RESOLVE: 'complaint:resolve',
  DEPARTMENT_MANAGE: 'department:manage',
  OFFICER_MANAGE: 'officer:manage',
  USER_MANAGE: 'user:manage',
  ANALYTICS_VIEW: 'analytics:view',
  AUDIT_READ: 'audit:read',
});

export default PermissionEnum;
