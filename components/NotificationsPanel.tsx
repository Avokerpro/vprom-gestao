import React from 'react';
import { AppNotification } from '../types';
import { X, Check, Bell, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationsPanelProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (tab: any) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  isOpen, 
  onClose, 
  onMarkRead, 
  onDelete, 
  onClearAll,
  onNavigate 
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} className="text-yellow-600" />;
      case 'alert': return <AlertCircle size={18} className="text-red-600" />;
      case 'success': return <CheckCircle size={18} className="text-green-600" />;
      default: return <Info size={18} className="text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-100';
      case 'alert': return 'bg-red-50 border-red-100';
      case 'success': return 'bg-green-50 border-green-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="absolute right-0 top-16 w-full md:w-96 bg-white shadow-xl rounded-lg border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[80vh] m-4 md:m-0 md:mr-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
           <Bell size={18} className="text-vprom-orange" />
           <h3 className="font-bold text-gray-800">Notificações</h3>
           <span className="bg-vprom-dark text-white text-xs px-2 py-0.5 rounded-full">
             {notifications.filter(n => !n.read).length}
           </span>
        </div>
        <div className="flex gap-2">
            {notifications.length > 0 && (
                <button onClick={onClearAll} className="text-xs text-gray-500 hover:text-red-600 underline">
                    Limpar
                </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="mx-auto mb-2 opacity-20" size={32} />
            <p className="text-sm">Nenhuma notificação.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-3 rounded-lg border relative group transition-all ${getBgColor(notif.type)} ${notif.read ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}
            >
              <div className="flex gap-3">
                 <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                 </div>
                 <div className="flex-1 cursor-pointer" onClick={() => { if(notif.actionTab) { onNavigate(notif.actionTab); onClose(); } }}>
                    <h4 className={`text-sm font-bold ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">{new Date(notif.date).toLocaleString()}</p>
                 </div>
              </div>
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {!notif.read && (
                    <button onClick={() => onMarkRead(notif.id)} className="p-1 bg-white rounded-full shadow hover:text-blue-600" title="Marcar como lida">
                        <Check size={12} />
                    </button>
                 )}
                 <button onClick={() => onDelete(notif.id)} className="p-1 bg-white rounded-full shadow hover:text-red-600" title="Excluir">
                    <X size={12} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
