'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Download, Filter, X, Columns, FileX, FileText, BarChart2, Package, Users, TrendingUp, CreditCard, BookOpen, Share2, CalendarDays } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, fmtDate } from '@/lib/data';

const today = () => new Date().toISOString().slice(0,10);
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0,10); };
const fmtD = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}) : '';

// ── LEFT NAV TREE ─────────────────────────────────────────────────────────────
const NAV_ICONS = { taxes: FileX, transaction: FileText, billwise: BarChart2, item: Package, party: Users, pl: TrendingUp, payments: CreditCard, daybook: CalendarDays, share: Share2 };

const NAV_TREE = [
  { label:'Taxes', icon:'taxes', children:[
    { label:'GSTR - 1' },{ label:'GSTR - 2B' },{ label:'GSTR - 3B' },{ label:'GSTR - 7' },
    { label:'Sale Summary by HSN' },{ label:'TDS Receivable' },{ label:'TDS Payable' },
    { label:'TCS Receivable' },{ label:'TCS Payable' },
  ]},
  { label:'Transaction Reports', icon:'transaction', children:[
    { label:'Sales' },{ label:'Purchases' },{ label:'Sale Returns / Credit Notes' },
    { label:'Sales Debit Notes' },{ label:'Purchase Returns / Debit Notes' },
    { label:'Quotations' },{ label:'Sales Orders' },{ label:'Delivery Challans' },
    { label:'Pro Forma Invoices' },{ label:'Purchase Orders' },
    { label:'Ewaybills', tag:'New' },{ label:'Expense' },{ label:'Indirect Income' },
    { label:'Category-Wise Expense' },{ label:'Category-Wise Indirect Income' },
  ]},
  { label:'Bill-wise Item Reports', icon:'billwise', children:[
    { label:'Sales' },{ label:'Purchases' },{ label:'Sale Returns / Credit Notes' },
    { label:'Sales Debit Notes' },{ label:'Purchase Returns / Debit Notes' },
    { label:'Quotations' },{ label:'Sales Orders' },{ label:'Delivery Challans' },
    { label:'Pro Forma Invoices' },{ label:'Purchase Orders' },
  ]},
  { label:'Item Reports', icon:'item', children:[
    { label:'Stock Summary' },{ label:'Item-wise Discount' },{ label:'Stock Value' },
    { label:'Inventory Timeline' },{ label:'Low Stock', tag:'New' },
  ]},
  { label:'Party Reports', icon:'party', children:[
    { label:'All Customers' },{ label:'All Vendors' },{ label:'Customer Statement' },
    { label:'Vendor Statement' },{ label:'Customer wise Items' },{ label:'Vendor wise Items' },
  ]},
  { label:'Profit & Loss(PL) Reports', icon:'pl', children:[
    { label:'P&L Statement' },{ label:'Sales P&L Report' },{ label:'Sale Items P&L Report' },
    { label:'Item-wise P&L (Purchases)' },{ label:'Item-wise P&L Report (Purchase Price)' },
    { label:'Category-wise P&L Report (Purchase Price)' },{ label:'Customer-wise P&L Report' },
  ]},
  { label:'Payments Reports', icon:'payments', children:[
    { label:'Payment Received' },{ label:'Payment Made' },
  ]},
  { label:'Day Book', icon:'daybook', children:[] },
  { label:'Share History', icon:'share', children:[] },
];

// ── SAMPLE DATA ───────────────────────────────────────────────────────────────
function getSampleData(label) {
  if (label === 'P&L Statement') return {
    cols:['Transaction Type (without tax)', 'Total Amount'],
    rows:[
      ['Sales Revenue', '₹1,45,000'],['Purchase Cost', '₹82,000'],
      ['Gross Profit', '₹63,000'],['Expenses', '₹18,500'],['Net Profit', '₹44,500'],
    ],
    totals:['Net Profit', '₹44,500'],
  };
  if (label === 'Sales P&L Report') return {
    cols:['Invoice #', 'Customer', 'Date', 'Revenue', 'Cost', 'Profit', 'Margin%'],
    rows:[
      ['INV-001','Raj Traders','07/04/2026','₹12,500','₹8,000','₹4,500','36%'],
      ['INV-002','Kumar Pvt','06/04/2026','₹8,200','₹5,500','₹2,700','33%'],
      ['INV-003','Sharma & Co','05/04/2026','₹21,000','₹14,000','₹7,000','33%'],
    ],
    totals:['Total','','','₹41,700','₹27,500','₹14,200','34%'],
  };
  if (label === 'All Customers') return {
    cols:['Name','Billing Address','Mobile','Company Name','GSTIN','Closing Balance','Net Balance as of today','Tags'],
    rows:[['Default Customer','—','—','—','—','0.00','0.00','—']],
    totals:['Total','','','','','0.00','0.00',''],
  };
  if (label === 'Stock Summary') return {
    cols:['Item Name','Variant','Unit','HSN/SAC','Price','Purchase Price','Category','Barcode'],
    rows:[],
    totals:[],
  };
  if (label === 'Sales') return {
    cols:['Date','Due Date','Serial Number','Total Amount','Party Company Name','Party Name','Tax Amount'],
    rows:[],
    totals:[],
  };
  return {
    cols:['Date','Description','Amount','Status'],
    rows:[],
    totals:[],
  };
}

function ReportContent({ label, dateFrom, dateTo }) {
  const { state, fmtMoney, currency } = useApp();
  const { cols, rows, totals } = getSampleData(label);
  const invoices = state.invoices || [];
  const customers = state.customers || [];

  // Use real data for transaction-type reports
  let displayRows = rows;
  if ((label === 'Sales' || label === 'Sales Register') && invoices.length > 0) {
    displayRows = invoices.map(inv => {
      const c = customers.find(x => x.id === inv.customerId);
      const t = calcDoc(inv.items||[], inv.disc);
      return [fmtDate(inv.date), fmtDate(inv.dueDate), inv.number||'—', fmtMoney(t.total), c?.name||'—', c?.name||'—', fmtMoney(t.taxAmt)];
    });
  }

  return (
    <div>
      <div style={{ overflowX:'auto' }}>
        <table className="tbl" style={{ minWidth:600 }}>
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c} style={{ whiteSpace:'nowrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    {c}
                    <span style={{ cursor:'pointer', opacity:0.5, fontSize:10 }}>⇅</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} style={{ textAlign:'center', padding:'48px 20px', color:'var(--muted)' }}>
                  No data for the selected period
                </td>
              </tr>
            ) : displayRows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j} style={{ whiteSpace:'nowrap' }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
          {totals.length > 0 && displayRows.length > 0 && (
            <tfoot>
              <tr style={{ background:'var(--bg)', fontWeight:700 }}>
                {totals.map((cell, j) => (
                  <td key={j} style={{ padding:'10px 14px', fontWeight:700, fontSize:13, borderTop:'2px solid var(--border)', whiteSpace:'nowrap' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function NavSection({ item, active, onSelect, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const isLeaf = !item.children || item.children.length === 0;

  if (isLeaf) {
    const LeafIcon = item.icon && NAV_ICONS[item.icon] ? NAV_ICONS[item.icon] : null;
    return (
      <button className={`report-nav-item${active===item.label?' active':''}`}
        style={{ paddingLeft:16, display:'flex', alignItems:'center', gap:8 }}
        onClick={() => onSelect(item.label)}>
        {LeafIcon && <LeafIcon size={13} style={{flexShrink:0}}/>}
        {item.label}
        {item.tag && <span style={{ marginLeft:6, fontSize:9, fontWeight:800, background:'#3b82f6', color:'#fff', padding:'1px 5px', borderRadius:4 }}>{item.tag}</span>}
      </button>
    );
  }

  return (
    <div className="report-nav-section">
      <button className="report-nav-header" onClick={() => setOpen(o => !o)}>
        {item.icon && NAV_ICONS[item.icon] && (() => { const Ic = NAV_ICONS[item.icon]; return <Ic size={14} color="var(--muted)" style={{flexShrink:0}}/>; })()}
        <span style={{ flex:1 }}>{item.label}</span>
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0, color:'var(--muted)' }}/>
      </button>
      {open && item.children.map(child => (
        <button key={child.label} className={`report-nav-item${active===child.label?' active':''}`}
          onClick={() => onSelect(child.label)}>
          {child.label}
          {child.tag && <span style={{ marginLeft:6, fontSize:9, fontWeight:800, background:'#3b82f6', color:'#fff', padding:'1px 5px', borderRadius:4 }}>{child.tag}</span>}
        </button>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [active, setActive] = useState('Sales');
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(today());
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Find parent section title
  const parentSection = NAV_TREE.find(n => n.children?.some(c => c.label === active));

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 52px)' }}>

      {/* Left sidebar nav */}
      <div className="reports-sidebar">
        {/* Back */}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => window.history.back()}>
            ← Back
          </button>
        </div>
        {NAV_TREE.map((item, i) => (
          <NavSection key={item.label} item={item} active={active} onSelect={setActive}
            defaultOpen={item.children?.some(c => c.label === active)}/>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex:1, minWidth:0, overflow:'hidden' }}>
        {/* Mobile nav toggle */}
        <div style={{ display:'none' }} className="mobile-report-nav-btn">
          <button className="btn btn-outline btn-sm" style={{display:'flex',alignItems:'center',gap:6}} onClick={() => setShowMobileNav(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            Reports Menu
          </button>
        </div>
        {showMobileNav && (
          <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.5)'}} onClick={() => setShowMobileNav(false)}>
            <div style={{position:'absolute',top:0,left:0,bottom:0,width:'min(300px,85vw)',background:'var(--card-bg)',overflowY:'auto',boxShadow:'4px 0 24px rgba(0,0,0,0.15)',animation:'sheetIn 0.25s ease'}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontWeight:700,fontSize:15}}>Reports</span>
                <button className="btn-icon" onClick={() => setShowMobileNav(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {NAV_TREE.map((item, i) => (
                <NavSection key={item.label} item={item} active={active} onSelect={s => { setActive(s); setShowMobileNav(false); }}
                  defaultOpen={item.children?.some(c => c.label === active)}/>
              ))}
            </div>
          </div>
        )}

        {/* Report header */}
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div>
            <h2 style={{ fontWeight:700, fontSize:18, color:'var(--text)' }}>{active}</h2>
            {parentSection && <p style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{parentSection.label}</p>}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button className="btn btn-outline btn-sm"><Download size={13}/> Download</button>
            <button className="btn btn-outline btn-sm"><Columns size={13}/> Columns</button>
          </div>
        </div>

        {/* Filters row */}
        <div style={{ padding:'12px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', fontWeight:600, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>Date Range</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ border:'1px solid var(--border)', borderRadius:6, padding:'6px 10px', fontSize:13, fontFamily:'Inter,sans-serif', color:'var(--text)', background:'var(--card-bg)', outline:'none' }}/>
              <span style={{ color:'var(--muted)', fontSize:13 }}>→</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ border:'1px solid var(--border)', borderRadius:6, padding:'6px 10px', fontSize:13, fontFamily:'Inter,sans-serif', color:'var(--text)', background:'var(--card-bg)', outline:'none' }}/>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ alignSelf:'flex-end' }}>
            <Filter size={13}/> + Filters
          </button>
        </div>

        {/* Tab for the active report */}
        <div style={{ padding:'0 24px', borderBottom:'1px solid var(--border)' }}>
          <div className="tabs-row">
            <button className="tab-btn active">{active.toUpperCase().replace(/ /g,'_')}</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ padding:'0 24px 24px' }}>
          <ReportContent label={active} dateFrom={dateFrom} dateTo={dateTo}/>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .reports-sidebar { display: none !important; }
          .mobile-report-nav-btn { display: block !important; padding: 12px 16px; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </div>
  );
}
