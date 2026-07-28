import { RoleMatrix } from './RoleMatrix.js';

export class GovernmentUserAuth {
  constructor({
    id = `usr_gov_${Date.now()}`,
    username,
    email,
    passwordHash,
    salt,
    role = 'FIELD_OFFICER',
    departmentId = null,
    district = 'Coimbatore',
    active = true,
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.salt = salt;
    this.role = role;
    this.permissions = RoleMatrix[role] || [];
    this.departmentId = departmentId;
    this.district = district;
    this.active = Boolean(active);
    this.lastLoginAt = null;
    this.createdAt = new Date().toISOString();
  }

  hasPermission(permission) {
    return this.permissions.includes(permission);
  }

  hasRole(requiredRole) {
    return this.role === requiredRole;
  }
}

export default GovernmentUserAuth;
