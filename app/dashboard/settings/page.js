'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { STATES } from '@/lib/data';
import { Eye, EyeOff, Trash2, User, Building2, CreditCard, Globe, Zap, FileText, BarChart3 } from 'lucide-react';

const MENU = [
  { label:'Company Details',   Icon:Building2 },
  { label:'User Profile',      Icon:User },
  { label:'All Users & Roles', Icon:User },
  { label:'General Settings',  Icon:Zap },
  { label:'Banks & Payments',  Icon:CreditCard },
  { label:'Payment Gateway',   Icon:CreditCard },
  { label:'Integrations',      Icon:Globe },
  { label:'E-Way Bill Portal', Icon:FileText },
  { label:'Reports',           Icon:BarChart3 },
];

/* ── Sub Users & Roles ── */
function UsersRoles({ state, addItem, removeItem, toast }) {
  const [sheet, setSheet] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [f, setF] = useState({ name:'', email:'', mobile:'', username:'', password:'', role:'sub_admin' });
  const users = state.subUsers || [];
  const MAX = 2;
  const canAdd = users.length < MAX;

  const save = () => {
    if (!f.name.trim() || !f.email.trim()) { toast('Name and email required', 'error'); return; }
    if (!f.username.trim()) { toast('Username required', 'error'); return; }
    if (f.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    addItem('subUsers', { ...f, createdAt: new Date().toISOString() });
    setSheet(false);
    setF({ name:'', email:'', mobile:'', username:'', password:'', role:'sub_admin' });
    toast('Sub admin added successfully', 'success');
  };

  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color:'var(--text)' }}>All Users & Roles</div>
      <p style={{ color:'var(--muted)', fontSize:13, marginBottom:20 }}>Manage who has access to your account. Sub admins can log in using their own username and password.</p>

      <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', marginBottom:16 }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg)' }}>
          <span style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>Team Members ({users.length + 1}/{MAX + 1})</span>
          {canAdd && (
            <button className="btn btn-brand btn-sm" onClick={() => setSheet(true)}>+ Add Sub Admin</button>
          )}
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Username</th><th>Password</th><th>Email</th><th>Role</th><th>Access</th><th>Actions</th></tr></thead>
            <tbody>
              <tr>
                <td style={{ fontWeight:600, color:'var(--text)' }}>{state.profile?.firstName || 'Admin'} <span style={{ color:'var(--muted)', fontWeight:400, fontSize:12 }}>(You)</span></td>
                <td style={{ color:'var(--muted)', fontFamily:'monospace' }}>{state.profile?.username || '—'}</td>
                <td style={{ color:'var(--muted)' }}>••••••</td>
                <td style={{ color:'var(--muted)' }}>{state.profile?.email || '—'}</td>
                <td><span className="badge badge-brand">Admin</span></td>
                <td style={{ fontSize:12, color:'var(--muted)' }}>Full access</td>
                <td>—</td>
              </tr>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight:600, color:'var(--text)' }}>{u.name}<div style={{ fontSize:11, color:'var(--muted)' }}>{u.mobile}</div></td>
                  <td style={{ color:'var(--muted)', fontFamily:'monospace' }}>{u.username || '—'}</td>
                  <td style={{ color:'var(--muted)', letterSpacing:2 }}>{u.password ? '••••••' : '—'}</td>
                  <td style={{ color:'var(--muted)' }}>{u.email || '—'}</td>
                  <td><span className="badge" style={{background:'#dbeafe',color:'#1e40af',padding:'3px 10px',borderRadius:20,fontSize:11.5,fontWeight:600}}>Sub Admin</span></td>
                  <td style={{ fontSize:12, color:'var(--muted)' }}>No profit reports</td>
                  <td>
                    <button className="btn-icon" onClick={() => { removeItem('subUsers', u.id); toast('Removed', 'success'); }}>
                      <Trash2 size={14} color="#dc2626"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!canAdd && (
        <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#92400e' }}>
          Maximum {MAX} sub admins reached on your current plan. Upgrade to add more.
        </div>
      )}

      {/* Add Sub Admin Modal */}
      {sheet && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setSheet(false)}>
          <div className="modal-box modal-md">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px 20px', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontWeight:700, fontSize:16, color:'var(--text)' }}>Add Sub Admin</span>
              <button className="btn-icon" onClick={() => setSheet(false)}><span style={{ fontSize:18 }}>✕</span></button>
            </div>
            <div style={{ padding:20 }}>
              <div className="field-row field-row-2">
                <div>
                  <label className="form-label">Full Name <span className="req">*</span></label>
                  <input className="form-input" value={f.name} onChange={e => setF(p=>({...p,name:e.target.value}))} placeholder="Full name" autoFocus/>
                </div>
                <div>
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input className="form-input" type="email" value={f.email} onChange={e => setF(p=>({...p,email:e.target.value}))} placeholder="email@example.com"/>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label className="form-label">Mobile</label>
                <input className="form-input" value={f.mobile} onChange={e => setF(p=>({...p,mobile:e.target.value.replace(/\D/g,'').slice(0,10)}))} placeholder="10-digit mobile number"/>
              </div>
              <div style={{ background:'var(--bg)', borderRadius:9, padding:'14px 16px', marginBottom:16, border:'1px solid var(--border)' }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:12, color:'var(--text)' }}>Login Credentials</div>
                <p style={{ fontSize:12.5, color:'var(--muted)', marginBottom:12 }}>The sub admin will use these credentials to log into this invoice system.</p>
                <div className="field-row field-row-2">
                  <div>
                    <label className="form-label">Username <span className="req">*</span></label>
                    <input className="form-input" value={f.username} onChange={e => setF(p=>({...p,username:e.target.value.replace(/\s/g,'').toLowerCase()}))} placeholder="e.g. john_doe"/>
                  </div>
                  <div>
                    <label className="form-label">Password <span className="req">*</span></label>
                    <div style={{ position:'relative' }}>
                      <input className="form-input" type={showPw?'text':'password'} style={{ paddingRight:38 }} value={f.password} onChange={e => setF(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters"/>
                      <button type="button" onClick={() => setShowPw(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--muted)', display:'flex' }}>
                        {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:8, padding:'10px 12px', marginBottom:16, fontSize:12.5, color:'#92400e' }}>
                Sub admins can access invoices, customers, products, and expenses but cannot view profit reports or financial summaries.
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setSheet(false)}>Cancel</button>
                <button className="btn btn-brand" onClick={save}>Add Sub Admin</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Company Details ── */
function CompanyDetails({ state, update, toast }) {
  const [f, setF] = useState({ name:'', gstin:'', mobile:'', email:'', address:'', city:'', pincode:'', state:'Tamil Nadu', ...state.companyDetails });
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:20, color:'var(--text)' }}>Company Details</div>
      <div style={{ maxWidth:600 }}>
        <div className="field-row field-row-2" style={{ marginBottom:14 }}>
          <div><label className="form-label">Business Name</label><input className="form-input" value={f.name} onChange={e=>s('name',e.target.value)} placeholder="Your Business Name"/></div>
          <div><label className="form-label">GSTIN</label><input className="form-input" value={f.gstin} onChange={e=>s('gstin',e.target.value.toUpperCase())} placeholder="29AABCT1332L000" maxLength={15}/></div>
        </div>
        <div className="field-row field-row-2" style={{ marginBottom:14 }}>
          <div><label className="form-label">Mobile</label><input className="form-input" value={f.mobile} onChange={e=>s('mobile',e.target.value)} placeholder="+91 9000000000"/></div>
          <div><label className="form-label">Email</label><input className="form-input" type="email" value={f.email} onChange={e=>s('email',e.target.value)} placeholder="business@email.com"/></div>
        </div>
        <div style={{ marginBottom:14 }}><label className="form-label">Address</label><textarea className="form-input form-textarea" rows={2} value={f.address} onChange={e=>s('address',e.target.value)}/></div>
        <div className="field-row field-row-3" style={{ marginBottom:20 }}>
          <div><label className="form-label">City</label><input className="form-input" value={f.city} onChange={e=>s('city',e.target.value)}/></div>
          <div><label className="form-label">State</label><select className="form-select" value={f.state} onChange={e=>s('state',e.target.value)}>{STATES.map(st=><option key={st}>{st}</option>)}</select></div>
          <div><label className="form-label">Pincode</label><input className="form-input" value={f.pincode} onChange={e=>s('pincode',e.target.value.replace(/\D/g,'').slice(0,6))}/></div>
        </div>
        <button className="btn btn-brand" onClick={() => { update('companyDetails', f); toast && toast('Company details saved!', 'success'); }}>Save Details</button>
      </div>
    </div>
  );
}

/* ── General Settings ── */
function GeneralSettings() {
  const [discountType, setDiscountType] = useState('line');
  const [roundOff, setRoundOff] = useState(false);
  const [salesperson, setSalesperson] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [adjustment, setAdjustment] = useState(false);

  const Row = ({ label, desc, checked, onChange }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ flex:1, paddingRight:20 }}>
        <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{label}</div>
        {desc && <div style={{ fontSize:12.5, color:'var(--muted)', marginTop:2 }}>{desc}</div>}
      </div>
      <div className={`tog-track${checked?' on':''}`} onClick={onChange}><div className="tog-thumb"/></div>
    </div>
  );

  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:20, color:'var(--text)' }}>General Settings</div>
      <div style={{ maxWidth:600 }}>
        <div style={{ marginBottom:20, padding:'16px', background:'var(--bg)', borderRadius:10, border:'1px solid var(--border)' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:12, color:'var(--text)' }}>Do you give discounts?</div>
          {['none','line','transaction'].map(t => (
            <label key={t} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, cursor:'pointer' }}>
              <input type="radio" name="discount" checked={discountType===t} onChange={() => setDiscountType(t)}
                style={{ accentColor:'var(--brand)', width:16, height:16 }}/>
              <span style={{ fontSize:13, color:'var(--text)' }}>
                {t==='none' ? "I don't give discounts" : t==='line' ? 'At Line Item Level' : 'At Transaction Level'}
              </span>
            </label>
          ))}
        </div>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:12, color:'var(--text)' }}>Additional Charges</div>
        <Row label="Adjustment" desc="Add custom adjustment amount at transaction level" checked={adjustment} onChange={() => setAdjustment(p=>!p)}/>
        <Row label="Shipping Charges" desc="Add a separate line for shipping charges" checked={shipping} onChange={() => setShipping(p=>!p)}/>
        <Row label="Round Off Total" desc="Round off the total to the nearest whole number" checked={roundOff} onChange={() => setRoundOff(p=>!p)}/>
        <Row label="Salesperson Field" desc="Track which salesperson created the invoice" checked={salesperson} onChange={() => setSalesperson(p=>!p)}/>
        <div style={{ marginTop:20 }}>
          <button className="btn btn-brand">Save Settings</button>
        </div>
      </div>
    </div>
  );
}

/* ── Payment Gateway ── */
function PaymentGateway() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const connect = async () => {
    setConnecting(true);
    await new Promise(r=>setTimeout(r,2200));
    setConnecting(false); setConnected(true);
  };
  return (
    <div>
      <div style={{fontWeight:700,fontSize:16,marginBottom:6,color:'var(--text)'}}>Payment Gateway</div>
      <p style={{color:'var(--muted)',fontSize:13,marginBottom:24}}>Connect with your preferred payment gateway to accept payments online and automate settlements</p>
      <div style={{maxWidth:520,margin:'0 auto'}}>
        <div style={{border:'2px solid var(--border)',borderRadius:16,padding:'32px 28px',textAlign:'center',background:'var(--card-bg)',boxShadow:'var(--shadow)'}}>
          <div style={{fontWeight:900,fontSize:28,marginBottom:4}}>
            <span style={{color:'#072654'}}>Razor</span><span style={{color:'#2196f3'}}>pay</span>
          </div>
          <div style={{fontSize:13,color:'var(--muted)',marginBottom:6}}>India's most trusted payment gateway</div>
          <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:24,flexWrap:'wrap'}}>
            {['UPI','Cards','Net Banking','Wallets','EMI'].map(m=>(
              <span key={m} style={{fontSize:11,background:'var(--bg)',border:'1px solid var(--border)',borderRadius:20,padding:'3px 10px',color:'var(--muted)',fontWeight:600}}>{m}</span>
            ))}
          </div>
          {connected ? (
            <div style={{background:'#d1fae5',borderRadius:10,padding:'12px 20px',marginBottom:20,fontWeight:700,color:'#065f46',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Connected to Razorpay
            </div>
          ) : (
            <button className="btn btn-brand" style={{width:'100%',justifyContent:'center',marginBottom:12,padding:'12px 0',fontSize:15}} onClick={connect} disabled={connecting}>
              {connecting ? <><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/> Connecting…</> : 'Connect Razorpay →'}
            </button>
          )}
          {connected&&<button className="btn btn-outline btn-sm" style={{marginBottom:20}} onClick={()=>setConnected(false)}>Disconnect</button>}
          <div style={{background:'var(--bg)',borderRadius:10,padding:'16px',textAlign:'left',marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'var(--text)'}}>Features</div>
            {['Accept UPI, Cards, Net Banking, Wallets','Auto payment reconciliation','Instant settlements & payouts','Payment links & QR codes','Detailed analytics dashboard'].map(f=>(
              <div key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5,marginBottom:7,color:'var(--text)'}}>
                <span style={{color:'#10b981',fontWeight:700,fontSize:14}}></span>{f}
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:16,display:'flex',alignItems:'center',justifyContent:'center',gap:16,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--muted)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              256-bit SSL secured
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--muted)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              PCI DSS compliant
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--muted)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              24/7 support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Integrations ── */
function Integrations() {
  const integrations = [
    { name:'Tally', desc:'Sync invoices and accounting data with Tally ERP', connected:false, logo:'T' },
    { name:'WhatsApp Business', desc:'Send invoices directly via WhatsApp', connected:false, logo:'W' },
    { name:'Gmail', desc:'Send invoices directly from your Gmail account', connected:false, logo:'G' },
    { name:'Google Drive', desc:'Auto-backup all invoices to Google Drive', connected:false, logo:'D' },
  ];
  const [states, setStates] = useState({});
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color:'var(--text)' }}>Integrations</div>
      <p style={{ color:'var(--muted)', fontSize:13, marginBottom:20 }}>Connect your favourite tools to automate your workflow</p>
      <div style={{ display:'grid', gap:12, maxWidth:600 }}>
        {integrations.map(i => (
          <div key={i.name} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px', border:'1px solid var(--border)', borderRadius:10, background:'var(--card-bg)' }}>
            <div style={{ width:42, height:42, borderRadius:10, background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, color:'var(--brand)', flexShrink:0 }}>{i.logo}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{i.name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{i.desc}</div>
            </div>
            <button className={`btn btn-sm ${states[i.name] ? 'btn-outline' : 'btn-brand'}`}
              onClick={() => setStates(s => ({...s, [i.name]: !s[i.name]}))}>
              {states[i.name] ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── E-Way Bill Portal ── */
function EWayBill() {
  const [f, setF] = useState({ gstin:'', username:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color:'var(--text)' }}>E-Way Bill Portal</div>
      <p style={{ color:'var(--muted)', fontSize:13, marginBottom:20 }}>Connect to the GST E-Way Bill portal to generate e-way bills directly from invoices</p>
      <div style={{ maxWidth:480, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'24px' }}>
        <div style={{ marginBottom:14 }}>
          <label className="form-label">GSTIN</label>
          <input className="form-input" value={f.gstin} onChange={e => setF(p=>({...p,gstin:e.target.value.toUpperCase()}))} placeholder="29AABCT1332L000" maxLength={15}/>
        </div>
        <div style={{ marginBottom:14 }}>
          <label className="form-label">E-Way Bill Username</label>
          <input className="form-input" value={f.username} onChange={e => setF(p=>({...p,username:e.target.value}))} placeholder="Portal username"/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label className="form-label">E-Way Bill Password</label>
          <div style={{ position:'relative' }}>
            <input className="form-input" type={showPw?'text':'password'} style={{ paddingRight:38 }} value={f.password} onChange={e => setF(p=>({...p,password:e.target.value}))} placeholder="Portal password"/>
            <button type="button" onClick={() => setShowPw(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--muted)', display:'flex' }}>
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
        <button className="btn btn-brand">Connect E-Way Bill Portal</button>
      </div>
    </div>
  );
}

/* ── Reports Settings ── */
function ReportsSettings() {
  const [tds, setTds] = useState(false);
  const [tcs, setTcs] = useState(false);
  const Row = ({ label, desc, checked, onChange }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ flex:1, paddingRight:20 }}>
        <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{label}</div>
        {desc && <div style={{ fontSize:12.5, color:'var(--muted)', marginTop:2 }}>{desc}</div>}
      </div>
      <div className={`tog-track${checked?' on':''}`} onClick={onChange}><div className="tog-thumb"/></div>
    </div>
  );
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color:'var(--text)' }}>Reports Configuration</div>
      <p style={{ color:'var(--muted)', fontSize:13, marginBottom:20 }}>Configure which reports and fields appear in your dashboard</p>
      <div style={{ maxWidth:560 }}>
        <Row label="Enable TDS" desc="Show TDS (Tax Deducted at Source) fields in invoices and reports" checked={tds} onChange={() => setTds(p=>!p)}/>
        <Row label="Enable TCS" desc="Show TCS (Tax Collected at Source) fields in invoices and reports" checked={tcs} onChange={() => setTcs(p=>!p)}/>
        <div style={{ paddingTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
          {['GSTR-1','GSTR-3B','P&L Statement','Sales Register','Purchase Register','Outstanding Report'].map(r => (
            <span key={r} className="chip active" style={{ fontSize:12 }}>{r}</span>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--muted)', marginTop:8 }}>Selected reports will appear in your Reports dashboard</p>
        <div style={{ marginTop:20 }}>
          <button className="btn btn-brand">Save Report Settings</button>
        </div>
      </div>
    </div>
  );
}

/* ── User Profile ── */
function UserProfile({ state, update, toast }) {
  const [f, setF] = useState({ firstName:'', lastName:'', email:'', ...state.profile });
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:20, color:'var(--text)' }}>User Profile</div>
      <div style={{ maxWidth:500 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, padding:16, background:'var(--bg)', borderRadius:12, border:'1px solid var(--border)', flexWrap:'wrap' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:22 }}>
            {(f.firstName?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:'var(--text)' }}>{f.firstName || 'Admin'} {f.lastName}</div>
            <div style={{ fontSize:13, color:'var(--muted)' }}>{f.email || 'No email set'}</div>
            <span className="badge badge-brand" style={{ marginTop:4 }}>Admin</span>
          </div>
        </div>
        <div className="field-row field-row-2"><div><label className="form-label">First Name</label><input className="form-input" value={f.firstName||''} onChange={e=>setF(p=>({...p,firstName:e.target.value}))}/></div><div><label className="form-label">Last Name</label><input className="form-input" value={f.lastName||''} onChange={e=>setF(p=>({...p,lastName:e.target.value}))}/></div></div>
        <div style={{ marginBottom:14 }}><label className="form-label">Email</label><input className="form-input" type="email" value={f.email||''} onChange={e=>setF(p=>({...p,email:e.target.value}))}/></div>
        <button className="btn btn-brand" onClick={() => { update('profile', f); toast('Profile updated', 'success'); }}>Save Profile</button>
      </div>
    </div>
  );
}

/* ── Banks & Payments (link to bank details page) ── */
function BanksPayments() {
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:6, color:'var(--text)' }}>Banks & Payments</div>
      <p style={{ color:'var(--muted)', fontSize:13, marginBottom:20 }}>Manage your bank accounts. These appear on invoices so customers can pay you directly.</p>
      <a href="/dashboard/bank-details" className="btn btn-brand">Manage Bank Details →</a>
    </div>
  );
}

export default function SettingsPage() {
  const { state, update, addItem, removeItem, toast } = useApp();
  const [active, setActive] = useState('Company Details');

  const content = {
    'Company Details':   <CompanyDetails state={state} update={(k,v) => { update(k,v); toast('Saved', 'success'); }}/>,
    'User Profile':      <UserProfile state={state} update={update} toast={toast}/>,
    'All Users & Roles': <UsersRoles state={state} addItem={addItem} removeItem={removeItem} toast={toast}/>,
    'General Settings':  <GeneralSettings/>,
    'Banks & Payments':  <BanksPayments/>,
    'Payment Gateway':   <PaymentGateway/>,
    'Integrations':      <Integrations/>,
    'E-Way Bill Portal': <EWayBill/>,
    'Reports':           <ReportsSettings/>,
  };

  return (
    <div className="page-content">
      <h1 style={{ fontWeight:800, fontSize:22, marginBottom:20, color:'var(--text)' }}>Settings</h1>
      <div className="settings-grid" style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:20, alignItems:'start' }}>
        <div className="card settings-menu-card" style={{ overflow:'visible', padding:0 }}>
          {MENU.map(({ label, Icon:Ic }) => (
            <button key={label} onClick={() => setActive(label)}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 16px', background: active===label ? 'var(--brand-bg)' : 'transparent', border:'none', borderLeft: active===label ? '3px solid var(--brand)' : '3px solid transparent', cursor:'pointer', fontSize:13, fontWeight: active===label ? 600 : 400, color: active===label ? 'var(--brand)' : 'var(--text)', fontFamily:'Inter,sans-serif', textAlign:'left', transition:'all .12s' }}>
              <Ic size={14} style={{ flexShrink:0, opacity:0.7 }}/> {label}
            </button>
          ))}
        </div>
        <div className="card" style={{ padding:24 }}>
          {content[active]}
        </div>
      </div>
    <style>{`
      @media(max-width:768px){
        .settings-grid { grid-template-columns:1fr !important; gap:12px !important; }
        .settings-menu-card { display:grid !important; grid-template-columns:1fr 1fr !important; padding:6px !important; gap:4px !important; border-radius:10px !important; }
        .settings-menu-card button { border-left:none !important; border-radius:8px !important; font-size:12px !important; padding:9px 10px !important; }
        .settings-grid > .card:last-child { padding:14px !important; }
      }
    `}</style>
    </div>
  );
}
