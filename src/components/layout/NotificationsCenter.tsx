import React from 'react';
import { SystemNotification, Language } from '../../types';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  Clock, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface NotificationsCenterProps {
  notifications: SystemNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectDefect?: (defectId: string) => void;
  language: Language;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectDefect,
  language,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'DEFECT_ASSIGNED':
        return <AlertTriangle className="w-4 h-4 text-[#cbd5e1]" />;
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-[#ef4444]" />;
      case 'DEADLINE_APPROACHING':
        return <Clock className="w-4 h-4 text-[#cbd5e1]" />;
      case 'RESOLUTION_SUBMITTED':
        return <Send className="w-4 h-4 text-[#cbd5e1]" />;
      case 'RETURNED_FOR_REWORK':
        return <RotateCcw className="w-4 h-4 text-[#ef4444]" />;
      case 'DEFECT_CLOSED':
        return <CheckCircle2 className="w-4 h-4 text-[#10b981]" />;
      default:
        return <Info className="w-4 h-4 text-[#E9EDF2]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-md bg-[#0a272c] border-l border-[#1b535c] h-full shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1b535c] bg-[#071f23] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#334155]/60 text-white border border-[#64748b]/50">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {language === 'UZ' ? 'Тизим хабарномалари' : 'Уведомления системы'}
              </h3>
              <p className="text-[11px] text-[#E9EDF2]/60">
                {unreadCount > 0 
                  ? (language === 'UZ' ? `${unreadCount} та янги хабарнома` : `${unreadCount} новых уведомлений`)
                  : (language === 'UZ' ? 'Барча хабарлар ўқилган' : 'Все уведомления прочитаны')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] text-[#cbd5e1] hover:text-white hover:underline font-bold flex items-center gap-1 cursor-pointer"
                title={language === 'UZ' ? 'Барчасини ўқилган деб белгилаш' : 'Отметить все прочитанными'}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{language === 'UZ' ? 'Барчаси' : 'Все'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#E9EDF2]/60 hover:text-white hover:bg-[#154c55] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1b535c]/50 custom-scrollbar p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-[#E9EDF2]/50 text-xs">
              <Bell className="w-8 h-8 text-[#1b535c] mx-auto mb-2 opacity-50" />
              <p>{language === 'UZ' ? 'Хабарномалар мавжуд эмас' : 'Уведомлений нет'}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) onMarkAsRead(n.id);
                  if (n.defectId && onSelectDefect) {
                    onSelectDefect(n.defectId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !n.isRead
                    ? 'bg-[#0f3b42] border-[#64748b] shadow-md'
                    : 'bg-[#0b2e34]/70 border-[#1b535c]/50 hover:bg-[#0f3b42]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#082428] border border-[#1b535c] shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-white truncate">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0"></span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#E9EDF2]/80 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-[#1b535c]/40 text-[10px] text-[#E9EDF2]/50 font-mono">
                      <span>{n.createdAt}</span>
                      {n.defectId && (
                        <span className="text-[#cbd5e1] font-bold">
                          {n.defectId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
