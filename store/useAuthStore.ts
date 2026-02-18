
import { create } from 'zustand';
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setAuth: (user, profile) => set({ user, profile, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    // Sign out logic is handled in AuthProvider but we clear store here
    set({ user: null, profile: null, isLoading: false });
  },
}));
