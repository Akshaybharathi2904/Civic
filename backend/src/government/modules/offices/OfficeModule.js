import { Office } from '../../domain/entities/Office.js';
import { CreateOfficeDTO } from '../../domain/dtos/OfficeDTOs.js';

export class OfficeServiceContract {
  async getAllOffices() { throw new Error('OfficeServiceContract.getAllOffices must be implemented.'); }
  async getOfficesByDepartment(departmentId) { throw new Error('OfficeServiceContract.getOfficesByDepartment must be implemented.'); }
  async createOffice(officeDTO) { throw new Error('OfficeServiceContract.createOffice must be implemented.'); }
}

export class OfficeService extends OfficeServiceContract {
  constructor() {
    super();
    this.offices = new Map();
    const defaultOffice = new Office({ id: 'off_pwd_central', name: 'Central PWD Operations Office', officeCode: 'OFF-PWD-01', departmentId: 'PWD', zone: 'Central Zone', ward: 'Ward 72' });
    this.offices.set(defaultOffice.id, defaultOffice);
  }

  async getAllOffices() {
    return Array.from(this.offices.values());
  }

  async getOfficesByDepartment(departmentId) {
    return Array.from(this.offices.values()).filter((o) => o.departmentId === departmentId);
  }

  async createOffice(officeInput) {
    const dto = new CreateOfficeDTO(officeInput);
    const office = new Office({
      name: dto.name,
      officeCode: dto.officeCode,
      departmentId: dto.departmentId,
      zone: dto.zone,
      ward: dto.ward,
      address: dto.address,
    });
    this.offices.set(office.id, office);
    return office;
  }
}

export class OfficeController {
  constructor(service = new OfficeService()) {
    this.service = service;
  }

  async list(req, res, next) {
    try {
      const offices = await this.service.getAllOffices();
      return res.status(200).json({ success: true, data: offices });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const office = await this.service.createOffice(req.body);
      return res.status(201).json({ success: true, data: office });
    } catch (err) { next(err); }
  }
}

export default { OfficeServiceContract, OfficeService, OfficeController };
