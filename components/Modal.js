'use client';
import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

export function Modal({ open, onClose, title, size = 'md', footer, children }) {
  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box modal-${size}`}>
        {title && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
            <span style={{ fontWeight:700, fontSize:16 }}>{title}</span>
            <button className="btn-icon" onClick={onClose}><X size={18}/></button>
          </div>
        )}
        <div style={{ padding:20, overflowY:'auto', flex:1 }}>{children}</div>
        {footer && <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10, justifyContent:'flex-end', flexShrink:0 }}>{footer}</div>}
      </div>
    </div>
  );
}

export function DeleteModal({ open, onClose, onConfirm, loading, itemName = 'item' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div style={{ padding:'24px 24px 20px', textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <AlertTriangle size={24} color="#dc2626"/>
          </div>
          <h3 style={{ fontWeight:700, fontSize:17, marginBottom:8 }}>Delete {itemName}?</h3>
          <p style={{ color:'#6b7280', fontSize:13.5, lineHeight:1.5 }}>
            This action cannot be undone. Are you sure?
          </p>
        </div>
        <div style={{ padding:'0 20px 20px', display:'flex', gap:10 }}>
          <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnsavedModal({ open, onDiscard, onSave }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-box modal-sm">
        <div style={{ padding:'24px 24px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <AlertTriangle size={18} color="#d97706"/>
            </div>
            <h3 style={{ fontWeight:700, fontSize:16 }}>Unsaved changes</h3>
          </div>
          <p style={{ color:'#6b7280', fontSize:13.5, lineHeight:1.5 }}>
            You have unsaved changes. Are you sure you want to exit without saving?
          </p>
        </div>
        <div style={{ padding:'0 20px 20px', display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn btn-outline" onClick={onDiscard}>Exit Without Saving</button>
          <button className="btn btn-brand" onClick={onSave}>Save and Exit</button>
        </div>
      </div>
    </div>
  );
}

export function UpgradeModal({ open, onClose, feature, plan = 'ADVANCED', benefits = [], allFeatures = [] }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md">
        <div style={{ padding:'20px 24px 0' }}>
          <div style={{ display:'flex', justifyContent:'flex-end' }}><button className="btn-icon" onClick={onClose}><X size={18}/></button></div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>✦</div>
            <h3 style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>{feature}</h3>
            <p style={{ color:'#6b7280', fontSize:13 }}>This feature is part of our <strong>{plan} Plan</strong>.</p>
          </div>
          {benefits.map((b,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:'#111827', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                <CheckCircle size={12} color="#fff"/>
              </div>
              <span style={{ fontSize:13.5 }}>{b}</span>
            </div>
          ))}
          {allFeatures.length > 0 && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16, marginTop:8, marginBottom:20 }}>
              <p style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>All features in <strong>{plan} Plan</strong></p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 20px' }}>
                {allFeatures.map((f,i) => <div key={i} style={{ fontSize:13, display:'flex', alignItems:'center', gap:6 }}><span style={{ color:'var(--muted)' }}>+</span>{f}</div>)}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
          <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}>Talk to a specialist</button>
          <button className="btn" style={{ flex:1, justifyContent:'center', background:'#111827', color:'#fff' }}>Subscribe Now</button>
        </div>
      </div>
    </div>
  );
}
