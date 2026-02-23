import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
