import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Sparkles,
  Trophy,
  User,
  LogOut,
  Leaf,
  Activity,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log', icon: Activity, label: 'Log Activity' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/insights', icon: Sparkles, label: 'AI Insights' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokens, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout(tokens?.refreshToken);
    } catch {
      // Logout even if API call fails
    } finally {
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-carbon-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-carbon-100">
        <Leaf className="h-7 w-7 text-green-600 mr-2" />
        <span className="text-xl font-bold text-carbon-900">EcoTrack</span>
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
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-carbon-600 hover:bg-carbon-50 hover:text-carbon-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-green-600' : 'text-carbon-400'
                  )}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info & logout */}
      <div className="border-t border-carbon-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <span className="text-green-700 font-semibold text-sm">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-carbon-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-carbon-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-carbon-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
