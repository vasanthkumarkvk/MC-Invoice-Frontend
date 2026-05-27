'use client';
import { useState } from 'react';
import { X, User, Plus } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { STATES } from '@/lib/data';
import { useRouter } from 'next/navigation';

export default function QuickAddCustomer({ open, onClose, onAdded }) {
  const { state, addItem, toast } = useApp();
  const router = useRouter();
  const [f, setF] = useState({ name:'', mobile:'', email:'', gstin:'', billingAddress:'', city:'', state:'Tamil Nadu', pincode:'' });
  const [err, setErr] = useState({});
  const s = (k,v) => { setF(p=>({...p,[k]:v})); if(err[k]) setErr(p=>({...p,[k]:''})); };

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Name is required';
    if (!f.mobile.trim()) e.mobile = 'Mobile is required';
    setErr(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    const newCustomer = { ...f, id: Date.now() };
    addItem('customers', newCustomer);
    toast('Customer added successfully', 'success');
    if (onAdded) onAdded(newCustomer);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:600, display:'flex', alignItems:'stretch', justifyContent:'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:'min(440px,100vw)', background:'var(--card-bg)', display:'flex', flexDirection:'column', boxShadow:'-4px 0 32px rgba(0,0,0,0.15)', animation:'sheetIn 0.28s cubic-bezier(0.22,1,0.36,1)' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className="btn-icon" onClick={onClose} style={{ border:'1px solid var(--border)' }}><X size={16}/></button>
            <span style={{ fontWeight:700, fontSize:16 }}>Quick Add Customer</span>
          </div>
          <button className="btn btn-outline btn-sm" style={{ fontSize:12 }} onClick={() => { onClose(); router.push('/dashboard/create/invoice'); }}>
            Create Invoice →
          </button>
        </div>

        {/* Form */}
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>
          <div style={{ marginBottom:14 }}>
            <label className="form-label">Customer Name <span style={{color:'#dc2626'}}>*</span></label>
            <input className={`form-input${err.name?' error':''}`} placeholder="Full name or business name" value={f.name} onChange={e=>s('name',e.target.value)} autoFocus/>
            {err.name && <div className="form-err">{err.name}</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="form-label">Mobile <span style={{color:'#dc2626'}}>*</span></label>
            <input className={`form-input${err.mobile?' error':''}`} placeholder="+91 98765 43210" type="tel" value={f.mobile} onChange={e=>s('mobile',e.target.value)}/>
            {err.mobile && <div className="form-err">{err.mobile}</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="form-label">Email</label>
            <input className="form-input" placeholder="customer@email.com" type="email" value={f.email} onChange={e=>s('email',e.target.value)}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="form-label">GSTIN</label>
            <input className="form-input" placeholder="29AABCT1332L000" value={f.gstin} onChange={e=>s('gstin',e.target.value)}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="form-label">Billing Address</label>
            <textarea className="form-input form-textarea" rows={2} placeholder="Street address" value={f.billingAddress} onChange={e=>s('billingAddress',e.target.value)}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label className="form-label">City</label>
              <input className="form-input" placeholder="City" value={f.city} onChange={e=>s('city',e.target.value)}/>
            </div>
            <div>
              <label className="form-label">Pincode</label>
              <input className="form-input" placeholder="600001" value={f.pincode} onChange={e=>s('pincode',e.target.value)}/>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="form-label">State</label>
            <select className="form-select" value={f.state} onChange={e=>s('state',e.target.value)}>
              {(STATES||['Tamil Nadu','Karnataka','Maharashtra','Delhi','Gujarat','Rajasthan','Uttar Pradesh','West Bengal','Telangana','Kerala']).map(st=><option key={st}>{st}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10, flexShrink:0 }}>
          <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" style={{ flex:2, justifyContent:'center' }} onClick={handleSave}>
            <Plus size={14}/> Save Customer
          </button>
        </div>
      </div>
      <style>{`@keyframes sheetIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}
