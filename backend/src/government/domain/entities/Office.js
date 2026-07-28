export class Office {
  constructor({
    id = `off_loc_${Date.now()}`,
    name,
    officeCode,
    departmentId,
    zone = 'Central Zone',
    ward = 'Ward 72',
    address = '',
    active = true,
  }) {
    this.id = id;
    this.name = name;
    this.officeCode = officeCode || `OFF-${Math.floor(Math.random() * 900 + 100)}`;
    this.departmentId = departmentId;
    this.zone = zone;
    this.ward = ward;
    this.address = address;
    this.active = Boolean(active);
    this.createdAt = new Date().toISOString();
  }
}

export default Office;
