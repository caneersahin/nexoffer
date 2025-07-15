'use client';

import { useState } from 'react';
import {
  Eye,
  Edit,
  Send,
  Download,
  MessageCircle,
  Check,
  X,
  Trash2,
  MoreVertical,
} from 'lucide-react';

interface Props {
  onView: () => void;
  onEdit: () => void;
  onSend: () => void;
  onPdf: () => void;
  onWhatsapp: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  showAccept: boolean;
  showReject: boolean;
}

export default function OfferActionsDropdown({
  onView,
  onEdit,
  onSend,
  onPdf,
  onWhatsapp,
  onAccept,
  onReject,
  onDelete,
  showAccept,
  showReject,
}: Props) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);
  const handle = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={toggle} className="p-2 text-gray-400 hover:text-gray-600">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button onClick={() => handle(onView)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Eye className="h-4 w-4 mr-2" />Görüntüle
            </button>
            <button onClick={() => handle(onEdit)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Edit className="h-4 w-4 mr-2" />Düzenle
            </button>
            <button onClick={() => handle(onSend)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Send className="h-4 w-4 mr-2" />Gönder
            </button>
            <button onClick={() => handle(onPdf)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Download className="h-4 w-4 mr-2" />PDF
            </button>
            <button onClick={() => handle(onWhatsapp)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
              <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
            </button>
            {showAccept && onAccept && (
              <button onClick={() => handle(onAccept)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Check className="h-4 w-4 mr-2" />Onayla
              </button>
            )}
            {showReject && onReject && (
              <button onClick={() => handle(onReject)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                <X className="h-4 w-4 mr-2" />Reddet
              </button>
            )}
            <button onClick={() => handle(onDelete)} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Trash2 className="h-4 w-4 mr-2" />Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
