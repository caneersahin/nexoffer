'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PaymentModalProps {
  isOpen: boolean;
  plan: string;
  price: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, plan, price, onConfirm, onClose }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setProcessing(true);
    await new Promise((res) => setTimeout(res, 1500));
    await onConfirm();
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {plan} Planı için Ödeme
        </h3>
        <div className="space-y-3 mb-6">
          <input
            className="input w-full"
            placeholder="Kart Numarası"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <div className="flex space-x-2">
            <input
              className="input flex-1"
              placeholder="AA/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <input
              className="input flex-1"
              placeholder="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} disabled={processing} className="btn btn-outline btn-md">
            İptal
          </button>
          <button onClick={handlePay} disabled={processing} className="btn btn-primary btn-md">
            {processing && <LoadingSpinner size="sm" className="mr-2" />} {processing ? 'Ödeniyor...' : `₺${price} Öde`}
          </button>
        </div>
      </div>
    </div>
  );
}
