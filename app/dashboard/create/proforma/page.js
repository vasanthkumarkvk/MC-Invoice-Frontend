'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw, AlertCircle, Eye, Receipt } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { fmtDate } from '@/lib/data';

const API_BASE = 'https://invoice.crazystory.in/api';

const money = (v) => {
  const n = parseFloat(v) || 0;
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    accepted:  { bg: '#d1fae5', color: '#065f46' },
    draft:     { bg: '#f3f4f6', color: '#4b5563' },
    sent:      { bg: '#dbeafe', color: '#1d4ed8' },
    rejected:  { bg: '#fee2e2', color: '#991b1b' },
    expired:   { bg: '#fef3c7', color: '#92400e' },
    converted: { bg: '#ede9fe', color: '#6d28d9' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      background: s.bg, color: s.color,
      display: 'inline-block', padding: '3px 10px',
      borderRadius: 999, fontSize: 11, fontWeight: 700,
      letterSpacing: '.3px', textTransform: 'capitalize'
    }}>
      {status}
    </span>
  );
}

// ── View Panel ─────────────────────────────────────────────────
function ProformaView({ data, onClose }) {
  if (!data) return null;
  const customer = data.customer || {};
  const items = data.items || [];
  const subtotal = parseFloat(data.subtotal) || 0;
  const gst = parseFloat(data.gst_amount) || 0;
  const discount = parseFloat(data.discount_amount) || 0;
  const adjustment = parseFloat(data.adjustment_amount) || 0;
  const total = parseFloat(data.total_amount) || (subtotal + gst - discount + adjustment);

  const thS = { padding: '8px 10px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: '#9ca3af', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' };
  const tdS = { padding: '9px 10px', fontSize: 13, borderBottom: '1px solid #f3f4f6', color: '#374151' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#f3f4f6', border: 'none', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center', color: '#6b7280' }}>×</button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '2px solid #111827', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#8f195c' }}>PROFORMA INVOICE</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{data.quotation_number || `QT-${data.id}`}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12.5, color: '#374151' }}>
            <div><strong>Date:</strong> {fmtDate(data.quotation_date)}</div>
            <div><strong>Valid Until:</strong> {fmtDate(data.validity_date) || '—'}</div>
            {data.reference && <div><strong>Ref:</strong> {data.reference}</div>}
            <div style={{ marginTop: 6 }}><StatusBadge status={data.status} /></div>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#9ca3af', marginBottom: 5 }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{customer.name || '—'}</div>
          {customer.billing_address && <div style={{ fontSize: 13, color: '#6b7280' }}>{customer.billing_address}</div>}
          <div style={{ fontSize: 13, color: '#6b7280' }}>{[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}</div>
          {customer.mobile && <div style={{ fontSize: 13, color: '#6b7280' }}>Mobile: {customer.mobile}</div>}
          {customer.gstin && <div style={{ fontSize: 13, color: '#6b7280' }}>GSTIN: {customer.gstin}</div>}
        </div>

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={thS}>#</th>
              <th style={thS}>Item</th>
              <th style={{ ...thS, textAlign: 'right' }}>Qty</th>
              <th style={{ ...thS, textAlign: 'right' }}>Rate</th>
              <th style={{ ...thS, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No items</td></tr>
            ) : items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td style={tdS}>{idx + 1}</td>
                <td style={{ ...tdS, fontWeight: 600 }}>{it.product_name || `Product #${it.product_id}`}</td>
                <td style={{ ...tdS, textAlign: 'right' }}>{it.quantity}</td>
                <td style={{ ...tdS, textAlign: 'right' }}>{money(it.price)}</td>
                <td style={{ ...tdS, textAlign: 'right', fontWeight: 700 }}>{money(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 240 }}>
            {[['Subtotal', money(subtotal)], ...(gst > 0 ? [['GST', money(gst)]] : []), ...(discount > 0 ? [['Discount', '- ' + money(discount)]] : []), ...(adjustment !== 0 ? [['Adjustment', money(adjustment)]] : [])].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13.5, color: '#6b7280' }}>
                <span>{l}</span><span style={{ fontWeight: 600, color: '#374151' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: 6, borderTop: '2px solid #111827', fontWeight: 800, fontSize: 16 }}>
              <span>Total</span><span style={{ color: '#8f195c' }}>{money(total)}</span>
            </div>
          </div>
        </div>

        {(data.notes || data.terms) && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
            {data.notes && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 3 }}>Notes</div><div style={{ fontSize: 13, color: '#374151' }}>{data.notes}</div></div>}
            {data.terms && <div><div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 3 }}>Terms & Conditions</div><div style={{ fontSize: 13, color: '#374151' }}>{data.terms}</div></div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Inner ─────────────────────────────────────────────────
function Inner() {
  const router = useRouter();
  const { toast } = useApp();

  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewData, setViewData] = useState(null);

  const fetchProformas = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/quotations/proformas`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data) ? data : (data.proformas || data.data || []);
        setProformas(list);
      } else {
        setError(data.message || 'Failed to load proforma invoices.');
      }
    } catch (err) {
      console.error('Fetch proformas error:', err);
      setError('Network error. Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProformas(); }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
          <button className="btn-icon" onClick={() => router.back()}><ChevronLeft size={20} /></button>
          <h1 style={{ fontWeight: 800, fontSize: 18 }}>Pro Forma Invoices</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading proforma invoices...</p>
          </div>
        </div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap' }}>
        <button className="btn-icon" onClick={() => router.back()}><ChevronLeft size={20} /></button>
        <h1 style={{ fontWeight: 800, fontSize: 18 }}>Pro Forma Invoices</h1>
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchProformas} title="Refresh">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 10px' }}>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} color="#dc2626" />
              <span style={{ fontSize: 13, color: '#991b1b' }}>{error}</span>
            </div>
            <button onClick={fetchProformas} className="btn btn-outline btn-sm">Try Again</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 20 }}>
          <div className="stat-card">
            <div style={{ fontWeight: 800, fontSize: 24 }}>{proformas.length}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Total Proformas</div>
          </div>
          <div className="stat-card">
            <div style={{ fontWeight: 800, fontSize: 24, color: '#065f46' }}>{proformas.filter(p => p.status === 'accepted').length}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Accepted</div>
          </div>
          <div className="stat-card">
            <div style={{ fontWeight: 800, fontSize: 24, color: '#1d4ed8' }}>{proformas.filter(p => p.status === 'sent').length}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Sent</div>
          </div>
          <div className="stat-card">
            <div style={{ fontWeight: 800, fontSize: 24, color: '#8f195c' }}>
              {money(proformas.reduce((s, p) => s + (parseFloat(p.total_amount) || 0), 0))}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Total Value</div>
          </div>
        </div>

        {/* Empty state */}
        {proformas.length === 0 && !error ? (
          <div style={{ textAlign: 'center', padding: '72px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text)' }}>No pro forma invoices yet</p>
            <p style={{ fontSize: 13 }}>Convert a quotation to a proforma invoice from the Quotations page.</p>
          </div>
        ) : proformas.length > 0 && (
          /* Table */
          <div className="card" style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    {['Quote #', 'Customer', 'Date', 'Valid Until', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proformas.map((inv, idx) => {
                    const customer = inv.customer || {};
                    const total = parseFloat(inv.total_amount) || 0;
                    return (
                      <tr key={inv.id} style={{ borderBottom: idx < proformas.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(143,25,92,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--brand)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Receipt size={13} color="#4338ca" />
                            {inv.quotation_number || `QT-${inv.id}`}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                          {customer.name || <span style={{ color: 'var(--muted)' }}>—</span>}
                          {customer.mobile && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{customer.mobile}</div>}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--muted)', whiteSpace: 'nowrap', fontSize: 13 }}>
                          {fmtDate(inv.quotation_date)}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--muted)', whiteSpace: 'nowrap', fontSize: 13 }}>
                          {fmtDate(inv.validity_date) || '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {money(total)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <StatusBadge status={inv.status} />
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            className="btn-icon"
                            onClick={() => setViewData(inv)}
                            title="View"
                            style={{ color: 'var(--brand)' }}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewData && <ProformaView data={viewData} onClose={() => setViewData(null)} />}

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}