import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, PlusCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/purchases', icon: ShoppingBag, label: 'Purchases' },
    { to: '/add', icon: PlusCircle, label: 'Add' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-50 glass border-b border-gold/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">GT</span>
            </div>
            <span className="font-bold text-gold">Gold Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gold/10 sm:hidden z-50">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-1 text-xs transition-colors ${
                  isActive ? 'text-gold' : 'text-gray-500'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Side nav (desktop) */}
      <nav className="hidden sm:flex fixed left-0 top-14 h-[calc(100vh-56px)] w-52 glass border-r border-gold/10 flex-col p-4 gap-1 z-40">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold/20 text-gold'
                  : 'text-gray-400 hover:bg-surface-light hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
