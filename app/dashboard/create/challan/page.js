'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Send, Plus } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, today, addDays, nextId } from '@/lib/data';
import LineItems from '@/components/LineItems';
import QuickAddCustomer from '@/components/QuickAddCustomer';

function ChallanInner() {
  const router = useRouter();
  const { state, addItem, toast, fmtMoney, currency} = useApp();
  const [f, setF] = useState({
    partyId: '', date: today(), dueDate: addDays(30),
    number: `DC-${nextId(state.estimates || [])}`,
    notes: '', terms: 'Goods once dispatched cannot be returned without prior approval.',
    items: [], disc: 0,
  });
  const [showQuick, setShowQuick] = useState(false);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const customers = state.customers || [];
  const totals = calcDoc(f.items, f.disc);

  const handleSave = (status) => {
    if (!f.partyId) { toast('Please select a customer', 'error'); return; }
    addItem('estimates', { ...f, type: 'challan', status: status || 'draft' });
    toast('Challan saved', 'success');
    router.push('/dashboard/delivery-challans');
  };

  return (
    <div>
      {/* Topbar */}
      <div style={{ background:'var(--card-bg)', borderBottom:'1px solid var(--border)', padding:'10px 14px', display:'flex', alignItems:'center', gap:8, position:'sticky', top:0, zIndex:50, flexWrap:'wrap', rowGap:6 }}>
        <button className="btn-icon" onClick={() => router.back()}><ChevronLeft size={18}/></button>
        <span style={{ fontWeight:700, fontSize:15 }}>Create Delivery Challan</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => handleSave('draft')}><Save size={13}/> Save Draft</button>
          <button className="btn btn-brand btn-sm" onClick={() => handleSave('sent')}><Send size={13}/> Save & Send</button>
        </div>
      </div>

      <div style={{ padding:'16px 10px', maxWidth:900, margin:'0 auto' }}>
        {/* Customer */}
        <div className="card inv-card" style={{ marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--text)' }}>Customer Details</div>
          <div className="field-row field-row-2" style={{ marginBottom:12 }}>
            <div>
              <label className="form-label">Customer <span className="req">*</span></label>
              <div style={{ display:'flex', gap:8 }}>
                <select className="form-select" style={{ flex:1 }} value={f.partyId} onChange={e => s('partyId', parseInt(e.target.value))}>
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="btn btn-brand btn-sm" onClick={() => setShowQuick(true)}><Plus size={13}/></button>
              </div>
            </div>
            <div>
              <label className="form-label">Challan Number</label>
              <input className="form-input" value={f.number} onChange={e => s('number', e.target.value)}/>
            </div>
          </div>
          <div className="field-row field-row-2">
            <div><label className="form-label">Date</label><input className="form-input" type="date" value={f.date} onChange={e => s('date', e.target.value)}/></div>
            <div><label className="form-label">Due Date</label><input className="form-input" type="date" value={f.dueDate} onChange={e => s('dueDate', e.target.value)}/></div>
          </div>
        </div>

        {/* Items */}
        <div className="card inv-card" style={{ marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Products & Services</div>
          <LineItems items={f.items} onChange={v => s('items', v)} currency={state.companyDetails?.currency || 'INR'} currency={currency}/>
        </div>

        {/* Notes */}
        <div className="card inv-card" style={{ marginBottom:16 }}>
          <div className="field-row field-row-2">
            <div><label className="form-label">Notes</label><textarea className="form-input form-textarea" rows={3} value={f.notes} onChange={e => s('notes', e.target.value)} placeholder="Notes for this challan"/></div>
            <div><label className="form-label">Terms & Conditions</label><textarea className="form-input form-textarea" rows={3} value={f.terms} onChange={e => s('terms', e.target.value)}/></div>
          </div>
        </div>

        {/* Summary */}
        <div className="card inv-card">
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Summary</div>
          {[['Subtotal', totals.subtotal], ['GST', totals.tax]].map(([l, v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13, color:'var(--muted)', borderBottom:'1px solid var(--border)' }}>
              <span>{l}</span><span>{fmtMoney(v)}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', fontSize:16, fontWeight:800, color:'var(--brand)' }}>
            <span>Total</span><span>{fmtMoney(totals.total)}</span>
          </div>
        </div>
      </div>

      {showQuick && <QuickAddCustomer onClose={() => setShowQuick(false)} onSaved={c => { setShowQuick(false); s('partyId', c.id); }}/>}
    </div>
  );
}

export default function CreateChallanPage() {
  return (
    <Suspense fallback={<div style={{padding:40,textAlign:'center'}}>Loading...</div>}>
      <ChallanInner/>
    </Suspense>
  );
}
