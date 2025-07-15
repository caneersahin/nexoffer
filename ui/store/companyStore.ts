import { create } from 'zustand';
import { api } from '../lib/api';

interface Company {
  id: number;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  taxNumber?: string;
  iban?: string;
  website?: string;
  subscriptionPlan: string;
  offersUsed: number;
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  isActive: boolean;
}

interface UpdateCompanyData {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxNumber?: string;
  iban?: string;
  website?: string;
}

interface CompanyState {
  company: Company | null;
  loading: boolean;
  error: string | null;
  fetchCompany: () => Promise<void>;
  updateCompany: (data: UpdateCompanyData) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  upgradePlan: (plan: string, amount: number) => Promise<void>;
}


export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: null,
  loading: false,
  error: null,

  fetchCompany: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/company/me');
      set({ company: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Şirket bilgileri yüklenemedi', 
        loading: false 
      });
    }
  },

  updateCompany: async (data: UpdateCompanyData) => {
    try {
      const response = await api.put('/api/company', data);
      set({ company: response.data });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Şirket bilgileri güncellenemedi');
    }
  },

  uploadLogo: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      await api.post('/api/company/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh company data
      await get().fetchCompany();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logo yüklenemedi');
    }
  },

  upgradePlan: async (plan: string, amount: number) => {
    try {
      const response = await api.post('/api/company/upgrade', {
        plan,
        amount,
        transactionId: Math.random().toString(36).substring(2, 10),
      });
      set({ company: response.data });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Plan yükseltilemedi');
    }
  },
}));