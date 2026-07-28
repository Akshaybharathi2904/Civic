export class Officer {
  constructor({
    id = `off_${Date.now()}`,
    name,
    badgeNumber,
    designation = 'Field Inspector',
    departmentId,
    activeCases = 0,
    phone = '',
  }) {
    this.id = id;
    this.name = name;
    this.badgeNumber = badgeNumber;
    this.designation = designation;
    this.departmentId = departmentId;
    this.activeCases = activeCases;
    this.phone = phone;
  }
}

export default Officer;
