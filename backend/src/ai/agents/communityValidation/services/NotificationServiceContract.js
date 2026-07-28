export class NotificationServiceContract {
  /**
   * Abstract method: Dispatch community validation alert to nearby registered citizens
   */
  async dispatchNearbyValidationAlert(complaintId, location, options = {}) {
    throw new Error('NotificationServiceContract.dispatchNearbyValidationAlert must be implemented by concrete notification service.');
  }
}

export default NotificationServiceContract;
