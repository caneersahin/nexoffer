import { create } from 'zustand';
import { api } from '../lib/api';

export interface CompanySummary {
  id: number;
  name: string;
  offerCount: number;
  userCount: number;
  subscriptionPlan: string;
}

export interface AdminDashboard {
  companies: CompanySummary[];
  totalCompanies: number;
  proCompanies: number;
  freeCompanies: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueTotal: number;
}

interface AdminState {
  dashboard: AdminDashboard | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  upgradeCompany: (id: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboard: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/admin/dashboard');
      set({ dashboard: res.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Yönetici verileri yüklenemedi',
        loading: false,
      });
    }
  },

  upgradeCompany: async (id: number) => {
    try {
      await api.post(`/api/admin/companies/${id}/upgrade`, {
        plan: 'Pro',
        amount: 0,
        transactionId: 'admin',
      });
      // Refresh dashboard after upgrade
      await (useAdminStore.getState().fetchDashboard());
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Şirket yükseltilemedi');
    }
  },
}));
