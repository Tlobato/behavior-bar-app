import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTrash } from 'react-icons/fa';
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
  onClearAll?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead, onNotificationClick, onClearAll }) => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
          <div className="notification-dropdown-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Notificações</span>
            {sortedNotifications.length > 0 && (
              <button
                className="notification-clear-btn"
                title="Limpar todas"
                onClick={onClearAll}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18, padding: 0 }}
              >
                <FaTrash />
              </button>
            )}
          </div>
          {sortedNotifications.length === 0 ? (
            <div className="notification-empty">Nenhuma notificação</div>
          ) : (
            <ul className="notification-list">
              {sortedNotifications.map((n) => (
                <li
                  key={n.id}
                  className={n.read ? 'notification-read' : 'notification-unread'}
                  onClick={() => {
                    if (!n.read) onMarkAsRead(n.id);
                    if (onNotificationClick) onNotificationClick(n);
                  }}
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