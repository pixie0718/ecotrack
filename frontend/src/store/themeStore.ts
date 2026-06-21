import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },
    }),
    { name: 'eco-theme' }
  )
);

// Apply saved theme immediately on load (before React renders)
try {
  const saved = localStorage.getItem('eco-theme');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
} catch {}
