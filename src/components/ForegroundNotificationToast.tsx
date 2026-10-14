import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ExternalLink } from 'lucide-react';

export interface ForegroundNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: any;
}

interface ForegroundNotificationToastProps {
  notification: ForegroundNotificationPayload | null;
  onClose: () => void;
  onClick?: () => void;
}

export const ForegroundNotificationToast: React.FC<ForegroundNotificationToastProps> = ({
  notification,
  onClose,
  onClick
}) => {
  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="foreground-push-toast"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900/95 dark:bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-sky-500/40 p-3.5 backdrop-blur-md flex items-start gap-3 cursor-pointer"
        onClick={() => {
          onClick?.();
          onClose();
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-700">
          <img
            src={notification.icon || '/LogoPrincipal.png'}
            alt="Decoelectric"
            className="w-full h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
              Notificación Push
            </span>
          </div>
          <h4 className="text-xs font-bold text-white line-clamp-1">
            {notification.title}
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
            {notification.body}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
