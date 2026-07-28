export class Role {
  constructor({
    id = `role_${Date.now()}`,
    name,
    description = '',
    permissions = [],
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.permissions = permissions;
  }
}

export default Role;
