export class CreateOfficeDTO {
  constructor({ name, officeCode, departmentId, zone = 'Central Zone', ward = 'Ward 72', address = '' }) {
    if (!name || !departmentId) {
      throw new Error('CreateOfficeDTO requires name and departmentId.');
    }
    this.name = name;
    this.officeCode = officeCode;
    this.departmentId = departmentId;
    this.zone = zone;
    this.ward = ward;
    this.address = address;
  }
}

export class UpdateOfficeDTO {
  constructor({ name, zone, ward, address, active }) {
    this.name = name;
    this.zone = zone;
    this.ward = ward;
    this.address = address;
    this.active = active;
  }
}

export default { CreateOfficeDTO, UpdateOfficeDTO };
