import { create } from 'zustand';
import { api } from '../lib/api';

export interface Payment {
  id: number;
  amount: number;
  paidAt: string;
  transactionId?: string;
}

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  fetchPayments: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: false,
  error: null,
  fetchPayments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/company/payments');
      set({ payments: res.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ödemeler yüklenemedi',
        loading: false,
      });
    }
  },
}));
