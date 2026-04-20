import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/30">
            <span className="text-black font-bold text-2xl">GT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Gold Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Track your gold investments</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-surface-light border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-surface-light border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-light border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-gradient text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>

          {!isRegister && (
            <Link
              to="/forgot-password"
              className="block text-center text-sm text-gold/80 hover:text-gold mt-4 transition-colors"
            >
              Forgot Password?
            </Link>
          )}

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setLocalError(''); clearError(); }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <span className="text-gold">{isRegister ? 'Login' : 'Sign up'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
