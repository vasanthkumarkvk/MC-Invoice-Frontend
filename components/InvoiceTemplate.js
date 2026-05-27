'use client';
import { fmtRs as fmtRsBase, getCurrencySymbol } from '@/lib/data';

// fmt is now defined per-component with currency

const fmtDate = d => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return d; }
};

export default function InvoiceTemplate({ invoice, company, customer, currency = "INR" }) {
  const fmt = (n) => fmtRsBase(n, currency || company?.currency || 'INR');
  const items = invoice?.items || [];
  const subtotal = items.reduce((s, i) => {
    const base = (parseFloat(i.qty)||1) * (parseFloat(i.price)||0) * (1 - (parseFloat(i.disc)||0)/100);
    return s + base;
  }, 0);
  const taxAmt = items.reduce((s, i) => {
    const base = (parseFloat(i.qty)||1) * (parseFloat(i.price)||0) * (1 - (parseFloat(i.disc)||0)/100);
    return s + base * ((parseFloat(i.gst)||0) / 100);
  }, 0);
  const disc = parseFloat(invoice?.disc) || 0;
  const adjustment = parseFloat(invoice?.adjustment) || 0;
  const advancePaid = parseFloat(invoice?.advancePaid) || 0;
  const total = invoice?.grandTotal ?? (subtotal + taxAmt - disc + adjustment);
  const balanceDue = advancePaid > 0 ? Math.max(0, total - advancePaid) : total;
  const initial = ((company?.name || invoice?.companyName || 'A')[0] || 'A').toUpperCase();
  const coName = company?.name || invoice?.companyName || 'Your Business';
  const coAddr = [company?.address, company?.city, company?.state, company?.pincode].filter(Boolean).join(', ');
  const custAddr = customer ? [customer.billingAddress, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ') : '';

  // Table columns — only show HSN/disc/gst columns if any item has that data
  const hasHSN  = items.some(i => i.hsn);
  const hasDisc = items.some(i => parseFloat(i.disc) > 0);
  const hasGST  = items.some(i => parseFloat(i.gst) > 0);

  const cols = [
    { label:'#',           w:'32px',  align:'left'  },
    { label:'Description', w:'1fr',   align:'left'  },
    ...(hasHSN  ? [{ label:'HSN/SAC',   w:'80px',  align:'center' }] : []),
    ...(hasDisc ? [{ label:'Disc%',     w:'60px',  align:'right'  }] : []),
    ...(hasGST  ? [{ label:'GST%',      w:'60px',  align:'right'  }] : []),
    { label:'Qty',         w:'52px',  align:'right' },
    { label:'Rate',        w:'90px',  align:'right' },
    { label:'Amount',      w:'100px', align:'right' },
  ];

  const gridCols = cols.map(c => c.w).join(' ');

  return (
    <div style={{
      background: '#fff',
      width: '100%',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#111111',
    }}>
      {/* Top accent bar */}
      <div style={{ height:5, background:'#8f195c' }}/>

      <div style={{ padding:'40px 48px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:13 }}>
            {invoice?.logo ? (
              <img src={invoice.logo} alt="Logo" style={{ width:50, height:50, objectFit:'contain', borderRadius:8, border:'1px solid #e5e7eb' }}/>
            ) : (
              <div style={{ width:44, height:44, background:'#8f195c', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:20, fontWeight:700, flexShrink:0 }}>
                {initial}
              </div>
            )}
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:'#111111' }}>{coName}</div>
              {coAddr && <div style={{ fontSize:12, color:'#6b7280', marginTop:3, lineHeight:1.5 }}>{coAddr}</div>}
              {company?.email && <div style={{ fontSize:12, color:'#6b7280' }}>{company.email}</div>}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8f195c', marginBottom:5 }}>INVOICE</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#111111' }}>{invoice?.number || '—'}</div>
          </div>
        </div>

        {/* Meta: dates + status */}
        <div style={{ display:'flex', gap:24, flexWrap:'wrap', marginBottom:24, paddingBottom:24, borderBottom:'1px solid #f7e8f1' }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:4 }}>Issue Date</div>
            <div style={{ fontSize:13, fontWeight:500 }}>{fmtDate(invoice?.date)}</div>
          </div>
          {invoice?.dueDate && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:4 }}>Due Date</div>
              <div style={{ fontSize:13, fontWeight:500 }}>{fmtDate(invoice?.dueDate)}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:4 }}>Status</div>
            <div style={{ display:'inline-block', fontSize:11, fontWeight:700, background:'#f7e8f1', color:'#8f195c', padding:'3px 12px', borderRadius:20 }}>
              {invoice?.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Draft'}
            </div>
          </div>
          <div style={{ marginLeft:'auto' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:4 }}>Amount Due</div>
            <div style={{ fontSize:26, fontWeight:700, color:'#8f195c', lineHeight:1 }}>{fmt(balanceDue)}</div>
          </div>
        </div>

        {/* Parties */}
        <div style={{ display:'flex', flexWrap:'wrap', marginBottom:28, gap:0 }}>
          <div style={{ flex:1, minWidth:180, paddingRight:28 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:10 }}>FROM</div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{coName}</div>
            {coAddr && <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>{coAddr}</div>}
            {company?.gstin && <div style={{ fontSize:12, color:'#6b7280' }}>GSTIN: {company.gstin}</div>}
          </div>
          <div style={{ flex:1, minWidth:180, paddingLeft:28, borderLeft:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:10 }}>BILL TO</div>
            {customer ? (
              <>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{customer.name}</div>
                {customer.companyName && <div style={{ fontSize:12, color:'#6b7280' }}>{customer.companyName}</div>}
                {custAddr && <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>{custAddr}</div>}
                {customer.email && <div style={{ fontSize:12, color:'#6b7280' }}>{customer.email}</div>}
                {customer.gstin && <div style={{ fontSize:12, color:'#6b7280' }}>GSTIN: {customer.gstin}</div>}
              </>
            ) : (
              <div style={{ fontSize:13, color:'#9ca3af' }}>No customer selected</div>
            )}
          </div>
        </div>

        {/* Items table */}
        <div style={{ marginBottom:24 }}>
          {/* Header row */}
          <div style={{ display:'grid', gridTemplateColumns:gridCols, padding:'10px 14px', background:'#f7e8f1', borderRadius:6, marginBottom:2, gap:8 }}>
            {cols.map(c => (
              <div key={c.label} style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#8f195c', textAlign:c.align }}>
                {c.label}
              </div>
            ))}
          </div>

          {/* Item rows */}
          {items.filter(i => i.name?.trim()).map((item, idx) => {
            const qty = parseFloat(item.qty) || 1;
            const price = parseFloat(item.price) || 0;
            const discPct = parseFloat(item.disc) || 0;
            const gstPct = parseFloat(item.gst) || 0;
            const base = qty * price * (1 - discPct/100);
            const total = base + base * gstPct/100;

            return (
              <div key={item.id || idx} style={{ display:'grid', gridTemplateColumns:gridCols, alignItems:'center', padding:'12px 14px', borderBottom:'1px solid #e5e7eb', gap:8 }}>
                <div style={{ fontSize:10, fontWeight:600, color:'#8f195c', opacity:0.45 }}>{String(idx+1).padStart(2,'0')}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#111111' }}>{item.name}</div>
                  {item.unit && item.unit !== 'Nos' && <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>Unit: {item.unit}</div>}
                </div>
                {hasHSN  && <div style={{ fontSize:12, color:'#6b7280', textAlign:'center' }}>{item.hsn || '—'}</div>}
                {hasDisc && <div style={{ fontSize:12, color:'#6b7280', textAlign:'right' }}>{discPct > 0 ? discPct + '%' : '—'}</div>}
                {hasGST  && <div style={{ fontSize:12, color:'#6b7280', textAlign:'right' }}>{gstPct > 0 ? gstPct + '%' : '—'}</div>}
                <div style={{ fontSize:12, color:'#6b7280', textAlign:'right' }}>{qty}</div>
                <div style={{ fontSize:12, color:'#6b7280', textAlign:'right' }}>{fmt(price)}</div>
                <div style={{ fontSize:13, fontWeight:600, textAlign:'right', color:'#111111' }}>{fmt(total)}</div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div style={{ display:'flex', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
          {/* Notes + Terms left */}
          <div style={{ flex:1, minWidth:200 }}>
            {invoice?.notes && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:8 }}>NOTES</div>
                <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.75 }}>{invoice.notes}</div>
              </div>
            )}
            {invoice?.terms && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#8f195c', marginBottom:8 }}>TERMS & CONDITIONS</div>
                <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.75 }}>{invoice.terms}</div>
              </div>
            )}
          </div>

          {/* Totals right */}
          <div style={{ width:260, flexShrink:0 }}>
            {[
              ['Subtotal', subtotal],
              ...(disc > 0 ? [['Discount', -disc]] : []),
              ['Tax (GST)', taxAmt],
              ...(adjustment !== 0 ? [['Adjustment', adjustment]] : []),
              ...(advancePaid > 0 ? [['Advance Paid', -advancePaid]] : []),
            ].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13, color:'#6b7280', borderBottom:'0.5px solid #f7e8f1' }}>
                <span>{l}</span>
                <span style={{ fontWeight:500, color: v < 0 ? '#059669' : '#111111' }}>
                  {v < 0 ? '−' + fmt(Math.abs(v)) : fmt(v)}
                </span>
              </div>
            ))}
            <div style={{ height:1, background:'#8f195c', margin:'10px 0' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', background:'#f7e8f1', padding:'14px 16px', borderRadius:8, marginTop:6 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#8f195c' }}>{advancePaid > 0 ? 'Balance Due' : 'Total'}</span>
              <span style={{ fontSize:22, fontWeight:700, color:'#8f195c' }}>{fmt(balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop:'1px solid #f7e8f1', marginTop:32, paddingTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <div style={{ fontSize:11, color:'#6b7280' }}>Generated by Zetsap · zetsap.com</div>
          <div style={{ fontSize:11, fontWeight:700, color:'#8f195c', letterSpacing:'0.06em' }}>{invoice?.number || ''}</div>
        </div>
      </div>
    </div>
  );
}
