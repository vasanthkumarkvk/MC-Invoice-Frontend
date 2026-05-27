'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Send, Sparkles, ShoppingCart, Truck, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, today, addDays } from '@/lib/data';
import LineItems from '@/components/LineItems';
import { UnsavedModal } from '@/components/Modal';
import AIModal from '@/components/AIModal';

const Spin = () => <span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite' }}/>;

function Inner() {
  const router = useRouter();
  const { state, addItem, toast, fmtMoney, currency} = useApp();
  const [form, setForm] = useState({ vendorId:'', date:today(), deliveryDate:addDays(14), deliveryAddress:'', shipVia:'', poRef:'', paymentTerms:'Net 30', priority:'Normal', items:[{id:1,name:'',qty:1,price:0,unit:'Nos',disc:0,gst:18,hsn:''}], notes:'', terms:'Please deliver goods as per specifications. Quality inspection will be done upon receipt.', disc:0, status:'draft' });
  const [dirty,setDirty]=useState(false);const [saving,setSaving]=useState(false);const [unsaved,setUnsaved]=useState(false);const [aiOpen,setAiOpen]=useState(false);
  const sf=(k,v)=>{setForm(f=>({...f,[k]:v}));setDirty(true);};
  const totals=calcDoc(form.items,form.disc);const vendors=state.vendors||[];const products=state.products||[];
  const PCOLOR={Normal:'#3b82f6',High:'#f59e0b',Urgent:'#ef4444'};
  const save=async(status='draft')=>{
    if(!form.items.some(i=>i.name.trim())){toast('Add at least one item','error');return;}
    setSaving(true);await new Promise(r=>setTimeout(r,280));
    const seq=(state.purchases||[]).length+1;
    addItem('purchases',{...form,number:'PO-'+String(seq).padStart(3,'0'),status,type:'purchase-order'});
    setSaving(false);setDirty(false);
    toast(status==='approved'?'Purchase Order sent to vendor':'Saved as draft','success');
    router.push('/dashboard/purchases');
  };
  return(
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div style={{background:'var(--card-bg)',borderBottom:'1px solid var(--border)',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,zIndex:50,flexWrap:'wrap'}}>
        <button className="btn-icon" onClick={()=>dirty?setUnsaved(true):router.push('/dashboard/purchases')}><ChevronLeft size={20}/></button>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:'#fef3c7',display:'flex',alignItems:'center',justifyContent:'center'}}><ShoppingCart size={16} color="#92400e"/></div>
          <h1 style={{fontWeight:800,fontSize:18,color:'var(--text)'}}>Purchase Order</h1>
          <span style={{fontSize:11,background:'#fef3c7',color:'#92400e',padding:'2px 8px',borderRadius:4,fontWeight:700}}>PO</span>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button className="btn btn-outline btn-sm" onClick={()=>save('draft')} disabled={saving}><Save size={13}/>{saving?<Spin/>:'Save Draft'}</button>
          <button className="btn btn-brand btn-sm" onClick={()=>save('approved')} disabled={saving}><Send size={13}/>{saving?<Spin/>:'Approve & Send'}</button>
        </div>
      </div>
      <div className="create-page-body" style={{padding:"16px",maxWidth:1180,margin:'0 auto'}}>
        <div className="invoice-grid" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 300px',gap:20,alignItems:'start'}}>
          <div>
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}><Truck size={15} color="var(--brand)"/><span style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>Vendor & Delivery Details</span></div>
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
                <div><label className="form-label">Order Date</label><input className="form-input" type="date" value={form.date} onChange={e=>sf('date',e.target.value)}/></div>
              </div>
              <div className="field-row field-row-2" style={{marginTop:14}}>
                <div><label className="form-label">Expected Delivery Date</label><input className="form-input" type="date" value={form.deliveryDate} onChange={e=>sf('deliveryDate',e.target.value)}/></div>
                <div>
                  <label className="form-label">Ship Via</label>
                  <select className="form-select" value={form.shipVia} onChange={e=>sf('shipVia',e.target.value)}>
                    <option value="">Select shipping method</option>
                    {['Road','Rail','Air','Sea','Courier','Hand Delivery'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row field-row-2" style={{marginTop:14}}>
                <div><label className="form-label">PO Reference #</label><input className="form-input" placeholder="e.g. REF-2024-001" value={form.poRef} onChange={e=>sf('poRef',e.target.value)}/></div>
                <div>
                  <label className="form-label">Priority</label>
                  <div style={{display:'flex',gap:8}}>
                    {['Normal','High','Urgent'].map(p=>(
                      <button key={p} onClick={()=>sf('priority',p)} style={{flex:1,padding:'7px 0',border:`1.5px solid ${form.priority===p?PCOLOR[p]:'var(--border)'}`,borderRadius:7,background:form.priority===p?PCOLOR[p]+'22':'var(--card-bg)',color:form.priority===p?PCOLOR[p]:'var(--muted)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{marginTop:14}}><label className="form-label">Delivery Address</label><textarea className="form-input form-textarea" rows={2} placeholder="Delivery address (if different from company address)" value={form.deliveryAddress} onChange={e=>sf('deliveryAddress',e.target.value)}/></div>
            </div>
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <h3 style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>Order Items</h3>
                <Link href="/dashboard/products" className="btn btn-outline btn-sm" style={{fontSize:12}}>+ Add Product</Link>
              </div>
              <div className="tbl-wrap"><LineItems items={form.items} onChange={v=>sf('items',v)} products={products} currency={currency}/></div>
            </div>
            <div className="card" style={{padding:20}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}><FileCheck size={15} color="var(--brand)"/><h3 style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>Notes & Terms</h3></div>
              <div className="field-row field-row-2">
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                    <label className="form-label" style={{margin:0}}>Internal Notes</label>
                    <button className="btn btn-ghost btn-sm" style={{fontSize:11,color:'var(--brand)',gap:4}} onClick={()=>setAiOpen(true)}><Sparkles size={11}/> AI</button>
                  </div>
                  <textarea className="form-input form-textarea" rows={3} value={form.notes} onChange={e=>sf('notes',e.target.value)} placeholder="Internal notes about this order…"/>
                </div>
                <div><label className="form-label">Terms & Conditions</label><textarea className="form-input form-textarea" rows={3} value={form.terms} onChange={e=>sf('terms',e.target.value)}/></div>
              </div>
              <div style={{marginTop:14}}>
                <label className="form-label">Payment Terms</label>
                <select className="form-select" style={{maxWidth:220}} value={form.paymentTerms} onChange={e=>sf('paymentTerms',e.target.value)}>
                  {['Net 7','Net 14','Net 30','Net 45','Net 60','Due on Receipt','Advance Payment'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <div className="card" style={{padding:20,position:'sticky',top:0}}>
              <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'var(--text)'}}>Order Summary</h3>
              {form.vendorId&&<div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',marginBottom:14}}><div style={{fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Vendor</div><div style={{fontWeight:600,fontSize:13,color:'var(--text)'}}>{vendors.find(v=>v.id===form.vendorId)?.name||'—'}</div></div>}
              {[['Subtotal',totals.subtotal],['GST',totals.taxAmt]].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:13}}><span style={{color:'var(--muted)'}}>{l}</span><span style={{fontWeight:600,color:'var(--text)'}}>{fmtMoney(v)}</span></div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:'2px solid var(--border)',fontSize:16,fontWeight:800}}><span style={{color:'var(--text)'}}>Order Total</span><span style={{color:'var(--brand)'}}>{fmtMoney(totals.total)}</span></div>
              <div style={{marginTop:14}}><label className="form-label">Discount (₹)</label><input className="form-input" type="number" min="0" value={form.disc} onChange={e=>sf('disc',Math.max(0,parseInt(e.target.value)||0))} placeholder="0"/></div>
              <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:8}}>
                <button className="btn btn-brand" style={{width:'100%',justifyContent:'center'}} onClick={()=>save('approved')} disabled={saving}><Send size={14}/> {saving?<Spin/>:'Approve & Send to Vendor'}</button>
                <button className="btn btn-outline" style={{width:'100%',justifyContent:'center'}} onClick={()=>save('draft')} disabled={saving}><Save size={14}/> Save as Draft</button>
              </div>
              {form.priority!=='Normal'&&<div style={{marginTop:14,padding:'10px 12px',background:PCOLOR[form.priority]+'15',borderRadius:8,fontSize:12,color:PCOLOR[form.priority],fontWeight:600}}>{form.priority} Priority Order</div>}
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
