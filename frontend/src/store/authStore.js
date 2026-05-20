import { create } from 'zustand';
import api from '@/lib/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      if (typeof window !== 'undefined') localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/login', { email, password });
      if (typeof window !== 'undefined') localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/register', { name, email, password });
      if (typeof window !== 'undefined') localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, error: null });
  },
  
  clearError: () => set({ error: null })
}));

export default useAuthStore;
