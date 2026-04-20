import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const token = (location.state as any)?.token || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) navigate('/forgot-password');
  }, [token]);

  const strength = password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak';

  const strengthColors: Record<string, string> = {
    strong: 'bg-emerge',
    medium: 'bg-gold',
    weak: 'bg-crimson',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-warm mb-8 transition-colors text-sm"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          Back
        </button>

        <div className="mb-8">
          <div className="w-10 h-10 bg-gold/10 border border-gold/25 flex items-center justify-center mb-5">
            <span className="font-display text-gold text-lg font-medium">⌖</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-warm mb-1">New Password</h1>
          <p className="text-muted text-sm">Create a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="vault-input pr-11"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength indicator */}
            {password && (
              <div className="mt-2 flex gap-1.5">
                {['weak', 'medium', 'strong'].map((s, i) => (
                  <div
                    key={s}
                    className={`h-0.5 flex-1 rounded-full transition-colors ${
                      (strength === 'strong') ||
                      (strength === 'medium' && i < 2) ||
                      (strength === 'weak' && i === 0)
                        ? strengthColors[strength]
                        : 'bg-faint'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-muted ml-1 capitalize">{strength}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="vault-input"
              required
            />
          </div>

          {error && (
            <div className="bg-crimson-bg border border-crimson/20 rounded-lg px-4 py-3 text-crimson-light text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full py-3 rounded-lg text-sm"
          >
            {isLoading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
