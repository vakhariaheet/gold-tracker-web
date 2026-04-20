import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    try {
      if (isRegister) {
        if (!name.trim()) { setLocalError('Name is required'); return; }
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const displayError = localError || error;

  const switchMode = () => {
    setIsRegister(!isRegister);
    setLocalError('');
    clearError();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — decorative, desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 border-r border-gold/[0.08] p-10 relative overflow-hidden">
        {/* Decorative large K */}
        <div className="absolute -bottom-10 -left-8 font-display text-[240px] font-light text-gold/[0.04] leading-none select-none pointer-events-none">
          K
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 border border-gold/40 bg-gold/8 flex items-center justify-center">
            <span className="font-display text-gold font-semibold text-base leading-none">K</span>
          </div>
          <span className="font-display text-gold text-lg font-medium tracking-wide">Karat</span>
        </div>

        {/* Tagline */}
        <div>
          <h2 className="font-display text-4xl font-light text-warm leading-tight mb-4">
            Your precious<br />
            investments,<br />
            <em>precisely tracked.</em>
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-xs">
            Monitor your gold portfolio with real-time market rates, P&L tracking, and full purchase history — all in one place.
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-faint text-xs">24K · 22K · 18K purity support</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 border border-gold/40 bg-gold/8 flex items-center justify-center">
              <span className="font-display text-gold font-semibold text-base leading-none">K</span>
            </div>
            <span className="font-display text-gold text-lg font-medium tracking-wide">Karat</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-medium text-warm mb-1">
              {isRegister ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-muted text-sm">
              {isRegister ? 'Start tracking your gold portfolio' : 'Sign in to your portfolio'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Arjun Kumar"
                  className="vault-input"
                  required
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="vault-input"
                required
                autoFocus={!isRegister}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vault-input pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="bg-crimson-bg border border-crimson/20 rounded-lg px-4 py-3 text-crimson-light text-sm">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full py-3 rounded-lg text-sm mt-2"
            >
              {isLoading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-xs text-muted hover:text-gold transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="mt-7 pt-5 border-t border-gold/[0.08] text-center">
            <button onClick={switchMode} className="text-sm text-muted hover:text-warm transition-colors">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <span className="text-gold">{isRegister ? 'Sign in' : 'Sign up'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
