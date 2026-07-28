export class CreateNotificationDTO {
  constructor({ recipientId, complaintId = null, type, title, message, channels = ['IN_APP'] }) {
    if (!recipientId || !type || !title || !message) {
      throw new Error('CreateNotificationDTO requires recipientId, type, title, and message.');
    }
    this.recipientId = recipientId;
    this.complaintId = complaintId;
    this.type = type.toUpperCase();
    this.title = title;
    this.message = message;
    this.channels = Array.isArray(channels) ? channels.map(c => c.toUpperCase()) : ['IN_APP'];
  }
}

export class NotificationPreferenceDTO {
  constructor({ citizenId, inAppEnabled = true, emailEnabled = true, smsEnabled = true, allowedTypes = [] }) {
    if (!citizenId) throw new Error('NotificationPreferenceDTO requires citizenId.');
    this.citizenId = citizenId;
    this.inAppEnabled = Boolean(inAppEnabled);
    this.emailEnabled = Boolean(emailEnabled);
    this.smsEnabled = Boolean(smsEnabled);
    this.allowedTypes = allowedTypes;
  }
}

export class NotificationQueryDTO {
  constructor(query = {}) {
    this.recipientId = query.recipientId || null;
    this.unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === true;
    this.page = Math.max(1, parseInt(query.page || '1', 10));
    this.limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  }
}

export default { CreateNotificationDTO, NotificationPreferenceDTO, NotificationQueryDTO };
