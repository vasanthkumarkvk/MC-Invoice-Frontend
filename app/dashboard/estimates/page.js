'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, AlertCircle, Eye, CheckCircle2, ArrowRight, PackageX, Lock, X, FileCheck2, Clock, Printer, ChevronDown, Tag, ExternalLink, Receipt, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, fmtDate, today, addDays, nextId } from '@/lib/data';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import Sheet from '@/components/Sheet';

const API_BASE = 'https://invoice.crazystory.in/api';
const PRODUCTS_LINK = '/dashboard/products';
const SETTINGS_LINK = '/dashboard/settings/invoice-prefixes';

const ST = {
  draft: { l: 'Draft', c: 'badge-draft' },
  sent: { l: 'Sent', c: 'badge-sent' },
  accepted: { l: 'Accepted', c: 'badge-paid' },
  expired: { l: 'Expired', c: 'badge-overdue' },
  rejected: { l: 'Rejected', c: 'badge-draft' },
  converted: { l: 'Converted', c: 'badge-paid' },
  proforma: { l: 'Proforma', c: 'badge-sent' }
};

const STATUS_OPTIONS = ['draft', 'sent', 'accepted', 'expired', 'rejected'];

const isConverted = (q) =>
  !!(q?.invoice_id || q?.invoiceId || q?.is_converted || q?.converted_at || q?.status === 'converted');

const isProforma = (q) =>
  !!(q?.proforma_id || q?.is_proforma || q?.converted_to_proforma || q?.status === 'proforma');

const getInvoiceNumber = (q) => q?.invoice_number || q?.invoiceNumber || (q?.invoice_id ? `#${q.invoice_id}` : null);
const getProformaNumber = (q) => q?.proforma_number || q?.proformaNumber || (q?.proforma_id ? `#${q.proforma_id}` : null);

const money = (v) => {
  const n = parseFloat(v) || 0;
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ============================================================
// Edit Quotation Form
// ============================================================
function EditQuotationForm({ data, onSave, onCancel, toast, customers = [] }) {
  const [f, setF] = useState({
    customer_id: data?.customer_id || '',
    quotation_date: data?.quotation_date?.split('T')[0] || today(),
    validity_date: data?.validity_date?.split('T')[0] || addDays(30),
    reference: data?.reference || '',
    notes: data?.notes || '',
    terms: data?.terms || '',
    status: data?.status || 'draft'
  });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!f.customer_id) e.customer_id = 'Customer is required';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    const apiData = {
      customer_id: parseInt(f.customer_id),
      quotation_date: f.quotation_date,
      validity_date: f.validity_date || null,
      reference: f.reference || null,
      notes: f.notes || null,
      terms: f.terms || null,
      status: f.status
    };
    try {
      const res = await fetch(`${API_BASE}/admin/quotations/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) toast(Object.values(result.errors).flat().join(', '), 'error');
        else toast(result.message || 'Failed to update quotation', 'error');
        setLoading(false);
        return;
      }
      toast('Quotation updated successfully', 'success');
      onSave(result.quotation || result);
    } catch (error) {
      console.error('Update quotation error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Customer *</label>
        <select className={`form-select ${err.customer_id ? 'error' : ''}`} value={f.customer_id} onChange={e => s('customer_id', e.target.value)}>
          <option value="">Select Customer...</option>
          {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        {err.customer_id && <p className="form-err">{err.customer_id}</p>}
      </div>
      <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">Quotation Date</label>
          <input type="date" className="form-input" value={f.quotation_date} onChange={e => s('quotation_date', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Valid Until</label>
          <input type="date" className="form-input" value={f.validity_date} onChange={e => s('validity_date', e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Reference</label>
        <input className="form-input" placeholder="PO Number, Sales Person, etc." value={f.reference} onChange={e => s('reference', e.target.value)} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Status</label>
        <select className="form-select" value={f.status} onChange={e => s('status', e.target.value)}>
          {STATUS_OPTIONS.map(o => <option key={o} value={o}>{(ST[o] || {}).l || o}</option>)}
        </select>
      </div>
      <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">Notes</label>
          <textarea className="form-input form-textarea" rows={3} value={f.notes} onChange={e => s('notes', e.target.value)} placeholder="Additional notes..." />
        </div>
        <div>
          <label className="form-label">Terms & Conditions</label>
          <textarea className="form-input form-textarea" rows={3} value={f.terms} onChange={e => s('terms', e.target.value)} placeholder="Payment terms, validity, etc." />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={handleSubmit} disabled={loading}>{loading ? 'Updating...' : 'Update Quotation'}</button>
      </div>
    </div>
  );
}

const thStyle = { padding: '9px 8px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: '#9ca3af', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' };
const tdStyle = { padding: '9px 8px', fontSize: 13, borderBottom: '1px solid #f3f4f6', color: '#374151' };
const TotRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13.5, color: '#6b7280' }}>
    <span>{label}</span><span style={{ fontWeight: 600, color: '#374151' }}>{value}</span>
  </div>
);

// ============================================================
// Invoice-style View Panel
// ============================================================
function InvoiceView({ data }) {
  if (!data) return null;
  const customer = data.customer || {};
  const items = data.items || [];
  const subtotal = parseFloat(data.subtotal) || 0;
  const gst = parseFloat(data.gst_amount) || 0;
  const discount = parseFloat(data.discount_amount) || 0;
  const adjustment = parseFloat(data.adjustment_amount) || 0;
  const total = parseFloat(data.total_amount) || (subtotal + gst - discount + adjustment);
  const converted = isConverted(data);
  const proforma = isProforma(data);
  const invNo = getInvoiceNumber(data);
  const proNo = getProformaNumber(data);
  const st = converted ? ST.converted : proforma ? ST.proforma : (ST[data.status] || ST.draft);

  const hasHsn = items.some(i => i.hsn_sac_code);
  const hasDisc = items.some(i => parseFloat(i.discount_percent) > 0);
  const hasGst = items.some(i => parseFloat(i.gst_rate) > 0);

  const handlePrint = () => {
    const el = document.getElementById('inv-print-area');
    if (!el) return;
    const w = window.open('', '_blank', 'width=900,height=650');
    w.document.write('<html><head><title>' + (data.quotation_number || 'Quotation') + '</title><style>*{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}body{margin:0;padding:32px;color:#111827;}table{width:100%;border-collapse:collapse;margin-top:14px;}th,td{padding:9px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;}th{background:#f9fafb;font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.4px;color:#6b7280;}</style></head><body>' + el.innerHTML + '</body></html>');
    w.document.close(); w.focus(); setTimeout(() => { w.print(); }, 250);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          background: converted ? '#ede9fe' : proforma ? '#eef2ff' : data.status === 'accepted' ? '#d1fae5' : data.status === 'sent' ? '#dbeafe' : '#f3f4f6',
          color: converted ? '#6d28d9' : proforma ? '#4338ca' : data.status === 'accepted' ? '#065f46' : data.status === 'sent' ? '#1e40af' : '#6b7280',
          fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600
        }}>
          {st.l}{converted && invNo ? ` · ${invNo}` : ''}{proforma && proNo ? ` · ${proNo}` : ''}
        </span>
        <button className="btn btn-outline btn-sm" onClick={handlePrint}><Printer size={13} /> Print</button>
      </div>
      {converted && (
        <div style={{ background: '#ede9fe', border: '1px solid #ddd6fe', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#5b21b6' }}>
          <FileCheck2 size={16} /><span>Converted to invoice{invNo ? ` (${invNo})` : ''} — this quotation is locked.</span>
        </div>
      )}
      {proforma && (
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#4338ca' }}>
          <FileText size={16} /><span>Converted to proforma invoice{proNo ? ` (${proNo})` : ''} — can still be converted to a tax invoice.</span>
        </div>
      )}
      <div id="inv-print-area" className="inv-doc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '2px solid #111827', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#8f195c' }}>QUOTATION</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{data.quotation_number || `QT-${data.id}`}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12.5, color: '#374151' }}>
            <div><strong>Date:</strong> {fmtDate(data.quotation_date)}</div>
            <div><strong>Valid Until:</strong> {fmtDate(data.validity_date) || '—'}</div>
            {data.reference && <div><strong>Ref:</strong> {data.reference}</div>}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#9ca3af', marginBottom: 5 }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{customer.name || '—'}</div>
          {customer.billing_address && <div style={{ fontSize: 13, color: '#6b7280' }}>{customer.billing_address}</div>}
          <div style={{ fontSize: 13, color: '#6b7280' }}>{[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}</div>
          {customer.mobile && <div style={{ fontSize: 13, color: '#6b7280' }}>Mobile: {customer.mobile}</div>}
          {customer.gstin && <div style={{ fontSize: 13, color: '#6b7280' }}>GSTIN: {customer.gstin}</div>}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th><th style={thStyle}>Item</th>
              {hasHsn && <th style={thStyle}>HSN/SAC</th>}
              <th style={{ ...thStyle, textAlign: 'right' }}>Qty</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Rate</th>
              {hasDisc && <th style={{ ...thStyle, textAlign: 'right' }}>Disc%</th>}
              {hasGst && <th style={{ ...thStyle, textAlign: 'right' }}>GST%</th>}
              <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No items</td></tr>
            ) : items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {it.product_name || `Product #${it.product_id}`}
                  {it.unit && <span style={{ color: '#9ca3af', fontWeight: 400 }}> / {it.unit}</span>}
                </td>
                {hasHsn && <td style={tdStyle}>{it.hsn_sac_code || '—'}</td>}
                <td style={{ ...tdStyle, textAlign: 'right' }}>{it.quantity}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{money(it.price)}</td>
                {hasDisc && <td style={{ ...tdStyle, textAlign: 'right' }}>{parseFloat(it.discount_percent) || 0}%</td>}
                {hasGst && <td style={{ ...tdStyle, textAlign: 'right' }}>{parseFloat(it.gst_rate) || 0}%</td>}
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>{money(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <div style={{ width: 260 }}>
            <TotRow label="Subtotal" value={money(subtotal)} />
            {gst > 0 && <TotRow label="GST" value={money(gst)} />}
            {discount > 0 && <TotRow label="Discount" value={'- ' + money(discount)} />}
            {adjustment !== 0 && <TotRow label="Adjustment" value={money(adjustment)} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: 6, borderTop: '2px solid #111827', fontWeight: 800, fontSize: 16 }}>
              <span>Total</span><span style={{ color: '#8f195c' }}>{money(total)}</span>
            </div>
          </div>
        </div>
        {(data.notes || data.terms) && (
          <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
            {data.notes && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 3 }}>Notes</div>
                <div style={{ fontSize: 13, color: '#374151' }}>{data.notes}</div>
              </div>
            )}
            {data.terms && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 3 }}>Terms & Conditions</div>
                <div style={{ fontSize: 13, color: '#374151' }}>{data.terms}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx>{`.inv-doc { background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 12px; padding: 24px; }`}</style>
    </div>
  );
}

// ============================================================
// Inline Status Dropdown
// ============================================================
function StatusDropdown({ quotation, onUpdated, toast }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const cur = ST[quotation.status] || ST.draft;

  const change = async (newStatus) => {
    setOpen(false);
    if (newStatus === quotation.status) return;
    setBusy(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/quotations/${quotation.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) { toast(data.message || `Status updated to ${newStatus}`, 'success'); onUpdated(quotation.id, newStatus); }
      else toast(data.message || 'Failed to update status', 'error');
    } catch (err) {
      console.error('Status update error:', err);
      toast('Network error. Please try again.', 'error');
    } finally { setBusy(false); }
  };

  const bg = quotation.status === 'accepted' ? '#d1fae5' : quotation.status === 'sent' ? '#dbeafe' : '#f3f4f6';
  const fg = quotation.status === 'accepted' ? '#065f46' : quotation.status === 'sent' ? '#1e40af' : '#6b7280';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} disabled={busy} className="status-pill" style={{ background: bg, color: fg }}>
        {busy ? '…' : cur.l} <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div className="status-menu">
            {STATUS_OPTIONS.map(opt => (
              <button key={opt} className="status-menu-item" style={opt === quotation.status ? { fontWeight: 700, color: 'var(--brand)' } : undefined} onClick={() => change(opt)}>
                {(ST[opt] || {}).l || opt}{opt === quotation.status && <CheckCircle2 size={13} />}
              </button>
            ))}
          </div>
        </>
      )}
      <style jsx>{`
        .status-pill { display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; transition: filter .15s; }
        .status-pill:hover { filter: brightness(0.96); }
        .status-pill:disabled { opacity: .6; cursor: default; }
        .status-menu { position: absolute; top: calc(100% + 4px); left: 0; z-index: 50; background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,.12); padding: 5px; min-width: 130px; }
        .status-menu-item { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px; padding: 7px 10px; border: none; background: none; border-radius: 7px; cursor: pointer; font-size: 13px; text-align: left; color: #374151; }
        .status-menu-item:hover { background: var(--brand-bg, #fce7f3); }
      `}</style>
    </div>
  );
}

// ============================================================
// Convert Modal
// allowedTypes: ['proforma','invoice'] for fresh quotations
//               ['invoice'] for proforma rows (already a proforma)
// ============================================================
function ConvertModal({
  open, quotation, onClose, onConfirmStatus, onConvert,
  state, result, statusLoading,
  prefixes, selectedPrefix, onSelectPrefix, onConfirmPrefix, prefixLoading,
  convertType, onSelectType, onConfirmType,
  allowedTypes   // <-- NEW: controls which options appear
}) {
  if (!open || !quotation) return null;
  const qNo = quotation.quotation_number || quotation.number || `QT-${quotation.id}`;

  const ALL_TYPE_OPTIONS = [
    {
      key: 'proforma',
      label: 'Proforma invoice',
      desc: 'Preliminary invoice for confirmation — not a tax document',
      icon: <FileText size={20} />,
      iconBg: '#eef2ff',
      iconColor: '#4338ca'
    },
    {
      key: 'invoice',
      label: 'Tax invoice',
      desc: 'Official GST invoice — deducts stock and records revenue',
      icon: <Receipt size={20} />,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a'
    }
  ];

  // Filter based on allowed types passed from parent
  const TYPE_OPTIONS = ALL_TYPE_OPTIONS.filter(o => (allowedTypes || ['proforma', 'invoice']).includes(o.key));

  return (
    <div className="cm-overlay" onClick={state === 'loading' ? undefined : onClose}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        {state !== 'loading' && (
          <button className="cm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        )}

        {/* ── Step 0: Choose conversion type ── */}
        {state === 'choose-type' && (
          <>
            <div className="cm-icon cm-icon-brand"><ArrowRight size={26} /></div>
            <h3 className="cm-title">Convert quotation</h3>
            <p className="cm-text" style={{ marginBottom: 18 }}>
              Choose what to create from <strong>{qNo}</strong>
            </p>
            {/* Proforma already done — show info banner */}
            {(allowedTypes || []).length === 1 && allowedTypes[0] === 'invoice' && (
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#4338ca', textAlign: 'left' }}>
                <FileText size={15} style={{ flexShrink: 0 }} />
                <span>This quotation is already a <strong>proforma invoice</strong>. You can now convert it to a tax invoice.</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 6 }}>
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => onSelectType(opt.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 14,
                    border: `2px solid ${convertType === opt.key ? 'var(--brand, #8f195c)' : '#e5e7eb'}`,
                    background: convertType === opt.key ? 'var(--brand-bg, #fce7f3)' : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all .15s', width: '100%'
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 11,
                    background: convertType === opt.key ? (opt.key === 'proforma' ? '#e0e7ff' : '#dcfce7') : opt.iconBg,
                    color: opt.iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s'
                  }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${convertType === opt.key ? 'var(--brand, #8f195c)' : '#d1d5db'}`,
                    background: convertType === opt.key ? 'var(--brand, #8f195c)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s'
                  }}>
                    {convertType === opt.key && <CheckCircle2 size={14} color="#fff" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="cm-actions" style={{ marginTop: 22 }}>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-brand" onClick={onConfirmType} disabled={!convertType} style={{ opacity: convertType ? 1 : 0.5 }}>Continue</button>
            </div>
          </>
        )}

        {/* ── Step 1: No prefix found ── */}
        {state === 'no-prefix' && (
          <>
            <div className="cm-icon cm-icon-amber"><Tag size={26} /></div>
            <h3 className="cm-title">No invoice prefix found</h3>
            <p className="cm-text">You need at least one invoice prefix (e.g. <strong>INV</strong>) before converting a quotation to an invoice.</p>
            <p className="cm-text" style={{ marginTop: 6 }}>Please create a prefix in your settings, then come back to convert.</p>
            <div className="cm-actions">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <Link href={SETTINGS_LINK} className="btn btn-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <ExternalLink size={14} /> Create Prefix
              </Link>
            </div>
          </>
        )}

        {/* ── Step 2: Choose prefix (tax invoice only) ── */}
        {state === 'choose-prefix' && (
          <>
            <div className="cm-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><Tag size={26} /></div>
            <h3 className="cm-title">Select prefix</h3>
            <p className="cm-text" style={{ marginBottom: 16 }}>
              Choose a prefix for the <strong>tax invoice</strong> created from <strong>{qNo}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
              {prefixes.map(p => (
                <button key={p.id} onClick={() => onSelectPrefix(p)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10,
                  border: `2px solid ${selectedPrefix?.id === p.id ? 'var(--brand, #8f195c)' : 'var(--border, #e5e7eb)'}`,
                  background: selectedPrefix?.id === p.id ? 'var(--brand-bg, #fce7f3)' : '#fff',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  color: selectedPrefix?.id === p.id ? 'var(--brand, #8f195c)' : '#374151', transition: 'all .15s'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: selectedPrefix?.id === p.id ? 'var(--brand, #8f195c)' : '#f3f4f6',
                      color: selectedPrefix?.id === p.id ? '#fff' : '#6b7280',
                      borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, letterSpacing: 1
                    }}>{p.prefix}</span>
                    {p.is_default && <span style={{ fontSize: 11, color: '#059669', background: '#d1fae5', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Default</span>}
                  </span>
                  {selectedPrefix?.id === p.id && <CheckCircle2 size={16} color="var(--brand, #8f195c)" />}
                </button>
              ))}
            </div>
            <div className="cm-actions">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-brand" onClick={onConfirmPrefix} disabled={!selectedPrefix || prefixLoading}>
                {prefixLoading ? 'Please wait…' : 'Continue'}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Status check ── */}
        {state === 'confirm-status' && (
          <>
            <div className="cm-icon cm-icon-amber"><Clock size={26} /></div>
            <h3 className="cm-title">Mark as accepted first?</h3>
            <p className="cm-text">
              Quotation <strong>{qNo}</strong> is currently <strong>{(ST[quotation.status] || ST.draft).l}</strong>.
              {convertType === 'proforma' ? ' Only accepted quotations can be converted to a proforma invoice.' : ' Only accepted quotations can be converted to an invoice.'}
            </p>
            <p className="cm-text" style={{ marginTop: 6 }}>Set its status to <strong>Accepted</strong> now?</p>
            <div className="cm-actions">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-brand" onClick={onConfirmStatus} disabled={statusLoading}>{statusLoading ? 'Updating…' : 'Set to Accepted'}</button>
            </div>
          </>
        )}

        {/* ── Step 4: Confirm convert ── */}
        {state === 'confirm-convert' && (
          <>
            <div className="cm-icon" style={{
              background: convertType === 'proforma' ? '#eef2ff' : 'var(--brand-bg, #fce7f3)',
              color: convertType === 'proforma' ? '#4338ca' : 'var(--brand, #8f195c)'
            }}>
              {convertType === 'proforma' ? <FileText size={26} /> : <Receipt size={26} />}
            </div>
            <h3 className="cm-title">Convert to {convertType === 'proforma' ? 'proforma invoice' : 'tax invoice'}?</h3>
            {convertType === 'invoice' && selectedPrefix && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-bg, #fce7f3)', border: '1px solid #f9a8d4', borderRadius: 8, padding: '5px 12px', fontSize: 12.5, color: 'var(--brand, #8f195c)', fontWeight: 600, marginBottom: 10 }}>
                <Tag size={13} /> Prefix: <strong>{selectedPrefix.prefix}</strong>
              </div>
            )}
            <p className="cm-text">
              {convertType === 'proforma'
                ? <>This creates a proforma invoice from quotation <strong>{qNo}</strong>. Stock will <strong>not</strong> be deducted.</>
                : <>This creates a tax invoice from quotation <strong>{qNo}</strong>. Stock will be deducted for its items.</>
              }
            </p>
            <p className="cm-text" style={{ marginTop: 6, color: '#92400e' }}>Once converted to a tax invoice, this quotation becomes <strong>read-only</strong>.</p>
            <div className="cm-actions">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-brand" onClick={onConvert}>Convert now</button>
            </div>
          </>
        )}

        {/* ── Loading ── */}
        {state === 'loading' && (
          <>
            <div className="cm-spinner" />
            <h3 className="cm-title">Converting…</h3>
            <p className="cm-text">{convertType === 'proforma' ? 'Creating proforma invoice. Please wait.' : 'Creating invoice and updating stock. Please wait.'}</p>
          </>
        )}

        {/* ── Success ── */}
        {state === 'success' && (
          <>
            <div className="cm-icon cm-icon-green"><CheckCircle2 size={28} /></div>
            <h3 className="cm-title">Converted successfully!</h3>
            <p className="cm-text">
              {convertType === 'proforma'
                ? (result?.message || 'The quotation has been converted to a proforma invoice.')
                : result?.invoice_number
                  ? <>Invoice <strong>{result.invoice_number}</strong> has been created.</>
                  : (result?.message || 'The quotation has been converted to a tax invoice.')
              }
            </p>
            <div className="cm-actions">
              <button className="btn btn-outline" onClick={onClose}>Stay Here</button>
              <Link href="/dashboard/sales" className="btn btn-brand">View Invoices</Link>
            </div>
          </>
        )}

        {/* ── Stock Error ── */}
        {state === 'stock-error' && (
          <>
            <div className="cm-icon cm-icon-red"><PackageX size={26} /></div>
            <h3 className="cm-title">Insufficient stock</h3>
            <p className="cm-text">{result?.error || 'One or more products do not have enough stock to fulfil this quotation.'}</p>
            <p className="cm-text" style={{ marginTop: 6 }}>Add stock for the affected product(s), then try again.</p>
            <div className="cm-actions">
              <button className="btn btn-outline" onClick={onClose}>Close</button>
              <Link href={PRODUCTS_LINK} className="btn btn-brand"><PackageX size={14} /> Manage Stock</Link>
            </div>
          </>
        )}

        {/* ── Error ── */}
        {state === 'error' && (
          <>
            <div className="cm-icon cm-icon-red"><AlertCircle size={26} /></div>
            <h3 className="cm-title">Conversion failed</h3>
            <p className="cm-text">{result?.message || result?.error || 'Something went wrong. Please try again.'}</p>
            <div className="cm-actions">
              <button className="btn btn-outline" onClick={onClose}>Close</button>
              <button className="btn btn-brand" onClick={onConvert}>Retry</button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .cm-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(15,23,42,.45); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: cmFade .18s ease; }
        .cm-modal { position: relative; background: #fff; border-radius: 20px; width: 100%; max-width: 440px; padding: 30px 26px 24px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.25); animation: cmPop .22s cubic-bezier(.16,1,.3,1); }
        .cm-close { position: absolute; top: 14px; right: 14px; background: var(--bg,#f3f4f6); border: none; width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; cursor: pointer; color: #6b7280; transition: all .15s; }
        .cm-close:hover { background: #e5e7eb; color: #111827; }
        .cm-icon { width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 16px; }
        .cm-icon-green { background: #d1fae5; color: #059669; }
        .cm-icon-red { background: #fee2e2; color: #dc2626; }
        .cm-icon-amber { background: #fef3c7; color: #d97706; }
        .cm-icon-brand { background: var(--brand-bg,#fce7f3); color: var(--brand,#8f195c); }
        .cm-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; color: #111827; }
        .cm-text { font-size: 13.5px; color: var(--muted,#6b7280); line-height: 1.55; }
        .cm-actions { display: flex; gap: 10px; justify-content: center; margin-top: 22px; }
        .cm-actions .btn { flex: 1; justify-content: center; text-decoration: none; }
        .cm-spinner { width: 48px; height: 48px; margin: 0 auto 16px; border: 4px solid #f3f4f6; border-top-color: var(--brand,#8f195c); border-radius: 50%; animation: cmSpin .8s linear infinite; }
        @keyframes cmSpin { to { transform: rotate(360deg); } }
        @keyframes cmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cmPop { from { opacity: 0; transform: scale(.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function EstimatesPage() {
  const router = useRouter();
  const { state, addItem, editItem, removeItem, toast, fmtMoney } = useApp();
  const [search, setSearch] = useState('');
  const [sf, setSf] = useState('all');
  const [del, setDel] = useState(null);
  const [delL, setDelL] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Convert modal state
  const [cvOpen, setCvOpen] = useState(false);
  const [cvQuotation, setCvQuotation] = useState(null);
  const [cvState, setCvState] = useState('choose-type');
  const [cvResult, setCvResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [cvAllowedTypes, setCvAllowedTypes] = useState(['proforma', 'invoice']);

  // Convert type: 'proforma' | 'invoice'
  const [convertType, setConvertType] = useState(null);

  // Prefix state (only for tax invoice)
  const [prefixes, setPrefixes] = useState([]);
  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [prefixLoading, setPrefixLoading] = useState(false);

  const fetchPrefixes = async () => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoice-prefixes`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data) ? data : (data.prefixes || data.data || []);
        return list;
      }
      return [];
    } catch (err) { console.error('Fetch prefixes error:', err); return []; }
  };

  const fetchEstimates = async () => {
    setLoading(true); setError(null);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/quotations`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        let list = [];
        if (data.quotations && Array.isArray(data.quotations)) list = data.quotations;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data)) list = data;
        setEstimates(list);
      } else {
        setError(data.message || 'Failed to load quotations. Please try again.');
        const fb = state.estimates || [];
        if (fb.length > 0) setEstimates(fb);
      }
    } catch (err) {
      console.error('Fetch quotations error:', err);
      setError('Network error. Unable to connect to server.');
      const fb = state.estimates || [];
      if (fb.length > 0) setEstimates(fb);
    } finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/customers`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        let list = [];
        if (data.customers && Array.isArray(data.customers)) list = data.customers;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data)) list = data;
        setCustomers(list);
      }
    } catch (err) { console.error('Fetch customers error:', err); }
  };

  const fetchEstimateById = async (id) => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/quotations/${id}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) return data.quotation || data;
      return null;
    } catch (error) { console.error('Fetch quotation error:', error); return null; }
  };

  useEffect(() => { fetchEstimates(); fetchCustomers(); }, []);

  const handleStatusUpdated = (id, newStatus) => {
    setEstimates(list => list.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const handleMarkConverted = (id, invoiceData) => {
    setEstimates(list => list.map(e =>
      e.id === id ? {
        ...e, status: 'converted', is_converted: true,
        invoice_number: invoiceData?.invoice_number || e.invoice_number,
        invoice_id: invoiceData?.invoice_id || invoiceData?.id || e.invoice_id
      } : e
    ));
  };

  const handleMarkProforma = (id, proformaData) => {
    setEstimates(list => list.map(e =>
      e.id === id ? {
        ...e, status: 'proforma', is_proforma: true, converted_to_proforma: true,
        proforma_number: proformaData?.proforma_number || e.proforma_number,
        proforma_id: proformaData?.proforma_id || proformaData?.id || e.proforma_id
      } : e
    ));
  };

  const handleEdit = async (estimate) => {
    if (isConverted(estimate)) { toast('This quotation is converted and cannot be edited', 'error'); return; }
    if (isProforma(estimate)) { toast('This quotation is a proforma and cannot be edited', 'error'); return; }
    const freshData = await fetchEstimateById(estimate.id);
    if (freshData) {
      if (isConverted(freshData) || isProforma(freshData)) { toast('This quotation is converted and cannot be edited', 'error'); return; }
      setEditData(freshData); setSheetOpen(true);
    }
  };

  const handleSave = async () => { setSheetOpen(false); await fetchEstimates(); setEditData(null); };

  const handleView = async (estimate) => {
    setViewData(null); setViewOpen(true); setViewLoading(true);
    const freshData = await fetchEstimateById(estimate.id);
    setViewData(freshData || estimate); setViewLoading(false);
  };

  const patchStatusAccepted = async (id) => {
    const token = localStorage.getItem('zetsap_token');
    const res = await fetch(`${API_BASE}/admin/quotations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: 'accepted' })
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  const postConvert = async (id, prefixValue, type) => {
    const token = localStorage.getItem('zetsap_token');
    const endpoint = type === 'proforma'
      ? `${API_BASE}/admin/quotations/${id}/convert-to-proforma`
      : `${API_BASE}/admin/quotations/${id}/convert-to-invoice`;
    const body = type === 'proforma' ? {} : { prefix: prefixValue };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  };

  // ── Open convert for a normal quotation (both options) ─────
  const openConvert = (est) => {
    if (isConverted(est)) { toast('This quotation is already converted to a tax invoice', 'error'); return; }
    setCvQuotation(est);
    setCvResult(null);
    setSelectedPrefix(null);
    setConvertType(null);
    setPrefixes([]);
    // Normal quotation: allow both proforma and invoice
    setCvAllowedTypes(['proforma', 'invoice']);
    setCvState('choose-type');
    setCvOpen(true);
  };

  // ── Open convert for a proforma row (tax invoice only) ─────
  const openConvertFromProforma = (est) => {
    if (isConverted(est)) { toast('This quotation is already converted to a tax invoice', 'error'); return; }
    setCvQuotation(est);
    setCvResult(null);
    setSelectedPrefix(null);
    // Auto-select 'invoice' since only option
    setConvertType('invoice');
    setPrefixes([]);
    // Only allow tax invoice
    setCvAllowedTypes(['invoice']);
    setCvState('choose-type');
    setCvOpen(true);
  };

  const handleConfirmType = async () => {
    if (!convertType) return;

    if (convertType === 'proforma') {
      if (cvQuotation.status === 'accepted') setCvState('confirm-convert');
      else setCvState('confirm-status');
      return;
    }

    // Tax invoice: fetch prefixes
    setPrefixLoading(true);
    setCvState('choose-prefix');
    const fetchedPrefixes = await fetchPrefixes();
    setPrefixes(fetchedPrefixes);
    setPrefixLoading(false);

    if (fetchedPrefixes.length === 0) { setCvState('no-prefix'); return; }

    const defaultP = fetchedPrefixes.find(p => p.is_default) || fetchedPrefixes[0];
    setSelectedPrefix(defaultP);

    if (fetchedPrefixes.length === 1) advanceAfterPrefix(cvQuotation, defaultP);
    else setCvState('choose-prefix');
  };

  const advanceAfterPrefix = (est, prefix) => {
    const q = est || cvQuotation;
    const p = prefix || selectedPrefix;
    setSelectedPrefix(p);
    if (q.status === 'accepted' || q.status === 'proforma') setCvState('confirm-convert');
    else setCvState('confirm-status');
  };

  const handleConfirmPrefix = () => {
    if (!selectedPrefix) return;
    advanceAfterPrefix(cvQuotation, selectedPrefix);
  };

  const closeConvert = () => {
    if (cvState === 'loading') return;
    const wasSuccess = cvState === 'success';
    setCvOpen(false); setCvQuotation(null); setCvResult(null);
    setConvertType(null); setStatusLoading(false);
    setPrefixes([]); setSelectedPrefix(null);
    setCvState('choose-type'); setCvAllowedTypes(['proforma', 'invoice']);
    if (wasSuccess) fetchEstimates();
  };

  const handleConfirmStatus = async () => {
    if (!cvQuotation) return;
    setStatusLoading(true);
    try {
      const { ok, data } = await patchStatusAccepted(cvQuotation.id);
      if (!ok) { toast(data.message || 'Failed to update status', 'error'); setStatusLoading(false); return; }
      toast(data.message || 'Status updated to accepted', 'success');
      setCvQuotation(q => ({ ...q, status: 'accepted' }));
      handleStatusUpdated(cvQuotation.id, 'accepted');
      setCvState('confirm-convert');
    } catch (err) {
      console.error('Patch status error:', err);
      toast('Network error. Please try again.', 'error');
    } finally { setStatusLoading(false); }
  };

  const handleConvert = async () => {
    if (!cvQuotation) return;
    const prefixValue = selectedPrefix?.prefix || 'INV';
    setCvState('loading');
    try {
      const { ok, data } = await postConvert(cvQuotation.id, prefixValue, convertType);
      if (ok) {
        setCvResult(data);
        setCvState('success');
        if (convertType === 'proforma') {
          handleMarkProforma(cvQuotation.id, data);
          toast(data.message || 'Converted to proforma invoice successfully!', 'success');
        } else {
          handleMarkConverted(cvQuotation.id, data);
          toast(data.message || 'Converted to tax invoice successfully!', 'success');
        }
        return;
      }
      const msg = `${data?.message || ''} ${data?.error || ''}`.toLowerCase();
      if (msg.includes('stock') || msg.includes('insufficient')) { setCvResult(data); setCvState('stock-error'); }
      else { setCvResult(data); setCvState('error'); }
    } catch (err) {
      console.error('Convert error:', err);
      setCvResult({ message: 'Network error. Please try again.' }); setCvState('error');
    }
  };

  const askDelete = (e) => {
    if (isConverted(e)) { toast('This quotation is converted and cannot be deleted', 'error'); return; }
    if (isProforma(e)) { toast('This proforma quotation cannot be deleted', 'error'); return; }
    setDel(e);
  };

  const handleDelete = async () => {
    setDelL(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/quotations/${del.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        await fetchEstimates(); removeItem('estimates', del.id);
        toast(data.message || 'Quotation deleted successfully', 'success');
      } else toast(data.message || 'Failed to delete quotation', 'error');
    } catch (error) {
      console.error('Delete quotation error:', error);
      toast('Network error. Please try again.', 'error');
    } finally { setDel(null); setDelL(false); }
  };

  const calculateTotal = (q) => parseFloat(q.total_amount) || ((parseFloat(q.subtotal) || 0) + (parseFloat(q.gst_amount) || 0));

  const filtered = estimates.filter(e => {
    const customer = e.customer || customers.find(x => x.id === e.customer_id);
    const isProformaRow = isProforma(e);
    const isConvertedRow = isConverted(e);
    const matchSearch = !search ||
      (e.quotation_number || e.number || '').toLowerCase().includes(search.toLowerCase()) ||
      (customer?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = sf === 'all'
      || (sf === 'converted' ? isConvertedRow : sf === 'proforma' ? isProformaRow : e.status === sf);
    return matchSearch && matchFilter;
  });

  const totalCount = estimates.length;
  const sentCount = estimates.filter(e => e.status === 'sent').length;
  const acceptedCount = estimates.filter(e => e.status === 'accepted').length;
  const convertedCount = estimates.filter(e => isConverted(e)).length;
  const proformaCount = estimates.filter(e => isProforma(e)).length;

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading quotations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22 }}>Quotations</h1>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchEstimates} title="Refresh"><RefreshCw size={13} /> Refresh</button>
          <Link href="/dashboard/create/estimate" className="btn btn-brand btn-sm"><Plus size={14} /> Create Quotation</Link>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#991b1b' }}>{error}</span>
          </div>
          <button onClick={fetchEstimates} className="btn btn-outline btn-sm">Try Again</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 24 }}>{totalCount}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Total Quotations</div></div>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 24, color: '#f59e0b' }}>{sentCount}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Sent</div></div>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 24, color: '#10b981' }}>{acceptedCount}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Accepted</div></div>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 24, color: '#4338ca' }}>{proformaCount}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Proforma</div></div>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 24, color: '#8f195c' }}>{convertedCount}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Converted</div></div>
      </div>

      {/* Main card */}
      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ maxWidth: 280 }}>
            <Search size={14} color="#9ca3af" />
            <input placeholder="Search by number or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['all', 'draft', 'sent', 'accepted', 'expired', 'rejected', 'proforma', 'converted'].map(s => (
              <button key={s} className={`chip${sf === s ? ' active' : ''}`} style={{ fontSize: 12, textTransform: 'capitalize' }} onClick={() => setSf(s)}>{s}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            type="generic"
            title="No quotations yet"
            desc={['Create quotations and convert them to invoices', 'Share quotes with customers via WhatsApp or email']}
            action={<Link href="/dashboard/create/estimate" className="btn btn-brand btn-lg" style={{ justifyContent: 'center' }}><Plus size={16} /> Create Quotation</Link>}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>Quote #</th><th>Customer</th><th>Date</th><th>Valid Till</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const customer = e.customer || customers.find(x => x.id === e.customer_id);
                  const total = calculateTotal(e);
                  const converted = isConverted(e);
                  const proforma = isProforma(e);
                  const quotationNumber = e.quotation_number || e.number || `QT-${e.id}`;
                  const invNo = getInvoiceNumber(e);
                  const proNo = getProformaNumber(e);

                  return (
                    <tr key={e.id} style={(converted || proforma) ? { background: 'rgba(143,25,92,0.03)' } : undefined}>
                      <td style={{ fontWeight: 700, color: 'var(--brand)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {quotationNumber}
                          {converted && <Lock size={12} color="#8f195c" title="Locked — converted to invoice" />}
                          {proforma && !converted && <FileText size={12} color="#4338ca" title="Proforma — can convert to tax invoice" />}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{customer?.name || '—'}</td>
                      <td style={{ color: 'var(--muted)' }}>{fmtDate(e.quotation_date || e.date)}</td>
                      <td style={{ color: 'var(--muted)' }}>{fmtDate(e.validity_date || e.dueDate) || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{fmtMoney ? fmtMoney(total) : money(total)}</td>

                      {/* STATUS CELL */}
                      <td>
                        {converted ? (
                          <div>
                            <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>Converted</span>
                            {invNo && <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{invNo}</div>}
                          </div>
                        ) : proforma ? (
                          <div>
                            <span style={{ background: '#eef2ff', color: '#4338ca', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>Proforma</span>
                            {proNo && <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{proNo}</div>}
                          </div>
                        ) : (
                          <StatusDropdown quotation={e} onUpdated={handleStatusUpdated} toast={toast} />
                        )}
                      </td>

                      {/* ACTIONS CELL */}
                      <td>
                        {converted ? (
                          /* Fully converted — view only */
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button className="btn-icon" onClick={() => handleView(e)} title="View"><Eye size={13} /></button>
                            <span style={{ fontSize: 11, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Lock size={11} /> Locked</span>
                          </div>
                        ) : proforma ? (
                          /* Proforma — view + convert to tax invoice */
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button
                              className="btn btn-sm"
                              style={{ fontSize: 11.5, background: '#eef2ff', color: '#4338ca', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={() => openConvertFromProforma(e)}
                              title="Convert to Tax Invoice"
                            >
                              <Receipt size={11} /> Tax Invoice →
                            </button>
                            <button className="btn-icon" onClick={() => handleView(e)} title="View"><Eye size={13} /></button>
                          </div>
                        ) : (
                          /* Normal quotation — full actions */
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-sm"
                              style={{ fontSize: 11.5, background: 'var(--brand-bg)', color: 'var(--brand)', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}
                              onClick={() => openConvert(e)}
                            >Convert →</button>
                            <button className="btn-icon" onClick={() => handleView(e)} title="View"><Eye size={13} /></button>
                            <button className="btn-icon" onClick={() => handleEdit(e)} title="Edit"><Pencil size={13} /></button>
                            <button className="btn-icon" onClick={() => askDelete(e)} title="Delete"><Trash2 size={13} color="#dc2626" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditData(null); }} title="Edit Quotation" size="md">
        <EditQuotationForm data={editData} onSave={handleSave} onCancel={() => { setSheetOpen(false); setEditData(null); }} toast={toast} customers={customers} />
      </Sheet>

      {/* View Sheet */}
      <Sheet open={viewOpen} onClose={() => { setViewOpen(false); setViewData(null); }} title="Quotation Preview" size="lg">
        {viewLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</p>
          </div>
        ) : (
          <InvoiceView data={viewData} />
        )}
      </Sheet>

      {/* Convert Modal */}
      <ConvertModal
        open={cvOpen}
        quotation={cvQuotation}
        state={cvState}
        result={cvResult}
        statusLoading={statusLoading}
        onClose={closeConvert}
        onConfirmStatus={handleConfirmStatus}
        onConvert={handleConvert}
        prefixes={prefixes}
        selectedPrefix={selectedPrefix}
        onSelectPrefix={setSelectedPrefix}
        onConfirmPrefix={handleConfirmPrefix}
        prefixLoading={prefixLoading}
        convertType={convertType}
        onSelectType={setConvertType}
        onConfirmType={handleConfirmType}
        allowedTypes={cvAllowedTypes}
      />

      {/* Delete Modal */}
      <DeleteModal open={!!del} onClose={() => setDel(null)} onConfirm={handleDelete} loading={delL} itemName="Quotation" />

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .field-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .field-row-2 { grid-template-columns: 1fr; } }
        .chip { padding: 4px 12px; border-radius: 20px; background: var(--bg); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
        .chip.active { background: var(--brand); color: white; border-color: var(--brand); }
        .chip:hover:not(.active) { background: var(--brand-bg); border-color: var(--brand); }
      `}</style>
    </div>
  );
}