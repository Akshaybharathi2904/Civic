import { OfficerService } from '../../../officers/OfficerModule.js';

export class OfficerAvailabilityService {
  constructor(officerService = new OfficerService()) {
    this.officerService = officerService;
  }

  async getEligibleOfficers(departmentId, ward = null, zone = null) {
    const officers = await this.officerService.getAllOfficers();
    return officers.filter((o) => {
      const isDeptMatch = !departmentId || o.departmentId === departmentId;
      const isActive = o.status === 'ACTIVE';
      const isAvailable = o.availabilityStatus === 'AVAILABLE';
      return isDeptMatch && isActive && isAvailable;
    });
  }
}

export default OfficerAvailabilityService;
