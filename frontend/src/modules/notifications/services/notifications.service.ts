import api from '../../../shared/api/apiClient';
import { NotificationItem } from '../../../shared/types';

export const notificationsService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await api.get<NotificationItem[] | { data: NotificationItem[] }>('/notifications');
    return Array.isArray(res) ? res : (res as any).data || [];
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  },
};

export default notificationsService;
