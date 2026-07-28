export class NotificationPreference {
  constructor({
    id = `pref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    citizenId,
    inAppEnabled = true,
    emailEnabled = true,
    smsEnabled = true,
    allowedTypes = [],
  }) {
    this.id = id;
    this.citizenId = citizenId;
    this.inAppEnabled = Boolean(inAppEnabled);
    this.emailEnabled = Boolean(emailEnabled);
    this.smsEnabled = Boolean(smsEnabled);
    this.allowedTypes = allowedTypes;
    this.updatedAt = new Date().toISOString();
  }

  isChannelEnabled(channel) {
    if (channel === 'IN_APP') return this.inAppEnabled;
    if (channel === 'EMAIL') return this.emailEnabled;
    if (channel === 'SMS') return this.smsEnabled;
    return true;
  }
}

export default NotificationPreference;
