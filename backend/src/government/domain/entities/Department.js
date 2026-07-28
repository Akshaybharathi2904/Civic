export class Department {
  constructor({
    id = `dept_${Date.now()}`,
    name,
    code,
    zone = 'Central Zone',
    contactEmail = '',
    active = true,
  }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.zone = zone;
    this.contactEmail = contactEmail;
    this.active = Boolean(active);
  }
}

export default Department;
