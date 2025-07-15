'use client';

import { ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  children?: ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'danger',
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      default:
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className={`h-6 w-6 ${typeStyles.icon} mr-3`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn btn-outline btn-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn btn-md ${typeStyles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}