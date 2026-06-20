import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types/auth.types';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),

      setTokens: (tokens) =>
        set({ tokens }),

      logout: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    {
      name: 'eco-auth',
      storage: createJSONStorage(() => sessionStorage), // sessionStorage for security (cleared on tab close)
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
