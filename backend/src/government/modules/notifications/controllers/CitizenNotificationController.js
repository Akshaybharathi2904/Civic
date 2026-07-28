import { CitizenNotificationService } from '../services/CitizenNotificationService.js';

export class CitizenNotificationController {
  constructor(notificationService = new CitizenNotificationService()) {
    this.notificationService = notificationService;
  }

  async send(req, res, next) {
    try {
      const sentList = await this.notificationService.createAndSendNotification(req.body);
      return res.status(201).json({
        success: true,
        message: `Notification dispatched across ${sentList.length} channels.`,
        data: sentList,
      });
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const notifications = await this.notificationService.getNotifications(req.query);
      return res.status(200).json({ success: true, data: notifications });
    } catch (err) { next(err); }
  }

  async markRead(req, res, next) {
    try {
      const readNotif = await this.notificationService.markAsRead(req.params.id);
      return res.status(200).json({ success: true, message: 'Notification marked as read.', data: readNotif });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await this.notificationService.deleteNotification(req.params.id);
      return res.status(200).json({ success: true, message: 'Notification deleted.' });
    } catch (err) { next(err); }
  }

  async getUnreadCount(req, res, next) {
    try {
      const recipientId = req.query.recipientId || (req.govUser && req.govUser.id) || 'cit_101';
      const count = await this.notificationService.getUnreadCount(recipientId);
      return res.status(200).json({ success: true, data: { unreadCount: count } });
    } catch (err) { next(err); }
  }

  async updatePreferences(req, res, next) {
    try {
      const pref = await this.notificationService.updatePreferences(req.body);
      return res.status(200).json({ success: true, message: 'Notification preferences updated.', data: pref });
    } catch (err) { next(err); }
  }

  async retryFailed(req, res, next) {
    try {
      const retried = await this.notificationService.retryFailedNotifications();
      return res.status(200).json({ success: true, message: 'Failed notifications retried.', data: retried });
    } catch (err) { next(err); }
  }
}

export default CitizenNotificationController;
