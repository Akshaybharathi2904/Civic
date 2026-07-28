import { CitizenNotification } from '../models/CitizenNotification.js';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { CreateNotificationDTO, NotificationPreferenceDTO, NotificationQueryDTO } from '../dtos/NotificationDTOs.js';
import { MockCitizenNotificationRepository } from '../repositories/MockCitizenNotificationRepository.js';
import { MockNotificationPreferenceRepository } from '../repositories/MockNotificationPreferenceRepository.js';
import { NotificationDispatcher } from './NotificationDispatcher.js';

export class CitizenNotificationServiceContract {
  async createAndSendNotification(createDTO) { throw new Error('CitizenNotificationServiceContract.createAndSendNotification must be implemented.'); }
  async markAsRead(notificationId) { throw new Error('CitizenNotificationServiceContract.markAsRead must be implemented.'); }
  async deleteNotification(notificationId) { throw new Error('CitizenNotificationServiceContract.deleteNotification must be implemented.'); }
  async getUnreadCount(recipientId) { throw new Error('CitizenNotificationServiceContract.getUnreadCount must be implemented.'); }
  async updatePreferences(prefDTO) { throw new Error('CitizenNotificationServiceContract.updatePreferences must be implemented.'); }
  async retryFailedNotifications() { throw new Error('CitizenNotificationServiceContract.retryFailedNotifications must be implemented.'); }
}

export class CitizenNotificationService extends CitizenNotificationServiceContract {
  constructor(
    notificationRepository = new MockCitizenNotificationRepository(),
    preferenceRepository = new MockNotificationPreferenceRepository(),
    dispatcher = new NotificationDispatcher()
  ) {
    super();
    this.notificationRepository = notificationRepository;
    this.preferenceRepository = preferenceRepository;
    this.dispatcher = dispatcher;
  }

  async createAndSendNotification(input) {
    const dto = new CreateNotificationDTO(input);
    const prefs = await this.preferenceRepository.findByCitizenId(dto.recipientId);

    const dispatchedList = [];

    for (const channel of dto.channels) {
      if (!prefs.isChannelEnabled(channel)) {
        continue; // Skip channel if disabled in citizen preferences
      }

      const notif = new CitizenNotification({
        recipientId: dto.recipientId,
        complaintId: dto.complaintId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        channel,
      });

      try {
        await this.dispatcher.dispatch(notif);
      } catch (err) {
        notif.status = 'FAILED';
      }

      await this.notificationRepository.save(notif);
      dispatchedList.push(notif);
    }

    return dispatchedList;
  }

  async markAsRead(notificationId) {
    const notif = await this.notificationRepository.findById(notificationId);
    if (!notif) throw new Error(`Notification #${notificationId} not found.`);

    notif.markRead();
    return await this.notificationRepository.save(notif);
  }

  async deleteNotification(notificationId) {
    return await this.notificationRepository.delete(notificationId);
  }

  async getUnreadCount(recipientId) {
    return await this.notificationRepository.getUnreadCount(recipientId);
  }

  async getNotifications(queryInput = {}) {
    const dto = new NotificationQueryDTO(queryInput);
    return await this.notificationRepository.findByRecipient(dto.recipientId, dto.unreadOnly);
  }

  async updatePreferences(input) {
    const dto = new NotificationPreferenceDTO(input);
    const pref = new NotificationPreference({
      citizenId: dto.citizenId,
      inAppEnabled: dto.inAppEnabled,
      emailEnabled: dto.emailEnabled,
      smsEnabled: dto.smsEnabled,
      allowedTypes: dto.allowedTypes,
    });
    return await this.preferenceRepository.save(pref);
  }

  async retryFailedNotifications() {
    const failedList = await this.notificationRepository.findFailed();
    const retriedList = [];

    for (const notif of failedList) {
      notif.retryCount++;
      try {
        await this.dispatcher.dispatch(notif);
        notif.status = 'SENT';
      } catch (err) {
        notif.status = 'FAILED';
      }
      await this.notificationRepository.save(notif);
      retriedList.push(notif);
    }

    return retriedList;
  }
}

export default { CitizenNotificationServiceContract, CitizenNotificationService };
