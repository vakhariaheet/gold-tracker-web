import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="glass rounded-2xl p-6">
          <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={20} className="text-black" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Verify OTP</h2>
          <p className="text-gray-400 text-sm mb-2">
            Enter the 6-digit code sent to <span className="text-gold">{email}</span>
          </p>
          <p className="text-sm mb-6">
            <span className={timeLeft < 60 ? 'text-red-400' : 'text-gray-400'}>
              Expires in {formatTime(timeLeft)}
            </span>
          </p>

          <div className="flex gap-2 justify-between mb-6">
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
                className="w-12 h-12 text-center text-xl font-bold bg-surface-light border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.some(d => !d)}
            className="w-full gold-gradient text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="w-full text-sm text-gray-400 hover:text-gold disabled:opacity-50 transition-colors"
          >
            {resendCooldown > 0
              ? `Resend OTP in ${resendCooldown}s`
              : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
