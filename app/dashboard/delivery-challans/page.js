'use client';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileText } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { fmtRs, fmtDate, calcDoc } from '@/lib/data';
import Link from 'next/link';
import { DeleteModal } from '@/components/Modal';

export default function DeliveryChallansPage() {
  const { state, removeItem, toast, fmtMoney, currency } = useApp();
  const [search, setSearch] = useState('');
  const [del, setDel] = useState(null);
  const [delL, setDelL] = useState(false);
  const challans = (state.estimates || []).filter(e => e.type === 'challan');
  const filtered = challans.filter(c => !search || c.number?.toLowerCase().includes(search.toLowerCase()));
  const handleDel = async () => { setDelL(true); await new Promise(r=>setTimeout(r,350)); removeItem('estimates', del.id); setDel(null); setDelL(false); toast('Deleted','success'); };
  return (
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <h1 style={{fontWeight:800,fontSize:22}}>Delivery Challans</h1>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>
        </div>
        <Link href="/dashboard/create/challan" className="btn btn-brand btn-sm"><Plus size={14}/> Create Challan</Link>
      </div>
      <div className="card">
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:10}}>
          <div className="search-bar" style={{maxWidth:300}}><Search size={14} color="#9ca3af"/><input placeholder="Search challans..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        {filtered.length===0?(
          <div style={{padding:'60px 32px',textAlign:'center'}}>
            <FileText size={48} style={{opacity:0.08,margin:'0 auto 16px',display:'block',color:'var(--text)'}}/>
            <p style={{fontWeight:600,fontSize:16,color:'var(--text)',marginBottom:8}}>No Delivery Challans</p>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:18}}>Create delivery challans to track goods dispatched to customers.</p>
            <Link href="/dashboard/create/challan" className="btn btn-brand btn-sm"><Plus size={13}/> Create your first challan</Link>
          </div>
        ):(
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(c=>{
              const cust=(state.customers||[]).find(x=>x.id===c.partyId);
              const t=calcDoc(c.items||[],c.disc);
              return (<tr key={c.id}>
                <td style={{fontWeight:700,color:'var(--brand)'}}>{c.number}</td>
                <td>{fmtDate(c.date)}</td>
                <td>{cust?.name||'—'}</td>
                <td>{fmtMoney(t.total)}</td>
                <td><span className="badge badge-brand">{c.status||'draft'}</span></td>
                <td><div style={{display:'inline-flex',gap:4}}><button className="btn-icon" onClick={()=>setDel(c)}><Trash2 size={13} color="#dc2626"/></button></div></td>
              </tr>);
            })}</tbody>
          </table></div>
        )}
      </div>
      <DeleteModal open={!!del} onClose={()=>setDel(null)} onConfirm={handleDel} loading={delL} itemName="Challan"/>
    </div>
  );
}
