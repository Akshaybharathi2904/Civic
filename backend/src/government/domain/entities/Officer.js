export class Officer {
  constructor({
    id = `off_${Date.now()}`,
    name,
    badgeNumber,
    designation = 'Field Inspector',
    email = '',
    phone = '',
    departmentId,
    officeId = null,
    status = 'ACTIVE',
    availabilityStatus = 'AVAILABLE',
    activeCases = 0,
  }) {
    this.id = id;
    this.name = name;
    this.badgeNumber = badgeNumber;
    this.designation = designation;
    this.email = email;
    this.phone = phone;
    this.departmentId = departmentId;
    this.officeId = officeId;
    this.status = status; // ACTIVE, ON_LEAVE, SUSPENDED, INACTIVE
    this.availabilityStatus = availabilityStatus; // AVAILABLE, BUSY, ON_FIELD_DISPATCH, OFF_DUTY
    this.activeCases = activeCases;
    this.createdAt = new Date().toISOString();
  }
}

export default Officer;
