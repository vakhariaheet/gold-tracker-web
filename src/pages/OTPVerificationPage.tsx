import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OTPVerificationPage() {
  const { verifyOtp, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) { setError('Enter all 6 digits'); return; }
    setIsLoading(true);
    setError('');
    try {
      const token = await verifyOtp(email, otpCode);
      navigate('/reset-password', { state: { token } });
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await forgotPassword(email);
      setResendCooldown(60);
      setTimeLeft(10 * 60);
    } catch (err: any) {
      setError(err.message);
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
            <span className="font-mono text-gold text-base font-medium">6</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-warm mb-1">Enter Code</h1>
          <p className="text-muted text-sm">
            A 6-digit code was sent to{' '}
            <span className="text-gold font-mono text-xs">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-2 mb-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className={`flex-1 h-12 text-center font-mono text-xl font-medium bg-s2 border rounded-lg text-warm transition-colors focus:outline-none ${
                digit
                  ? 'border-gold/40 bg-gold/[0.06]'
                  : 'border-gold/[0.1] focus:border-gold/40'
              }`}
            />
          ))}
        </div>

        {/* Timer */}
        <p className={`text-xs font-mono mb-5 ${timeLeft < 60 ? 'text-crimson-light' : 'text-muted'}`}>
          Expires in {formatTime(timeLeft)}
        </p>

        {error && (
          <div className="bg-crimson-bg border border-crimson/20 rounded-lg px-4 py-3 text-crimson-light text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={() => handleVerify()}
          disabled={isLoading || otp.some(d => !d)}
          className="btn-gold w-full py-3 rounded-lg text-sm mb-4"
        >
          {isLoading ? 'Verifying…' : 'Verify Code'}
        </button>

        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="w-full text-sm text-muted hover:text-warm disabled:opacity-40 transition-colors text-center"
        >
          {resendCooldown > 0 ? (
            <span className="font-mono">Resend in {resendCooldown}s</span>
          ) : (
            'Resend code'
          )}
        </button>
      </div>
    </div>
  );
}
