import { CommunityResponseRepositoryContract } from './CommunityResponseRepositoryContract.js';

export class MockCommunityResponseRepository extends CommunityResponseRepositoryContract {
  constructor() {
    super();
    this.responses = new Map();

    // Seed mock responses for comp_10029
    this.responses.set('comp_10029', [
      { userId: 'usr_01', action: 'confirm', timestamp: new Date().toISOString() },
      { userId: 'usr_02', action: 'confirm', timestamp: new Date().toISOString() },
      { userId: 'usr_03', action: 'confirm', timestamp: new Date().toISOString() },
      { userId: 'usr_04', action: 'confirm', timestamp: new Date().toISOString() },
      { userId: 'usr_05', action: 'reject', timestamp: new Date().toISOString() },
    ]);
  }

  async recordResponse(complaintId, userId, action) {
    if (!this.responses.has(complaintId)) {
      this.responses.set(complaintId, []);
    }
    const list = this.responses.get(complaintId);
    list.push({ userId, action, timestamp: new Date().toISOString() });
    return list;
  }

  async getResponses(complaintId) {
    return this.responses.get(complaintId) || [];
  }
}

export default MockCommunityResponseRepository;
