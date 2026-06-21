import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Calculator, Sparkles, Trophy, User, Leaf, Sun, Moon,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { EcoBackground } from '@/components/ui/EcoBackground';
import { DashboardChat } from '@/components/dashboard/DashboardChat';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';

const BOTTOM_NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Home'       },
  { to: '/log',        icon: Activity,         label: 'Log'        },
  { to: '/calculator', icon: Calculator,       label: 'Calc'       },
  { to: '/insights',   icon: Sparkles,         label: 'AI'         },
  { to: '/challenges', icon: Trophy,           label: 'Challenges' },
  { to: '/profile',    icon: User,             label: 'Profile'    },
];

export const AppLayout: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen flex transition-colors duration-200">
      <EcoBackground />

      {/* Desktop sidebar (hidden on mobile) */}
      <Sidebar />

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4
                         bg-white dark:bg-carbon-900 border-b border-carbon-200 dark:border-carbon-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center shadow shadow-green-500/30">
            <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-carbon-900 dark:text-white tracking-tight">EcoTrack</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-carbon-400 hover:bg-carbon-100 dark:hover:bg-carbon-800 transition-colors"
        >
          {theme === 'dark'
            ? <Sun  className="h-5 w-5 text-amber-400" />
            : <Moon className="h-5 w-5" />}
        </button>
      </header>

      {/* Main content */}
      <main
        className="relative flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0 pb-16 lg:pb-0"
        style={{ zIndex: 2 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Universal AI chatbot — available on all pages */}
      <DashboardChat />

      {/* Mobile bottom nav */}
      <nav
        aria-label="Main navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16
                   bg-white dark:bg-carbon-900 border-t border-carbon-200 dark:border-carbon-700
                   flex items-center justify-around"
      >
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors',
                isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-carbon-400 dark:text-carbon-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-1 rounded-lg transition-colors',
                  isActive ? 'bg-green-50 dark:bg-green-900/30' : ''
                )}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
