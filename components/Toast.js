'use client';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />}
          {t.type === 'error'   && <XCircle     size={16} color="#ef4444" style={{ flexShrink: 0 }} />}
          {t.type === 'info'    && <Info         size={16} color="#3b82f6" style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button className="btn-icon" style={{ width: 22, height: 22, flexShrink: 0 }} onClick={() => dismissToast(t.id)}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
