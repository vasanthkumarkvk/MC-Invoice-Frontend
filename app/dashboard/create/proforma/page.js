'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Send, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, today, addDays } from '@/lib/data';
import LineItems from '@/components/LineItems';
import { UnsavedModal } from '@/components/Modal';
import AIModal from '@/components/AIModal';

function Inner() {
  const router = useRouter();
  const { state, addItem, toast, fmtMoney, currency} = useApp();
  const [form, setForm] = useState({ partyId:'', date:today(), dueDate:addDays(30), items:[{id:1,name:'',qty:1,price:0,unit:'Nos',disc:0,gst:18,hsn:''}], notes:'', terms:'', disc:0, status:'draft' });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const sf = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };
  const totals = calcDoc(form.items, form.disc);
  const parties = state.customers || [];
  const products = state.products || [];
  const Spin = () => <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>;
  const save = async (status = 'draft') => {
    if (!form.items.some(i => i.name.trim())) { toast('Add at least one item', 'error'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 280));
    const seq = (state.invoices || []).length + 1;
    addItem('invoices', { ...form, number: 'PF-' + String(seq).padStart(3,'0'), status, type: 'proforma' });
    setSaving(false); setDirty(false);
    toast(status === 'sent' ? 'Create Pro Forma Invoice saved' : 'Saved as draft', 'success');
    router.back();
  };
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ background:'var(--card-bg)', borderBottom:'1px solid var(--border)', padding:'12px 20px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50, flexWrap:'wrap' }}>
        <button className="btn-icon" onClick={() => dirty ? setUnsaved(true) : router.back()}><ChevronLeft size={20}/></button>
        <h1 style={{ fontWeight:800, fontSize:18 }}>Create Pro Forma Invoice</h1>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => save('draft')} disabled={saving}><Save size={13}/> {saving ? <Spin/> : 'Save Draft'}</button>
          <button className="btn btn-brand btn-sm" onClick={() => save('sent')} disabled={saving}><Send size={13}/> {saving ? <Spin/> : 'Save & Send'}</button>
        </div>
      </div>
      <div className="cr-page-wrap" style={{ padding:'16px 10px', maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
        <div className="cr-main-form">
            <div className="card" style={{ padding:20, marginBottom:16 }}>
              <div className="field-row field-row-2">
                <div>
                  <label className="form-label">Select Customer</label>
                  <div style={{ display:'flex', gap:6 }}>
                    <select className="form-select" style={{ flex:1 }} value={form.partyId} onChange={e => sf('partyId', parseInt(e.target.value) || '')}>
                      <option value="">Select Customer...</option>
                      {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Link href="/dashboard/customers" className="btn btn-brand btn-sm" style={{ flexShrink:0, fontSize:12 }}>+ Customer</Link>
                  </div>
                </div>
                <div><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => sf('date', e.target.value)}/></div>
              </div>
              <div style={{ marginTop:14 }}><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.dueDate} onChange={e => sf('dueDate', e.target.value)} style={{ maxWidth:200 }}/></div>
            </div>
            <div className="card" style={{ padding:20, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <h3 style={{ fontWeight:700, fontSize:15 }}>Items</h3>
                <Link href="/dashboard/products" className="btn btn-outline btn-sm" style={{ fontSize:12 }}>+ Add Product</Link>
              </div>
              <LineItems items={form.items} onChange={v => sf('items', v)} products={products} currency={currency}/>
            </div>
            <div className="card" style={{ padding:20 }}>
              <h3 style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Notes and Terms</h3>
              <div className="field-row field-row-2">
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <label className="form-label" style={{ margin:0 }}>Notes</label>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize:11.5, color:'var(--brand)', gap:4 }} onClick={() => setAiOpen(true)}><Sparkles size={12}/> AI</button>
                  </div>
                  <textarea className="form-input form-textarea" rows={3} value={form.notes} onChange={e => sf('notes', e.target.value)} placeholder="Notes..."/>
                </div>
                <div><label className="form-label">Terms</label><textarea className="form-input form-textarea" rows={3} value={form.terms} onChange={e => sf('terms', e.target.value)} placeholder="Payment terms..."/></div>
              </div>
            </div>
        </div>
        <div className="card cr-summary" style={{ padding:20 }}>
            <h3 style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Summary</h3>
            {[['Subtotal', totals.subtotal], ['GST', totals.taxAmt]].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:13 }}><span style={{ color:'var(--muted)' }}>{l}</span><span style={{ fontWeight:600 }}>{fmtMoney(v)}</span></div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'2px solid var(--border)', fontSize:16, fontWeight:800 }}><span>Total</span><span style={{ color:'var(--brand)' }}>{fmtMoney(totals.total)}</span></div>
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              <button className="btn btn-brand" style={{ width:'100%', justifyContent:'center' }} onClick={() => save('sent')} disabled={saving}><Send size={14}/> Save and Send</button>
              <button className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} onClick={() => save('draft')} disabled={saving}><Save size={14}/> Save as Draft</button>
            </div>
        </div>
      </div>
      <UnsavedModal open={unsaved} onDiscard={() => { setUnsaved(false); setDirty(false); router.back(); }} onSave={() => { setUnsaved(false); save(); }}/>
      <AIModal open={aiOpen} onClose={() => setAiOpen(false)} context="notes" onUse={t => sf('notes', t)}/>
    </div>
  );
}
export default function Page() { return <Suspense fallback={null}><Inner/></Suspense>; }
