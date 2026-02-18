
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'editor' | 'customer';

interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setAuth: (user: User | null, profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      setAuth: (user, profile) => set({ user, profile, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: async () => {
        set({ user: null, profile: null, isLoading: false });
      },
    }),
    {
      name: 'toursphere-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);
