import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, PlusCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/purchases', icon: ShoppingBag, label: 'Purchases' },
  { to: '/add', icon: PlusCircle, label: 'Add' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-gold/[0.08] h-14 flex items-center">
        <div className="flex items-center justify-between w-full px-4 sm:px-5">
          {/* Logo — visible on mobile */}
          <div className="sm:hidden flex items-center gap-2.5">
            <div className="w-7 h-7 border border-gold/40 flex items-center justify-center bg-gold/8">
              <span className="font-display text-gold text-sm font-semibold leading-none">K</span>
            </div>
            <span className="font-display text-gold text-base font-medium tracking-wide">Karat</span>
          </div>

          {/* Desktop: spacer for sidebar */}
          <div className="hidden sm:block w-52 shrink-0" />

          {/* Right: user + logout */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-muted hidden sm:block">{user?.name}</span>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 text-faint hover:text-crimson transition-colors p-1.5 rounded"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-4">
        {/* Sidebar — desktop */}
        <nav className="hidden sm:flex fixed left-0 top-14 h-[calc(100vh-56px)] w-52 flex-col border-r border-gold/[0.08] p-5 z-40 bg-background">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8 px-1">
            <div className="w-7 h-7 border border-gold/40 flex items-center justify-center bg-gold/8 shrink-0">
              <span className="font-display text-gold text-sm font-semibold leading-none">K</span>
            </div>
            <span className="font-display text-gold text-base font-medium tracking-wide">Karat</span>
          </div>

          {/* Nav links */}
          <div className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'nav-active font-medium'
                      : 'text-muted hover:text-warm hover:bg-gold/[0.05]'
                  }`
                }
              >
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Bottom: user name */}
          <div className="mt-auto pt-4 border-t border-gold/[0.08] px-1">
            <p className="text-xs text-faint truncate">{user?.name}</p>
            <p className="text-xs text-faint/60 truncate mt-0.5">{user?.email}</p>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 sm:pl-56 px-4 sm:px-8 py-7 pb-24 sm:pb-10">
          <div className="max-w-3xl">
            {children}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Sign out?"
        message="You'll need to sign in again to access your portfolio."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        danger
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gold/[0.08] sm:hidden z-50">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-gold' : 'text-faint'
                }`
              }
            >
              <Icon size={19} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
