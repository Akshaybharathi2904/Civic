import { NotificationServiceContract } from './NotificationServiceContract.js';

export class MockNotificationService extends NotificationServiceContract {
  async dispatchNearbyValidationAlert(complaintId, location, options = {}) {
    const radius = location.radiusMeters || 1000;
    const recipientCount = Math.floor(Math.random() * 10) + 5; // 5-15 nearby citizens

    return {
      success: true,
      recipientsNotified: recipientCount,
      radiusMeters: radius,
      channel: 'In-App Push & SMS',
      timestamp: new Date().toISOString(),
    };
  }
}

export default MockNotificationService;
