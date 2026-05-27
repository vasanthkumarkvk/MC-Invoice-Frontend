'use client';
import React from 'react';
import { useState } from 'react';
import { TrendingDown, TrendingUp, Package, Users, FileText, Clock, MoreHorizontal } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs } from '@/lib/data';

const today = () => new Date().toISOString().slice(0,10);
const monthStart = () => { const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); };

function NoData({ msg='No data' }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 20px',gap:10}}>
      <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
        <rect x="10" y="20" width="42" height="48" rx="4" fill="#e5e7eb"/>
        <rect x="14" y="28" width="28" height="4" rx="2" fill="#d1d5db"/>
        <rect x="14" y="36" width="20" height="4" rx="2" fill="#d1d5db"/>
        <rect x="14" y="44" width="24" height="4" rx="2" fill="#d1d5db"/>
        <circle cx="58" cy="28" r="14" fill="#d1d5db"/>
        <circle cx="60" cy="26" r="3" fill="#9ca3af"/>
        <path d="M54 32 Q60 28 66 32" stroke="#9ca3af" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      <p style={{color:'#9ca3af',fontSize:13}}>{msg}</p>
    </div>
  );
}

function SectionCard({ title, children, extra }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div style={{border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',background:'var(--card-bg)',position:'relative'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
        <span style={{fontWeight:600,fontSize:14,color:'var(--text)'}}>{title}</span>
        {extra||<button className="btn-icon" style={{color:'var(--muted)',position:'relative'}} onClick={()=>setMenuOpen(o=>!o)}>
          <MoreHorizontal size={16}/>
          {menuOpen&&<div style={{position:'absolute',top:32,right:0,background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:8,boxShadow:'var(--shadow-md)',zIndex:50,minWidth:130,overflow:'hidden'}}
            onMouseLeave={()=>setMenuOpen(false)}>
            {['View Details','Export CSV','Share'].map(item=>(
              <button key={item} onClick={()=>setMenuOpen(false)} style={{display:'block',width:'100%',padding:'8px 14px',background:'none',border:'none',textAlign:'left',fontSize:13,fontFamily:'Inter,sans-serif',color:'var(--text)',cursor:'pointer'}}
                onMouseOver={e=>e.currentTarget.style.background='var(--brand-bg)'}
                onMouseOut={e=>e.currentTarget.style.background='none'}>{item}</button>
            ))}
          </div>}
        </button>}
      </div>
      {children}
    </div>
  );
}

function DateRangePicker({ from, to, onFrom, onTo }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:4,border:'1px solid var(--border)',borderRadius:8,padding:'5px 10px',background:'var(--card-bg)',fontSize:13,color:'var(--muted)'}}>
      <input type="date" value={from} onChange={e=>onFrom(e.target.value)} style={{border:'none',outline:'none',fontSize:12,fontFamily:'Inter,sans-serif',color:'var(--text)',background:'transparent',cursor:'pointer'}}/>
      <span>→</span>
      <input type="date" value={to} onChange={e=>onTo(e.target.value)} style={{border:'none',outline:'none',fontSize:12,fontFamily:'Inter,sans-serif',color:'var(--text)',background:'transparent',cursor:'pointer'}}/>
    </div>
  );
}

export default function InsightsPage() {
  const {state,fmtMoney,currency}=useApp();
  const invs=state.invoices||[];
  const expenses=state.expenses||[];
  const custs=state.customers||[];
  const products=state.products||[];
  const indIncome=state.indirectIncome||[];

  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(today());
  const [dateFrom2, setDateFrom2] = useState(monthStart());
  const [dateTo2, setDateTo2] = useState(today());
  const [dateFrom3, setDateFrom3] = useState(monthStart());
  const [dateTo3, setDateTo3] = useState(today());

  const revenue = invs.filter(i=>i.status==='paid').reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);
  const cashOut = expenses.reduce((s,e)=>s+(e.amount||0),0);
  const pending = invs.filter(i=>['sent','draft'].includes(i.status)).reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);
  const totalSales = invs.reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);
  const totalExp = expenses.reduce((s,e)=>s+(e.amount||0),0);
  const totalIndIncome = indIncome.reduce((s,e)=>s+(e.amount||0),0);

  const SNAP = [
    {Icon:TrendingDown,label:'Cash In',v:fmtMoney(revenue),color:'#10b981'},
    {Icon:TrendingUp,label:'Cash Out',v:fmtMoney(cashOut),color:'#ef4444'},
    {Icon:Package,label:'Products Sold',v:products.length,color:'var(--brand)'},
    {Icon:Users,label:'Customers',v:custs.length,color:'#3b82f6'},
    {Icon:FileText,label:'Pending Invoices',v:fmtMoney(pending),color:'#f59e0b'},
    {Icon:Clock,label:'Invoices Created',v:invs.length,color:'#6366f1'},
  ];

  // Last 7 days revenue
  const last7 = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const key=d.toISOString().slice(0,10);
    const label=d.toLocaleDateString('en-IN',{weekday:'short'});
    const rev=invs.filter(inv=>inv.date===key&&inv.status==='paid').reduce((s,inv)=>s+calcDoc(inv.items||[],inv.disc).total,0);
    return {label,rev};
  });
  const maxRev=Math.max(...last7.map(d=>d.rev),1);

  return (
    <div className="page-content">
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20}}>
        <h1 style={{fontWeight:800,fontSize:22}}>Insights</h1>
        <span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>
      </div>

      {/* Snapshot stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,marginBottom:28}}>
        {SNAP.map(s=>(
          <div key={s.label} style={{border:'1px solid var(--border)',borderRadius:10,padding:'14px',background:'var(--card-bg)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</div>
              <s.Icon size={15} color={s.color}/>
            </div>
            <div style={{fontSize:20,fontWeight:800,color:'var(--text)'}}>{s.v}</div>
          </div>

        ))}
      </div>

      {/* Reports Overview */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,flexWrap:'wrap'}}>
          <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>Reports Overview</span>
          <DateRangePicker from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo}/>
        </div>
        <div className="insights-main-grid" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 280px',gap:16,alignItems:'start'}}>
          <div style={{border:'1px solid var(--border)',borderRadius:12,padding:'24px',background:'var(--card-bg)',minHeight:280,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {invs.length===0 ? <NoData msg="No data"/> : (
              <div style={{width:'100%'}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:20,color:'var(--text)'}}>Weekly Revenue (Past 7 Days)</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:6,height:140}}>
                  {last7.map((d,i)=>{
                    const h=Math.max(8,(d.rev/maxRev)*120);
                    return (
                      <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                        <div style={{fontSize:9,color:'var(--muted)'}}>{d.rev>0?`${Math.round(d.rev/1000)}k`:''}</div>
                        <div style={{width:'100%',height:h,background:'var(--brand)',borderRadius:'4px 4px 0 0',opacity:0.85,transition:'height 0.4s'}}/>
                        <div style={{fontSize:10,color:'var(--muted)'}}>{d.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[{l:'Total Sales',v:fmtMoney(totalSales),bg:'#eff6ff',c:'#1d4ed8'},{l:'Total Purchases',v:fmtMoney(0),bg:'#fff7ed',c:'#c2410c'},{l:'Total Expenses',v:fmtMoney(totalExp),bg:'#fef2f2',c:'#dc2626'},{l:'Total Indirect Income',v:fmtMoney(totalIndIncome),bg:'#f0fdf4',c:'#16a34a'}].map(x=>(
              <div key={x.l} style={{border:`1.5px solid ${x.bg}`,borderRadius:10,padding:'14px 16px',background:x.bg}}>
                <div style={{fontSize:12,fontWeight:600,color:x.c,marginBottom:4}}>{x.l}</div>
                <div style={{fontSize:22,fontWeight:800,color:x.c}}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments / Pending / Weekly */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16,marginBottom:24}}>
        <SectionCard title="Payments"><NoData msg="No data"/></SectionCard>
        <SectionCard title="Pending Invoices">{invs.filter(i=>['sent','draft'].includes(i.status)).length===0?<NoData msg="No Pending Invoices"/>:<div className="tbl-wrap"><table className="tbl"><thead><tr><th>#</th><th>Amount</th><th>Status</th></tr></thead><tbody>{invs.filter(i=>['sent','draft'].includes(i.status)).map(inv=><tr key={inv.id}><td style={{fontWeight:700,color:'var(--brand)'}}>{inv.number}</td><td>{fmtMoney(calcDoc(inv.items||[],inv.disc).total)}</td><td><span className="badge badge-pending">{inv.status}</span></td></tr>)}</tbody></table></div>}</SectionCard>
        <SectionCard title="Weekly Revenue (Past 7 Days)">
          {invs.length===0?<NoData msg="No data"/>:(
            <div style={{padding:'16px',display:'flex',alignItems:'flex-end',gap:4,height:160}}>
              {last7.map((d,i)=>(<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}><div style={{width:'100%',height:Math.max(8,(d.rev/maxRev)*110),background:'var(--brand)',borderRadius:'3px 3px 0 0',opacity:0.8}}/><div style={{fontSize:9,color:'var(--muted)'}}>{d.label}</div></div>))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Product Analysis */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,flexWrap:'wrap'}}>
          <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>Product Analysis</span>
          <DateRangePicker from={dateFrom2} to={dateTo2} onFrom={setDateFrom2} onTo={setDateTo2}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
          <SectionCard title="Top Categories by sales"><NoData msg="No Categories by Sales"/></SectionCard>
          <SectionCard title="Top Products by Sales">{products.length===0?<NoData msg="No Products"/>:<div className="tbl-wrap"><table className="tbl"><thead><tr><th>Product</th><th>Price</th></tr></thead><tbody>{products.slice(0,5).map(p=><tr key={p.id}><td style={{fontWeight:600}}>{p.name}</td><td>{fmtMoney(p.price||0)}</td></tr>)}</tbody></table></div>}</SectionCard>
          <SectionCard title="Products expiring soon"><NoData msg="No Products"/></SectionCard>
          <SectionCard title="Low Inventory"><NoData msg="No Products"/></SectionCard>
          <SectionCard title="Top Products by revenue"><NoData msg="No Products"/></SectionCard>
          <SectionCard title="Top Expenses by Category">{expenses.length===0?<NoData msg="No Expense recorded in the date range selected"/>:<NoData msg="No data"/>}</SectionCard>
        </div>
      </div>

      {/* Customer Analysis */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,flexWrap:'wrap'}}>
          <span style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>Customer Analysis</span>
          <DateRangePicker from={dateFrom3} to={dateTo3} onFrom={setDateFrom3} onTo={setDateTo3}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
          <SectionCard title="Payment Methods"><NoData msg="No Payment Methods"/></SectionCard>
          <SectionCard title="Peak Performing Days"><NoData msg="No Customers"/></SectionCard>
          <SectionCard title="Recurring Customers"><NoData msg="No Regular Customers"/></SectionCard>
          <SectionCard title="Top Customers by Sales">{custs.length===0?<NoData msg="No Customers"/>:<div className="tbl-wrap"><table className="tbl"><thead><tr><th>Customer</th><th>Invoices</th></tr></thead><tbody>{custs.slice(0,5).map(c=><tr key={c.id}><td style={{fontWeight:600}}>{c.name}</td><td>{invs.filter(i=>i.customerId===c.id).length}</td></tr>)}</tbody></table></div>}</SectionCard>
        </div>
      </div>
    </div>
  );
}
