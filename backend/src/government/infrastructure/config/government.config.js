export const GovernmentConfig = Object.freeze({
  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
    ZONAL_OFFICER: 'ZONAL_OFFICER',
    FIELD_INSPECTOR: 'FIELD_INSPECTOR',
  },
  COMPLAINT_STATUSES: {
    RECEIVED: 'RECEIVED',
    TRIAGED: 'TRIAGED',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    INSPECTION_PENDING: 'INSPECTION_PENDING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
    REJECTED: 'REJECTED',
  },
  DEPARTMENTS: [
    { code: 'PWD', name: 'Public Works Department (PWD)' },
    { code: 'WSSB', name: 'Water Supply & Sewerage Board (WSSB)' },
    { code: 'ESLD', name: 'Electricity & Street Lighting Dept (ESLD)' },
    { code: 'SWMD', name: 'Solid Waste Management Dept (SWMD)' },
    { code: 'TPSB', name: 'Traffic & Public Safety Board' },
  ],
});

export default GovernmentConfig;
