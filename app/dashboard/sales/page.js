'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Eye, Download, Send, Printer, FileText,
  MoreVertical, ChevronDown, CheckCircle, Clock, AlertCircle,
  X, User, Calendar, DollarSign, CreditCard, RefreshCw,
  TrendingUp, TrendingDown, BarChart2, Filter, ChevronRight,
  IndianRupee, Receipt, Users, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { INVOICE_TEMPLATES } from '@/lib/data';

const API_BASE = 'https://api.crazystory.in/api';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const today = () => new Date();
const fmt = d => (d ? String(d).split('T')[0] : '—');

function getDateRange(period) {
  const now = today();
  const start = new Date(now);
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    case 'week': {
      const day = now.getDay();
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    default:
      return null;
  }
}

function calcPaid(invoice) {
  return (invoice.payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
}

function calcBalance(invoice) {
  return (parseFloat(invoice.total_amount) || 0) - calcPaid(invoice);
}

function isOverdue(inv) {
  return inv.due_date && new Date(inv.due_date) < today() && inv.status !== 'paid' && calcBalance(inv) > 0;
}

function buildStats(list) {
  const total = list.length;
  const totalAmt = list.reduce((s, i) => s + (parseFloat(i.total_amount) || 0), 0);
  const totalPaid = list.reduce((s, i) => s + calcPaid(i), 0);
  const totalBalance = totalAmt - totalPaid;
  const overdueCount = list.filter(isOverdue).length;
  const paidCount = list.filter(i => i.status === 'paid').length;
  const draftCount = list.filter(i => i.status === 'draft').length;
  const sentCount = list.filter(i => i.status === 'sent').length;
  return { total, totalAmt, totalPaid, totalBalance, overdueCount, paidCount, draftCount, sentCount };
}

/* ─────────────────────────────────────────────
   Currency formatter
───────────────────────────────────────────── */
const INR = v => `₹${(parseFloat(v) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ─────────────────────────────────────────────
   StatusBadge
───────────────────────────────────────────── */
const STATUS_CFG = {
  draft:   { color: '#6b7280', bg: '#f3f4f6', Icon: Clock },
  sent:    { color: '#f59e0b', bg: '#fef3c7', Icon: Send },
  paid:    { color: '#059669', bg: '#d1fae5', Icon: CheckCircle },
  overdue: { color: '#dc2626', bg: '#fee2e2', Icon: AlertCircle },
};
function StatusBadge({ status, onClick }) {
  const c = STATUS_CFG[status] || STATUS_CFG.draft;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.color, border: 'none', cursor: onClick ? 'pointer' : 'default'
    }}>
      <c.Icon size={11} /> {status}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
function StatCard({ label, value, sub, color, icon: Icon, accent }) {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '16px 18px',
      borderLeft: `4px solid ${accent || color || 'var(--brand)'}`,
      display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: color || 'var(--text)', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: accent ? `${accent}18` : 'var(--brand-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Icon size={16} color={accent || 'var(--brand)'} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Report Summary Bar
───────────────────────────────────────────── */
function ReportSummary({ stats, periodLabel }) {
  const collectRate = stats.totalAmt > 0 ? ((stats.totalPaid / stats.totalAmt) * 100).toFixed(1) : '0.0';
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1155 50%, #8f195c 100%)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: '#fff',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* decorative blobs */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <BarChart2 size={16} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Invoice Report — {periodLabel}
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>{INR(stats.totalAmt)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Total Invoice Value · {stats.total} invoices</div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>{INR(stats.totalPaid)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Collected</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: stats.totalBalance > 0 ? '#f87171' : '#4ade80' }}>{INR(stats.totalBalance)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Balance Due</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>{collectRate}%</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Collection Rate</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171' }}>{stats.overdueCount}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Overdue</div>
          </div>
        </div>
      </div>

      {/* Status breakdown bar */}
      <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Paid', count: stats.paidCount, color: '#4ade80' },
          { label: 'Sent', count: stats.sentCount, color: '#fbbf24' },
          { label: 'Draft', count: stats.draftCount, color: 'rgba(255,255,255,0.5)' },
          { label: 'Overdue', count: stats.overdueCount, color: '#f87171' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{s.label}: <strong style={{ color: '#fff' }}>{s.count}</strong></span>
          </div>
        ))}
      </div>

      {/* Collection bar */}
      {stats.totalAmt > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${Math.min(100, (stats.totalPaid / stats.totalAmt) * 100)}%`,
              background: 'linear-gradient(90deg, #4ade80, #22c55e)',
              transition: 'width 0.6s ease'
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Collection progress: {collectRate}% of total invoiced amount collected
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Filter Bar
───────────────────────────────────────────── */
function FilterBar({ filters, setFilters, creators, prefixes }) {
  const periodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '14px 16px', marginBottom: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Filter size={13} color="var(--brand)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filters</span>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>

        {/* Search */}
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Search</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px' }}>
            <Search size={13} color="var(--muted)" style={{ flexShrink: 0 }} />
            <input
              placeholder="Invoice # or customer..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text)', width: '100%' }}
            />
            {filters.search && (
              <button onClick={() => setFilters(f => ({ ...f, search: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                <X size={12} color="var(--muted)" />
              </button>
            )}
          </div>
        </div>

        {/* Period */}
        <div style={{ flex: '0 0 auto' }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Period</label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {periodOptions.map(opt => (
              <button key={opt.value}
                onClick={() => setFilters(f => ({ ...f, period: opt.value }))}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: filters.period === opt.value ? 'var(--brand)' : 'var(--bg)',
                  color: filters.period === opt.value ? '#fff' : 'var(--text)',
                  border: filters.period === opt.value ? '1px solid var(--brand)' : '1px solid var(--border)',
                  transition: 'all 0.15s'
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div style={{ flex: '0 0 auto' }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Status</label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['all', 'draft', 'sent', 'paid', 'overdue'].map(s => (
              <button key={s}
                onClick={() => setFilters(f => ({ ...f, status: s }))}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: filters.status === s ? 'var(--brand)' : 'var(--bg)',
                  color: filters.status === s ? '#fff' : 'var(--text)',
                  border: filters.status === s ? '1px solid var(--brand)' : '1px solid var(--border)',
                  transition: 'all 0.15s'
                }}>
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Prefix */}
        {prefixes.length > 1 && (
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Prefix</label>
            <select
              value={filters.prefix}
              onChange={e => setFilters(f => ({ ...f, prefix: e.target.value }))}
              style={{
                padding: '7px 28px 7px 10px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center'
              }}>
              <option value="all">All Prefixes</option>
              {prefixes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        {/* Creator */}
        {creators.length > 1 && (
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Created By</label>
            <select
              value={filters.creator}
              onChange={e => setFilters(f => ({ ...f, creator: e.target.value }))}
              style={{
                padding: '7px 28px 7px 10px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center'
              }}>
              <option value="all">All Creators</option>
              {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Clear */}
        <div style={{ flex: '0 0 auto' }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'transparent', display: 'block', marginBottom: 5 }}>·</label>
          <button
            onClick={() => setFilters({ search: '', period: 'all', status: 'all', prefix: 'all', creator: 'all' })}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
            }}>
            <X size={11} /> Clear
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Status Update Modal
───────────────────────────────────────────── */
function StatusUpdateModal({ open, onClose, invoice, onUpdate, toast }) {
  const [status, setStatus] = useState(invoice?.status || 'draft');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (invoice) setStatus(invoice.status); }, [invoice]);

  if (!open) return null;

  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || 'Failed to update status', 'error'); return; }
      toast(`Invoice status updated to ${status}`, 'success');
      onUpdate(); onClose();
    } catch { toast('Network error. Please try again.', 'error'); }
    finally { setLoading(false); }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
    { value: 'sent', label: 'Sent', color: '#f59e0b', bg: '#fef3c7' },
    { value: 'paid', label: 'Paid', color: '#059669', bg: '#d1fae5' },
    { value: 'overdue', label: 'Overdue', color: '#dc2626', bg: '#fee2e2' }
  ];

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>Update Invoice Status</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 13, marginBottom: 14, color: 'var(--muted)' }}>Invoice: <strong>{invoice?.invoice_number}</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {statusOptions.map(opt => (
              <label key={opt.value} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                border: status === opt.value ? `2px solid ${opt.color}` : '1px solid var(--border)',
                borderRadius: 8, cursor: 'pointer',
                background: status === opt.value ? opt.bg : 'var(--card-bg)'
              }}>
                <input type="radio" name="status" value={opt.value} checked={status === opt.value} onChange={() => setStatus(opt.value)} style={{ accentColor: opt.color }} />
                <span style={{ fontWeight: 500, flex: 1 }}>{opt.label}</span>
                <span style={{ fontSize: 11, color: opt.color, background: opt.bg, padding: '2px 8px', borderRadius: 12 }}>{opt.value}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-brand btn-sm" onClick={handleUpdate} disabled={loading}>{loading ? 'Updating...' : 'Update Status'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Template Select Modal
───────────────────────────────────────────── */
function TemplateSelectModal({ open, onClose, onSelect, invoice }) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Select Template — #{invoice?.invoice_number}</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Choose a template to download/print</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {INVOICE_TEMPLATES.map(tmpl => (
              <label key={tmpl.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                border: selectedTemplate === tmpl.id ? `2px solid var(--brand)` : '1px solid var(--border)',
                borderRadius: 10, cursor: 'pointer',
                background: selectedTemplate === tmpl.id ? 'var(--brand-bg)' : 'var(--card-bg)', transition: 'all 0.2s'
              }}>
                <input type="radio" name="template" value={tmpl.id} checked={selectedTemplate === tmpl.id} onChange={() => setSelectedTemplate(tmpl.id)} style={{ accentColor: 'var(--brand)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tmpl.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tmpl.description}</div>
                </div>
                <div style={{ width: 40, height: 40, background: tmpl.colors?.accent || 'var(--brand)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color="#fff" />
                </div>
              </label>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-brand btn-sm" onClick={() => { onSelect(invoice, selectedTemplate); onClose(); }}>
            <Download size={14} /> Download / Print
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Invoice Detail Modal
───────────────────────────────────────────── */
function InvoiceDetailModal({ open, onClose, invoice }) {
  if (!open || !invoice) return null;
  const paidAmount = calcPaid(invoice);
  const balanceDue = (parseFloat(invoice.total_amount) || 0) - paidAmount;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 10 }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Invoice Details</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>{invoice.invoice_number}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, padding: '12px', background: 'var(--brand-bg)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><User size={14} color="var(--brand)" /><span style={{ fontWeight: 600 }}>Customer Information</span></div>
            <div><strong>{invoice.customer?.name}</strong></div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{invoice.customer?.mobile}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{invoice.customer?.email}</div>
            {invoice.customer?.gstin && <div style={{ fontSize: 12, fontFamily: 'monospace' }}>GSTIN: {invoice.customer.gstin}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Invoice Date</div><div style={{ fontWeight: 500 }}>{fmt(invoice.invoice_date)}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Due Date</div><div style={{ fontWeight: 500, color: invoice.due_date && new Date(invoice.due_date) < today() && invoice.status !== 'paid' ? '#dc2626' : 'inherit' }}>{fmt(invoice.due_date)}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Created By</div><div style={{ fontWeight: 500 }}>{invoice.creator?.name || '—'}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Status</div><StatusBadge status={invoice.status} /></div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Items</div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px' }}>Product</th>
                  <th style={{ textAlign: 'center', padding: '8px 4px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 4px' }}>{item.product_name}</td>
                    <td style={{ textAlign: 'center', padding: '8px 4px' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>₹{parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>₹{parseFloat(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>Subtotal</span><span style={{ fontWeight: 500 }}>₹{parseFloat(invoice.subtotal || 0).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>GST</span><span style={{ fontWeight: 500 }}>₹{parseFloat(invoice.gst_amount || 0).toFixed(2)}</span></div>
            {parseFloat(invoice.discount_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>Discount</span><span style={{ fontWeight: 500, color: '#dc2626' }}>-₹{parseFloat(invoice.discount_amount).toFixed(2)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border)', fontWeight: 600 }}><span>Total</span><span style={{ color: 'var(--brand)' }}>₹{parseFloat(invoice.total_amount || 0).toFixed(2)}</span></div>
          </div>
          {(invoice.payments || []).length > 0 && (
            <div style={{ marginBottom: 12, padding: 12, background: '#ecfdf5', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><CreditCard size={14} color="#059669" /><span style={{ fontWeight: 600, fontSize: 13 }}>Payments Received</span></div>
              {(invoice.payments || []).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>{fmt(p.payment_date)} — {p.payment_method}</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>₹{parseFloat(p.amount).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTop: '1px solid #bbf7d0' }}><span style={{ fontWeight: 600 }}>Paid Amount</span><span style={{ fontWeight: 600, color: '#059669' }}>₹{paidAmount.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span style={{ fontWeight: 600 }}>Balance Due</span><span style={{ fontWeight: 700, color: balanceDue > 0 ? '#dc2626' : '#059669' }}>₹{balanceDue.toFixed(2)}</span></div>
            </div>
          )}
          {invoice.notes && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Notes</div><div style={{ fontSize: 13 }}>{invoice.notes}</div></div>}
          {invoice.terms_conditions && <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Terms & Conditions</div><div style={{ fontSize: 13 }}>{invoice.terms_conditions}</div></div>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function SalesPage() {
  const router = useRouter();
  const { state, toast, fmtMoney } = useApp();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', period: 'all', status: 'all', prefix: 'all', creator: 'all' });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showStatusModal, setShowStatusModal]     = useState(false);
  const [showDetailModal, setShowDetailModal]     = useState(false);
  const [selectedInvoice, setSelectedInvoice]     = useState(null);

  /* ── Fetch ── */
  const fetchInvoices = async () => {
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoices`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.invoices || data.data || data;
        setInvoices(Array.isArray(list) ? list : []);
      } else {
        toast(data.message || 'Failed to fetch invoices', 'error');
        setInvoices(state.invoices || []);
      }
    } catch {
      setInvoices(state.invoices || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  /* ── Derive unique creators & prefixes ── */
  const creators = useMemo(() => {
    const map = new Map();
    invoices.forEach(inv => { if (inv.creator?.id) map.set(inv.creator.id, inv.creator); });
    return Array.from(map.values());
  }, [invoices]);

  const prefixes = useMemo(() => {
    const set = new Set();
    invoices.forEach(inv => {
      if (inv.invoice_number) {
        const match = inv.invoice_number.match(/^([A-Za-z\-]+)/);
        if (match) set.add(match[1]);
      }
    });
    return Array.from(set);
  }, [invoices]);

  /* ── Period label ── */
  const periodLabel = useMemo(() => {
    const labels = { all: 'All Time', today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year' };
    return labels[filters.period] || 'All Time';
  }, [filters.period]);

  /* ── Filter + apply ── */
  const filteredInvoices = useMemo(() => {
    let list = invoices;

    // Period
    const range = getDateRange(filters.period);
    if (range) {
      list = list.filter(inv => {
        if (!inv.invoice_date) return false;
        const d = new Date(inv.invoice_date);
        return d >= range.start && d <= range.end;
      });
    }

    // Status
    if (filters.status !== 'all') {
      if (filters.status === 'overdue') {
        list = list.filter(isOverdue);
      } else {
        list = list.filter(inv => inv.status === filters.status);
      }
    }

    // Prefix
    if (filters.prefix !== 'all') {
      list = list.filter(inv => inv.invoice_number?.startsWith(filters.prefix));
    }

    // Creator
    if (filters.creator !== 'all') {
      list = list.filter(inv => String(inv.creator?.id) === String(filters.creator));
    }

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.customer?.name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [invoices, filters]);

  /* ── Stats for filtered list ── */
  const stats = useMemo(() => buildStats(filteredInvoices), [filteredInvoices]);

  /* ── Handlers ── */
  const handleView       = inv => { setSelectedInvoice(inv); setShowDetailModal(true); };
  const handleStatusUpd  = inv => { setSelectedInvoice(inv); setShowStatusModal(true); };
  const openTemplateModal= inv => { setSelectedInvoice(inv); setShowTemplateModal(true); };
  const handleDownload   = (inv, tplId) => router.push(`/dashboard/invoice-preview?id=${inv.id}&template=${tplId}&download=true`);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading invoices...</p>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="page-content">

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>Invoices</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Manage and track all your invoices</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchInvoices} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <Link href="/dashboard/create/invoice" className="btn btn-brand btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Plus size={14} /> Create Invoice
          </Link>
        </div>
      </div>

      {/* ── Report Summary Banner ── */}
      <ReportSummary stats={stats} periodLabel={periodLabel} />

      {/* ── Stat Cards (filtered) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Invoices"  value={stats.total}              icon={Receipt}        accent="#8f195c" />
        <StatCard label="Total Amount"    value={INR(stats.totalAmt)}      icon={IndianRupee}    accent="#f59e0b" color="#f59e0b" />
        <StatCard label="Amount Paid"     value={INR(stats.totalPaid)}     icon={CheckCircle}    accent="#059669" color="#059669" />
        <StatCard label="Balance Due"     value={INR(stats.totalBalance)}  icon={AlertTriangle}  accent={stats.totalBalance > 0 ? '#dc2626' : '#059669'} color={stats.totalBalance > 0 ? '#dc2626' : '#059669'} />
        <StatCard label="Overdue"         value={stats.overdueCount}       icon={AlertCircle}    accent="#dc2626" color="#dc2626" sub={`${stats.paidCount} paid · ${stats.sentCount} sent`} />
      </div>

      {/* ── Filters ── */}
      <FilterBar filters={filters} setFilters={setFilters} creators={creators} prefixes={prefixes} />

      {/* ── Table Card ── */}
      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
            {filters.period !== 'all' && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)', marginLeft: 6 }}>· {periodLabel}</span>}
          </span>
          <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
            <Download size={12} /> Export
          </button>
        </div>

        {filteredInvoices.length === 0 ? (
          <div style={{ padding: '50px 32px', textAlign: 'center' }}>
            <FileText size={48} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No Invoices Found</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              {filters.search ? 'Try a different search term' : 'Adjust the filters or create a new invoice'}
            </p>
            {!filters.search && (
              <Link href="/dashboard/create/invoice" className="btn btn-brand btn-sm" style={{ textDecoration: 'none' }}>
                <Plus size={14} /> Create Invoice
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const totalAmt  = parseFloat(inv.total_amount) || 0;
                  const paidAmt   = calcPaid(inv);
                  const balance   = totalAmt - paidAmt;
                  const overdue   = isOverdue(inv);
                  return (
                    <tr key={inv.id} style={{ background: overdue ? '#fef2f2' : 'transparent' }}>
                      <td style={{ fontWeight: 600, color: 'var(--brand)' }}>{inv.invoice_number}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inv.customer?.name || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{inv.customer?.mobile}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(inv.invoice_date)}</td>
                      <td style={{ fontSize: 12, color: overdue ? '#dc2626' : 'var(--muted)', fontWeight: overdue ? 600 : 400 }}>
                        {fmt(inv.due_date)}
                        {overdue && <span style={{ fontSize: 10, marginLeft: 4 }}>(Overdue)</span>}
                      </td>
                      <td style={{ fontWeight: 600 }}>{INR(totalAmt)}</td>
                      <td style={{ fontWeight: 600, color: '#059669' }}>{INR(paidAmt)}</td>
                      <td style={{ fontWeight: 600, color: balance > 0 ? '#dc2626' : '#059669' }}>{INR(balance)}</td>
                      <td><StatusBadge status={inv.status} onClick={() => handleStatusUpd(inv)} /></td>
                      <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={10} />{inv.creator?.name || '—'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => handleView(inv)} title="View Details"><Eye size={14} /></button>
                          <button className="btn-icon" onClick={() => openTemplateModal(inv)} title="Download"><Download size={14} /></button>
                          <button className="btn-icon" onClick={() => handleView(inv)} title="Print"><Printer size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table footer totals */}
              <tfoot>
                <tr style={{ background: 'var(--bg)', fontWeight: 700, borderTop: '2px solid var(--border)' }}>
                  <td colSpan={4} style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted)' }}>
                    Totals — {filteredInvoices.length} invoices
                  </td>
                  <td style={{ padding: '10px 4px', color: '#f59e0b' }}>{INR(stats.totalAmt)}</td>
                  <td style={{ padding: '10px 4px', color: '#059669' }}>{INR(stats.totalPaid)}</td>
                  <td style={{ padding: '10px 4px', color: stats.totalBalance > 0 ? '#dc2626' : '#059669' }}>{INR(stats.totalBalance)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <TemplateSelectModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleDownload}
        invoice={selectedInvoice}
      />
      <StatusUpdateModal
        open={showStatusModal}
        onClose={() => { setShowStatusModal(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
        onUpdate={fetchInvoices}
        toast={toast}
      />
      <InvoiceDetailModal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}