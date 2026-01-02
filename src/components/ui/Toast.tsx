'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'celebration' | 'warning';
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

function ToastItem({ id, message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const types = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-pink-500',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    celebration: 'bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={cn(
        'px-6 py-4 rounded-2xl text-white font-semibold shadow-2xl',
        types[type]
      )}
    >
      {message}
    </motion.div>
  );
}

// Hook para gerenciar toasts
let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export function toast(message: string, type: Toast['type'] = 'info', duration = 3000) {
  const newToast: Toast = {
    id: `toast-${++toastId}`,
    message,
    type,
    duration,
  };
  listeners.forEach((listener) => listener(newToast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addToast = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
    };

    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
