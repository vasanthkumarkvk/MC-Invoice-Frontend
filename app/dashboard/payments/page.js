'use client';
import { useState } from 'react';
import { Plus, CheckCircle, Clock, AlertTriangle, Search, X, Link2, QrCode, Copy, ExternalLink, RefreshCw, Download } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, fmtDate, today } from '@/lib/data';
import EmptyState from '@/components/EmptyState';

const ST = { paid:{l:'Paid',c:'badge-paid'}, draft:{l:'Draft',c:'badge-draft'}, sent:{l:'Sent',c:'badge-sent'}, overdue:{l:'Overdue',c:'badge-overdue'} };

function RecordPaymentModal({ invoice, customer, onClose, onSave }) {
  const [amount, setAmount] = useState(calcDoc(invoice?.items||[],invoice?.disc).total);
  const [mode, setMode] = useState('Cash');
  const [date, setDate] = useState(today());
  const [ref, setRef] = useState('');
  const MODES = ['Cash','UPI','Card','Net Banking','Cheque','NEFT','RTGS'];
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-sm">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:'1px solid var(--border)'}}>
          <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>Record Payment</span>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{background:'var(--bg)',borderRadius:9,padding:'12px 14px',marginBottom:16}}>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:4}}>Invoice {invoice?.number}</div>
            <div style={{fontWeight:700,fontSize:18,color:'var(--brand)'}}>{fmtMoney(calcDoc(invoice?.items||[],invoice?.disc).total)}</div>
            <div style={{fontSize:12.5,color:'var(--muted)',marginTop:2}}>{customer?.name || '—'}</div>
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Amount Received (₹)</label>
            <input className="form-input" type="number" min="0" value={amount} onChange={e=>setAmount(parseFloat(e.target.value)||0)}/>
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Payment Mode</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:6}}>
              {MODES.map(m=>(
                <button key={m} onClick={()=>setMode(m)} style={{padding:'7px 6px',border:`1.5px solid ${mode===m?'var(--brand)':'var(--border)'}`,borderRadius:7,background:mode===m?'var(--brand-bg)':'var(--card-bg)',color:mode===m?'var(--brand)':'var(--text)',fontSize:12,fontWeight:mode===m?700:400,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}><label className="form-label">Payment Date</label><input className="form-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
          <div><label className="form-label">Reference / Transaction ID</label><input className="form-input" placeholder="UPI ref, cheque no, transaction ID…" value={ref} onChange={e=>setRef(e.target.value)}/></div>
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid var(--border)',display:'flex',gap:10}}>
          <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" style={{flex:1,justifyContent:'center'}} onClick={()=>onSave({amount,mode,date,ref})}>Record Payment</button>
        </div>
      </div>
    </div>
  );
}

function CreateLinkModal({ customers, onClose, onSave }) {
  const [custId, setCustId] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [expiry, setExpiry] = useState('');
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-sm">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:'1px solid var(--border)'}}>
          <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>Create Payment Link</span>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{marginBottom:14}}>
            <label className="form-label">Customer</label>
            <select className="form-select" value={custId} onChange={e=>setCustId(e.target.value)}>
              <option value="">Select customer…</option>
              {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{marginBottom:14}}><label className="form-label">Amount (₹) <span className="req">*</span></label><input className="form-input" type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></div>
          <div style={{marginBottom:14}}><label className="form-label">Description</label><input className="form-input" placeholder="What is this payment for?" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
          <div><label className="form-label">Link Expiry</label><input className="form-input" type="date" value={expiry} onChange={e=>setExpiry(e.target.value)}/></div>
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid var(--border)',display:'flex',gap:10}}>
          <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" style={{flex:1,justifyContent:'center'}} onClick={()=>{if(!amount){return;}onSave({custId,amount:parseFloat(amount),desc,expiry,link:`pay.zetsap.com/${Math.random().toString(36).slice(2,9)}`,created:today(),status:'active'});}}>Generate Link</button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const {state,editItem,addItem,toast,fmtMoney}=useApp();
  const [tab,setTab]=useState('timeline');
  const [search,setSearch]=useState('');
  const [recordModal,setRecordModal]=useState(null);
  const [linkModal,setLinkModal]=useState(false);
  const [links,setLinks]=useState([]);

  const invs=state.invoices||[];const custs=state.customers||[];
  const paid=invs.filter(i=>i.status==='paid');
  const pending=invs.filter(i=>['sent','draft'].includes(i.status));
  const overdue=invs.filter(i=>i.status==='overdue');
  const totalPaid=paid.reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);
  const totalPending=pending.reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);
  const totalOverdue=overdue.reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);

  const markPaid=(id,paymentInfo)=>{const inv=invs.find(x=>x.id===id);if(inv){editItem('invoices',{...inv,status:'paid',paymentInfo});toast('Payment recorded!','success');}};

  const listMap={timeline:invs,received:paid,pending:[...overdue,...pending]};
  const filtered=(listMap[tab]||invs).filter(inv=>{const c=custs.find(x=>x.id===inv.customerId);return !search||(inv.number||'').toLowerCase().includes(search.toLowerCase())||(c?.name||'').toLowerCase().includes(search.toLowerCase());});

  return (
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><h1 style={{fontWeight:800,fontSize:22,color:'var(--text)'}}>Payments</h1><span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/></div>
        <div style={{display:'flex',gap:8}}>
          {tab==='payment-links'&&<button className="btn btn-brand btn-sm" onClick={()=>setLinkModal(true)}><Plus size={14}/> Create Payment Link</button>}
          {tab!=='payment-links'&&<button className="btn btn-brand btn-sm" onClick={()=>{ const unpaid=invs.filter(i=>i.status!=='paid'); if(unpaid.length===0){toast('No unpaid invoices to record payment for','error');}else if(unpaid.length===1){setRecordModal(unpaid[0]);}else{setRecordModal(unpaid[0]);} }}><Plus size={14}/> Record Payment</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(178px,1fr))',gap:14,marginBottom:20}}>
        {[{l:'Received',v:fmtMoney(totalPaid),n:`${paid.length} invoices`,bg:'#d1fae5',ic:'#065f46',Icon:CheckCircle},{l:'Pending',v:fmtMoney(totalPending),n:`${pending.length} invoices`,bg:'#fef3c7',ic:'#92400e',Icon:Clock},{l:'Overdue',v:fmtMoney(totalOverdue),n:`${overdue.length} invoices`,bg:'#fee2e2',ic:'#991b1b',Icon:AlertTriangle}].map(s=>(
          <div key={s.l} className="stat-card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><div style={{fontWeight:800,fontSize:22,color:'var(--text)'}}>{s.v}</div><div style={{fontSize:12.5,color:'var(--muted)',marginTop:3}}>{s.l}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{s.n}</div></div>
              <div style={{width:40,height:40,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><s.Icon size={18} color={s.ic}/></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-row" style={{marginBottom:16}}>
        {[['timeline','Timeline'],['received','Received'],['pending','Pending & Overdue'],['payment-links','Payment Links'],['reconciliation','Bank Reconciliation']].map(([k,l])=>(
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Timeline / Received / Pending tabs */}
      {['timeline','received','pending'].includes(tab)&&(
        <div className="card">
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
            <div className="search-bar" style={{maxWidth:400}}><Search size={14} color="var(--muted)"/><input placeholder="Search by invoice or customer…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <button className="btn btn-outline btn-sm" style={{marginLeft:'auto',gap:6}}><Download size={13}/> Export</button>
          </div>
          {filtered.length===0?(
            <EmptyState type="generic" title="No payments to show" desc={['Create invoices and track payments here','Mark invoices as paid to see them here']}/>
          ):(
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{filtered.map(inv=>{const c=custs.find(x=>x.id===inv.customerId);const t=calcDoc(inv.items||[],inv.disc);const st=ST[inv.status]||ST.draft;return(
                <tr key={inv.id}>
                  <td style={{fontWeight:700,color:'var(--brand)'}}>{inv.number}</td>
                  <td style={{fontWeight:600,color:'var(--text)'}}>{c?.name||'—'}</td>
                  <td style={{color:'var(--muted)'}}>{fmtDate(inv.date)}</td>
                  <td style={{color:inv.status==='overdue'?'#dc2626':'var(--muted)'}}>{fmtDate(inv.dueDate)||'—'}</td>
                  <td style={{fontWeight:700,color:'var(--text)'}}>{fmtMoney(t.total)}</td>
                  <td><span className={`badge ${st.c}`}>{st.l}</span></td>
                  <td>{inv.status!=='paid'&&<button onClick={()=>setRecordModal(inv)} style={{fontSize:12,color:'#065f46',background:'#d1fae5',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontWeight:600,fontFamily:'Inter,sans-serif'}}>Record Payment</button>}</td>
                </tr>
              );})}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {/* Payment Links tab */}
      {tab==='payment-links'&&(
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:4,color:'var(--text)'}}>Payment Links</div>
          <p style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>Create shareable payment links and QR codes. Share via WhatsApp, Email, or SMS.</p>
          {links.length===0?(
            <div style={{textAlign:'center',padding:'40px 0'}}>
              <Link2 size={40} style={{opacity:0.12,margin:'0 auto 14px',display:'block'}}/>
              <p style={{fontWeight:700,fontSize:16,marginBottom:6,color:'var(--text)'}}>No payment links yet</p>
              <p style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>Create a link and your customer can pay you instantly online</p>
              <button className="btn btn-brand" onClick={()=>setLinkModal(true)}><Plus size={14}/> Create Payment Link</button>
            </div>
          ):(
            <div>
              {links.map((l,i)=>{const c=custs.find(x=>x.id===parseInt(l.custId));return(
                <div key={i} style={{border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px',marginBottom:12,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                  <div style={{width:40,height:40,borderRadius:9,background:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><QrCode size={18} color="var(--brand)"/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:'var(--text)'}}>{fmtMoney(l.amount)}{l.desc&&` — ${l.desc}`}</div>
                    <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{c?.name||'Anyone'} · {l.link}</div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>{navigator.clipboard?.writeText(l.link);toast('Link copied!','success');}} className="btn btn-outline btn-sm" style={{gap:5}}><Copy size={12}/> Copy</button>
                    <button className="btn btn-outline btn-sm" style={{gap:5}}><ExternalLink size={12}/> Open</button>
                    <span className="badge badge-paid">Active</span>
                  </div>
                </div>
              );})}
            </div>
          )}
        </div>
      )}

      {/* Bank Reconciliation tab */}
      {tab==='reconciliation'&&(
        <div>
          <div className="card" style={{padding:20,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:4,color:'var(--text)'}}>Bank Reconciliation</div>
                <p style={{fontSize:13,color:'var(--muted)'}}>Match your bank transactions with invoices and payments in Zetsap.</p>
              </div>
              <button className="btn btn-brand btn-sm" style={{gap:6}}><RefreshCw size={13}/> Sync Bank Statement</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:20}}>
            {[{l:'Matched Transactions',v:`${paid.length}`,sub:'Auto-matched with invoices',color:'#d1fae5',ic:'#065f46'},{l:'Unmatched Credits',v:'0',sub:'Need manual matching',color:'#fef3c7',ic:'#92400e'},{l:'Unmatched Debits',v:'0',sub:'Check for missing expenses',color:'#fee2e2',ic:'#dc2626'}].map(s=>(
              <div key={s.l} style={{background:s.color,borderRadius:10,padding:'16px 18px'}}>
                <div style={{fontSize:24,fontWeight:800,color:s.ic}}>{s.v}</div>
                <div style={{fontSize:13,fontWeight:600,color:s.ic,marginTop:2}}>{s.l}</div>
                <div style={{fontSize:12,color:s.ic,opacity:0.8,marginTop:3}}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13,color:'var(--text)'}}>Matched Transactions</div>
            {paid.length===0?(
              <div style={{padding:'32px',textAlign:'center',color:'var(--muted)'}}>
                <RefreshCw size={32} style={{opacity:0.15,margin:'0 auto 10px',display:'block'}}/>
                <p style={{fontSize:13}}>No matched transactions. Record payments on invoices to see reconciliation.</p>
              </div>
            ):(
              <div className="tbl-wrap"><table className="tbl">
                <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Payment Date</th><th>Mode</th><th>Status</th></tr></thead>
                <tbody>{paid.map(inv=>{const c=custs.find(x=>x.id===inv.customerId);const t=calcDoc(inv.items||[],inv.disc);return(
                  <tr key={inv.id}>
                    <td style={{fontWeight:700,color:'var(--brand)'}}>{inv.number}</td>
                    <td style={{fontWeight:600,color:'var(--text)'}}>{c?.name||'—'}</td>
                    <td style={{fontWeight:700,color:'var(--text)'}}>{fmtMoney(t.total)}</td>
                    <td style={{color:'var(--muted)'}}>{inv.paymentInfo?.date||inv.date}</td>
                    <td>{inv.paymentInfo?.mode&&<span className="badge badge-brand">{inv.paymentInfo.mode}</span>}</td>
                    <td><span className="badge badge-paid">Reconciled</span></td>
                  </tr>
                );})}
                </tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {recordModal&&(
        <RecordPaymentModal
          invoice={recordModal}
          customer={custs.find(c=>c.id===recordModal.customerId)}
          onClose={()=>setRecordModal(null)}
          onSave={info=>{markPaid(recordModal.id,info);setRecordModal(null);}}/>
      )}
      {linkModal&&(
        <CreateLinkModal
          customers={custs}
          onClose={()=>setLinkModal(false)}
          onSave={link=>{setLinks(l=>[link,...l]);setLinkModal(false);toast('Payment link created!','success');}}/>
      )}
    </div>
  );
}
