export class Notification {
  constructor({
    id = `notif_${Date.now()}`,
    recipientId,
    type = 'ALERT',
    title,
    message,
    read = false,
  }) {
    this.id = id;
    this.recipientId = recipientId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.read = Boolean(read);
    this.createdAt = new Date().toISOString();
  }
}

export default Notification;
