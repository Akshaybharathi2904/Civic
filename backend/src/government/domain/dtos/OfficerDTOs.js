export class CreateOfficerDTO {
  constructor({ name, badgeNumber, designation = 'Field Inspector', departmentId, phone = '' }) {
    if (!name || !badgeNumber || !departmentId) {
      throw new Error('CreateOfficerDTO requires name, badgeNumber, and departmentId.');
    }
    this.name = name;
    this.badgeNumber = badgeNumber;
    this.designation = designation;
    this.departmentId = departmentId;
    this.phone = phone;
  }
}

export default { CreateOfficerDTO };
