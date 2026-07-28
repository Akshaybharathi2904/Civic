import { GovernmentUserRepositoryContract } from '../../domain/repositories/GovernmentUserRepositoryContract.js';
import { DepartmentRepositoryContract } from '../../domain/repositories/DepartmentRepositoryContract.js';
import { GovernmentComplaintRepositoryContract } from '../../domain/repositories/GovernmentComplaintRepositoryContract.js';
import { OfficeRepositoryContract } from '../../domain/repositories/OfficeRepositoryContract.js';
import { RegionAssignmentRepositoryContract } from '../../domain/repositories/RegionAssignmentRepositoryContract.js';

export class MockGovernmentUserRepository extends GovernmentUserRepositoryContract {
  constructor() { super(); this.store = new Map(); }
  async findById(id) { return this.store.get(id) || null; }
  async findByEmail(email) { return Array.from(this.store.values()).find(u => u.email === email) || null; }
  async save(user) { this.store.set(user.id, user); return user; }
  async findAll() { return Array.from(this.store.values()); }
}

export class MockDepartmentRepository extends DepartmentRepositoryContract {
  constructor() { super(); this.store = new Map(); }
  async findById(id) { return this.store.get(id) || null; }
  async findByCode(code) { return Array.from(this.store.values()).find(d => d.code === code) || null; }
  async findAll() { return Array.from(this.store.values()); }
  async save(dept) { this.store.set(dept.id, dept); return dept; }
}

export class MockOfficeRepository extends OfficeRepositoryContract {
  constructor() { super(); this.store = new Map(); }
  async findById(id) { return this.store.get(id) || null; }
  async findByDepartment(departmentId) { return Array.from(this.store.values()).filter(o => o.departmentId === departmentId); }
  async findByZone(zone) { return Array.from(this.store.values()).filter(o => o.zone === zone); }
  async save(office) { this.store.set(office.id, office); return office; }
  async findAll() { return Array.from(this.store.values()); }
}

export class MockRegionAssignmentRepository extends RegionAssignmentRepositoryContract {
  constructor() { super(); this.store = new Map(); }
  async findById(id) { return this.store.get(id) || null; }
  async findByOfficer(officerId) { return Array.from(this.store.values()).filter(r => r.officerId === officerId); }
  async save(assignment) { this.store.set(assignment.id, assignment); return assignment; }
}

export class MockGovernmentComplaintRepository extends GovernmentComplaintRepositoryContract {
  constructor() { super(); this.store = new Map(); }
  async findById(id) { return this.store.get(id) || null; }
  async findByTicketId(ticketId) { return Array.from(this.store.values()).find(c => c.ticketId === ticketId) || null; }
  async findByDepartment(departmentId) { return Array.from(this.store.values()).filter(c => c.departmentId === departmentId); }
  async save(complaint) { this.store.set(complaint.id, complaint); return complaint; }
  async findAll() { return Array.from(this.store.values()); }
}

export default {
  MockGovernmentUserRepository,
  MockDepartmentRepository,
  MockOfficeRepository,
  MockRegionAssignmentRepository,
  MockGovernmentComplaintRepository,
};
