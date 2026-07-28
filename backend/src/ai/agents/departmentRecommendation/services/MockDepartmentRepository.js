import { DepartmentRepositoryContract } from './DepartmentRepositoryContract.js';
import { DepartmentConfig } from '../config/department.config.js';

export class MockDepartmentRepository extends DepartmentRepositoryContract {
  constructor() {
    super();
    this.departmentDb = new Map(Object.entries(DepartmentConfig.DEPARTMENTS));
  }

  async getDepartmentByCode(code) {
    return this.departmentDb.get(code) || this.departmentDb.get('PWD');
  }

  async getAllDepartments() {
    return Array.from(this.departmentDb.values());
  }
}

export default MockDepartmentRepository;
