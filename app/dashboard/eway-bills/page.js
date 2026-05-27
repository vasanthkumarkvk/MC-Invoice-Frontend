'use client';
import { useState } from 'react';
import { Plus, FileCheck } from 'lucide-react';
function EwayConnectModal({ onClose }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.42)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,maxWidth:480,width:'100%',overflow:'hidden',boxShadow:'0 8px 48px rgba(0,0,0,0.18)'}}>
        <div style={{background:'linear-gradient(135deg,#8f195c,#b52577)',padding:'28px 28px 24px',color:'#fff',textAlign:'center',borderRadius:'16px 16px 0 0'}}>
          <div style={{width:52,height:52,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div style={{fontWeight:800,fontSize:20,marginBottom:6}} onClick={()=>setShowConnect(true)}>Connect to E-way Bill Portal</div>
          <p style={{fontSize:13,opacity:0.9,lineHeight:1.5}}>Generate and manage e-way bills directly from Zetsap. Connect your GSTIN to get started.</p>
        </div>
        <div style={{padding:'24px 28px'}}>
          <div style={{marginBottom:14}}>
            {[['Lightning fast','Generate e-way bills in seconds'],['Auto-fill','GSTIN and vehicle details auto-populated'],['Compliance','100% GST compliant e-way bills'],['Alerts','Get expiry and renewal alerts']].map(([title,desc])=>(
              <div key={title} style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:'#d1fae5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{textAlign:'left'}}>
                  <div style={{fontWeight:700,fontSize:13.5,color:'#111827'}}>{title}</div>
                  <div style={{fontSize:12.5,color:'#6b7280',marginTop:2}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:'#fdf0f7',borderRadius:8,padding:'12px 14px',marginBottom:18,fontSize:12.5,color:'#8f195c',fontWeight:600}}>
            Available on Growth & Enterprise plans. Upgrade to connect.
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:'10px',background:'#f3f4f6',border:'none',borderRadius:9,cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,color:'#374151',fontSize:13}}>Cancel</button>
            <button style={{flex:2,padding:'10px',background:'#8f195c',border:'none',borderRadius:9,cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:700,color:'#fff',fontSize:13}}>
              Upgrade to Connect
            </button>
          </div>
          <div style={{textAlign:'center',marginTop:12,fontSize:12,color:'#6b7280'}}>
            <span style={{marginRight:6}}>Talk to a specialist</span>
            <a href="tel:+917305940914" style={{color:'#8f195c',fontWeight:600,textDecoration:'none'}}>+91 7305 940 914</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EwayBillsPage() {
  const [showConnect, setShowConnect] = useState(false);
  return(
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h1 style={{fontWeight:800,fontSize:22}}>E-way Bills</h1>
        <button className="btn btn-brand btn-sm"><Plus size={14}/> Generate E-way Bill</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:20}}>
        {[{l:'Total Bills',v:0},{l:'Active',v:0},{l:'Cancelled',v:0},{l:'Expired',v:0}].map(s=>(
          <div key={s.l} className="stat-card"><div style={{fontWeight:800,fontSize:24}}>{s.v}</div><div style={{fontSize:12.5,color:'var(--muted)',marginTop:3}}>{s.l}</div></div>
        ))}
      </div>
      <div className="card">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 32px',textAlign:'center',gap:20}}>
          <FileCheck size={56} style={{opacity:.12}}/>
          <div style={{fontWeight:800,fontSize:20}}>E-way Bill Management</div>
          <div style={{color:'var(--muted)',fontSize:13.5,maxWidth:420}}>Generate and manage e-way bills for goods transportation. Connect to the government e-way bill portal to get started.</div>
          <button className="btn btn-brand btn-lg" style={{justifyContent:'center'}} onClick={()=>setShowConnect(true)}>Connect to E-way Bill Portal</button>
      {showConnect && <EwayConnectModal onClose={()=>setShowConnect(false)}/>}
          <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
            <span style={{fontSize:12.5,color:'#6b7280'}}>Talk to a specialist</span>
            <a href="tel:+918121335436" style={{display:'flex',alignItems:'center',gap:6,fontSize:12.5,color:'var(--muted)',textDecoration:'none'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> +91 812 133 5436</a>
          </div>
        </div>
      </div>
    </div>
  );
}
