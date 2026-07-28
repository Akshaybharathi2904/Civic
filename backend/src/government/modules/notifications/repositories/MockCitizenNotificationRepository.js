export class CitizenNotificationRepositoryContract {
  async save(notification) { throw new Error('CitizenNotificationRepositoryContract.save must be implemented.'); }
  async findById(id) { throw new Error('CitizenNotificationRepositoryContract.findById must be implemented.'); }
  async findByRecipient(recipientId, unreadOnly = false) { throw new Error('CitizenNotificationRepositoryContract.findByRecipient must be implemented.'); }
  async getUnreadCount(recipientId) { throw new Error('CitizenNotificationRepositoryContract.getUnreadCount must be implemented.'); }
  async delete(id) { throw new Error('CitizenNotificationRepositoryContract.delete must be implemented.'); }
  async findFailed() { throw new Error('CitizenNotificationRepositoryContract.findFailed must be implemented.'); }
}

export class MockCitizenNotificationRepository extends CitizenNotificationRepositoryContract {
  constructor() {
    super();
    this.notifications = new Map();
  }

  async save(notification) {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async findById(id) {
    return this.notifications.get(id) || null;
  }

  async findByRecipient(recipientId, unreadOnly = false) {
    return Array.from(this.notifications.values()).filter(
      n => n.recipientId === recipientId && (!unreadOnly || !n.read)
    );
  }

  async getUnreadCount(recipientId) {
    const unread = await this.findByRecipient(recipientId, true);
    return unread.length;
  }

  async delete(id) {
    const existed = this.notifications.has(id);
    this.notifications.delete(id);
    return existed;
  }

  async findFailed() {
    return Array.from(this.notifications.values()).filter(n => n.status === 'FAILED');
  }
}

export default { CitizenNotificationRepositoryContract, MockCitizenNotificationRepository };
