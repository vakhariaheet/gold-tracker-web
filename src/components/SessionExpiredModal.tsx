import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COUNTDOWN = 4;

export default function SessionExpiredModal() {
  const { sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(COUNTDOWN);

  useEffect(() => {
    if (!sessionExpired) {
      setCount(COUNTDOWN);
      return;
    }

    setCount(COUNTDOWN);
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(interval);
          clearSessionExpired();
          navigate('/login', { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionExpired, navigate, clearSessionExpired]);

  if (!sessionExpired) return null;

  const progress = ((COUNTDOWN - count) / COUNTDOWN) * 100;
  const circumference = 2 * Math.PI * 20;
  const dash = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease forwards' }}
      />

      {/* Modal */}
      <div
        className="relative vault-card w-full max-w-sm p-7 flex flex-col items-center text-center"
        style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards' }}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-full border border-gold/25 bg-gold/[0.06] flex items-center justify-center mb-5">
          <LockKeyhole size={20} className="text-gold" strokeWidth={1.5} />
        </div>

        <h2 className="font-display text-2xl font-light text-warm mb-2">Session Expired</h2>
        <p className="text-sm text-muted leading-relaxed mb-7">
          Your session has ended. Please sign in again to continue.
        </p>

        {/* Countdown ring */}
        <div className="relative w-12 h-12 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            {/* Track */}
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="rgba(194,156,68,0.12)"
              strokeWidth="2.5"
            />
            {/* Progress */}
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="#C29C44"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dash}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-sm text-gold">
            {count}
          </span>
        </div>

        <p className="text-xs text-faint mb-6">Redirecting in {count}s…</p>

        <button
          onClick={() => {
            clearSessionExpired();
            navigate('/login', { replace: true });
          }}
          className="btn-gold w-full py-2.5 rounded-lg text-sm font-medium"
        >
          Sign in now
        </button>
      </div>
    </div>
  );
}
