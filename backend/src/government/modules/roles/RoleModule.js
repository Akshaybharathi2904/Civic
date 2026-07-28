import { Role } from '../../domain/entities/Role.js';

export class RoleContract {
  async getRoles() { throw new Error('RoleContract.getRoles must be implemented.'); }
  async createRole(roleDTO) { throw new Error('RoleContract.createRole must be implemented.'); }
}

export class MockRoleService extends RoleContract {
  constructor() {
    super();
    this.roles = [
      new Role({ id: 'role_admin', name: 'SUPER_ADMIN', description: 'Platform Administrator' }),
      new Role({ id: 'role_head', name: 'DEPARTMENT_HEAD', description: 'Department Chief' }),
      new Role({ id: 'role_inspector', name: 'FIELD_INSPECTOR', description: 'Field Inspector' }),
    ];
  }

  async getRoles() {
    return this.roles;
  }

  async createRole(roleData) {
    const role = new Role(roleData);
    this.roles.push(role);
    return role;
  }
}

export default { RoleContract, MockRoleService };
