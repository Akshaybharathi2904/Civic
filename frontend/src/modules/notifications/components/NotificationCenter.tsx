import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '../../../shared/types';
import notificationsService from '../services/notifications.service';

export interface NotificationCenterProps {
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const icons = {
    info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    escalation: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    status_change: <Bell className="w-4 h-4 text-purple-400 shrink-0" />,
  };

  return (
    <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Check size={12} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No new notifications</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id || item.id}
              className={`p-3.5 flex items-start gap-3 transition-colors ${
                item.read ? 'bg-slate-900/40 opacity-70' : 'bg-slate-800/30'
              }`}
            >
              {icons[item.type] || <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.message}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
