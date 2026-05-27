'use client';
import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { HSN_DATA } from '@/lib/data';
import Sheet from './Sheet';

export default function HSNSearch({ open, onClose, onSelect }) {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (!q.trim()) return HSN_DATA.slice(0, 24);
    const lq = q.toLowerCase();
    return HSN_DATA.filter(h =>
      h.code.startsWith(q) || h.desc.toLowerCase().includes(lq) || h.category.toLowerCase().includes(lq)
    ).slice(0, 50);
  }, [q]);

  return (
    <Sheet
      open={open}
      onClose={() => { setQ(''); onClose(); }}
      title="Search HSN / SAC"
      size="md"
    >
      <div style={{ marginBottom: 14 }}>
        <div className="search-bar">
          <Search size={14} color="#9ca3af" />
          <input
            autoFocus
            placeholder="Type HSN code or product name…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {results.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            No results for "{q}"
          </div>
        ) : results.map((h, i) => (
          <div key={i}
            onClick={() => { onSelect(h.code, h.desc); setQ(''); }}
            style={{ padding: '11px 14px', borderBottom: i < results.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.1s' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--brand-bg)'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13.5, color: 'var(--brand)', minWidth: 80 }}>{h.code}</span>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{h.desc}</div>
              <div style={{ fontSize: 11.5, color: '#9ca3af' }}>{h.category}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <a href="https://www.cbic-gst.gov.in/gst-goods-services-rates.html" target="_blank" rel="noreferrer"
          style={{ fontSize: 12.5, color: '#3b82f6', textDecoration: 'none' }}>
          Click here to check GST approved HSN/SAC codes ↗
        </a>
      </div>
    </Sheet>
  );
}
