import { Department } from '../../domain/entities/Department.js';
import { GovernmentConfig } from '../../infrastructure/config/government.config.js';
import { CreateDepartmentDTO } from '../../domain/dtos/DepartmentDTOs.js';

export class DepartmentServiceContract {
  async getAllDepartments() { throw new Error('DepartmentServiceContract.getAllDepartments must be implemented.'); }
  async getDepartmentByCode(code) { throw new Error('DepartmentServiceContract.getDepartmentByCode must be implemented.'); }
  async createDepartment(departmentDTO) { throw new Error('DepartmentServiceContract.createDepartment must be implemented.'); }
}

export class DepartmentService extends DepartmentServiceContract {
  constructor() {
    super();
    this.departments = new Map();
    GovernmentConfig.DEPARTMENTS.forEach((d) => {
      const dept = new Department({ name: d.name, code: d.code, zone: 'Central Zone' });
      this.departments.set(dept.code, dept);
    });
  }

  async getAllDepartments() {
    return Array.from(this.departments.values());
  }

  async getDepartmentByCode(code) {
    return this.departments.get(code) || null;
  }

  async createDepartment(departmentInput) {
    const dto = new CreateDepartmentDTO(departmentInput);
    const dept = new Department({ name: dto.name, code: dto.code, zone: dto.zone, contactEmail: dto.contactEmail });
    this.departments.set(dept.code, dept);
    return dept;
  }
}

export class DepartmentController {
  constructor(service = new DepartmentService()) {
    this.service = service;
  }

  async list(req, res, next) {
    try {
      const depts = await this.service.getAllDepartments();
      return res.status(200).json({ success: true, data: depts });
    } catch (err) { next(err); }
  }

  async getByCode(req, res, next) {
    try {
      const dept = await this.service.getDepartmentByCode(req.params.code);
      if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
      return res.status(200).json({ success: true, data: dept });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const dept = await this.service.createDepartment(req.body);
      return res.status(201).json({ success: true, data: dept });
    } catch (err) { next(err); }
  }
}

export default { DepartmentServiceContract, DepartmentService, DepartmentController };
