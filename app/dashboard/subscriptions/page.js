'use client';
import { useState } from 'react';
import { Check, Phone, Headphones, X } from 'lucide-react';

const PLANS_MONTHLY = [
  { name:'Starter',    price:999,   features:['50 invoices/month','Basic reports','GST invoicing','1 user','Email support'], popular:false, cta:'Choose Plan' },
  { name:'Growth',     price:2499,  features:['Unlimited invoices','GSTR reports','Payment gateway','3 users','Priority support','Inventory management'], popular:true, cta:'Get Started' },
  { name:'Enterprise', price:4999,  features:['Everything in Growth','Unlimited users','Tally sync','Dedicated manager','Custom domain','API access'], popular:false, cta:'Choose Plan' },
];

const PLANS_YEARLY = [
  { name:'Starter',    price:799,   features:['50 invoices/month','Basic reports','GST invoicing','1 user','Email support'], popular:false, cta:'Choose Plan' },
  { name:'Growth',     price:1999,  features:['Unlimited invoices','GSTR reports','Payment gateway','3 users','Priority support','Inventory management'], popular:true, cta:'Get Started' },
  { name:'Enterprise', price:3999,  features:['Everything in Growth','Unlimited users','Tally sync','Dedicated manager','Custom domain','API access'], popular:false, cta:'Choose Plan' },
];

const FAQS = [
  ['Can I switch plans later?', 'Yes, you can upgrade or downgrade your plan at any time. Unused days are prorated automatically.'],
  ['Is there a free trial?', 'Yes! All new accounts start on a free plan. You can upgrade whenever you are ready.'],
  ['What payment methods do you accept?', 'We accept UPI, credit/debit cards, net banking, and cheques for annual plans.'],
  ['Can I cancel anytime?', 'Yes, you can cancel at any time. Your account will remain active until the end of the billing period.'],
];

export default function SubscriptionsPage() {
  const [period, setPeriod] = useState('monthly');
  const [faqOpen, setFaqOpen] = useState(null);

  const plans = period === 'monthly' ? PLANS_MONTHLY : PLANS_YEARLY;

  return (
    <div className="page-content" style={{ maxWidth:1000, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:36 }}>
        <div style={{ display:'inline-block', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--brand)', marginBottom:8 }}>
          Flexible plans
        </div>
        <h1 style={{ fontWeight:800, fontSize:30, marginBottom:8, letterSpacing:'-0.02em', color:'var(--text)' }}>Our Pricing</h1>
        <p style={{ color:'var(--muted)', fontSize:14 }}>Custom pricing designed around your goals</p>

        {/* Toggle */}
        <div style={{ display:'inline-flex', background:'var(--bg)', borderRadius:50, padding:4, gap:4, marginTop:20, border:'1px solid var(--border)' }}>
          {['monthly','yearly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding:'7px 22px', borderRadius:40, border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:13,
                background: period===p ? 'var(--brand)' : 'transparent',
                color: period===p ? '#fff' : 'var(--muted)',
                transition:'all 0.2s', display:'flex', alignItems:'center', gap:6 }}>
              {p === 'monthly' ? 'Monthly' : 'Yearly'}
              {p === 'yearly' && <span style={{ fontSize:11, background:'#10b981', color:'#fff', borderRadius:10, padding:'1px 6px' }}>Save 20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, marginBottom:40 }}>
        {plans.map(p => (
          <div key={p.name} style={{
            border:`2px solid ${p.popular ? 'var(--brand)' : 'var(--border)'}`,
            borderRadius:20, padding:'28px 24px',
            background: p.popular ? 'var(--brand-bg)' : 'var(--card-bg)',
            position:'relative', transition:'all 0.25s',
          }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
            onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            {p.popular && (
              <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'var(--brand)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 16px', borderRadius:30, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                MOST POPULAR
              </div>
            )}
            <div style={{ fontWeight:700, fontSize:18, color:'var(--text)', marginBottom:4 }}>{p.name}</div>

            {/* Price */}
            <div style={{ margin:'12px 0', paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontWeight:800, fontSize:36, color:'var(--brand)', letterSpacing:'-1px' }}>₹{p.price.toLocaleString('en-IN')}</span>
              <span style={{ fontSize:13, fontWeight:500, color:'var(--muted)', marginLeft:4 }}>/{period === 'monthly' ? 'month' : 'month'}</span>
              {period === 'yearly' && <div style={{ fontSize:11.5, color:'#10b981', fontWeight:600, marginTop:3 }}>Billed annually — save 20%</div>}
            </div>

            {/* Features */}
            <ul style={{ listStyle:'none', margin:'12px 0 20px', padding:0 }}>
              {p.features.map(f => (
                <li key={f} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', fontSize:13, color:'var(--text)', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Check size={12} color="#10b981" strokeWidth={3}/>
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button className={`btn${p.popular ? ' btn-brand' : ' btn-outline'}`} style={{ width:'100%', justifyContent:'center', padding:'10px 0', fontSize:14 }}>
              {p.cta} →
            </button>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="card" style={{ padding:24, marginBottom:24 }}>
        <h3 style={{ fontWeight:700, fontSize:16, marginBottom:16, color:'var(--text)' }}>Frequently Asked Questions</h3>
        {FAQS.map(([q, a], i) => (
          <div key={i} style={{ borderBottom: i < FAQS.length-1 ? '1px solid var(--border)' : 'none', paddingBottom:14, marginBottom:14 }}>
            <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:600, color:'var(--text)' }}>
              {q}
              <span style={{ fontSize:20, color:'var(--brand)', transition:'transform 0.2s', transform: faqOpen === i ? 'rotate(45deg)' : 'none', flexShrink:0, marginLeft:12 }}>+</span>
            </button>
            {faqOpen === i && <p style={{ fontSize:13.5, color:'var(--muted)', marginTop:10, lineHeight:1.65 }}>{a}</p>}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'16px 0 8px' }}>
        <p style={{ fontSize:12.5, color:'var(--muted)', marginBottom:14 }}>All plans include CDN · No hidden fees · Cancel anytime</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:28, flexWrap:'wrap' }}>
          <a href="tel:+918121335436" style={{ display:'flex', alignItems:'center', gap:7, color:'var(--brand)', fontWeight:700, textDecoration:'none', fontSize:14 }}>
            <Phone size={16}/> +91 812 133 5436
          </a>
          <div style={{ display:'flex', alignItems:'center', gap:7, color:'var(--muted)', fontSize:13 }}>
            <Headphones size={15}/> Talk to a specialist
          </div>
        </div>
      </div>
    </div>
  );
}
