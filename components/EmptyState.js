'use client';
import { Phone, Headphones } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState({ type = 'generic', title, desc, action }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 24px', textAlign:'center', minHeight:320 }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--bg)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, flexShrink:0 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <h2 style={{ fontWeight:800, fontSize:20, marginBottom:10, color:'var(--text)' }}>{title}</h2>
      <div style={{ maxWidth:340, marginBottom:20 }}>
        {(Array.isArray(desc) ? desc : [desc]).map((d, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8, textAlign:'left' }}>
            <div style={{ width:18, height:18, borderRadius:'50%', background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
              <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize:13.5, color:'var(--muted)', lineHeight:1.5 }}>{d}</span>
          </div>
        ))}
      </div>
      {action && (
        <div style={{ width:'100%', maxWidth:300 }}>
          {action}
          <div style={{ display:'flex', gap:20, marginTop:14, flexWrap:'wrap', justifyContent:'center' }}>
            <a href="tel:+918121335436" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, color:'var(--brand)', fontWeight:600, textDecoration:'none' }}>
              <Headphones size={13}/> Talk to a specialist
            </a>
            <a href="tel:+918121335436" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, color:'var(--muted)', textDecoration:'none' }}>
              <Phone size={13}/> +91 812 133 5436
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
