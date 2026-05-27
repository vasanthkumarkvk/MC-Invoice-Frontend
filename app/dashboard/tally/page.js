'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/AppContext';
import { calcDoc } from '@/lib/data';
import {
  LayoutDashboard, BookOpen, FileText, AlertCircle,
  Download, TrendingUp, TrendingDown, Users, Package,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  FileSpreadsheet, FileCode, CheckCircle, Clock
} from 'lucide-react';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function getMonthLabel(key) {
  if (!key) return '';
  const [y, m] = key.split('-');
  return `${months[parseInt(m)-1]} ${y}`;
}

function SectionCard({ title, icon: Icon, children, color = 'var(--brand)' }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  );
}

function StatBox({ label, value, color, icon: Icon, sub }) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function buildTallyXML(invoices, customers, company) {
  const co = company?.name || 'My Company';
  const vouchers = invoices.map(inv => {
    const cust = customers.find(c => c.id === inv.customerId || c.id === inv.partyId);
    const custName = cust?.name || 'Unknown Party';
    const t = calcDoc(inv.items || [], inv.disc || 0);
    const date = (inv.date || '').replace(/-/g, '').slice(0, 8) || '20260101';
    return `\n    <VOUCHER VCHTYPE="Sales" ACTION="Create">
      <DATE>${date}</DATE>
      <VOUCHERNUMBER>${inv.number || ''}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${custName}</PARTYLEDGERNAME>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${custName}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <AMOUNT>-${t.total.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Sales</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${t.subtotal.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>GST</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${t.taxAmt.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
    </VOUCHER>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES><SVCURRENTCOMPANY>${co}</SVCURRENTCOMPANY></STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">${vouchers}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function TallyPage() {
  const { state, fmtMoney } = useApp();
  const [tab, setTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [expandedCust, setExpandedCust] = useState(null);

  const invoices  = state.invoices  || [];
  const purchases = state.purchases || [];
  const expenses  = state.expenses  || [];
  const payments  = state.payments  || [];
  const customers = state.customers || [];
  const company   = state.companyDetails || {};

  const totalSales     = useMemo(() => invoices.reduce((s,inv) => s+calcDoc(inv.items||[],inv.disc||0).total, 0), [invoices]);
  const totalPurchases = useMemo(() => purchases.reduce((s,p) => s+calcDoc(p.items||[],p.disc||0).total, 0), [purchases]);
  const totalExpenses  = useMemo(() => expenses.reduce((s,e) => s+(parseFloat(e.amount)||0), 0), [expenses]);
  const totalReceived  = useMemo(() => payments.reduce((s,p) => s+(parseFloat(p.amount)||0), 0), [payments]);
  const netProfit      = totalSales - totalPurchases - totalExpenses;

  const paidInvoiceIds   = useMemo(() => new Set(payments.map(p=>p.invoiceId).filter(Boolean)), [payments]);
  const unpaidInvoices   = useMemo(() => invoices.filter(inv => !paidInvoiceIds.has(inv.id) && inv.status !== 'draft'), [invoices, paidInvoiceIds]);
  const totalOutstanding = useMemo(() => unpaidInvoices.reduce((s,inv) => s+calcDoc(inv.items||[],inv.disc||0).total, 0), [unpaidInvoices]);

  const allMonths = useMemo(() => {
    const keys = new Set();
    [...invoices, ...purchases].forEach(d => { const k = getMonthKey(d.date); if (k) keys.add(k); });
    return Array.from(keys).sort().reverse();
  }, [invoices, purchases]);

  const gstData = useMemo(() => {
    const map = {};
    invoices.forEach(inv => {
      const mk = getMonthKey(inv.date); if (!mk) return;
      if (selectedMonth !== 'all' && mk !== selectedMonth) return;
      if (!map[mk]) map[mk] = { sales:0, cgst:0, sgst:0, inputGst:0, purchases:0 };
      const t = calcDoc(inv.items||[], inv.disc||0);
      map[mk].sales += t.subtotal; map[mk].cgst += t.taxAmt/2; map[mk].sgst += t.taxAmt/2;
    });
    purchases.forEach(p => {
      const mk = getMonthKey(p.date); if (!mk) return;
      if (selectedMonth !== 'all' && mk !== selectedMonth) return;
      if (!map[mk]) map[mk] = { sales:0, cgst:0, sgst:0, inputGst:0, purchases:0 };
      const t = calcDoc(p.items||[], p.disc||0);
      map[mk].purchases += t.subtotal; map[mk].inputGst += t.taxAmt;
    });
    return Object.entries(map).sort((a,b) => b[0].localeCompare(a[0]));
  }, [invoices, purchases, selectedMonth]);

  const customerLedger = useMemo(() => {
    return customers.map(cust => {
      const custInvoices = invoices.filter(inv => inv.customerId===cust.id || inv.partyId===cust.id);
      const custPayments = payments.filter(p => p.customerId===cust.id || custInvoices.some(inv=>inv.id===p.invoiceId));
      const totalBilled  = custInvoices.reduce((s,inv) => s+calcDoc(inv.items||[],inv.disc||0).total, 0);
      const totalPaid    = custPayments.reduce((s,p) => s+(parseFloat(p.amount)||0), 0);
      const balance      = totalBilled - totalPaid + (parseFloat(cust.openingBalance)||0);
      return { ...cust, custInvoices, custPayments, totalBilled, totalPaid, balance };
    }).filter(c => c.totalBilled > 0 || c.balance > 0).sort((a,b) => b.balance-a.balance);
  }, [customers, invoices, payments]);

  const outstandingDues = useMemo(() => {
    return unpaidInvoices.map(inv => {
      const cust  = customers.find(c => c.id===inv.customerId || c.id===inv.partyId);
      const total = calcDoc(inv.items||[], inv.disc||0).total;
      const days  = Math.floor((Date.now()-new Date(inv.date))/86400000);
      return { ...inv, custName: cust?.name||'Unknown', total, days };
    }).sort((a,b) => b.total-a.total);
  }, [unpaidInvoices, customers]);

  const exportXML = () => downloadFile(buildTallyXML(invoices, customers, company), `tally-export-${Date.now()}.xml`, 'text/xml');
  const exportCSV = () => {
    const rows = [['Invoice#','Date','Customer','Subtotal','GST','Total','Status']];
    invoices.forEach(inv => {
      const cust = customers.find(c=>c.id===inv.customerId||c.id===inv.partyId);
      const t = calcDoc(inv.items||[],inv.disc||0);
      rows.push([inv.number||'',inv.date||'',cust?.name||'',t.subtotal.toFixed(2),t.taxAmt.toFixed(2),t.total.toFixed(2),inv.status||'']);
    });
    downloadFile(rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n'), `invoices-${Date.now()}.csv`, 'text/csv');
  };
  const exportGST = () => {
    const rows = [['Month','Sales','CGST','SGST','Output GST','Input GST','Net Payable']];
    gstData.forEach(([key,d]) => {
      const net = (d.cgst+d.sgst)-d.inputGst;
      rows.push([getMonthLabel(key),d.sales.toFixed(2),d.cgst.toFixed(2),d.sgst.toFixed(2),(d.cgst+d.sgst).toFixed(2),d.inputGst.toFixed(2),net.toFixed(2)]);
    });
    downloadFile(rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n'), `gst-report-${Date.now()}.csv`, 'text/csv');
  };

  const TABS = [
    {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
    {id:'ledger',label:'Ledger',icon:BookOpen},
    {id:'gst',label:'GST Report',icon:FileText},
    {id:'outstanding',label:'Outstanding',icon:AlertCircle},
    {id:'export',label:'Export',icon:Download},
    {id:'pl',label:'P & L',icon:TrendingUp},
  ];

  return (
    <div className="page-content">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:22 }}>Tally</h1>
          <p style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>Accounting, GST reports and Tally export — live from your invoice data</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}><Download size={13}/> CSV</button>
          <button className="btn btn-brand btn-sm" onClick={exportXML}><FileCode size={13}/> Tally XML</button>
        </div>
      </div>

      <div className="tabs-row" style={{ marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={() => setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <t.icon size={13}/> {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab==='dashboard' && <>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:20 }}>
          <StatBox label="Total Sales"      value={fmtMoney(totalSales)}      color="#8f195c" icon={TrendingUp}     sub={`${invoices.length} invoices`}/>
          <StatBox label="Total Purchases"  value={fmtMoney(totalPurchases)}  color="#1d4ed8" icon={TrendingDown}   sub={`${purchases.length} bills`}/>
          <StatBox label="Total Expenses"   value={fmtMoney(totalExpenses)}   color="#dc2626" icon={ArrowDownRight} sub={`${expenses.length} entries`}/>
          <StatBox label="Total Received"   value={fmtMoney(totalReceived)}   color="#059669" icon={ArrowUpRight}   sub={`${payments.length} payments`}/>
          <StatBox label="Outstanding"      value={fmtMoney(totalOutstanding)} color="#f59e0b" icon={Clock}         sub={`${unpaidInvoices.length} unpaid`}/>
          <StatBox label="Net Profit"       value={fmtMoney(netProfit)}        color={netProfit>=0?'#059669':'#dc2626'} icon={TrendingUp} sub={netProfit>=0?'Profit':'Loss'}/>
        </div>
        <SectionCard title="Recent Invoices" icon={FileText}>
          {invoices.length===0 ? <div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)'}}>No invoices yet</div> : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>{invoices.slice(0,8).map(inv => {
                  const cust = customers.find(c=>c.id===inv.customerId||c.id===inv.partyId);
                  const t = calcDoc(inv.items||[],inv.disc||0);
                  return <tr key={inv.id}>
                    <td style={{fontWeight:700,color:'var(--brand)'}}>{inv.number}</td>
                    <td>{cust?.name||'—'}</td>
                    <td style={{color:'var(--muted)'}}>{inv.date}</td>
                    <td style={{fontWeight:600}}>{fmtMoney(t.total)}</td>
                    <td><span className={`badge badge-${inv.status==='paid'?'paid':inv.status==='sent'?'sent':'draft'}`}>{inv.status}</span></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </>}

      {/* LEDGER */}
      {tab==='ledger' && (
        <SectionCard title="Customer Ledger" icon={BookOpen}>
          {customerLedger.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 0',color:'var(--muted)'}}>
              <BookOpen size={36} style={{margin:'0 auto 12px',display:'block',opacity:0.12}}/>
              <p>No ledger data yet. Create invoices to see customer ledgers.</p>
            </div>
          ) : customerLedger.map(cust => (
            <div key={cust.id} style={{border:'1px solid var(--border)',borderRadius:10,marginBottom:12,overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'var(--bg)',cursor:'pointer'}}
                onClick={() => setExpandedCust(expandedCust===cust.id?null:cust.id)}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'var(--brand)',flexShrink:0}}>
                    {cust.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{cust.name}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{cust.custInvoices.length} invoices · {cust.custPayments.length} payments</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:800,fontSize:15,color:cust.balance>0?'#dc2626':'#059669'}}>{fmtMoney(Math.abs(cust.balance))}</div>
                    <div style={{fontSize:10,color:'var(--muted)'}}>{cust.balance>0?'Due':'Advance'}</div>
                  </div>
                  {expandedCust===cust.id ? <ChevronUp size={16} color="var(--muted)"/> : <ChevronDown size={16} color="var(--muted)"/>}
                </div>
              </div>
              {expandedCust===cust.id && (
                <div style={{padding:'0 16px 16px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,margin:'12px 0',padding:'12px',background:'var(--bg)',borderRadius:8}}>
                    {[['Total Billed',fmtMoney(cust.totalBilled),'#1d4ed8'],['Total Paid',fmtMoney(cust.totalPaid),'#059669'],['Balance Due',fmtMoney(cust.balance),'#dc2626']].map(([l,v,c]) => (
                      <div key={l} style={{textAlign:'center'}}>
                        <div style={{fontWeight:700,fontSize:14,color:c}}>{v}</div>
                        <div style={{fontSize:11,color:'var(--muted)'}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {cust.custInvoices.length>0 && (
                    <div className="tbl-wrap">
                      <table className="tbl">
                        <thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>{cust.custInvoices.map(inv => {
                          const t = calcDoc(inv.items||[],inv.disc||0);
                          const paid = paidInvoiceIds.has(inv.id);
                          return <tr key={inv.id}>
                            <td style={{fontWeight:600,color:'var(--brand)'}}>{inv.number}</td>
                            <td style={{color:'var(--muted)'}}>{inv.date}</td>
                            <td style={{fontWeight:600}}>{fmtMoney(t.total)}</td>
                            <td><span className={`badge ${paid?'badge-paid':'badge-pending'}`}>{paid?'Paid':'Unpaid'}</span></td>
                          </tr>;
                        })}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </SectionCard>
      )}

      {/* GST REPORT */}
      {tab==='gst' && (
        <SectionCard title="GST Report" icon={FileText} color="#059669">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
            <select className="form-select" style={{maxWidth:200}} value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>
              <option value="all">All Months</option>
              {allMonths.map(m=><option key={m} value={m}>{getMonthLabel(m)}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" onClick={exportGST}><FileSpreadsheet size={13}/> Export Excel</button>
          </div>
          {gstData.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 0',color:'var(--muted)'}}>No GST data yet. Create invoices to generate reports.</div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Month</th><th>Sales</th><th>CGST</th><th>SGST</th><th>Output GST</th><th>Input GST</th><th>Net Payable</th></tr></thead>
                <tbody>{gstData.map(([key,d]) => {
                  const out = d.cgst+d.sgst;
                  const net = out-d.inputGst;
                  return <tr key={key}>
                    <td style={{fontWeight:600}}>{getMonthLabel(key)}</td>
                    <td>{fmtMoney(d.sales)}</td>
                    <td style={{color:'#1d4ed8'}}>{fmtMoney(d.cgst)}</td>
                    <td style={{color:'#7c3aed'}}>{fmtMoney(d.sgst)}</td>
                    <td style={{fontWeight:600}}>{fmtMoney(out)}</td>
                    <td style={{color:'#059669'}}>{fmtMoney(d.inputGst)}</td>
                    <td style={{fontWeight:700,color:net>0?'#dc2626':'#059669'}}>{fmtMoney(net)}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* OUTSTANDING */}
      {tab==='outstanding' && (
        <SectionCard title="Outstanding Dues" icon={AlertCircle} color="#f59e0b">
          {outstandingDues.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 0'}}>
              <CheckCircle size={40} color="#059669" style={{margin:'0 auto 12px',display:'block'}}/>
              <p style={{fontWeight:600}}>All clear! No outstanding dues.</p>
            </div>
          ) : <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:16}}>
              {[['Total Outstanding',fmtMoney(totalOutstanding),'#dc2626'],['Unpaid Invoices',outstandingDues.length,'var(--text)'],['Overdue 30+ days',outstandingDues.filter(d=>d.days>30).length,'#f59e0b']].map(([l,v,c])=>(
                <div key={l} className="stat-card" style={{textAlign:'center'}}>
                  <div style={{fontWeight:800,fontSize:20,color:c}}>{v}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{l}</div>
                </div>
              ))}
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Days</th><th>Status</th></tr></thead>
                <tbody>{outstandingDues.map(inv=>(
                  <tr key={inv.id}>
                    <td style={{fontWeight:700,color:'var(--brand)'}}>{inv.number}</td>
                    <td style={{fontWeight:500}}>{inv.custName}</td>
                    <td style={{color:'var(--muted)'}}>{inv.date}</td>
                    <td style={{fontWeight:700}}>{fmtMoney(inv.total)}</td>
                    <td style={{fontWeight:600,color:inv.days>30?'#dc2626':inv.days>14?'#f59e0b':'var(--text)'}}>{inv.days}d</td>
                    <td><span className={`badge ${inv.days>30?'badge-overdue':'badge-pending'}`}>{inv.days>30?'Overdue':'Pending'}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>}
        </SectionCard>
      )}

      {/* EXPORT */}
      {tab==='export' && (
        <SectionCard title="Export to Tally" icon={Download} color="#1d4ed8">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginBottom:20}}>
            {[
              {title:'Tally XML',desc:'Import directly into TallyPrime via Gateway of Tally → Import Data.',icon:FileCode,color:'#8f195c',btn:'Export XML',fn:exportXML,count:`${invoices.length} invoices`},
              {title:'CSV Export',desc:'Open in Excel or import into any accounting software.',icon:FileSpreadsheet,color:'#059669',btn:'Export CSV',fn:exportCSV,count:`${invoices.length} records`},
              {title:'GST Report',desc:'Month-wise CGST/SGST/Input GST and Net Payable for CA and GST filing.',icon:FileText,color:'#1d4ed8',btn:'Export GST',fn:exportGST,count:`${gstData.length} months`},
            ].map(item=>(
              <div key={item.title} style={{border:'1px solid var(--border)',borderRadius:12,padding:20}}>
                <div style={{width:44,height:44,borderRadius:10,background:`${item.color}12`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                  <item.icon size={20} color={item.color}/>
                </div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{item.title}</div>
                <div style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.6,marginBottom:10}}>{item.desc}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:12}}>{item.count}</div>
                <button className="btn btn-brand btn-sm" style={{width:'100%',justifyContent:'center'}} onClick={item.fn}>
                  <Download size={13}/> {item.btn}
                </button>
              </div>
            ))}
          </div>
          <div style={{padding:'14px 16px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>How to import XML into TallyPrime:</div>
            {['Open TallyPrime on your PC','Go to Gateway of Tally → Import → Data','Select the XML file you exported','Choose your company and click Import','All vouchers will be created automatically'].map((step,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'var(--brand)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</div>
                <span style={{fontSize:12.5,color:'var(--muted)'}}>{step}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* P&L */}
      {tab==='pl' && (
        <SectionCard title="Profit & Loss Statement" icon={TrendingUp} color="#059669">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:24}}>
            {[['TOTAL REVENUE',totalSales,'#059669'],['PURCHASES',totalPurchases,'#1d4ed8'],['EXPENSES',totalExpenses,'#dc2626'],['NET PROFIT',netProfit,netProfit>=0?'#059669':'#dc2626']].map(([l,v,c])=>(
              <div key={l} className="stat-card" style={{borderLeft:`3px solid ${c}`}}>
                <div style={{fontSize:10,color:'var(--muted)',marginBottom:4}}>{l}</div>
                <div style={{fontWeight:800,fontSize:18,color:c}}>{fmtMoney(v)}</div>
              </div>
            ))}
          </div>
          {allMonths.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 0',color:'var(--muted)'}}>No data yet. Create invoices and purchases to see P&L.</div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Month</th><th>Sales</th><th>Purchases</th><th>Expenses</th><th>Net</th></tr></thead>
                <tbody>{allMonths.map(mk=>{
                  const mS = invoices.filter(i=>getMonthKey(i.date)===mk).reduce((s,i)=>s+calcDoc(i.items||[],i.disc||0).total,0);
                  const mP = purchases.filter(p=>getMonthKey(p.date)===mk).reduce((s,p)=>s+calcDoc(p.items||[],p.disc||0).total,0);
                  const mE = expenses.filter(e=>getMonthKey(e.date)===mk).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
                  const mN = mS-mP-mE;
                  return <tr key={mk}>
                    <td style={{fontWeight:600}}>{getMonthLabel(mk)}</td>
                    <td style={{color:'#059669',fontWeight:500}}>{fmtMoney(mS)}</td>
                    <td style={{color:'#1d4ed8',fontWeight:500}}>{fmtMoney(mP)}</td>
                    <td style={{color:'#dc2626',fontWeight:500}}>{fmtMoney(mE)}</td>
                    <td style={{fontWeight:700,color:mN>=0?'#059669':'#dc2626'}}>{fmtMoney(mN)}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      <style>{`
        @media (max-width: 768px) {
          .tab-btn { padding: 8px 10px !important; font-size: 12px !important; }
          .tab-btn svg { display: none !important; }
        }
      `}</style>
    </div>
  );
}
