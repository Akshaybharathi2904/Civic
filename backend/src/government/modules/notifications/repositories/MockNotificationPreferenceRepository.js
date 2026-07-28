import { NotificationPreference } from '../models/NotificationPreference.js';

export class NotificationPreferenceRepositoryContract {
  async save(preference) { throw new Error('NotificationPreferenceRepositoryContract.save must be implemented.'); }
  async findByCitizenId(citizenId) { throw new Error('NotificationPreferenceRepositoryContract.findByCitizenId must be implemented.'); }
}

export class MockNotificationPreferenceRepository extends NotificationPreferenceRepositoryContract {
  constructor() {
    super();
    this.preferences = new Map();
  }

  async save(preference) {
    this.preferences.set(preference.citizenId, preference);
    return preference;
  }

  async findByCitizenId(citizenId) {
    return this.preferences.get(citizenId) || new NotificationPreference({ citizenId });
  }
}

export default { NotificationPreferenceRepositoryContract, MockNotificationPreferenceRepository };
