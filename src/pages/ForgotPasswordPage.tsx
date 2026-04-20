import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      navigate('/otp-verification', { state: { email: email.trim() } });
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
          Back to sign in
        </button>

        <div className="mb-8">
          <div className="w-10 h-10 bg-gold/10 border border-gold/25 flex items-center justify-center mb-5">
            <span className="font-display text-gold text-lg font-medium">?</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-warm mb-1">Forgot Password</h1>
          <p className="text-muted text-sm">
            Enter your email and we'll send you a one-time code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="vault-input"
              required
              autoFocus
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
            {isLoading ? 'Sending…' : 'Send Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
