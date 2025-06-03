import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css';

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  redemptionId?: number;
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead, onNotificationClick }) => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="notification-bell-wrapper" ref={bellRef}>
      <div className="notification-bell-icon" onClick={() => setOpen(!open)}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-title">Notificações</div>
          {notifications.length === 0 ? (
            <div className="notification-empty">Nenhuma notificação</div>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={n.read ? 'notification-read' : 'notification-unread'}
                  onClick={() => onNotificationClick && onNotificationClick(n)}
                  style={{ cursor: onNotificationClick ? 'pointer' : 'default' }}
                >
                  <span>{n.message}</span>
                  {!n.read && (
                    <button
                      className="notification-mark-read"
                      onClick={e => { e.stopPropagation(); onMarkAsRead(n.id); }}
                    >
                      Marcar como lida
                    </button>
                  )}
                  <div className="notification-date">{new Date(n.createdAt).toLocaleString('pt-BR')}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 