import { NotificationChannelEnum } from './NotificationChannelEnum.js';
import { NotificationTypeEnum } from './NotificationTypeEnum.js';

export class CitizenNotification {
  constructor({
    id = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    recipientId,
    complaintId = null,
    type = NotificationTypeEnum.COMPLAINT_SUBMITTED,
    title,
    message,
    channel = NotificationChannelEnum.IN_APP,
    read = false,
    readAt = null,
    sentAt = new Date().toISOString(),
    status = 'SENT', // SENT, FAILED, PENDING
    retryCount = 0,
  }) {
    this.id = id;
    this.recipientId = recipientId;
    this.complaintId = complaintId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.channel = channel;
    this.read = Boolean(read);
    this.readAt = readAt;
    this.sentAt = sentAt;
    this.status = status;
    this.retryCount = retryCount;
  }

  markRead() {
    this.read = true;
    this.readAt = new Date().toISOString();
  }
}

export default CitizenNotification;
