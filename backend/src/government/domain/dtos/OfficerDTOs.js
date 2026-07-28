export class CreateOfficerDTO {
  constructor({ name, badgeNumber, designation = 'Field Inspector', email = '', phone = '', departmentId, officeId = null }) {
    if (!name || !badgeNumber || !departmentId) {
      throw new Error('CreateOfficerDTO requires name, badgeNumber, and departmentId.');
    }
    this.name = name;
    this.badgeNumber = badgeNumber;
    this.designation = designation;
    this.email = email;
    this.phone = phone;
    this.departmentId = departmentId;
    this.officeId = officeId;
  }
}

export class OfficerStatusUpdateDTO {
  constructor({ status, availabilityStatus }) {
    this.status = status; // ACTIVE, ON_LEAVE, SUSPENDED, INACTIVE
    this.availabilityStatus = availabilityStatus; // AVAILABLE, BUSY, ON_FIELD_DISPATCH, OFF_DUTY
  }
}

export class RegionAssignmentDTO {
  constructor({ ward = 'Ward 72', zone = 'Central Zone', district = 'Coimbatore' }) {
    this.ward = ward;
    this.zone = zone;
    this.district = district;
  }
}

export default { CreateOfficerDTO, OfficerStatusUpdateDTO, RegionAssignmentDTO };
