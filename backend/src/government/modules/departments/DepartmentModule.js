import { Department } from '../../domain/entities/Department.js';
import { GovernmentConfig } from '../../infrastructure/config/government.config.js';

export class DepartmentContract {
  async getAllDepartments() { throw new Error('DepartmentContract.getAllDepartments must be implemented.'); }
  async getDepartmentByCode(code) { throw new Error('DepartmentContract.getDepartmentByCode must be implemented.'); }
}

export class MockDepartmentService extends DepartmentContract {
  constructor() {
    super();
    this.departments = GovernmentConfig.DEPARTMENTS.map(
      d => new Department({ name: d.name, code: d.code, zone: 'Central Zone' })
    );
  }

  async getAllDepartments() {
    return this.departments;
  }

  async getDepartmentByCode(code) {
    return this.departments.find(d => d.code === code) || this.departments[0];
  }
}

export default { DepartmentContract, MockDepartmentService };
