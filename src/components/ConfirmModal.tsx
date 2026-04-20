import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/75 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.15s ease forwards' }}
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        className="relative vault-card w-full max-w-xs p-6"
        style={{ animation: 'modalSlideUp 0.25s cubic-bezier(0.22,1,0.36,1) forwards' }}
      >
        <h3 className="font-display text-xl font-light text-warm mb-1">{title}</h3>
        {message && (
          <p className="text-sm text-muted mt-1 mb-5 leading-relaxed">{message}</p>
        )}
        {!message && <div className="mb-5" />}

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="btn-ghost flex-1 py-2 rounded-lg text-sm"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-opacity ${
              danger
                ? 'bg-crimson/80 hover:bg-crimson text-warm'
                : 'btn-gold'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
