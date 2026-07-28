export class GovernmentUser {
  constructor({
    id = `usr_gov_${Date.now()}`,
    username,
    email,
    role = 'FIELD_INSPECTOR',
    departmentId = null,
    active = true,
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.departmentId = departmentId;
    this.active = Boolean(active);
    this.createdAt = new Date().toISOString();
  }
}

export default GovernmentUser;
