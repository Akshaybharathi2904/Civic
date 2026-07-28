export class NotificationRepositoryContract {
  async findById(id) { throw new Error('NotificationRepositoryContract.findById must be implemented.'); }
  async findByRecipient(recipientId) { throw new Error('NotificationRepositoryContract.findByRecipient must be implemented.'); }
  async save(notification) { throw new Error('NotificationRepositoryContract.save must be implemented.'); }
}

export default NotificationRepositoryContract;
