'use client';
import { useState, useMemo } from 'react';
import { Search, Package, X } from 'lucide-react';
import Sheet from './Sheet';

export default function ProductSearch({ open, onClose, onSelect, products = [] }) {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (!q.trim()) return products.slice(0, 50);
    const lq = q.toLowerCase();
    return products.filter(p =>
      p.name?.toLowerCase().includes(lq) ||
      p.hsn?.toLowerCase().includes(lq) ||
      p.category?.toLowerCase().includes(lq)
    ).slice(0, 100);
  }, [q, products]);

  const handleSelect = (product) => {
    onSelect(product);
    setQ('');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={() => { setQ(''); onClose(); }}
      title="Search Products"
      size="md"
    >
      <div style={{ marginBottom: 14 }}>
        <div className="search-bar">
          <Search size={14} color="#9ca3af"/>
          <input
            autoFocus
            placeholder="Search by product name, HSN or category..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ fontSize: 14 }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
              <X size={14} color="#9ca3af"/>
            </button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--muted)' }}>
          <Package size={36} style={{ margin:'0 auto 12px', display:'block', opacity:0.15 }}/>
          <p style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>No products yet</p>
          <p style={{ fontSize:13 }}>Add products in Products & Services to use them here.</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ padding:32, textAlign:'center', color:'var(--muted)', fontSize:13 }}>
          No results for "{q}"
        </div>
      ) : (
        <div style={{ borderRadius:8, border:'1px solid var(--border)', overflow:'hidden' }}>
          {results.map((p, idx) => (
            <button key={p.id || idx}
              onClick={() => handleSelect(p)}
              style={{
                display:'flex', alignItems:'center', gap:12, width:'100%',
                padding:'11px 14px', background:'none', border:'none',
                borderBottom: idx < results.length-1 ? '1px solid var(--border)' : 'none',
                cursor:'pointer', textAlign:'left', transition:'background 0.1s',
                fontFamily:'Inter,sans-serif'
              }}
              onMouseOver={e => e.currentTarget.style.background='var(--bg)'}
              onMouseOut={e => e.currentTarget.style.background='none'}
            >
              <div style={{ width:34, height:34, borderRadius:8, background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Package size={15} color="var(--brand)"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ fontSize:11.5, color:'var(--muted)', marginTop:2, display:'flex', gap:10 }}>
                  {p.hsn && <span>HSN: {p.hsn}</span>}
                  {p.category && <span>{p.category}</span>}
                  {p.unit && <span>{p.unit}</span>}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'var(--brand)' }}>
                  {p.price ? `₹${parseFloat(p.price).toLocaleString('en-IN')}` : '—'}
                </div>
                {p.gst !== undefined && (
                  <div style={{ fontSize:11, color:'var(--muted)' }}>GST {p.gst}%</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop:10, fontSize:11.5, color:'var(--muted)', textAlign:'center' }}>
        {results.length} of {products.length} products shown
      </div>
    </Sheet>
  );
}
