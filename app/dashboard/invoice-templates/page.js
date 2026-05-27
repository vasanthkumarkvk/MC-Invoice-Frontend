'use client';
import { useState } from 'react';
import { Check, X, ArrowLeft, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { useRouter } from 'next/navigation';

const fR = n => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

/* ── Template-specific sample data ── */
const DATA = {
  modern: {
    company:'TechCraft Solutions', email:'hello@techcraft.io', phone:'+91 98765 43210',
    address:'14, Prestige Tech Park, Whitefield, Bengaluru 560066', gstin:'29AABCT1332L000',
    customer:'Infosys Ltd.', customerAddr:'Electronics City, Phase 1, Bengaluru 560100',
    items:[
      { name:'Website Redesign & Development', qty:1, price:85000, gst:18 },
      { name:'SEO & Content Strategy (3 months)', qty:3, price:12000, gst:18 },
      { name:'UI/UX Consultation', qty:8, price:3500, gst:18 },
      { name:'Cloud Hosting Setup (Annual)', qty:1, price:24000, gst:18 },
      { name:'Technical Support Retainer', qty:2, price:8000, gst:18 },
    ],
    number:'TCH-2026-042', date:'10 Apr 2026', due:'10 May 2026'},
  social: {
    company:'SocialCraft Studio', email:'hello@socialcraft.io', phone:'+91 77777 88888',
    address:'12, Anna Nagar, 2nd Street, Chennai 600040', gstin:'33ABCDE1234F1Z5',
    customer:'Acme Retail Pvt. Ltd.', customerAddr:'45, MG Road, Nungambakkam, Chennai 600034',
    items:[
      { name:'Instagram Static Posts (12 posts)', qty:12, price:1200, gst:18, badge:'Insta Post' },
      { name:'Instagram Reels (8 videos)', qty:8, price:2500, gst:18, badge:'Reel' },
      { name:'Instagram Stories (20 slides)', qty:20, price:600, gst:18, badge:'Story' },
      { name:'Social Media Management (monthly)', qty:1, price:8000, gst:18, badge:'Management' },
      { name:'Ad Campaign Design & Setup', qty:2, price:4500, gst:18, badge:'Ads' },
    ],
    number:'SC-2026-042', date:'10 Apr 2026', due:'30 Apr 2026'},
  local: {
    company:'Ravi General Store', email:'ravistores@gmail.com', phone:'+91 98400 11223',
    address:'No. 7, Gandhi Street, T. Nagar, Chennai 600017', gstin:'33AABCR1234M1ZX',
    customer:'Meena Krishnamurthy', customerAddr:'42, Pondy Bazaar, 3rd Cross, Chennai 600017',
    items:[
      { name:'Basmati Rice (5 kg)', hsn:'1006', qty:3, price:480, gst:5, badge:'Grocery' },
      { name:'Refined Sunflower Oil (1 L)', hsn:'1512', qty:6, price:160, gst:5, badge:'Edible Oil' },
      { name:'Toor Dal (1 kg)', hsn:'0713', qty:4, price:145, gst:0, badge:'Pulses' },
      { name:'Detergent Powder (1 kg)', hsn:'3402', qty:2, price:220, gst:18, badge:'Household' },
      { name:'Whole Wheat Flour (5 kg)', hsn:'1101', qty:2, price:250, gst:0, badge:'Flour' },
    ],
    number:'RGS-2026-108', date:'10 Apr 2026', due:'20 Apr 2026'},
  healthcare: {
    company:'MediCare Clinic & Diagnostics', email:'care@medicareclinic.in', phone:'+91 44 2345 6789',
    address:'No. 14, Anna Salai, Teynampet, Chennai 600018', gstin:'33AABCM5678H1Z1',
    customer:'Anand Subramaniam', customerAddr:'7/3, Nehru Street, Kodambakkam, Chennai 600024',
    items:[
      { name:'Consultation – General Medicine', code:'99213', qty:1, price:600, gst:0, badge:'Consultation' },
      { name:'Complete Blood Count (CBC)', code:'85025', qty:1, price:450, gst:5, badge:'Lab Test' },
      { name:'Chest X-Ray (PA View)', code:'71046', qty:1, price:800, gst:5, badge:'Radiology' },
      { name:'Prescribed Medication – Azithromycin 500mg', code:'RX-001', qty:1, price:380, gst:12, badge:'Pharmacy' },
      { name:'Registration & Consultation Fee', code:'REG-001', qty:1, price:50, gst:0, badge:'Admin' },
    ],
    number:'MC-2026-0874', date:'10 Apr 2026', due:'17 Apr 2026'},
  dark: {
    company:'Pinnacle Consulting Group', email:'billing@pinnacle.in', phone:'+91 80 4567 8901',
    address:'Tower B, UB City, Vittal Mallya Road, Bengaluru 560001', gstin:'29AABCP9876X1Z2',
    customer:'Mahindra Finance Ltd.', customerAddr:'Gateway Building, Apollo Bunder, Mumbai 400001',
    items:[
      { name:'Strategic Advisory Services (Q1 2026)', qty:1, price:250000, gst:18 },
      { name:'Financial Due Diligence Report', qty:1, price:85000, gst:18 },
      { name:'Board Presentation & Deck', qty:3, price:15000, gst:18 },
      { name:'Risk Assessment Framework', qty:1, price:60000, gst:18 },
      { name:'Implementation Support (Monthly)', qty:2, price:45000, gst:18 },
    ],
    number:'PCG-2026-ENT-011', date:'10 Apr 2026', due:'10 May 2026'}};

/* ══════════════════ TEMPLATE RENDERERS ══════════════════ */

function TemplateModern({ accent = '#8f195c', d, mini }) {
  const a = accent; const p = mini ? 16 : 4;
  const t = { fs: mini?7:12, fsb: mini?9:15, fsm: mini?7.5:13, fsh: mini?8:11 };
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  return (
    <div style={{background:'#fff',fontFamily:"'Inter',sans-serif",color:'#111',minHeight:mini?'auto':'100%',position:'relative',overflow:'hidden'}}>
      <div style={{height:mini?3:5,background:`linear-gradient(90deg,${a},${a}88)`}}/>
      <div style={{position:'absolute',bottom:0,right:0,width:mini?100:200,height:mini?100:200,borderRadius:'50%',background:`${a}06`,transform:'translate(40%,40%)'}}/> 
      <div style={{padding:`${p}px ${p+8}px`}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:mini?10:24}}>
          <div>
            <div style={{fontWeight:800,fontSize:t.fsb,color:a}}>{d.company}</div>
            <div style={{fontSize:t.fsh,color:'#6b7280',marginTop:2}}>{d.email} · {d.phone}</div>
            {!mini&&<div style={{fontSize:t.fsh,color:'#6b7280'}}>{d.address}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?6:9,letterSpacing:'0.15em',color:'#9ca3af',textTransform:'uppercase'}}>Invoice</div>
            <div style={{fontSize:mini?10:18,fontWeight:800,color:a}}>{d.number}</div>
            {!mini&&<><div style={{fontSize:10,color:'#9ca3af'}}>Date: <span style={{color:'#111',fontWeight:500}}>{d.date}</span></div>
            <div style={{fontSize:10,color:'#9ca3af'}}>Due: <span style={{color:'#dc2626',fontWeight:600}}>{d.due}</span></div></>}
          </div>
        </div>
        {!mini&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            {[{title:'FROM',name:d.company,addr:d.address},{title:'BILL TO',name:d.customer,addr:d.customerAddr}].map(p=>(
              <div key={p.title} style={{padding:'12px 14px',background:`${a}08`,borderRadius:8,border:`1px solid ${a}20`}}>
                <div style={{fontSize:9,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>{p.title}</div>
                <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                <div style={{fontSize:11,color:'#6b7280'}}>{p.addr}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 48px 72px 72px',padding:`${mini?5:9}px ${mini?8:12}px`,background:`${a}14`,borderRadius:5,marginBottom:3,gap:6}}>
          {['Item','Qty','Price','Amount'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:a,textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 48px 72px 72px',padding:`${mini?5:9}px ${mini?8:12}px`,borderBottom:'1px solid #e5e7eb',gap:6,alignItems:'center'}}>
            <div style={{fontWeight:600,fontSize:t.fsm}}>{item.name}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#6b7280'}}>{item.qty}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#6b7280'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700}}>{fR(item.qty*item.price)}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?8:18}}>
          <div style={{width:mini?130:220}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['GST',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:t.fs,color:'#6b7280',borderBottom:`1px solid ${a}15`}}>
                <span>{l}</span><span>{fR(v)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?7:12}px ${mini?8:14}px`,background:a,borderRadius:7,marginTop:mini?5:10}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Total</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#fff'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
        {!mini&&<div style={{marginTop:20,paddingTop:14,borderTop:`1px solid ${a}18`,display:'flex',justifyContent:'space-between',fontSize:10,color:'#9ca3af'}}><span>Thank you for your business! Payment within 30 days.</span><span style={{color:a,fontWeight:700}}>zetsap.com</span></div>}
      </div>
    </div>
  );
}

function TemplateSocial({ accent = '#7c3aed', d, mini }) {
  const a = accent; const p = mini ? 14 : 4;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:10 };
  const BADGE_COLORS = [['#f0ebff','#7c3aed'],['#fce4f0','#be185d'],['#e0faf4','#0f766e'],['#fef3c7','#b45309'],['#dbeafe','#1d4ed8']];
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  return (
    <div style={{background:'#fff',fontFamily:"'Inter',sans-serif",position:'relative',overflow:'hidden'}}>
      <div style={{height:mini?3:5,background:`linear-gradient(90deg,${a},#a855f7,#ec4899)`}}/>
      <div style={{position:'absolute',bottom:0,right:0,width:mini?90:180,height:mini?90:180,borderRadius:'50%',background:'#f5f0ff',transform:'translate(40%,40%)'}}/>
      <div style={{padding:`${p}px ${p+8}px`,position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:mini?8:20}}>
          <div>
            <div style={{fontWeight:800,fontSize:t.fsb,color:a}}>{d.company}</div>
            <div style={{fontSize:t.fsh,color:'#a78bfa',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Social Media Agency</div>
            {!mini&&<div style={{fontSize:10,color:'#666',marginTop:3}}>{d.email} · {d.phone}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?12:22,fontWeight:700,color:a}}>INVOICE</div>
            <div style={{fontSize:t.fsh,color:'#888'}}>#{d.number}</div>
            {!mini&&<><div style={{fontSize:10,color:'#999',marginTop:3}}>Issue: <span style={{color:'#333',fontWeight:500}}>{d.date}</span></div>
            <div style={{fontSize:10,color:'#999'}}>Due: <span style={{color:'#ec4899',fontWeight:600}}>{d.due}</span></div></>}
          </div>
        </div>
        {!mini&&(
          <div style={{display:'flex',gap:8,marginBottom:18}}>
            {[{l:'Billing Period',v:'April 2026',bg:'#faf8ff',b:'#e4d9ff'},{l:'Campaign',v:'Spring Launch',bg:'#fff8fb',b:'#fce4f0'},{l:'Currency',v:'INR (₹)',bg:'#faf8ff',b:'#e4d9ff'}].map(c=>(
              <div key={c.l} style={{flex:1,background:c.bg,border:`1px solid ${c.b}`,borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:8,textTransform:'uppercase',letterSpacing:'0.08em',color:'#a78bfa',fontWeight:700,marginBottom:2}}>{c.l}</div>
                <div style={{fontSize:12,color:'#1a1a2e',fontWeight:500}}>{c.v}</div>
              </div>
            ))}
          </div>
        )}
        {!mini&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18}}>
            {[{title:'Billed From',name:d.company,addr:d.address,bg:'#faf8ff',bdr:'#e4d9ff'},{title:'Billed To',name:d.customer,addr:d.customerAddr,bg:'#fff8fb',bdr:'#fce4f0'}].map(p=>(
              <div key={p.title} style={{padding:'12px 14px',background:p.bg,border:`1px solid ${p.bdr}`,borderRadius:8}}>
                <div style={{fontSize:9,fontWeight:700,color:'#a78bfa',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>{p.title}</div>
                <div style={{fontWeight:700,fontSize:13,color:'#1a1a2e'}}>{p.name}</div>
                <div style={{fontSize:11,color:'#666',lineHeight:1.5,marginTop:2}}>{p.addr}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?5:9}px ${mini?8:12}px`,background:'#f5f0ff',borderRadius:5,marginBottom:3,gap:6}}>
          {['Service','Qty','Price','Amount'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:a,textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{borderBottom:'1px solid #f5f0ff',padding:`${mini?5:9}px ${mini?8:12}px`}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',gap:6,alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600,fontSize:t.fsm}}>{item.name}</div>
                {!mini&&item.badge&&<span style={{display:'inline-block',fontSize:9,padding:'2px 7px',borderRadius:20,background:BADGE_COLORS[i%5][0],color:BADGE_COLORS[i%5][1],marginTop:2,fontWeight:500}}>{item.badge}</span>}
              </div>
              <div style={{textAlign:'right',fontSize:t.fs,color:'#888'}}>{item.qty}</div>
              <div style={{textAlign:'right',fontSize:t.fs,color:'#888'}}>{fR(item.price)}</div>
              <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700}}>{fR(item.qty*item.price)}</div>
            </div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?6:16}}>
          <div style={{width:mini?130:230}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['GST',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:t.fs,color:'#555',borderBottom:'1px solid #f5f0ff'}}><span>{l}</span><span>{fR(v)}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?7:12}px ${mini?8:14}px`,background:a,borderRadius:8,marginTop:mini?5:10}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Total Due</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#fff'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
        {!mini&&<div style={{marginTop:16,padding:'12px 14px',background:'#fff8fb',border:'1px solid #fce4f0',borderRadius:8,fontSize:11,color:'#666',lineHeight:1.7}}>Payment due within 20 days. Late payments subject to 2% monthly interest. Thank you!</div>}
      </div>
    </div>
  );
}

function TemplateLocal({ accent = '#ea580c', d, mini }) {
  const a = accent; const p = mini ? 14 : 6;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:10 };
  const BADGE_COLORS = ['#ffedd5','#dcfce7','#dbeafe','#fef9c3','#f3e8ff'];
  const BADGE_TEXT = ['#c2410c','#15803d','#1d4ed8','#a16207','#7e22ce'];
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  return (
    <div style={{background:'#fff',fontFamily:"'Inter',sans-serif",position:'relative',overflow:'hidden'}}>
      <div style={{height:mini?3:6,background:`linear-gradient(90deg,#c2410c,${a},#f97316)`}}/>
      <div style={{position:'absolute',top:0,left:0,bottom:0,width:mini?2:4,background:a}}/>
      <div style={{position:'absolute',bottom:0,right:0,width:mini?90:180,height:mini?90:180,borderRadius:'50%',background:'#fff7ed',transform:'translate(40%,40%)'}}/>
      <div style={{padding:`${p}px ${p+8}px ${p}px ${p+12}px`,position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:mini?8:20}}>
          <div>
            <div style={{fontWeight:800,fontSize:t.fsb,color:'#1c1917'}}>{d.company}</div>
            <div style={{fontSize:t.fsh,color:a,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Local Retail Business</div>
            {!mini&&<div style={{fontSize:10,color:'#78716c',marginTop:3}}>{d.address}<br/>{d.phone} · {d.email}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?12:22,fontWeight:700,color:a}}>INVOICE</div>
            <div style={{fontSize:t.fsh,color:'#a8a29e'}}>Bill No. <span style={{color:'#1c1917',fontWeight:600}}>{d.number}</span></div>
            {!mini&&<><div style={{fontSize:10,color:'#a8a29e',marginTop:3}}>Issue: <span style={{color:'#1c1917',fontWeight:500}}>{d.date}</span></div>
            <div style={{fontSize:10,color:'#a8a29e'}}>Due: <span style={{color:'#dc2626',fontWeight:600}}>{d.due}</span></div></>}
          </div>
        </div>
        {!mini&&(
          <div style={{display:'flex',gap:8,marginBottom:18}}>
            {[{l:'Bill Date',v:d.date,bg:'#fff7ed',b:'#fed7aa',c:a},{l:'Payment Mode',v:'Cash / UPI',bg:'#f0fdf4',b:'#bbf7d0',c:'#16a34a'},{l:'GSTIN',v:d.gstin,bg:'#eff6ff',b:'#bfdbfe',c:'#2563eb'}].map(s=>(
              <div key={s.l} style={{flex:1,background:s.bg,border:`1px solid ${s.b}`,borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:8,textTransform:'uppercase',letterSpacing:'0.08em',color:s.c,fontWeight:700,marginBottom:2}}>{s.l}</div>
                <div style={{fontSize:11.5,color:'#1c1917',fontWeight:500}}>{s.v}</div>
              </div>
            ))}
          </div>
        )}
        {!mini&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18}}>
            <div style={{padding:'12px 14px',background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:8}}>
              <div style={{fontSize:9,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Sold By</div>
              <div style={{fontWeight:700,fontSize:13,color:'#1c1917'}}>{d.company}</div>
              <div style={{fontSize:11,color:'#78716c',lineHeight:1.5,marginTop:2}}>{d.address}</div>
            </div>
            <div style={{padding:'12px 14px',background:'#fafafa',border:'1px solid #e7e5e4',borderRadius:8}}>
              <div style={{fontSize:9,fontWeight:700,color:'#78716c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Sold To</div>
              <div style={{fontWeight:700,fontSize:13,color:'#1c1917'}}>{d.customer}</div>
              <div style={{fontSize:11,color:'#78716c',lineHeight:1.5,marginTop:2}}>{d.customerAddr}</div>
            </div>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?5:9}px ${mini?8:12}px`,background:'#fff7ed',borderRadius:5,borderBottom:'1px solid #fed7aa',marginBottom:2,gap:6}}>
          {['Item','Qty','Price','Amount'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:'#c2410c',textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?5:9}px ${mini?8:12}px`,borderBottom:'1px solid #fef3c7',gap:6,alignItems:'center'}}>
            <div>
              <div style={{fontWeight:500,fontSize:t.fsm,color:'#1c1917'}}>{item.name}</div>
              {!mini&&item.badge&&<span style={{display:'inline-block',fontSize:9,padding:'2px 7px',borderRadius:20,background:BADGE_COLORS[i%5],color:BADGE_TEXT[i%5],marginTop:2,fontWeight:500}}>{item.badge}</span>}
            </div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#57534e'}}>{item.qty}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#57534e'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700}}>{fR(item.qty*item.price)}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?6:16}}>
          <div style={{width:mini?130:230}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['GST',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:t.fs,color:'#57534e',borderBottom:'1px solid #fef3c7'}}><span>{l}</span><span>{fR(v)}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?7:12}px ${mini?8:14}px`,background:a,borderRadius:8,marginTop:mini?5:10}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Grand Total</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#fff'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
        {!mini&&<div style={{marginTop:14,padding:'12px 14px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,fontSize:11,color:'#78716c',lineHeight:1.7}}>Goods once sold not exchanged. Check items at time of purchase. Thank you for shopping!</div>}
      </div>
    </div>
  );
}

function TemplateHealthcare({ accent = '#0891b2', d, mini }) {
  const a = accent; const p = mini ? 14 : 6;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:9.5 };
  const BADGE_COLORS = [['#cffafe','#0e7490'],['#dbeafe','#1d4ed8'],['#f3e8ff','#7e22ce'],['#dcfce7','#15803d'],['#fff7ed','#c2410c']];
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  return (
    <div style={{background:'#fff',fontFamily:"'Inter',sans-serif",position:'relative',overflow:'hidden'}}>
      <div style={{height:mini?3:6,background:`linear-gradient(90deg,#0e7490,${a},#06b6d4)`}}/>
      <div style={{position:'absolute',top:0,left:0,bottom:0,width:mini?2:4,background:a}}/>
      <div style={{position:'absolute',bottom:0,right:0,width:mini?90:180,height:mini?90:180,borderRadius:'50%',background:'#ecfeff',transform:'translate(40%,40%)'}}/>
      <div style={{padding:`${p}px ${p+8}px ${p}px ${p+12}px`,position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:mini?8:18}}>
          <div>
            <div style={{fontWeight:800,fontSize:t.fsb,color:'#0c4a6e'}}>{d.company}</div>
            <div style={{fontSize:t.fsh,color:a,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Multi-Specialty Healthcare</div>
            {!mini&&<div style={{fontSize:10,color:'#64748b',marginTop:3}}>{d.address}<br/>{d.phone} · {d.email}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?12:22,fontWeight:700,color:a}}>INVOICE</div>
            <div style={{fontSize:t.fsh,color:'#94a3b8'}}>Bill No. <span style={{color:'#0c4a6e',fontWeight:600}}>{d.number}</span></div>
            {!mini&&<><div style={{fontSize:10,color:'#94a3b8',marginTop:3}}>Issue: <span style={{color:'#0c4a6e',fontWeight:500}}>{d.date}</span></div>
            <div style={{fontSize:10,color:'#94a3b8'}}>Due: <span style={{color:'#dc2626',fontWeight:600}}>{d.due}</span></div></>}
          </div>
        </div>
        {!mini&&(
          <div style={{background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {[{l:'Patient',v:'Anand Subramaniam'},{l:'Age/Gender',v:'42 Yrs / Male'},{l:'Visit Date',v:d.date},{l:'Doctor',v:'Dr. Priya Venkataraman'}].map(p=>(
              <div key={p.l}>
                <div style={{fontSize:8,textTransform:'uppercase',letterSpacing:'0.08em',color:a,fontWeight:700,marginBottom:2}}>{p.l}</div>
                <div style={{fontSize:12,color:'#0c4a6e',fontWeight:600}}>{p.v}</div>
              </div>
            ))}
          </div>
        )}
        {!mini&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <div style={{padding:'12px 14px',background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:8}}>
              <div style={{fontSize:9,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Hospital / Clinic</div>
              <div style={{fontWeight:700,fontSize:13,color:'#0c4a6e'}}>{d.company}</div>
              <div style={{fontSize:11,color:'#64748b',lineHeight:1.5,marginTop:2}}>{d.address}</div>
            </div>
            <div style={{padding:'12px 14px',background:'#fafafa',border:'1px solid #e2e8f0',borderRadius:8}}>
              <div style={{fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Patient / Billed To</div>
              <div style={{fontWeight:700,fontSize:13,color:'#0c4a6e'}}>{d.customer}</div>
              <div style={{fontSize:11,color:'#64748b',lineHeight:1.5,marginTop:2}}>{d.customerAddr}</div>
            </div>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 50px 70px 70px',padding:`${mini?5:9}px ${mini?8:12}px`,background:'#f0f9ff',borderRadius:5,borderBottom:'1px solid #bae6fd',marginBottom:2,gap:6}}>
          {['Service','Code','Charge','Amount'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:'#0e7490',textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 50px 70px 70px',padding:`${mini?5:9}px ${mini?8:12}px`,borderBottom:'1px solid #e0f7fa',gap:6,alignItems:'center'}}>
            <div>
              <div style={{fontWeight:500,fontSize:t.fsm,color:'#0c4a6e'}}>{item.name}</div>
              {!mini&&item.badge&&<span style={{display:'inline-block',fontSize:9,padding:'2px 7px',borderRadius:20,background:BADGE_COLORS[i%5][0],color:BADGE_COLORS[i%5][1],marginTop:2,fontWeight:500}}>{item.badge}</span>}
            </div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#475569',fontFamily:'monospace'}}>{item.code||'—'}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#475569'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700,color:'#1e293b'}}>{fR(item.qty*item.price*(1+(item.gst||0)/100))}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?6:16}}>
          <div style={{width:mini?130:240}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['GST',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:t.fs,color:'#475569',borderBottom:'1px solid #e0f7fa'}}><span>{l}</span><span>{fR(v)}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?7:12}px ${mini?8:14}px`,background:a,borderRadius:8,marginTop:mini?5:10}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Net Amount Due</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#fff'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
        {!mini&&<div style={{marginTop:14,padding:'12px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,fontSize:11,color:'#475569',lineHeight:1.7}}>Please retain this bill for insurance reimbursement. Follow-up appointment in 7 days. Emergency: +91 44 2345 9999.</div>}
      </div>
    </div>
  );
}

function TemplateDark({ accent = '#f59e0b', d, mini }) {
  const a = accent; const p = mini ? 14 : 4;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:9.5 };
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  return (
    <div style={{background:'#fff',fontFamily:"'Inter',sans-serif",color:'#1e293b'}}>
      <div style={{height:mini?3:5,background:`linear-gradient(90deg,${a},${a}88)`}}/>
      <div style={{padding:`${p}px ${p+8}px`}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:mini?8:20}}>
          <div>
            <div style={{fontWeight:800,fontSize:t.fsb,color:a}}>{d.company}</div>
            <div style={{fontSize:t.fsh,color:'#94a3b8'}}>Enterprise Consulting</div>
            {!mini&&<div style={{fontSize:10,color:'#64748b',marginTop:3}}>{d.email} · {d.phone}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?10:18,fontWeight:400,color:'#475569',letterSpacing:'0.2em',textTransform:'uppercase'}}>Invoice</div>
            <div style={{fontSize:mini?11:20,fontWeight:700,color:a}}>{d.number}</div>
            {!mini&&<><div style={{fontSize:10,color:'#64748b',marginTop:3}}>Date: <span style={{color:'#f1f5f9'}}>{d.date}</span></div>
            <div style={{fontSize:10,color:'#64748b'}}>Due: <span style={{color:a}}>{d.due}</span></div></>}
          </div>
        </div>
        {!mini&&(
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid #334155',borderRadius:8,padding:'12px 16px',marginBottom:18}}>
            <div style={{fontSize:8,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Bill To</div>
            <div style={{fontWeight:700,fontSize:13}}>{d.customer}</div>
            <div style={{fontSize:11,color:'#94a3b8'}}>{d.customerAddr}</div>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 48px 72px 72px',padding:`${mini?5:9}px ${mini?8:12}px`,background:'rgba(255,255,255,0.06)',borderRadius:5,marginBottom:2,gap:6}}>
          {['Item','Qty','Price','Amount'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:a,textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 48px 72px 72px',padding:`${mini?5:9}px ${mini?8:12}px`,borderBottom:'1px solid #1e293b',gap:6,alignItems:'center'}}>
            <div style={{fontWeight:600,fontSize:t.fsm}}>{item.name}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#94a3b8'}}>{item.qty}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#94a3b8'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700}}>{fR(item.qty*item.price)}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?6:16}}>
          <div style={{width:mini?130:220}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['GST',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:t.fs,color:'#94a3b8',borderBottom:'1px solid #1e293b'}}><span>{l}</span><span>{fR(v)}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?7:12}px ${mini?8:14}px`,background:a,borderRadius:7,marginTop:mini?5:10}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#0f172a'}}>Total</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#0f172a'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
        {!mini&&<div style={{marginTop:18,paddingTop:14,borderTop:'1px solid #1e293b',display:'flex',justifyContent:'space-between',fontSize:10,color:'#475569'}}><span>Payment due within 30 days. Late fee: 1.5% per month.</span><span style={{color:a,fontWeight:700}}>zetsap.com</span></div>}
      </div>
    </div>
  );
}

/* ── Extra data for new unique templates ── */
Object.assign(DATA, {
  education: {
    company:'Bright Minds Academy', email:'fees@brightminds.edu', phone:'+91 44 6789 1234',
    address:'No.5, ECR Road, Thiruvanmiyur, Chennai 600041', gstin:'33AABCB9876E1Z2',
    customer:'Mr. Rajesh Kumar', customerAddr:'14, Gandhi Nagar, Adyar, Chennai 600020',
    items:[
      { name:'Tuition Fee — Grade 10 (Term 2)', code:'TF-10-T2', qty:1, price:18000, gst:0, badge:'Tuition' },
      { name:'Lab & Activity Charges',          code:'LAB-001',  qty:1, price:2400,  gst:0, badge:'Lab' },
      { name:'Transport Fee (Bus Route A)',     code:'TR-A',     qty:1, price:3500,  gst:0, badge:'Transport' },
      { name:'Annual Day & Event Charges',      code:'EVT-26',   qty:1, price:800,   gst:0, badge:'Events' },
      { name:'Library & Digital Resource Fee', code:'LIB-26',   qty:1, price:600,   gst:0, badge:'Library' },
    ],
    number:'BMA-2026-FEE-219', date:'10 Apr 2026', due:'20 Apr 2026',
    student:'Arjun Rajesh Kumar', grade:'Grade 10 - Section A', rollNo:'2425-G10-047'},
  realestate: {
    company:'Vista Realty & Estates', email:'billing@vistarealty.in', phone:'+91 80 3456 7890',
    address:'Block C, Brigade Gateway, Rajajinagar, Bengaluru 560055', gstin:'29AABCV7654K1Z5',
    customer:'Mr. & Mrs. Arvind Menon', customerAddr:'4/2, Koramangala 6th Block, Bengaluru 560095',
    items:[
      { name:'Property Registration Assistance',    area:'—',          qty:1, price:25000, gst:18, badge:'Legal' },
      { name:'Home Loan Liaison Service',           area:'—',          qty:1, price:15000, gst:18, badge:'Finance' },
      { name:'Interior Design Consultation (5hr)',  area:'2400 sq.ft', qty:5, price:3500,  gst:18, badge:'Design' },
      { name:'Site Visit & Inspection Report',      area:'—',          qty:2, price:4000,  gst:18, badge:'Inspection' },
      { name:'Brokerage — 2BHK Sale',               area:'1200 sq.ft', qty:1, price:85000, gst:18, badge:'Brokerage' },
    ],
    number:'VRE-2026-TXN-084', date:'10 Apr 2026', due:'25 Apr 2026',
    propType:'2BHK Apartment', propLoc:'Koramangala, Bengaluru', propRef:'PROP-KOR-1122'},
  restaurant: {
    company:'The Spice Garden', email:'accounts@spicegarden.in', phone:'+91 98400 55678',
    address:'12, Nungambakkam High Road, Chennai 600034', gstin:'33AABCT5432G1Z8',
    customer:'Sunrise Events Pvt. Ltd.', customerAddr:'7, Anna Salai, Chennai 600002',
    items:[
      { name:'Paneer Tikka Platter (serves 20)',  qty:5,  price:850,  gst:5, badge:'Starter'},
      { name:'Veg Biryani (full tray)',           qty:10, price:650,  gst:5, badge:'Main'},
      { name:'Tandoori Roti (dozen)',             qty:20, price:120,  gst:5, badge:'Bread'},
      { name:'Gulab Jamun (50 pcs)',              qty:4,  price:400,  gst:5, badge:'Dessert'},
      { name:'Mineral Water (1L bottles)',        qty:50, price:20,   gst:12, badge:'Beverage' },
    ],
    number:'SG-2026-CAT-067', date:'10 Apr 2026', due:'15 Apr 2026',
    event:'Corporate Lunch — Board Meeting', covers:100},
  logistics: {
    company:'SwiftMove Logistics', email:'billing@swiftmove.in', phone:'+91 44 4567 8900',
    address:'Plot 12, SIDCO Industrial Estate, Ambattur, Chennai 600098', gstin:'33AABCS3456H1Z3',
    customer:'Nexus Manufacturing Ltd.', customerAddr:'Block A, Peenya Industrial Area, Bengaluru 560058',
    items:[
      { name:'Full Truck Load — Chennai to Bengaluru', distance:'346 km', qty:1, price:32000, gst:5, badge:'FTL' },
      { name:'Warehousing (10 pallets × 7 days)',      distance:'—',      qty:70, price:180,  gst:18, badge:'Storage' },
      { name:'Last-Mile Delivery (3 drops)',           distance:'City',   qty:3,  price:1200,  gst:5, badge:'LMD' },
      { name:'Packaging & Shrink Wrap',               distance:'—',      qty:1,  price:2800,  gst:18, badge:'Packing' },
      { name:'Insurance — Cargo (0.5% of value)',     distance:'—',      qty:1,  price:1500,  gst:18, badge:'Insurance' },
    ],
    number:'SML-2026-LR-00341', date:'10 Apr 2026', due:'20 Apr 2026',
    trackingId:'SML-TRK-7823', vehicle:'TN 09 AB 1234', driver:'Murugan R.'}});

/* ── Education template: certificate / academic layout ── */
function TemplateEducation({ accent = '#7c3aed', d, mini }) {
  const a = accent; const p = mini ? 14 : 5;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:9.5 };
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  const BADGE = [['#ede9fe','#6d28d9'],['#fce7f3','#be185d'],['#fef3c7','#b45309'],['#dbeafe','#1d4ed8'],['#d1fae5','#065f46']];
  return (
    <div style={{background:'#fff',fontFamily:"'Inter',sans-serif",position:'relative',overflow:'hidden'}}>
      {/* Top decorative strip */}
      <div style={{height:mini?3:6,background:`linear-gradient(90deg,${a},#a78bfa,#ec4899)`}}/>
      {/* Side accent */}
      <div style={{position:'absolute',top:0,right:0,width:mini?60:120,height:mini?60:120,background:`${a}08`,borderRadius:'0 0 0 100%'}}/>
      <div style={{padding:`${p}px`,position:'relative'}}>
        {/* Header with school crest style */}
        <div style={{textAlign:'center',marginBottom:mini?6:16,borderBottom:`2px solid ${a}22`,paddingBottom:mini?6:14}}>
          <div style={{width:mini?20:44,height:mini?20:44,borderRadius:'50%',background:`linear-gradient(135deg,${a},#a78bfa)`,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:mini?2:6,flexShrink:0}}>
            <span style={{color:'#fff',fontWeight:900,fontSize:mini?8:18}}>B</span>
          </div>
          <div style={{fontWeight:900,fontSize:t.fsb,color:a}}>{d.company}</div>
          <div style={{fontSize:t.fsh,color:'#6b7280',fontWeight:500}}>Fee Receipt</div>
          {!mini&&<div style={{fontSize:9,color:'#9ca3af',marginTop:2}}>{d.address}</div>}
        </div>
        {/* Student info strip */}
        {!mini&&d.student&&(
          <div style={{background:`${a}08`,border:`1px solid ${a}20`,borderRadius:8,padding:'10px 14px',marginBottom:14,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {[['Student',d.student],['Class',d.grade],['Roll No.',d.rollNo]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:8,textTransform:'uppercase',color:a,fontWeight:700,letterSpacing:'0.08em'}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:'#111'}}>{v}</div></div>
            ))}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?5:8}px ${mini?6:10}px`,background:`${a}14`,borderRadius:5,marginBottom:2,gap:4}}>
          {['Fee Head','Qty','Amount','Total'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:a,textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?4:8}px ${mini?6:10}px`,borderBottom:`1px solid ${a}12`,gap:4,alignItems:'center'}}>
            <div>
              <div style={{fontWeight:500,fontSize:t.fsm,color:'#1f2937'}}>{item.name}</div>
              {!mini&&item.badge&&<span style={{display:'inline-block',fontSize:9,padding:'2px 7px',borderRadius:20,background:BADGE[i%5][0],color:BADGE[i%5][1],marginTop:2,fontWeight:600}}>{item.badge}</span>}
            </div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#6b7280'}}>{item.qty}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#6b7280'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700,color:'#1f2937'}}>{fR(item.qty*item.price)}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?6:14}}>
          <div style={{width:mini?130:220}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontSize:t.fs,color:'#6b7280'}}><span>Sub-Total</span><span>{fR(d.items.reduce((s,i)=>s+i.qty*i.price,0))}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?6:10}px ${mini?8:12}px`,background:`linear-gradient(135deg,${a},#a78bfa)`,borderRadius:7,marginTop:mini?4:8}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Total Due</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#fff'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
        {!mini&&<div style={{marginTop:12,textAlign:'center',fontSize:10,color:'#9ca3af',borderTop:`1px dashed ${a}30`,paddingTop:10}}>This is a computer-generated receipt. No signature required. · Ref: {d.number}</div>}
      </div>
    </div>
  );
}

/* ── Real Estate: property card / two-tone layout ── */
function TemplateRealEstate({ accent = '#059669', d, mini }) {
  const a = accent; const p = mini ? 14 : 7;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:9.5 };
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  const BADGE = [['#d1fae5','#065f46'],['#dbeafe','#1d4ed8'],['#f3e8ff','#7e22ce'],['#fef3c7','#b45309'],['#fee2e2','#dc2626']];
  return (
    <div style={{background:'#fff',fontFamily:"'Inter',sans-serif",overflow:'hidden'}}>
      {/* Two-tone header */}
      <div style={{background:`linear-gradient(135deg,${a},#0d9488)`,padding:`${p}px`,paddingBottom:mini?12:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontWeight:900,fontSize:t.fsb,color:'#fff',letterSpacing:'-0.01em'}}>{d.company}</div>
            <div style={{fontSize:t.fsh,color:'rgba(255,255,255,0.75)',marginTop:1}}>Real Estate & Property Services</div>
            {!mini&&<div style={{fontSize:9,color:'rgba(255,255,255,0.65)',marginTop:4}}>{d.address}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?8:11,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Invoice</div>
            <div style={{fontSize:mini?11:19,fontWeight:800,color:'#fff'}}>{d.number}</div>
            {!mini&&<div style={{fontSize:9,color:'rgba(255,255,255,0.7)',marginTop:2}}>Date: <span style={{color:'#fff'}}>{d.date}</span></div>}
          </div>
        </div>
        {!mini&&d.propType&&(
          <div style={{marginTop:14,background:'rgba(255,255,255,0.12)',borderRadius:10,padding:'10px 14px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,backdropFilter:'blur(4px)'}}>
            {[['Property',d.propType],['Location',d.propLoc],['Ref No.',d.propRef]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:8,textTransform:'uppercase',color:'rgba(255,255,255,0.65)',fontWeight:700}}>{l}</div><div style={{fontSize:11.5,color:'#fff',fontWeight:600,marginTop:1}}>{v}</div></div>
            ))}
          </div>
        )}
      </div>
      {/* White body */}
      <div style={{padding:`${mini?10:20}px ${p}px`}}>
        {!mini&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {[{title:'From',name:d.company,addr:d.address,bg:`${a}08`,bdr:`${a}25`},{title:'Bill To',name:d.customer,addr:d.customerAddr,bg:'#f8fafc',bdr:'#e2e8f0'}].map(pp=>(
              <div key={pp.title} style={{padding:'10px 12px',background:pp.bg,border:`1px solid ${pp.bdr}`,borderRadius:8}}>
                <div style={{fontSize:8,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>{pp.title}</div>
                <div style={{fontWeight:700,fontSize:12.5,color:'#0f172a'}}>{pp.name}</div>
                <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{pp.addr}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?5:8}px ${mini?6:10}px`,background:`${a}10`,borderRadius:5,marginBottom:2,gap:4}}>
          {['Service','Qty','Rate','Total'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:a,textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?4:8}px ${mini?6:10}px`,borderBottom:'1px solid #f1f5f9',gap:4,alignItems:'center'}}>
            <div>
              <div style={{fontWeight:500,fontSize:t.fsm,color:'#0f172a'}}>{item.name}</div>
              {!mini&&item.badge&&<span style={{display:'inline-block',fontSize:9,padding:'2px 7px',borderRadius:20,background:BADGE[i%5][0],color:BADGE[i%5][1],marginTop:2,fontWeight:600}}>{item.badge}</span>}
            </div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#64748b'}}>{item.qty}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#64748b'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700}}>{fR(item.qty*item.price*(1+(item.gst||0)/100))}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?6:14}}>
          <div style={{width:mini?130:220}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['GST (18%)',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontSize:t.fs,color:'#64748b',borderBottom:'1px solid #f1f5f9'}}><span>{l}</span><span>{fR(v)}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?6:10}px ${mini?8:12}px`,background:`linear-gradient(135deg,${a},#0d9488)`,borderRadius:8,marginTop:mini?4:8}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Total Due</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#fff'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Restaurant: warm menu-card style ── */
function TemplateRestaurant({ accent = '#ea580c', d, mini }) {
  const a = accent; const p = mini ? 12 : 6;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:9.5 };
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  return (
    <div style={{background:'#fffbf5',fontFamily:"'Inter',sans-serif",overflow:'hidden',borderTop:`${mini?3:5}px solid ${a}`}}>
      <div style={{padding:`${p}px`}}>
        {/* Header: logo-style circle + name */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:mini?6:16,paddingBottom:mini?6:14,borderBottom:`1px dashed ${a}40`}}>
          <div style={{display:'flex',alignItems:'center',gap:mini?5:10}}>
            <div style={{width:mini?20:40,height:mini?20:40,borderRadius:'50%',background:`linear-gradient(135deg,${a},#f97316)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width={mini?10:20} height={mini?10:20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            </div>
            <div>
              <div style={{fontWeight:900,fontSize:t.fsb,color:'#1c1917'}}>{d.company}</div>
              <div style={{fontSize:t.fsh,color:a,fontWeight:600}}>Catering & Hospitality</div>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?9:15,fontWeight:800,color:a}}>BILL</div>
            <div style={{fontSize:t.fsh,color:'#a8a29e'}}>#{d.number}</div>
          </div>
        </div>
        {/* Event info */}
        {!mini&&d.event&&(
          <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:8,padding:'10px 14px',marginBottom:14,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
            <div><div style={{fontSize:8,textTransform:'uppercase',color:a,fontWeight:700}}>Event</div><div style={{fontSize:12,color:'#1c1917',fontWeight:600}}>{d.event}</div></div>
            <div><div style={{fontSize:8,textTransform:'uppercase',color:a,fontWeight:700}}>Covers</div><div style={{fontSize:12,color:'#1c1917',fontWeight:600}}>{d.covers} pax</div></div>
            <div><div style={{fontSize:8,textTransform:'uppercase',color:a,fontWeight:700}}>Date</div><div style={{fontSize:12,color:'#1c1917',fontWeight:600}}>{d.date}</div></div>
          </div>
        )}
        {/* Items */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 40px 60px 65px',padding:`${mini?4:7}px ${mini?6:10}px`,background:'#fff7ed',borderRadius:5,borderBottom:'1px solid #fed7aa',marginBottom:2,gap:4}}>
          {['Item','Qty','Rate','Amt'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:'#c2410c',textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 40px 60px 65px',padding:`${mini?4:8}px ${mini?6:10}px`,borderBottom:'1px dashed #fde8cc',gap:4,alignItems:'center'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                
                <span style={{fontWeight:500,fontSize:t.fsm,color:'#1c1917'}}>{item.name}</span>
              </div>
              {!mini&&item.badge&&<span style={{display:'inline-block',fontSize:9,padding:'1px 6px',borderRadius:20,background:'#fff7ed',color:a,border:`1px solid ${a}40`,marginTop:2,fontWeight:600}}>{item.badge}</span>}
            </div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#78716c'}}>{item.qty}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#78716c'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700,color:'#1c1917'}}>{fR(item.qty*item.price)}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?5:12}}>
          <div style={{width:mini?130:200}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['SGST+CGST',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontSize:t.fs,color:'#78716c',borderBottom:'1px dashed #fde8cc'}}><span>{l}</span><span>{fR(v)}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?6:10}px ${mini?8:12}px`,background:`linear-gradient(135deg,${a},#f97316)`,borderRadius:8,marginTop:mini?4:8}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Grand Total</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:'#fff'}}>{fR(total)}</span>
            </div>
          </div>
        </div>
        {!mini&&<div style={{marginTop:12,textAlign:'center',fontSize:10,color:'#a8a29e',borderTop:'1px dashed #fde8cc',paddingTop:10}}>Thank you for choosing us · FSSAI: 11221133001234 · GST: {d.gstin}</div>}
      </div>
    </div>
  );
}

/* ── Logistics: tracking / shipment style ── */
function TemplateLogistics({ accent = '#1d4ed8', d, mini }) {
  const a = accent; const p = mini ? 12 : 6;
  const t = { fs: mini?7:11, fsb: mini?9:16, fsm: mini?7.5:12.5, fsh: mini?7:9.5 };
  const total = d.items.reduce((s,i)=>s+i.qty*i.price*(1+(i.gst||0)/100),0);
  const BADGE = [['#dbeafe','#1d4ed8'],['#f0fdf4','#15803d'],['#fef3c7','#b45309'],['#f3e8ff','#7e22ce'],['#fee2e2','#dc2626']];
  return (
    <div style={{background:'#f8fafc',fontFamily:"'Inter',sans-serif",overflow:'hidden'}}>
      {/* Header bar */}
      <div style={{background:'#0f172a',padding:`${mini?10:22}px ${p}px`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontWeight:900,fontSize:t.fsb,color:'#fff'}}>{d.company}</div>
            <div style={{fontSize:t.fsh,color:`${a}`,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Logistics & Transport</div>
            {!mini&&<div style={{fontSize:9,color:'#64748b',marginTop:2}}>{d.phone} · {d.email}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:mini?8:11,color:'#475569',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em'}}>LORRY RECEIPT</div>
            <div style={{fontSize:mini?11:18,fontWeight:800,color:a}}>{d.number}</div>
            {!mini&&<div style={{fontSize:9,color:'#475569',marginTop:2}}>{d.date}</div>}
          </div>
        </div>
        {/* Tracking strip */}
        {!mini&&d.trackingId&&(
          <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
            {[['Track ID',d.trackingId,a],['Vehicle',d.vehicle,'#94a3b8'],['Driver',d.driver,'#94a3b8']].map(([l,v,c])=>(
              <div key={l} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:6,padding:'6px 10px',flex:1,minWidth:80}}>
                <div style={{fontSize:8,textTransform:'uppercase',color:'#64748b',fontWeight:700}}>{l}</div>
                <div style={{fontSize:11,color:c,fontWeight:600,marginTop:1}}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* White body */}
      <div style={{padding:`${mini?8:16}px ${p}px`}}>
        {!mini&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {[{title:'Consignor',name:d.company,addr:d.address},{title:'Consignee',name:d.customer,addr:d.customerAddr}].map(pp=>(
              <div key={pp.title} style={{padding:'10px 12px',background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,borderLeft:`3px solid ${a}`}}>
                <div style={{fontSize:8,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>{pp.title}</div>
                <div style={{fontWeight:700,fontSize:12.5}}>{pp.name}</div>
                <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{pp.addr}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?4:7}px ${mini?6:10}px`,background:'#1e293b',borderRadius:5,marginBottom:2,gap:4}}>
          {['Service','Qty','Rate','Total'].map((h,i)=><div key={h} style={{fontSize:t.fsh,fontWeight:700,color:a,textTransform:'uppercase',textAlign:i>0?'right':'left'}}>{h}</div>)}
        </div>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 44px 70px 70px',padding:`${mini?4:8}px ${mini?6:10}px`,borderBottom:'1px solid #e2e8f0',background:'#fff',marginBottom:1,borderRadius:4,gap:4,alignItems:'center'}}>
            <div>
              <div style={{fontWeight:500,fontSize:t.fsm,color:'#0f172a'}}>{item.name}</div>
              {!mini&&<div style={{fontSize:9,color:'#94a3b8',marginTop:1}}>{item.distance&&item.distance!=='—'?`Distance: ${item.distance}`:''}</div>}
              {!mini&&item.badge&&<span style={{display:'inline-block',fontSize:9,padding:'2px 7px',borderRadius:20,background:BADGE[i%5][0],color:BADGE[i%5][1],marginTop:2,fontWeight:600}}>{item.badge}</span>}
            </div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#64748b'}}>{item.qty}</div>
            <div style={{textAlign:'right',fontSize:t.fs,color:'#64748b'}}>{fR(item.price)}</div>
            <div style={{textAlign:'right',fontSize:t.fsm,fontWeight:700}}>{fR(item.qty*item.price*(1+(item.gst||0)/100))}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:mini?5:12}}>
          <div style={{width:mini?130:220}}>
            {[['Subtotal',d.items.reduce((s,i)=>s+i.qty*i.price,0)],['GST',total-d.items.reduce((s,i)=>s+i.qty*i.price,0)]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontSize:t.fs,color:'#64748b',borderBottom:'1px solid #e2e8f0'}}><span>{l}</span><span>{fR(v)}</span></div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:`${mini?6:10}px ${mini?8:12}px`,background:`linear-gradient(135deg,#0f172a,${a})`,borderRadius:8,marginTop:mini?4:8}}>
              <span style={{fontWeight:700,fontSize:t.fsm,color:'#fff'}}>Freight Total</span>
              <span style={{fontWeight:800,fontSize:mini?9:15,color:a}}>{fR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id:'modern',     name:'Modern Clean',      sub:'IT & Consulting',        Component:TemplateModern,       dataKey:'modern',     swatches:['#8f195c','#1d4ed8','#059669','#7c3aed','#0891b2'] },
  { id:'social',     name:'Creative Social',   sub:'Social Media Agency',    Component:TemplateSocial,       dataKey:'social',     swatches:['#7c3aed','#ec4899','#f59e0b','#059669','#0891b2'] },
  { id:'local',      name:'Local Business',    sub:'Retail & Shop',          Component:TemplateLocal,        dataKey:'local',      swatches:['#ea580c','#d97706','#dc2626','#16a34a','#7c3aed'] },
  { id:'healthcare', name:'Healthcare',        sub:'Clinics & Hospitals',    Component:TemplateHealthcare,   dataKey:'healthcare', swatches:['#0891b2','#059669','#7c3aed','#0e7490','#1d4ed8'] },
  { id:'dark',       name:'Dark Professional', sub:'Enterprise / Corporate', Component:TemplateDark,         dataKey:'dark',       swatches:['#f59e0b','#60a5fa','#a78bfa','#34d399','#fb7185'] },
  { id:'education',  name:'Education',         sub:'Schools & Coaching',     Component:TemplateEducation,    dataKey:'education',  swatches:['#7c3aed','#ec4899','#f59e0b','#0891b2','#059669'] },
  { id:'realestate', name:'Real Estate',       sub:'Property & Housing',     Component:TemplateRealEstate,   dataKey:'realestate', swatches:['#059669','#0891b2','#7c3aed','#1d4ed8','#ea580c'] },
  { id:'restaurant', name:'Restaurant / Hotel',sub:'Food & Hospitality',     Component:TemplateRestaurant,   dataKey:'restaurant', swatches:['#ea580c','#d97706','#dc2626','#f59e0b','#8f195c'] },
  { id:'logistics',  name:'Logistics',         sub:'Transport & Shipping',   Component:TemplateLogistics,    dataKey:'logistics',  swatches:['#1d4ed8','#475569','#0891b2','#374151','#6366f1'] },
];

export default function InvoiceTemplatesPage() {
  const { state, update } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState(state.template || 'modern');
  const [preview, setPreview] = useState(null);
  const [previewAccent, setPreviewAccent] = useState(null);

  const handleSelect = id => { setSelected(id); update('template', id); };
  const openTemplate = t => { setPreview(t); setPreviewAccent(t.swatches[0]); };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Sticky header — sits below the topbar */}
      <div className="tmpl-page-header" style={{ background:'var(--card-bg)', borderBottom:'1px solid var(--border)', padding:'12px 24px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 }}>
        <button className="btn-icon" onClick={() => router.back()} style={{ border:'1px solid var(--border)', flexShrink:0 }}>
          <ArrowLeft size={18}/>
        </button>
        <div>
          <h1 style={{ fontWeight:800, fontSize:18 }}>Invoice Templates</h1>
          <p style={{ fontSize:12, color:'var(--muted)' }}>9 Industry Templates — All Free · IT, Healthcare, Retail, Social Media and more</p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding:'12px', maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }} className="templates-grid">
          {TEMPLATES.map(t => {
            const d = DATA[t.dataKey];
            return (
              <div key={t.id} onClick={() => openTemplate(t)}
                style={{ cursor:'pointer', borderRadius:12, border:`2px solid ${selected===t.id?'var(--brand)':'var(--border)'}`, overflow:'hidden', transition:'all 0.16s', position:'relative', isolation:'isolate', aspectRatio:'1/1.414', display:'flex', flexDirection:'column', background:'var(--card-bg)' }}
                onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.14)'; }}
                onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                {selected===t.id && (
                  <div style={{ position:'absolute', top:8, right:8, background:'var(--brand)', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', zIndex:3, boxShadow:'0 2px 8px rgba(143,25,92,0.4)' }}>
                    <Check size={14} color="#fff" strokeWidth={3}/>
                  </div>
                )}
                <div style={{ flex:1, overflow:'hidden', pointerEvents:'none', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, width:'200%', transformOrigin:'top left', transform:'scale(0.5)' }}>
                    <t.Component accent={t.swatches[0]} d={d} mini={false}/>
                  </div>
                </div>
                <div style={{ padding:'8px 12px', background:'var(--card-bg)', borderTop:'1px solid var(--border)', flexShrink:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'var(--text)' }}>{t.name}</div>
                  <div style={{ fontSize:11, color:t.swatches[0], fontWeight:600 }}>{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Template preview modal */}
      {preview && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="tmpl-modal-backdrop">
          <div className="tmpl-modal-inner" style={{ background:'var(--card-bg)', width:'100%', maxWidth:860, maxHeight:'94dvh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 -8px 40px rgba(0,0,0,0.3)', borderRadius:'16px 16px 0 0' }}>
            {/* Modal header — always visible */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid var(--border)', flexShrink:0, background:'var(--card-bg)' }}>
              <div className="tmpl-modal-header-text" style={{ minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{preview.name}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>{preview.sub}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, marginLeft:8 }}>
                <button className={'btn btn-sm' + (selected===preview.id?' btn-brand':' btn-outline')} onClick={() => { handleSelect(preview.id); setPreview(null); }}>
                  {selected===preview.id ? <><Check size={13}/> Selected</> : 'Use This'}
                </button>
                <button className="btn-icon" onClick={() => setPreview(null)}><X size={18}/></button>
              </div>
            </div>

            {/* Bill preview — scrollable, full width on mobile */}
            <div className="tmpl-preview-bill" style={{ flex:1, overflow:'auto', padding:12, background:'#e8eaf0', display:'flex', justifyContent:'center', alignItems:'flex-start' }}>
              <div style={{ width:'100%', maxWidth:560, boxShadow:'0 4px 32px rgba(0,0,0,0.15)', background:'#fff' }}>
                <preview.Component accent={previewAccent||preview.swatches[0]} d={DATA[preview.dataKey]} mini={false}/>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Desktop: show as centered modal */
        @media (min-width: 769px) {
          .tmpl-modal-backdrop { align-items: center !important; }
          .tmpl-modal-inner { border-radius: 16px !important; max-height: 92dvh !important; }
        }
        /* Template card grid */
        @media (max-width: 1024px) { .templates-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px)  { .templates-grid { grid-template-columns: 1fr 1fr !important; gap:10px !important; } }
        @media (max-width: 380px)  { .templates-grid { grid-template-columns: 1fr !important; } }
        /* Template page header */
        @media (max-width: 768px) {
          .tmpl-page-header { padding: 10px 12px !important; }
          .tmpl-page-header h1 { font-size: 15px !important; }
          .tmpl-page-header p { display: none !important; }
          .tmpl-preview-bill { padding: 8px !important; }
          .tmpl-modal-header-text div:last-child { display: none !important; }
            .tmpl-modal-inner { max-width: 98vw !important; width: 98vw !important; }
  .tmpl-page-header { padding: 10px 12px !important; }
        }
      `}</style>
    </div>
  );
}
