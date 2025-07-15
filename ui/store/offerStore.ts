import { create } from 'zustand';
import { api } from '../lib/api';
import { useCompanyStore } from './companyStore';

interface OfferItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Offer {
  id: number;
  offerNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  offerDate: string;
  dueDate?: string;
  currency: 'TRY' | 'USD' | 'EUR';
  notes?: string;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  createdAt: string;
  companyName: string;
  items: OfferItem[];
}

interface CreateOfferData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  offerDate: string;
  dueDate?: string;
  currency: 'TRY' | 'USD' | 'EUR';
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface OfferState {
  offers: Offer[];
  currentOffer: Offer | null;
  loading: boolean;
  error: string | null;
  fetchOffers: () => Promise<void>;
  fetchOffer: (id: number) => Promise<void>;
  createOffer: (data: CreateOfferData) => Promise<Offer>;
  updateOffer: (id: number, data: CreateOfferData) => Promise<Offer>;
  deleteOffer: (id: number) => Promise<void>;
  sendOffer: (id: number) => Promise<void>;
  setCurrentOffer: (offer: Offer | null) => void;
}


export const useOfferStore = create<OfferState>((set, get) => ({
  offers: [],
  currentOffer: null,
  loading: false,
  error: null,

  fetchOffers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/offers');
      set({ offers: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Teklifler yüklenemedi', 
        loading: false 
      });
    }
  },

  fetchOffer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/offers/${id}`);
      set({ currentOffer: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Teklif yüklenemedi', 
        loading: false 
      });
    }
  },

  createOffer: async (data: CreateOfferData) => {
    try {
      const response = await api.post('/api/offers', data);
      const newOffer = response.data;
      
      set((state) => ({
        offers: [newOffer, ...state.offers],
      }));
      
      return newOffer;
    } catch (error: any) {
      console.log("error", error)
      throw new Error(error.response?.data?.message || error.response?.data || 'Teklif oluşturulamadı');
    }
  },

  updateOffer: async (id: number, data: CreateOfferData) => {
    try {
      const response = await api.put(`/api/offers/${id}`, data);
      const updatedOffer = response.data;
      
      set((state) => ({
        offers: state.offers.map((offer) => 
          offer.id === id ? updatedOffer : offer
        ),
        currentOffer: state.currentOffer?.id === id ? updatedOffer : state.currentOffer,
      }));
      
      return updatedOffer;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Teklif güncellenemedi');
    }
  },

  deleteOffer: async (id: number) => {
    try {
      await api.delete(`/api/offers/${id}`);
      
      set((state) => ({
        offers: state.offers.filter((offer) => offer.id !== id),
        currentOffer: state.currentOffer?.id === id ? null : state.currentOffer,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Teklif silinemedi');
    }
  },

  sendOffer: async (id: number) => {
    try {
      const { company, fetchCompany } = useCompanyStore.getState();
      if (company && company.subscriptionPlan === 'Free' && company.offersUsed >= 3) {
        throw new Error('Ücretsiz plan limiti doldu. Lütfen planınızı yükseltin.');
      }

      await api.post(`/api/offers/${id}/send`);

      await fetchCompany();
      
      set((state) => ({
        offers: state.offers.map((offer) => 
          offer.id === id ? { ...offer, status: 'Sent' as const } : offer
        ),
        currentOffer: state.currentOffer?.id === id 
          ? { ...state.currentOffer, status: 'Sent' as const }
          : state.currentOffer,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Teklif gönderilemedi');
    }
  },

  setCurrentOffer: (offer: Offer | null) => {
    set({ currentOffer: offer });
  },
}));