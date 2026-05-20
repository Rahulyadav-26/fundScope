import { create } from 'zustand';
import api from '@/lib/axios';

const useScreenerStore = create((set, get) => ({
  funds: [],
  isLoading: false,
  error: null,
  
  // Filter state
  filters: {
    search: '',
    category: 'all',
    amc: 'all',
    sortCol: 'aum',
    sortDir: 'desc' // 'asc' or 'desc'
  },
  
  // Compare state
  compareList: [], // Array of fund objects (max 3)
  
  // Modal state
  selectedFund: null,
  
  // Actions
  fetchFunds: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/funds`);
      set({ funds: res.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching funds:", error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  resetFilters: () => {
    set((state) => ({
      filters: { search: '', category: 'all', amc: 'all', sortCol: 'aum', sortDir: 'desc' }
    }));
  },
  
  toggleCompare: (fund) => {
    set((state) => {
      const exists = state.compareList.find(f => f._id === fund._id || f.schemeCode === fund.schemeCode);
      if (exists) {
        return { compareList: state.compareList.filter(f => f._id !== fund._id && f.schemeCode !== fund.schemeCode) };
      } else {
        if (state.compareList.length >= 3) return state; // Max 3
        return { compareList: [...state.compareList, fund] };
      }
    });
  },
  
  clearCompare: () => {
    set({ compareList: [] });
  },
  
  setSelectedFund: (fund) => {
    set({ selectedFund: fund });
  }
}));

export default useScreenerStore;
