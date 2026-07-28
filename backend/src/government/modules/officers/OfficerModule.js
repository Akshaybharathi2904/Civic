import { Officer } from '../../domain/entities/Officer.js';

export class OfficerContract {
  async getAllOfficers() { throw new Error('OfficerContract.getAllOfficers must be implemented.'); }
  async getOfficerById(id) { throw new Error('OfficerContract.getOfficerById must be implemented.'); }
}

export class MockOfficerService extends OfficerContract {
  constructor() {
    super();
    this.officers = [
      new Officer({ id: 'off_01', name: 'Rajesh Kumar', badgeNumber: 'PWD-8041', designation: 'Senior PWD Inspector', departmentId: 'PWD' }),
      new Officer({ id: 'off_02', name: 'Anita Sharma', badgeNumber: 'WSSB-3021', designation: 'Water Board Engineer', departmentId: 'WSSB' }),
    ];
  }

  async getAllOfficers() {
    return this.officers;
  }

  async getOfficerById(id) {
    return this.officers.find(o => o.id === id) || this.officers[0];
  }
}

export default { OfficerContract, MockOfficerService };
