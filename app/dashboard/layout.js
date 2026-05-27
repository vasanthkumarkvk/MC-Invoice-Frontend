'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingCart, FileText, Tag, Package, Warehouse,
  CreditCard, Users, Truck, FolderKanban, TrendingUp, BarChart3,
  FileCheck, Settings, ChevronDown, Grid2X2, DatabaseZap,
  Search, Bell, Zap, Menu, LogOut, X, Moon, Sun, Keyboard,
  HelpCircle, Star, Sparkles, Eye, EyeOff, Phone, Headphones, Check,
  Receipt, ShoppingBag, ClipboardList, FileOutput, RotateCcw, Wallet,
  Rocket, Bolt, Crown, ArrowRight, Gift,
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import Toasts from '@/components/Toast';
const API_BASE = "https://api.crazystory.in/api";
const LOGO = 'https://mindcarve.in/wp-content/uploads/2023/07/1.5X1-1.png';

const CURRENCIES = [
  { code:'INR', symbol:'₹', name:'Indian Rupee' },
  { code:'USD', symbol:'$', name:'US Dollar' },
  { code:'EUR', symbol:'€', name:'Euro' },
  { code:'GBP', symbol:'£', name:'British Pound' },
  { code:'AED', symbol:'د.إ', name:'UAE Dirham' },
  { code:'SGD', symbol:'S$', name:'Singapore Dollar' },
  { code:'JPY', symbol:'¥', name:'Japanese Yen' },
  { code:'CAD', symbol:'C$', name:'Canadian Dollar' },
  { code:'AUD', symbol:'A$', name:'Australian Dollar' },
  { code:'CHF', symbol:'CHF', name:'Swiss Franc' },
];

const NAV = [
  { key:'home',      label:'Home',              Icon:Grid2X2,      href:'/dashboard/home' },
  { key:'sales',     label:'Sales',             Icon:LayoutDashboard, sub:[
    { label:'Invoices',      href:'/dashboard/sales' },
    { label:'Credit Notes',  href:'/dashboard/create/sales-return' },
    { label:'E-Invoices',    href:'/dashboard/e-invoices' },
  ]},
  { key:'purchases', label:'Purchases',         Icon:ShoppingCart, sub:[
    { label:'Purchases',        href:'/dashboard/purchases' },
    { label:'Purchase Orders',  href:'/dashboard/create/purchase-order' },
    { label:'Purchase Returns', href:'/dashboard/create/purchase-return' },
  ]},
  { key:'quotations',label:'Quotations',        Icon:FileText, sub:[
    { label:'Quotations',        href:'/dashboard/estimates' },
    { label:'Pro Forma',         href:'/dashboard/create/proforma' },
    { label:'Delivery Challans', href:'/dashboard/delivery-challans' },
  ]},
  { key:'products',  label:'Products & Services', Icon:Package,  href:'/dashboard/products' },
  { key:'customers', label:'Customers',         Icon:Users,        href:'/dashboard/customers' },
  { key:'expenses',  label:'Expenses+',         Icon:Tag, sub:[
    { label:'Expenses',        href:'/dashboard/expenses' },
    { label:'Indirect Income', href:'/dashboard/indirect-income' },
  ]},
  { key:'vendors',   label:'Vendors',           Icon:Truck,        href:'/dashboard/vendors' },
  { key:'inventory', label:'Inventory',         Icon:Warehouse, sub:[
    { label:'Warehouses',  href:'/dashboard/inventory' },
    { label:'Timeline',    href:'/dashboard/inventory?tab=timeline' },
  ]},
  { key:'payments',  label:'Payments',          Icon:CreditCard,   href:'/dashboard/payments' },
  { key:'projects',  label:'Projects',          Icon:FolderKanban, href:'/dashboard/projects' },
  { key:'insights',  label:'Insights',          Icon:TrendingUp,   href:'/dashboard/insights' },
  { key:'reports',   label:'Reports',           Icon:BarChart3,    href:'/dashboard/reports' },
  { key:'tally',     label:'Tally',             Icon:DatabaseZap,  href:'/dashboard/tally', tag:'New' },
  { key:'eway',      label:'E-way Bills',       Icon:FileCheck,    href:'/dashboard/eway-bills' },
  { key:'settings',  label:'Settings',          Icon:Settings,     href:'/dashboard/settings' },
];

function NavItem({ item, pathname, onNav }) {
  const isActive = item.href
    ? pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    : (item.sub || []).some(s => pathname.startsWith(s.href));
  const [open, setOpen] = useState(isActive);
  const Ic = item.Icon;
  if (!item.sub) {
    return (
      <Link href={item.href||'#'} className={`nav-link${isActive?' active':''}`} onClick={onNav}>
        <Ic size={16}/><span style={{flex:1,textAlign:'left'}}>{item.label}</span>
        {item.tag && <span style={{fontSize:9,fontWeight:800,background:'#10b981',color:'#fff',padding:'1px 5px',borderRadius:4}}>{item.tag}</span>}
      </Link>
    );
  }
  return (
    <div>
      <button className={`nav-link${isActive?' active':''}`} onClick={()=>setOpen(o=>!o)} style={{width:'100%'}}>
        <Ic size={16}/><span style={{flex:1,textAlign:'left'}}>{item.label}</span>
        <ChevronDown size={13} style={{transition:'transform 0.2s',transform:open?'rotate(180deg)':'none'}}/>
      </button>
      {open && <div className="nav-sub">{item.sub.map(s=>(
        <Link key={s.label} href={s.href} className={`nav-link${pathname===s.href?' active':''}`} onClick={onNav}>{s.label}</Link>
      ))}</div>}
    </div>
  );
}


const SHORTCUTS_LIST = [
  { keys:'Ctrl+I', action:'Invoice',          href:'/dashboard/create/invoice' },
  { keys:'Ctrl+P', action:'Purchase Invoice', href:'/dashboard/create/purchase' },
  { keys:'Ctrl+O', action:'Purchase Order',   href:'/dashboard/create/purchase-order' },
  { keys:'Ctrl+Q', action:'Quotation',        href:'/dashboard/create/estimate' },
  { keys:'Ctrl+F', action:'Pro Forma Invoice',href:'/dashboard/create/proforma' },
  { keys:'Ctrl+C', action:'Sales Return',     href:'/dashboard/create/sales-return' },
  { keys:'Ctrl+E', action:'Expense',          href:'/dashboard/expenses' },
];

function ShortcutsPanel({ onClose }) {
  const router = useRouter();
  return (
    <div style={{position:'fixed',inset:0,zIndex:600,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,animation:'fadeIn 0.18s ease'}} onClick={onClose}>
      <div style={{background:'var(--card-bg)',borderRadius:20,boxShadow:'0 32px 80px rgba(0,0,0,0.35)',width:'min(420px,calc(100vw-32px))',maxHeight:'calc(100dvh - 40px)',overflowY:'auto',border:'1px solid var(--border)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'20px 24px 16px',background:'linear-gradient(135deg,var(--brand),#b52577)',borderRadius:'20px 20px 0 0',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
          <div style={{position:'absolute',bottom:-30,left:20,width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Keyboard size={20} color="#fff"/>
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:17,color:'#fff'}}>Keyboard Shortcuts</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:1}}>Navigate faster without a mouse</div>
              </div>
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',transition:'background 0.15s'}}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
              onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
              <X size={15}/>
            </button>
          </div>
        </div>
        <div style={{padding:'8px 12px 12px'}}>
          {SHORTCUTS_LIST.map((s, idx) => {
            const ICONS = [Receipt, ShoppingBag, ClipboardList, FileText, FileOutput, RotateCcw, Wallet];
            const Icon = ICONS[idx] || FileText;
            return (
            <button key={s.action} onClick={()=>{router.push(s.href);onClose();}}
              style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 12px',width:'100%',background:'none',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',color:'var(--text)',borderRadius:10,transition:'background 0.12s',marginBottom:2}}
              onMouseOver={e=>e.currentTarget.style.background='var(--brand-bg)'}
              onMouseOut={e=>e.currentTarget.style.background='none'}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:'var(--bg)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon size={15} color="var(--brand)"/>
                </div>
                <span style={{fontSize:14,fontWeight:500}}>{s.action}</span>
              </div>
              <div style={{display:'flex',gap:4,alignItems:'center'}}>
                {s.keys.split('+').map((k,i,arr)=>(
                  <span key={k} style={{display:'flex',alignItems:'center',gap:4}}>
                    <kbd style={{background:'var(--bg)',padding:'4px 10px',borderRadius:7,fontFamily:'monospace',fontSize:12,fontWeight:700,border:'1px solid var(--border)',color:'var(--text)',boxShadow:'0 2px 0 var(--border)'}}>{k}</kbd>
                    {i<arr.length-1&&<span style={{fontSize:11,color:'var(--muted)',fontWeight:600}}>+</span>}
                  </span>
                ))}
              </div>
            </button>
          );})}
        </div>
        <div style={{padding:'12px 24px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8,background:'var(--bg)',borderRadius:'0 0 20px 20px'}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#10b981',flexShrink:0}}/>
          <span style={{fontSize:12,color:'var(--muted)'}}>Shortcuts work anywhere except in text fields</span>
        </div>
      </div>
    </div>
  );
}

function OfferBanner() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    document.documentElement.style.setProperty('--banner-h', visible ? '38px' : '0px');
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="offer-banner">
      <span style={{display:'flex',alignItems:'center',gap:6}}><Gift size={14}/> Get ₹200 OFF on premium plans! Use code <strong>ZETSAP200</strong></span>
      <button className="offer-banner-close" onClick={()=>setVisible(false)}>✕</button>
    </div>
  );
}

function UserMenu({ onClose, onToggleDark, darkMode, onShowSubs, onShowShortcuts }) {
  const { state, logout } = useApp();
  const router = useRouter();
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  const name = state.profile ? `${state.profile.firstName||''} ${state.profile.lastName||''}`.trim() : null;
    // Correct logout function inside UserMenu

    

    const handleLogout = async () => {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('zetsap_token')}`
      }
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
  
  // Option 1: Clear specific items
  const authKeys = ['zetsap_token', 'zetsap_user', 'zetsap_company', 'user'];
  authKeys.forEach(key => localStorage.removeItem(key));
  
  // Option 2: Clear EVERYTHING (if no other important data)
  // localStorage.clear();
  
  await logout();
  router.push('/login');
  onClose();
};


  return (
    <div ref={ref} style={{position:'absolute',top:48,right:8,background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:12,boxShadow:'var(--shadow-lg)',width:260,zIndex:500,overflow:'hidden',animation:'fadeUp 0.15s ease'}}>
      <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)'}}>
        <div style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>{name||'Hello there!'}</div>
        <div style={{fontSize:12,color:'var(--muted)'}}>FREE PLAN</div>
        <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:3}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5}}><span style={{color:'var(--muted)'}}>Phone</span><span style={{color:'var(--text)'}}>{state.profile?.mobile||state.user?.mobile||'—'}</span></div>
          {state.profile?.email&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12.5}}><span style={{color:'var(--muted)'}}>Email</span><span style={{overflow:'hidden',textOverflow:'ellipsis',maxWidth:130,color:'var(--text)'}}>{state.profile.email}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5}}><span style={{color:'var(--muted)'}}>Role</span><span style={{fontWeight:600,color:'var(--brand)'}}>Admin</span></div>
        </div>
        <div style={{marginTop:10,background:'var(--brand-bg)',borderRadius:8,padding:'8px 10px',fontSize:12,fontWeight:600,color:'var(--brand)'}}>
          Super 2026 Offer — Get ₹500 OFF on 1-year plans!
        </div>
      </div>
      {[
        {Icon:Star,label:'Premium Plans',fn:()=>{onShowSubs();onClose();}},
        {Icon:darkMode?Sun:Moon,label:darkMode?'Light Mode':'Dark Mode',fn:()=>{onToggleDark();onClose();}},
        {Icon:Keyboard,label:'Keyboard Shortcuts',fn:()=>{if(onShowShortcuts)onShowShortcuts();onClose();}},
        {Icon:HelpCircle,label:'Help & Support',fn:()=>onClose()},
        {Icon:Settings,label:'Settings',fn:()=>{router.push('/dashboard/settings');onClose();}},
        {Icon:LogOut, label:'Logout', fn:handleLogout, danger:true},
        {Icon:X,label:'Close',fn:()=>onClose(),divider:true},
      ].map(({Icon:Ic,label,fn,danger})=>(
        <button key={label} onClick={fn} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:danger?'#dc2626':'var(--text)',fontFamily:'Inter,sans-serif',transition:'background 0.1s'}}
          onMouseOver={e=>e.currentTarget.style.background=danger?'#fff5f5':'var(--brand-bg)'}
          onMouseOut={e=>e.currentTarget.style.background='transparent'}>
          <Ic size={15}/>{label}
        </button>
      ))}
    </div>
  );
}

function SubscriptionModal({ onClose }) {
  const [billing, setBilling] = useState('yearly');
  const PLANS = [
    {
      name:'Starter',
      Icon:Rocket,
      monthly:'₹149', yearly:'₹999',
      save:'Save ₹789',
      desc:'Perfect for freelancers and solo business owners.',
      features:['50 invoices/month','Basic GST reports','1 user','Email support'],
      notIncluded:['Payment gateway','Tally sync'],
      popular:false, accent:'#059669',
    },
    {
      name:'Growth',
      Icon:Zap,
      monthly:'₹299', yearly:'₹2,499',
      save:'Save ₹1,089',
      desc:'Best for growing teams needing more power.',
      features:['Unlimited invoices','Full GST reports','3 users','Priority support','Payment gateway'],
      notIncluded:['Tally sync'],
      popular:true, accent:'var(--brand)',
    },
    {
      name:'Enterprise',
      Icon:Crown,
      monthly:'₹599', yearly:'₹4,999',
      save:'Save ₹2,189',
      desc:'Tailored for large businesses and high-volume needs.',
      features:['Everything in Growth','Unlimited users','Tally sync','Dedicated manager','Custom domain','API access'],
      notIncluded:[],
      popular:false, accent:'#1d4ed8',
    },
  ];
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-xl" style={{maxHeight:'94vh',overflowY:'auto',padding:0,borderRadius:20,background:'linear-gradient(135deg,#fef5f9 0%,#fdf2f7 100%)'}}>
        {/* Header */}
        <div style={{textAlign:'center',padding:'28px 28px 0',position:'relative'}}>
          <button onClick={onClose} style={{position:'absolute',top:16,right:16,width:32,height:32,borderRadius:8,background:'rgba(0,0,0,0.06)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={16}/></button>
          <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:700,background:'linear-gradient(135deg,var(--brand),#c0267a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:6}}>Flexible plans</div>
          <div style={{fontWeight:900,fontSize:26,color:'#0f172a',letterSpacing:'-0.02em',marginBottom:6}}>Choose the right plan</div>
          <p style={{fontSize:14,color:'#475569',marginBottom:20}}>Custom pricing designed around your goals</p>
          {/* Toggle */}
          <div style={{display:'inline-flex',background:'#f1f5f9',borderRadius:50,padding:'4px',border:'1px solid #e2e8f0',marginBottom:24}}>
            {['monthly','yearly'].map(b=>(
              <button key={b} onClick={()=>setBilling(b)}
                style={{padding:'8px 24px',borderRadius:40,border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:14,fontWeight:600,transition:'all 0.2s',
                  background:billing===b?'var(--brand)':'transparent',
                  color:billing===b?'#fff':'#475569',
                  boxShadow:billing===b?'0 2px 8px rgba(143,25,92,0.25)':'none'}}>
                {b==='monthly'?'Monthly':'Yearly'}
              </button>
            ))}
          </div>
          {billing==='yearly'&&<div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#dcfce7',borderRadius:20,padding:'4px 12px',fontSize:12,fontWeight:700,color:'#15803d',marginLeft:10,verticalAlign:'middle'}}>
            <Check size={12}/>Up to 44% off
          </div>}
        </div>

        {/* Cards */}
        <div style={{padding:'0 20px 24px',display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center',alignItems:'stretch'}}>
          {PLANS.map(p=>{
            const PIcon = p.Icon;
            return (
            <div key={p.name} style={{flex:'1',minWidth:240,maxWidth:320,background:'#fff',borderRadius:20,border:`1px solid ${p.popular?'var(--brand)':'#e2e8f0'}`,borderTop:p.popular?`3px solid var(--brand)`:'1px solid #e2e8f0',padding:'24px',position:'relative',display:'flex',flexDirection:'column',transition:'all 0.25s',boxShadow:p.popular?'0 8px 32px rgba(143,25,92,0.12)':'0 4px 12px rgba(0,0,0,0.03)'}}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 30px -12px rgba(0,0,0,0.12)';}}
              onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=p.popular?'0 8px 32px rgba(143,25,92,0.12)':'0 4px 12px rgba(0,0,0,0.03)';}}>
              {p.popular&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'var(--brand)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 14px',borderRadius:20,whiteSpace:'nowrap',letterSpacing:'0.05em'}}>Most Popular</div>}
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:38,height:38,borderRadius:10,background:p.popular?'var(--brand)':p.accent+'15',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <PIcon size={18} color={p.popular?'#fff':p.accent}/>
                </div>
                <div style={{fontWeight:800,fontSize:18,color:'#0f172a'}}>{p.name}</div>
              </div>
              <div style={{marginBottom:8}}>
                <span style={{fontWeight:900,fontSize:32,color:p.popular?'var(--brand)':p.accent,letterSpacing:'-1px'}}>{billing==='yearly'?p.yearly:p.monthly}</span>
                <span style={{fontSize:13,color:'#94a3b8',marginLeft:4}}>/month</span>
              </div>
              {billing==='yearly'&&<div style={{fontSize:11,fontWeight:700,color:'#059669',marginBottom:8}}>{p.save}</div>}
              <div style={{fontSize:13,color:'#475569',marginBottom:16,minHeight:36,lineHeight:1.5}}>{p.desc}</div>
              <div style={{height:1,background:'#e2e8f0',marginBottom:14}}/>
              <ul style={{listStyle:'none',flex:1,marginBottom:16}}>
                {p.features.map(f=>(
                  <li key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#1e293b',padding:'5px 0',borderBottom:'1px solid #f8fafc'}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:p.popular?'var(--brand)':p.accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Check size={10} color="#fff" strokeWidth={3}/>
                    </div>
                    {f}
                  </li>
                ))}
                {p.notIncluded.map(f=>(
                  <li key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#94a3b8',padding:'5px 0',borderBottom:'1px solid #f8fafc',textDecoration:'line-through'}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <X size={9} color="#94a3b8" strokeWidth={2.5}/>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`btn${p.popular?' btn-brand':' btn-outline'}`} style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:14,fontWeight:600,borderRadius:40}}>
                {p.popular?'Get Started':'Select Plan'}
              </button>
            </div>
          );})}
        </div>

        <div style={{padding:'14px 28px',borderTop:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',gap:24,flexWrap:'wrap',background:'rgba(255,255,255,0.7)',borderRadius:'0 0 20px 20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#64748b'}}><Headphones size={14}/> Talk to a specialist</div>
          <a href="tel:+918121335436" style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'var(--brand)',fontWeight:700,textDecoration:'none'}}><Phone size={14}/> +91 812 133 5436</a>
          <div style={{fontSize:12,color:'#94a3b8'}}>No hidden fees · Cancel anytime</div>
        </div>
      </div>
    </div>
  );
}


function WhatsAppFloat() {
  return (
    <a href="https://wa.me/917305940914" target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Chat on WhatsApp">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.113.549 4.098 1.51 5.823L0 24l6.336-1.498A11.928 11.928 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.003-1.372l-.36-.213-3.72.879.904-3.619-.233-.371A9.818 9.818 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
      </svg>
    </a>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { state, logout, sidebarOpen, setSidebarOpen, showShortcuts, setShowShortcuts } = useApp();

    useEffect(() => {
    const token = localStorage.getItem('zetsap_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAIInfo, setShowAIInfo] = useState(false);
  const [showSubs,    setShowSubs]    = useState(false);
  const [showUserMenu,setShowUserMenu]= useState(false);
  const [searchVal,   setSearchVal]   = useState('');
  const [darkMode,    setDarkMode]    = useState(false);

 

  useEffect(() => { document.documentElement.classList.toggle('dark',darkMode); }, [darkMode]);

  useEffect(() => {
    const fn = e => {
      if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
      const R={i:'/dashboard/create/invoice',p:'/dashboard/create/purchase',o:'/dashboard/create/purchase-order',q:'/dashboard/create/estimate',f:'/dashboard/create/proforma',c:'/dashboard/create/sales-return',e:'/dashboard/expenses'};
      if (e.ctrlKey&&R[e.key]) { e.preventDefault(); router.push(R[e.key]); }
    };
    document.addEventListener('keydown',fn);
    return ()=>document.removeEventListener('keydown',fn);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const companyName = state.companyDetails?.name||(state.profile?.firstName?`${state.profile.firstName}'s Business`:'YOUR BUSINESS');
  const initial = (companyName[0]||'A').toUpperCase();

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'var(--bg)'}}>
      <OfferBanner/>
      <div style={{display:'flex',flex:1}}>
        {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}/>}

        <nav className={`sidebar${sidebarOpen?' open':''}`}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <img src={LOGO} alt="" style={{height:32,objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
              <button className="btn-icon" id="sidebar-close-btn" style={{display:'none'}} onClick={closeSidebar}><X size={18}/></button>
            </div>
            <div style={{marginTop:10,display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'var(--brand-bg)',borderRadius:8,cursor:'pointer'}}>
              <div style={{width:28,height:28,borderRadius:7,background:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:12,flexShrink:0}}>{initial}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--brand)'}}>{companyName.toUpperCase()}</div>
                {state.companyDetails?.domain&&<div style={{fontSize:10,color:'var(--muted)'}}>zetsap.com/{state.companyDetails.domain}</div>}
              </div>
            </div>
          </div>
          <div className="sidebar-scroll">
            {NAV.map(item=><NavItem key={item.key} item={item} pathname={pathname} onNav={closeSidebar}/>)}
          </div>
          <div style={{padding:'12px 14px',borderTop:'1px solid var(--border)',flexShrink:0}}>
            <button className="btn btn-brand btn-sm" style={{width:'100%',justifyContent:'center',fontSize:11.5}} onClick={()=>setShowSubs(true)}>Subscribe Now</button>
          </div>
        </nav>

        <div className="main-wrap">
          <div className="topbar">
            <button className="btn-icon ham-btn" onClick={()=>setSidebarOpen(true)} aria-label="Open menu" style={{display:'none'}}>
              <Menu size={20}/>
            </button>
            {/* Logo in topbar — visible on mobile only */}
            <div className="topbar-logo-mobile" style={{flexShrink:0}}>
              <img src="https://mindcarve.in/wp-content/uploads/2023/07/1.5X1-1.png" alt="Zetsap" style={{height:28,objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
            </div>
            <div className="search-bar topbar-search" style={{flex:1,maxWidth:400}}>
              <Search size={14} color="var(--muted)"/>
              <input placeholder="Search invoices, customers, products…" value={searchVal} onChange={e=>setSearchVal(e.target.value)}/>
            </div>
            <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:4,position:'relative'}}>
              <button className="btn-icon" title="ZetsapAI" onClick={()=>setShowAIInfo(true)}>
                <Sparkles size={18} color="var(--brand)"/>
              </button>
              <button className="btn-icon" title="Keyboard Shortcuts" onClick={()=>setShowShortcuts(s=>!s)}>
                <Zap size={18}/>
              </button>
              <button className="btn-icon" title="Pricing" onClick={()=>setShowSubs(true)}>
                <Bell size={18}/>
              </button>
              <button onClick={()=>setShowUserMenu(m=>!m)}
                style={{width:32,height:32,borderRadius:'50%',background:'var(--brand)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:13,flexShrink:0}}>
                {state.profile?.firstName?.[0]?.toUpperCase()||state.user?.mobile?.slice(-2)||'A'}
              </button>
              {showUserMenu&&<UserMenu onClose={()=>setShowUserMenu(false)} onToggleDark={()=>setDarkMode(d=>!d)} darkMode={darkMode} onShowSubs={()=>setShowSubs(true)} onShowShortcuts={()=>setShowShortcuts(true)}/>}
            </div>
          </div>
          <main style={{flex:1,minWidth:0}}>{children}</main>
        </div>
      </div>

      <WhatsAppFloat/>
      {showShortcuts && <ShortcutsPanel onClose={()=>setShowShortcuts(false)}/>}
      {showAIInfo && (
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowAIInfo(false)}>
          <div className="modal-box modal-md">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center'}}><Sparkles size={18} color="var(--brand)"/></div>
                <div><div style={{fontWeight:800,fontSize:16,color:'var(--text)'}}>ZetsapAI</div><div style={{fontSize:12,color:'var(--muted)'}}>AI-Powered Invoice Assistant</div></div>
              </div>
              <button className="btn-icon" onClick={()=>setShowAIInfo(false)}><X size={18}/></button>
            </div>
            <div style={{padding:'20px',overflowY:'auto'}}>
              <p style={{fontSize:13.5,color:'var(--muted)',marginBottom:16,lineHeight:1.6}}>ZetsapAI helps you create professional content instantly — across invoices, products, expenses and more.</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
                {[{icon:FileText,title:'Invoice Notes',desc:'Generate professional notes and payment terms instantly.'},{icon:Package,title:'Product Descriptions',desc:'Write compelling product descriptions with one click.'},{icon:Sparkles,title:'Smart Tone Options',desc:'Choose Professional, Friendly, Formal or Concise.'},{icon:Settings,title:'Grammar Fix',desc:'Instantly improve grammar, spelling and clarity.'},{icon:Tag,title:'Expense Notes',desc:'Auto-generate expense descriptions using AI.'},{icon:Users,title:'Customer Messages',desc:'Compose personalised payment reminders.'}].map(f=>(
                  <div key={f.title} style={{padding:'14px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
                    <div style={{width:28,height:28,borderRadius:7,background:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginBottom:8}}><f.icon size={14} color="var(--brand)"/></div>
                    <div style={{fontWeight:700,fontSize:13,color:'var(--text)',marginBottom:4}}>{f.title}</div>
                    <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,color:'var(--muted)'}}>Powered by ZetsapAI</span>
              <button className="btn btn-brand btn-sm" onClick={()=>setShowAIInfo(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
      {showSubs    && <SubscriptionModal onClose={()=>setShowSubs(false)}/>}
      <Toasts/>

      <style>{`
        .ham-btn { display: none !important; }
        .topbar-logo-mobile { display: none !important; }
        @media(max-width:768px){
          .ham-btn { display:flex !important; }
          .topbar-logo-mobile { display:flex !important; }
          #sidebar-close-btn { display:flex !important; }
          .topbar-search { display:none !important; }
        }
        @media(max-width:768px){
          .field-row-2, .field-row-3 { grid-template-columns:1fr !important; }
          div[style*="flex: 0 0 68%"] { flex:1 1 100% !important; min-width:0 !important; }
          div[style*="flex: 0 0 calc(32%"] { flex:1 1 100% !important; min-width:0 !important; }
        }
      `}</style>
    </div>
  );
}
