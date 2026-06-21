import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calculator, Sparkles, Trophy, User,
  LogOut, Leaf, Activity, Sun, Moon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log',       icon: Activity,         label: 'Log Activity' },
  { to: '/calculator',icon: Calculator,       label: 'Calculator' },
  { to: '/insights',  icon: Sparkles,         label: 'AI Insights' },
  { to: '/challenges',icon: Trophy,           label: 'Challenges' },
  { to: '/profile',   icon: User,             label: 'Profile' },
];

export const Sidebar: React.FC = () => {
  const navigate   = useNavigate();
  const { user, tokens, logout } = useAuthStore();
  const { theme, toggleTheme }   = useThemeStore();

  const handleLogout = async () => {
    try { await authService.logout(tokens?.refreshToken); } catch { /* silent */ }
    finally {
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 z-40 transition-colors duration-200
                      bg-white border-r border-carbon-200
                      dark:bg-carbon-900 dark:border-carbon-700">

      {/* Logo + theme toggle */}
      <div className="h-16 flex items-center justify-between px-6
                      border-b border-carbon-100 dark:border-carbon-700">
        <div className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-green-600" />
          <span className="text-xl font-bold text-carbon-900 dark:text-white">EcoTrack</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg transition-colors
                     text-carbon-400 hover:text-carbon-700 hover:bg-carbon-100
                     dark:text-carbon-400 dark:hover:text-white dark:hover:bg-carbon-700"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900 dark:text-carbon-400 dark:hover:bg-carbon-800 dark:hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 shrink-0',
                  isActive ? 'text-green-600 dark:text-green-400' : 'text-carbon-400 dark:text-carbon-500'
                )} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-carbon-100 dark:border-carbon-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
            <span className="text-green-700 dark:text-green-400 font-semibold text-sm">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-carbon-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-carbon-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                     text-carbon-600 hover:text-red-600 hover:bg-red-50
                     dark:text-carbon-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
