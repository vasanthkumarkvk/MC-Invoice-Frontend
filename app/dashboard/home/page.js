'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Users, Package, IndianRupee, Tag, TrendingUp, Clock, CheckCircle, ChevronRight, Star, Activity, ArrowUpRight, Plus, Truck } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { fmtRs, calcDoc } from '@/lib/data';

const QUICK_LINKS = [
  { label:'Invoices',  Icon:FileText, href:'/dashboard/sales',    color:'#8f195c', bg:'#fdf0f7' },
  { label:'Customers', Icon:Users,    href:'/dashboard/customers', color:'#5b21b6', bg:'#f5f3ff' },
  { label:'Products',  Icon:Package,  href:'/dashboard/products',  color:'#1d4ed8', bg:'#eff6ff' },
  { label:'Vendors',   Icon:Truck,    href:'/dashboard/vendors',   color:'#065f46', bg:'#ecfdf5' },
  { label:'Expenses',  Icon:Tag,      href:'/dashboard/expenses',  color:'#b45309', bg:'#fefce8' },
];

const SETUP_STEPS = [
  { id:'invoice', label:'Set up your invoice template',      href:'/dashboard/create/invoice' },
  { id:'payment', label:'Add your bank payment details',     href:'/dashboard/bank-details' },
  { id:'tally',   label:'Connect Tally for accounting sync', href:'/dashboard/tally' },
];

export default function HomePage() {
  const { state, fmtMoney, currency } = useApp();
  const router = useRouter();
  const [setupDone, setSetupDone] = useState({});

  const invoices  = state.invoices  || [];
  const customers = state.customers || [];
  const products  = state.products  || [];
  const expenses  = state.expenses  || [];
  const indIncome = state.indirectIncome || [];

  const totalRevenue   = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);
  const outstanding    = invoices.filter(i=>['sent','draft'].includes(i.status)).reduce((s,i)=>s+calcDoc(i.items||[],i.disc).total,0);
  const totalExpenses  = expenses.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const recentInvoices = [...invoices].sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,5);
  const name  = state.profile?.firstName || 'there';
  const hr    = new Date().getHours();
  const greet = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const setupPercent = Math.round((Object.keys(setupDone).length/SETUP_STEPS.length)*100);

  return (
    <div className="home-page-wrap" style={{ padding:'20px 24px', maxWidth:'100%' }}>

      {/* Quick pill links */}
      <div className="quick-pills">
        {QUICK_LINKS.map(q=>(
          <Link key={q.label} href={q.href}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:24, background:q.bg, color:q.color, fontWeight:600, fontSize:13, textDecoration:'none', border:`1px solid ${q.color}22`, whiteSpace:'nowrap', flexShrink:0 }}>
            <q.Icon size={14}/>{q.label}
          </Link>
        ))}
      </div>

      {/* Greeting */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontWeight:800, fontSize:26, color:'var(--text)', letterSpacing:'-0.02em' }}>{greet}, {name} 👋</h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginTop:3 }}>Here is an overview of your business today.</p>
      </div>

      {/* Insight strip — image 7 style, full width */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:20 }} className="insight-grid">
        {[
          { label:'Cash In',          v:fmtMoney(totalRevenue),  Icon:TrendingUp,   c:'#10b981', sub:'Revenue earned' },
          { label:'Cash Out',         v:fmtMoney(totalExpenses), Icon:IndianRupee,  c:'#ef4444', sub:'Total expenses' },
          { label:'Products Sold',    v:products.length,      Icon:Package,      c:'#8f195c', sub:'Active products' },
          { label:'Customers',        v:customers.length,     Icon:Users,        c:'#3b82f6', sub:'Total clients' },
          { label:'Pending Invoices', v:fmtMoney(outstanding),  Icon:Clock,        c:'#f59e0b', sub:`${invoices.filter(i=>['sent','draft'].includes(i.status)).length} invoices` },
          { label:'Invoices Created', v:invoices.length,      Icon:FileText,     c:'#6366f1', sub:'All time' },
        ].map(s=>(
          <div key={s.label} style={{ border:'1px solid var(--border)', borderRadius:12, padding:'16px 16px', background:'var(--card-bg)', transition:'box-shadow 0.15s' }}
            onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
            onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.04em', lineHeight:1.3 }}>{s.label}</div>
              <div style={{ width:30, height:30, borderRadius:8, background:`${s.c}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <s.Icon size={15} color={s.c}/>
              </div>
            </div>
            <div style={{ fontWeight:800, fontSize:20, color:'var(--text)', lineHeight:1, marginBottom:4 }}>{s.v}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main layout: left (recent invoices) + right (setup + summary) */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }} className="home-main-grid">

        {/* Left: Revenue + Outstanding stat cards + Recent invoices */}
        <div>
          {/* 4-col stat cards */}
          <div style={{ marginBottom:8, fontSize:12, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Business Overview</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }} className="stats-grid">
            {[
              { l:'Revenue',      v:fmtMoney(totalRevenue),  sub:`${invoices.filter(i=>i.status==='paid').length} paid`,    accent:'#10b981', bg:'#ecfdf5', Icon:TrendingUp },
              { l:'Outstanding',  v:fmtMoney(outstanding),   sub:`${invoices.filter(i=>['sent','draft'].includes(i.status)).length} pending`, accent:'#f59e0b', bg:'#fffbeb', Icon:Clock },
              { l:'Customers',    v:customers.length,      sub:'Total clients',    accent:'#8f195c', bg:'#fdf0f7', Icon:Users },
              { l:'Expenses',     v:fmtMoney(totalExpenses), sub:`${expenses.length} records`, accent:'#ef4444', bg:'#fef2f2', Icon:IndianRupee },
            ].map(s=>(
              <div key={s.l} className="stat-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{s.l}</div>
                    <div style={{ fontWeight:800, fontSize:20, color:'var(--text)' }}>{s.v}</div>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{s.sub}</div>
                  </div>
                  <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <s.Icon size={18} color={s.accent}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Invoices */}
          <div className="card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:700, fontSize:14 }}>Recent Invoices</span>
              <Link href="/dashboard/sales" style={{ fontSize:12.5, color:'var(--brand)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                View all <ChevronRight size={13}/>
              </Link>
            </div>
            {recentInvoices.length===0 ? (
              <div style={{ padding:'48px 20px', textAlign:'center' }}>
                <FileText size={40} style={{ opacity:0.08, margin:'0 auto 14px', display:'block', color:'var(--text)' }}/>
                <p style={{ fontSize:13, color:'var(--muted)', marginBottom:14 }}>No invoices yet. Create your first invoice to get started.</p>
                <Link href="/dashboard/create/invoice" className="btn btn-brand btn-sm" style={{ textDecoration:'none' }}>
                  <Plus size={13}/> Create your first invoice
                </Link>
              </div>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>#</th><th>Customer</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                  <tbody>{recentInvoices.map(inv=>{
                    const cust=(state.customers||[]).find(x=>x.id===inv.customerId);
                    const t=calcDoc(inv.items||[],inv.disc);
                    const sColors={paid:'#065f46',draft:'#374151',sent:'#1e40af',overdue:'#991b1b'};
                    const sBgs={paid:'#d1fae5',draft:'#f3f4f6',sent:'#dbeafe',overdue:'#fee2e2'};
                    return (
                      <tr key={inv.id} style={{ cursor:'pointer' }} onClick={()=>router.push('/dashboard/sales')}>
                        <td style={{ fontWeight:700, color:'var(--brand)', fontSize:13 }}>{inv.number}</td>
                        <td style={{ fontWeight:500 }}>{cust?.name||'—'}</td>
                        <td style={{ fontWeight:700 }}>{fmtMoney(t.total)}</td>
                        <td><span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11.5, fontWeight:600, background:sBgs[inv.status]||'#f3f4f6', color:sColors[inv.status]||'#374151' }}>{(inv.status||'draft').charAt(0).toUpperCase()+(inv.status||'draft').slice(1)}</span></td>
                        <td><ArrowUpRight size={14} color="var(--muted)"/></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Get Started + Business Summary */}
        <div className="home-right-col">
          <div className="card" style={{ padding:20, marginBottom:16, border:'1.5px solid var(--brand)', background:'var(--brand-bg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <Star size={16} color="var(--brand)"/>
              <span style={{ fontWeight:700, fontSize:14, color:'var(--brand)' }}>Get Started</span>
              <span style={{ marginLeft:'auto', fontSize:12, color:'var(--brand)', fontWeight:600, background:'rgba(143,25,92,0.1)', padding:'2px 8px', borderRadius:20 }}>{setupPercent}%</span>
            </div>
            <div style={{ height:4, background:'rgba(143,25,92,0.15)', borderRadius:99, marginBottom:14, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${setupPercent}%`, background:'var(--brand)', borderRadius:99, transition:'width 0.4s' }}/>
            </div>
            {SETUP_STEPS.map((step,i)=>(
              <div key={step.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:i<SETUP_STEPS.length-1?'1px solid rgba(143,25,92,0.1)':'none' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:setupDone[step.id]?'#6b7280':'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {setupDone[step.id]?<CheckCircle size={14} color="#fff"/>:<span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{i+1}</span>}
                </div>
                <span style={{ flex:1, fontSize:13, color:'var(--brand)', lineHeight:1.4 }}>{step.label}</span>
                <Link href={step.href} onClick={()=>setSetupDone(d=>({...d,[step.id]:true}))} style={{ textDecoration:'none' }}>
                  <span style={{ fontSize:11.5, color:'var(--brand)', fontWeight:700 }}>{setupDone[step.id]?'Done':'Set up →'}</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={15} color="var(--brand)"/> Business Summary
            </div>
            {[
              { l:'Total Invoices',      v:invoices.length,   href:'/dashboard/sales' },
              { l:'Products / Services', v:products.length,   href:'/dashboard/products' },
              { l:'Total Customers',     v:customers.length,  href:'/dashboard/customers' },
              { l:'Total Expenses',      v:expenses.length,   href:'/dashboard/expenses' },
            ].map(r=>(
              <Link key={r.l} href={r.href} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)', textDecoration:'none' }}>
                <span style={{ fontSize:13, color:'var(--muted)' }}>{r.l}</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{r.v}</span>
                  <ChevronRight size={13} color="var(--muted)"/>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .quick-pills { display:flex; gap:8px; margin-bottom:20px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-bottom:4px; }
        .quick-pills::-webkit-scrollbar { display:none; }
        .insight-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; margin-bottom:20px; }
        .home-main-grid { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
        @media(max-width:1200px){ .insight-grid { grid-template-columns:repeat(3,1fr) !important; } }
        @media(max-width:1024px){ .home-main-grid { grid-template-columns:1fr !important; } .stats-grid { grid-template-columns:repeat(2,1fr) !important; } }
        @media(max-width:768px){
          .insight-grid { grid-template-columns:repeat(2,1fr) !important; }
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .home-main-grid { grid-template-columns:1fr !important; }
          .home-right-col { order: -1; }
          .home-page-wrap { padding: 10px !important; }
          .home-page-wrap .card { margin-left:0 !important; margin-right:0 !important; }
        }
        @media(max-width:480px){ .insight-grid { grid-template-columns:1fr 1fr !important; } .stats-grid { grid-template-columns:1fr 1fr !important; } }
      `}</style>
    </div>
  );
}
