export const AuthConfig = Object.freeze({
  JWT_SECRET: process.env.GOV_JWT_SECRET || 'gov_platform_super_secret_jwt_key_2026_x99283',
  JWT_EXPIRES_IN: '8h', // 8 hours duration
  JWT_EXPIRATION_SECONDS: 8 * 3600,
  ISSUER: 'GovernmentOperationsPlatform',
  ROLES: {
    STATE_ADMIN: 'STATE_ADMIN',
    DISTRICT_ADMIN: 'DISTRICT_ADMIN',
    MUNICIPAL_COMMISSIONER: 'MUNICIPAL_COMMISSIONER',
    DEPARTMENT_SUPERVISOR: 'DEPARTMENT_SUPERVISOR',
    FIELD_OFFICER: 'FIELD_OFFICER',
    GROUND_WORKER: 'GROUND_WORKER',
  },
});

export default AuthConfig;
