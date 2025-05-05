import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

export interface User {
  id: string;
  email: string;
  role: 'MENTOR' | 'MENTEE';
  mentor_id?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'MENTOR' | 'MENTEE', mentorId?: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { token, user } = await api.post('/auth/login', { email, password });
          set({ token, user, isLoading: false });
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, role: 'MENTOR' | 'MENTEE', mentorId?: string) => {
        try {
          set({ isLoading: true, error: null });
          const { token, user } = await api.post('/auth/signup', { 
            email, 
            password, 
            role,
            mentor_id: mentorId 
          });
          set({ token, user, isLoading: false });
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const user = await api.get('/auth/me');
          set({ user, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useAuthStore; 