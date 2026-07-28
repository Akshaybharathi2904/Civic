import { Officer } from '../../domain/entities/Officer.js';
import { RegionAssignment } from '../../domain/entities/RegionAssignment.js';
import { CreateOfficerDTO, RegionAssignmentDTO } from '../../domain/dtos/OfficerDTOs.js';

export class OfficerServiceContract {
  async getAllOfficers() { throw new Error('OfficerServiceContract.getAllOfficers must be implemented.'); }
  async createOfficer(officerDTO) { throw new Error('OfficerServiceContract.createOfficer must be implemented.'); }
  async assignRegion(officerId, regionDTO) { throw new Error('OfficerServiceContract.assignRegion must be implemented.'); }
  async updateAvailability(officerId, availabilityStatus) { throw new Error('OfficerServiceContract.updateAvailability must be implemented.'); }
}

export class OfficerService extends OfficerServiceContract {
  constructor() {
    super();
    this.officers = new Map();
    this.regionAssignments = new Map();

    const defaultOfficer = new Officer({
      id: 'off_01',
      name: 'Rajesh Kumar',
      badgeNumber: 'PWD-8041',
      designation: 'Senior PWD Inspector',
      departmentId: 'PWD',
      officeId: 'off_pwd_central',
      status: 'ACTIVE',
      availabilityStatus: 'AVAILABLE',
    });
    this.officers.set(defaultOfficer.id, defaultOfficer);
  }

  async getAllOfficers() {
    return Array.from(this.officers.values());
  }

  async getOfficerById(id) {
    return this.officers.get(id) || null;
  }

  async createOfficer(officerInput) {
    const dto = new CreateOfficerDTO(officerInput);
    const officer = new Officer({
      name: dto.name,
      badgeNumber: dto.badgeNumber,
      designation: dto.designation,
      email: dto.email,
      phone: dto.phone,
      departmentId: dto.departmentId,
      officeId: dto.officeId,
    });
    this.officers.set(officer.id, officer);
    return officer;
  }

  async assignRegion(officerId, regionInput) {
    const dto = new RegionAssignmentDTO(regionInput || {});
    const officer = await this.getOfficerById(officerId);
    if (!officer) throw new Error(`Officer with ID ${officerId} not found.`);

    const assignment = new RegionAssignment({
      officerId,
      ward: dto.ward,
      zone: dto.zone,
      district: dto.district,
    });
    this.regionAssignments.set(officerId, assignment);
    return assignment;
  }

  async updateAvailability(officerId, availabilityStatus) {
    const officer = await this.getOfficerById(officerId);
    if (!officer) throw new Error(`Officer with ID ${officerId} not found.`);

    officer.availabilityStatus = availabilityStatus;
    this.officers.set(officer.id, officer);
    return officer;
  }

  async updateStatus(officerId, status) {
    const officer = await this.getOfficerById(officerId);
    if (!officer) throw new Error(`Officer with ID ${officerId} not found.`);

    officer.status = status;
    this.officers.set(officer.id, officer);
    return officer;
  }

  async getAvailableOfficers(departmentId = null) {
    return Array.from(this.officers.values()).filter(
      (o) => o.status === 'ACTIVE' && o.availabilityStatus === 'AVAILABLE' && (!departmentId || o.departmentId === departmentId)
    );
  }
}

export class OfficerController {
  constructor(service = new OfficerService()) {
    this.service = service;
  }

  async list(req, res, next) {
    try {
      const officers = await this.service.getAllOfficers();
      return res.status(200).json({ success: true, data: officers });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const officer = await this.service.createOfficer(req.body);
      return res.status(201).json({ success: true, data: officer });
    } catch (err) { next(err); }
  }

  async assignRegion(req, res, next) {
    try {
      const assignment = await this.service.assignRegion(req.params.id, req.body);
      return res.status(200).json({ success: true, data: assignment });
    } catch (err) { next(err); }
  }

  async updateAvailability(req, res, next) {
    try {
      const officer = await this.service.updateAvailability(req.params.id, req.body.availabilityStatus);
      return res.status(200).json({ success: true, data: officer });
    } catch (err) { next(err); }
  }
}

export default { OfficerServiceContract, OfficerService, OfficerController };
