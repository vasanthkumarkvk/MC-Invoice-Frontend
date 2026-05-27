'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { fmtRs } from '@/lib/data';
import { ArrowLeft, ArrowUp, ArrowDown, Package, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TimelinePage() {
  const { state, fmtMoney, currency } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const products = (state.products || []).filter(p => p.type === 'product');

  const movements = products.flatMap(p => [
    ...(p.stock > 0 ? [{ id: p.id + '_open', product: p, type: 'in', qty: p.stock || 0, reason: 'Opening stock', date: p.createdAt || new Date().toISOString() }] : []),
  ]).sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = filter === 'all' ? movements : movements.filter(m => m.type === filter);

  const totalIn  = movements.filter(m => m.type === 'in').reduce((s, m) => s + m.qty, 0);
  const totalOut = movements.filter(m => m.type === 'out').reduce((s, m) => s + m.qty, 0);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <button className="btn-icon" onClick={() => router.push('/dashboard/inventory')} style={{ border:'1px solid var(--border)' }}>
          <ArrowLeft size={16}/>
        </button>
        <div>
          <h1 style={{ fontWeight:800, fontSize:22, color:'var(--text)' }}>Stock Movement Timeline</h1>
          <p style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>Track all inventory changes in real time</p>
        </div>
        <Link href="/dashboard/inventory" className="btn btn-outline btn-sm" style={{ marginLeft:'auto' }}>
          Warehouse View
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:14, marginBottom:20 }}>
        {[
          { label:'Total Products', value: products.length, icon: Package, color:'#8f195c', bg:'#fdf0f7' },
          { label:'Stock In', value: totalIn, icon: TrendingUp, color:'#059669', bg:'#d1fae5' },
          { label:'Stock Out', value: totalOut, icon: TrendingDown, color:'#dc2626', bg:'#fee2e2' },
          { label:'Movements', value: movements.length, icon: RefreshCw, color:'#1d4ed8', bg:'#dbeafe' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <s.icon size={16} color={s.color}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:20, color:'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','All'], ['in','Stock In'], ['out','Stock Out']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={filter === val ? 'chip active' : 'chip'}
            style={{ fontSize:12 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding:'60px 32px', textAlign:'center', color:'var(--muted)' }}>
            <RefreshCw size={40} style={{ margin:'0 auto 14px', display:'block', opacity:0.12 }}/>
            <p style={{ fontWeight:600, fontSize:16, color:'var(--text)', marginBottom:6 }}>No movements yet</p>
            <p style={{ fontSize:13 }}>Add products and adjust stock to see movements here.</p>
            <Link href="/dashboard/create/product" className="btn btn-brand btn-sm" style={{ marginTop:16, display:'inline-flex' }}>
              Add Product
            </Link>
          </div>
        ) : (
          <div style={{ padding:'8px 0' }}>
            {filtered.map((m, idx) => {
              const isIn = m.type === 'in';
              return (
                <div key={m.id} style={{ display:'flex', gap:16, padding:'14px 20px', borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
                  {/* Icon */}
                  <div style={{ width:38, height:38, borderRadius:'50%', background: isIn ? '#d1fae5' : '#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    {isIn ? <ArrowUp size={15} color="#059669"/> : <ArrowDown size={15} color="#dc2626"/>}
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{m.product.name}</span>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background: isIn ? '#d1fae5' : '#fee2e2', color: isIn ? '#059669' : '#dc2626' }}>
                        {isIn ? '+' : '-'}{m.qty} units
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--muted)', marginTop:4, display:'flex', gap:12, flexWrap:'wrap' }}>
                      <span>Reason: <strong style={{ color:'var(--text)' }}>{m.reason}</strong></span>
                      {m.product.category && <span>Category: <strong style={{ color:'var(--text)' }}>{m.product.category}</strong></span>}
                    </div>
                  </div>

                  {/* Value */}
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{fmtMoney((m.product.price || 0) * m.qty)}</div>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>Sales value</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>Stock: {m.product.stock || 0}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
