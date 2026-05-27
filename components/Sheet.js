'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function Sheet({ open, onClose, title, children, size = 'md', footer, headerRight }) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      document.body.style.overflow = '';
      setTimeout(() => setVisible(false), 280);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!visible) return null;

  const widths = { sm: '420px', md: '520px', lg: '640px', xl: '900px', full: '100vw' };
  const w = widths[size] || widths.md;

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}
        style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.28s' }}/>
      <div className="sheet-panel"
        style={{ width: `min(${w}, 100vw)`, transform: animate ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)' }}>
        <div className="sheet-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-icon" onClick={onClose} style={{ border: '1px solid var(--border)', flexShrink: 0 }}><X size={16}/></button>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {headerRight}
          </div>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </>
  );
}
