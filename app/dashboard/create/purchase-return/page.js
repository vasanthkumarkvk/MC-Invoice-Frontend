'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Send, Sparkles, RotateCcw, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, today } from '@/lib/data';
import LineItems from '@/components/LineItems';
import { UnsavedModal } from '@/components/Modal';
import AIModal from '@/components/AIModal';

const Spin = () => <span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite' }}/>;

const RETURN_REASONS = [
  'Damaged goods received',
  'Wrong item delivered',
  'Quality not as expected',
  'Quantity mismatch',
  'Expired / near expiry',
  'Duplicate order',
  'Price discrepancy',
  'Other',
];

function Inner() {
  const router = useRouter();
  const { state, addItem, toast, fmtMoney, currency} = useApp();
  const [form, setForm] = useState({
    vendorId:'', originalPORef:'', date:today(), returnReason:'Damaged goods received',
    customReason:'', refundMethod:'Credit Note', bankDetails:'',
    items:[{id:1,name:'',qty:1,price:0,unit:'Nos',disc:0,gst:18,hsn:''}],
    notes:'', terms:'', disc:0, status:'draft', requiresPickup:false,
  });
  const [dirty,setDirty]=useState(false);const [saving,setSaving]=useState(false);const [unsaved,setUnsaved]=useState(false);const [aiOpen,setAiOpen]=useState(false);
  const sf=(k,v)=>{setForm(f=>({...f,[k]:v}));setDirty(true);};
  const totals=calcDoc(form.items,form.disc);const vendors=state.vendors||[];const products=state.products||[];
  const purchases=(state.purchases||[]).filter(p=>p.type==='purchase-order');

  const save=async(status='draft')=>{
    if(!form.items.some(i=>i.name.trim())){toast('Add at least one item to return','error');return;}
    if(!form.returnReason){toast('Select a return reason','error');return;}
    setSaving(true);await new Promise(r=>setTimeout(r,280));
    const seq=(state.purchases||[]).length+1;
    addItem('purchases',{...form,number:'PR-'+String(seq).padStart(3,'0'),status,type:'purchase-return'});
    setSaving(false);setDirty(false);
    toast(status==='submitted'?'Purchase Return submitted to vendor':'Saved as draft','success');
    router.push('/dashboard/purchases');
  };

  return(
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div style={{background:'var(--card-bg)',borderBottom:'1px solid var(--border)',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,zIndex:50,flexWrap:'wrap'}}>
        <button className="btn-icon" onClick={()=>dirty?setUnsaved(true):router.push('/dashboard/purchases')}><ChevronLeft size={20}/></button>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center'}}><RotateCcw size={16} color="#dc2626"/></div>
          <h1 style={{fontWeight:800,fontSize:18,color:'var(--text)'}}>Purchase Return</h1>
          <span style={{fontSize:11,background:'#fee2e2',color:'#dc2626',padding:'2px 8px',borderRadius:4,fontWeight:700}}>RETURN</span>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button className="btn btn-outline btn-sm" onClick={()=>save('draft')} disabled={saving}><Save size={13}/> {saving?<Spin/>:'Save Draft'}</button>
          <button className="btn btn-danger btn-sm" onClick={()=>save('submitted')} disabled={saving}><Send size={13}/> {saving?<Spin/>:'Submit Return'}</button>
        </div>
      </div>

      <div className="create-page-body" style={{padding:"16px",maxWidth:1180,margin:'0 auto'}}>
        {/* Return alert banner */}
        <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
          <AlertTriangle size={18} color="#f59e0b"/>
          <div><div style={{fontWeight:700,fontSize:13,color:'#92400e'}}>Purchase Return Note</div><div style={{fontSize:12.5,color:'#92400e'}}>This will create a debit note and notify the vendor. The original purchase will be marked as partially/fully returned.</div></div>
        </div>

        <div className="invoice-grid" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 300px',gap:20,alignItems:'start'}}>
          <div>
            {/* Return details */}
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}><Package size={15} color="var(--brand)"/><span style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>Return Details</span></div>
              <div className="field-row field-row-2">
                <div>
                  <label className="form-label">Select Vendor <span className="req">*</span></label>
                  <div style={{display:'flex',gap:6}}>
                    <select className="form-select" style={{flex:1}} value={form.vendorId} onChange={e=>sf('vendorId',parseInt(e.target.value)||'')}>
                      <option value="">Select vendor…</option>
                      {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <Link href="/dashboard/vendors" className="btn btn-brand btn-sm" style={{flexShrink:0,fontSize:12}}>+ Vendor</Link>
                  </div>
                </div>
                <div><label className="form-label">Return Date</label><input className="form-input" type="date" value={form.date} onChange={e=>sf('date',e.target.value)}/></div>
              </div>
              <div className="field-row field-row-2" style={{marginTop:14}}>
                <div>
                  <label className="form-label">Original PO Reference</label>
                  {purchases.length > 0 ? (
                    <select className="form-select" value={form.originalPORef} onChange={e=>sf('originalPORef',e.target.value)}>
                      <option value="">Select original PO…</option>
                      {purchases.map(p=><option key={p.id} value={p.number}>{p.number}</option>)}
                    </select>
                  ) : (
                    <input className="form-input" placeholder="e.g. PO-001" value={form.originalPORef} onChange={e=>sf('originalPORef',e.target.value)}/>
                  )}
                </div>
                <div>
                  <label className="form-label">Refund Method</label>
                  <select className="form-select" value={form.refundMethod} onChange={e=>sf('refundMethod',e.target.value)}>
                    {['Credit Note','Bank Transfer','Cash Refund','Replacement Goods','Deduction from Next Invoice'].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              {form.refundMethod==='Bank Transfer'&&(
                <div style={{marginTop:14}}><label className="form-label">Your Bank Details for Refund</label><input className="form-input" placeholder="Account number, IFSC, Bank name" value={form.bankDetails} onChange={e=>sf('bankDetails',e.target.value)}/></div>
              )}
            </div>

            {/* Return reason */}
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:'var(--text)',display:'flex',alignItems:'center',gap:8}}><AlertTriangle size={14} color="#f59e0b"/> Reason for Return</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8,marginBottom:14}}>
                {RETURN_REASONS.map(r=>(
                  <button key={r} onClick={()=>sf('returnReason',r)} style={{padding:'10px 14px',border:`1.5px solid ${form.returnReason===r?'var(--brand)':'var(--border)'}`,borderRadius:8,background:form.returnReason===r?'var(--brand-bg)':'var(--card-bg)',color:form.returnReason===r?'var(--brand)':'var(--text)',fontSize:12.5,fontWeight:form.returnReason===r?700:400,cursor:'pointer',fontFamily:'Inter,sans-serif',textAlign:'left',transition:'all 0.12s'}}>
                    {r}
                  </button>
                ))}
              </div>
              {form.returnReason==='Other'&&(
                <div><label className="form-label">Specify Reason</label><input className="form-input" placeholder="Describe the return reason…" value={form.customReason} onChange={e=>sf('customReason',e.target.value)}/></div>
              )}
              <div style={{marginTop:14,display:'flex',alignItems:'center',gap:10}}>
                <div className={`tog-track${form.requiresPickup?' on':''}`} onClick={()=>sf('requiresPickup',!form.requiresPickup)}><div className="tog-thumb"/></div>
                <span style={{fontSize:13,color:'var(--text)'}}>Vendor needs to arrange pickup of returned goods</span>
              </div>
            </div>

            {/* Items to return */}
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <h3 style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>Items Being Returned</h3>
                <Link href="/dashboard/products" className="btn btn-outline btn-sm" style={{fontSize:12}}>+ Add Item</Link>
              </div>
              <div className="tbl-wrap"><LineItems items={form.items} onChange={v=>sf('items',v)} products={products} currency={currency}/></div>
            </div>

            {/* Notes */}
            <div className="card" style={{padding:20}}>
              <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'var(--text)'}}>Additional Notes</h3>
              <div className="field-row field-row-2">
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                    <label className="form-label" style={{margin:0}}>Notes to Vendor</label>
                    <button className="btn btn-ghost btn-sm" style={{fontSize:11,color:'var(--brand)',gap:4}} onClick={()=>setAiOpen(true)}><Sparkles size={11}/> AI</button>
                  </div>
                  <textarea className="form-input form-textarea" rows={3} value={form.notes} onChange={e=>sf('notes',e.target.value)} placeholder="Describe the issue and return request…"/>
                </div>
                <div><label className="form-label">Internal Notes</label><textarea className="form-input form-textarea" rows={3} value={form.terms} onChange={e=>sf('terms',e.target.value)} placeholder="Internal notes (not visible to vendor)…"/></div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card" style={{padding:20,position:'sticky',top:0,border:'2px solid #fee2e2'}}>
              <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'#dc2626',display:'flex',alignItems:'center',gap:8}}><RotateCcw size={15}/> Return Summary</h3>
              {form.vendorId&&<div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',marginBottom:14}}><div style={{fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Vendor</div><div style={{fontWeight:600,fontSize:13,color:'var(--text)'}}>{vendors.find(v=>v.id===form.vendorId)?.name||'—'}</div></div>}
              {form.returnReason&&<div style={{background:'#fff7ed',borderRadius:8,padding:'10px 12px',marginBottom:14}}><div style={{fontSize:11,color:'#92400e',fontWeight:600,marginBottom:2}}>Return Reason</div><div style={{fontSize:12.5,color:'#92400e'}}>{form.returnReason==='Other'?form.customReason||'Other':form.returnReason}</div></div>}
              {[['Return Subtotal',totals.subtotal],['GST Credit',totals.taxAmt]].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:13}}><span style={{color:'var(--muted)'}}>{l}</span><span style={{fontWeight:600,color:'var(--text)'}}>{fmtMoney(v)}</span></div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:'2px solid #fee2e2',fontSize:16,fontWeight:800}}><span style={{color:'#dc2626'}}>Total Credit</span><span style={{color:'#dc2626'}}>{fmtMoney(totals.total)}</span></div>
              <div style={{marginTop:12,padding:'10px 12px',background:'#fef3c7',borderRadius:8,fontSize:12,color:'#92400e'}}><strong>Refund via:</strong> {form.refundMethod}</div>
              <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:8}}>
                <button className="btn btn-danger" style={{width:'100%',justifyContent:'center'}} onClick={()=>save('submitted')} disabled={saving}><Send size={14}/>{saving?<Spin/>:'Submit Return to Vendor'}</button>
                <button className="btn btn-outline" style={{width:'100%',justifyContent:'center'}} onClick={()=>save('draft')} disabled={saving}><Save size={14}/> Save as Draft</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UnsavedModal open={unsaved} onDiscard={()=>{setUnsaved(false);setDirty(false);router.push('/dashboard/purchases');}} onSave={()=>{setUnsaved(false);save();}}/>
      <AIModal open={aiOpen} onClose={()=>setAiOpen(false)} context="notes" onUse={t=>sf('notes',t)}/>
    </div>
  );
}
export default function Page(){return<Suspense fallback={null}><Inner/></Suspense>;}
