import { PermissionEnum } from './PermissionEnum.js';

export const RoleMatrix = Object.freeze({
  STATE_ADMIN: [
    PermissionEnum.COMPLAINT_READ,
    PermissionEnum.COMPLAINT_WRITE,
    PermissionEnum.COMPLAINT_ASSIGN,
    PermissionEnum.COMPLAINT_ESCALATE,
    PermissionEnum.COMPLAINT_RESOLVE,
    PermissionEnum.DEPARTMENT_MANAGE,
    PermissionEnum.OFFICER_MANAGE,
    PermissionEnum.USER_MANAGE,
    PermissionEnum.ANALYTICS_VIEW,
    PermissionEnum.AUDIT_READ,
  ],
  DISTRICT_ADMIN: [
    PermissionEnum.COMPLAINT_READ,
    PermissionEnum.COMPLAINT_WRITE,
    PermissionEnum.COMPLAINT_ASSIGN,
    PermissionEnum.COMPLAINT_ESCALATE,
    PermissionEnum.DEPARTMENT_MANAGE,
    PermissionEnum.OFFICER_MANAGE,
    PermissionEnum.ANALYTICS_VIEW,
    PermissionEnum.AUDIT_READ,
  ],
  MUNICIPAL_COMMISSIONER: [
    PermissionEnum.COMPLAINT_READ,
    PermissionEnum.COMPLAINT_ESCALATE,
    PermissionEnum.DEPARTMENT_MANAGE,
    PermissionEnum.ANALYTICS_VIEW,
    PermissionEnum.AUDIT_READ,
  ],
  DEPARTMENT_SUPERVISOR: [
    PermissionEnum.COMPLAINT_READ,
    PermissionEnum.COMPLAINT_WRITE,
    PermissionEnum.COMPLAINT_ASSIGN,
    PermissionEnum.OFFICER_MANAGE,
    PermissionEnum.ANALYTICS_VIEW,
  ],
  FIELD_OFFICER: [
    PermissionEnum.COMPLAINT_READ,
    PermissionEnum.COMPLAINT_WRITE,
    PermissionEnum.COMPLAINT_RESOLVE,
  ],
  GROUND_WORKER: [
    PermissionEnum.COMPLAINT_READ,
    PermissionEnum.COMPLAINT_RESOLVE,
  ],
});

export default RoleMatrix;
