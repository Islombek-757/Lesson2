'use client';
import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationAPI } from '@/lib/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifications();
    } catch {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-xl glass flex items-center justify-center relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl z-50">
          <div className="p-3 border-b border-[var(--card-border)] font-semibold">Notifications</div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-[var(--muted-foreground)]">No notifications</p>
          ) : (
            <div className="p-2">
              {notifications.map((n) => (
                <div key={n._id} className={`p-3 rounded-lg mb-2 ${n.isRead ? 'bg-transparent' : 'bg-indigo-500/10'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)} className="text-green-500">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
