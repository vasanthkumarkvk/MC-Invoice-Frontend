'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronDown, Plus, Sparkles, Save, Send, X, Paperclip, Eye, Upload, ImageIcon, AlertCircle, Check, FileText, Printer, ChevronRight, User, Shield, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, today, addDays, INVOICE_TEMPLATES, STATES } from '@/lib/data';
import LineItems from '@/components/LineItems';
import { UnsavedModal } from '@/components/Modal';
import AIModal from '@/components/AIModal';
import Sheet from '@/components/Sheet';

const API_BASE = 'https://api.crazystory.in/api';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
];

/* ── Template Preview Modal ── */
function TemplatePreviewModal({ open, onClose, template, onSelect, templates = [] }) {
  if (!open) return null;

  const displayTemplates = templates.length > 0 ? templates : INVOICE_TEMPLATES;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 900, width: '90%', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>Invoice Templates</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Choose a template for your invoice</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          {displayTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => { onSelect(tmpl.id); onClose(); }}
              style={{
                border: template === tmpl.id ? `2px solid var(--brand)` : '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: 'var(--card-bg)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                padding: 16,
                background: tmpl.previewBg || tmpl.colors?.primary || '#ffffff',
                borderBottom: `2px solid ${tmpl.colors?.accent || 'var(--brand)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: tmpl.colors?.accent || 'var(--brand)' }}>
                    {tmpl.name?.toUpperCase() || 'INVOICE'}
                  </div>
                  <div style={{
                    width: 32,
                    height: 32,
                    background: tmpl.colors?.accent || 'var(--brand)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={14} color="#fff" />
                  </div>
                </div>
                <div style={{
                  height: 60,
                  background: `linear-gradient(135deg, ${tmpl.colors?.accent || 'var(--brand)'}15, transparent)`
                }} />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                  {tmpl.name || 'Template'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {tmpl.description || 'Professional invoice template'}
                </div>
                {tmpl.isPro && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: 6,
                    fontSize: 10,
                    background: 'linear-gradient(135deg, #f59e0b, #dc2626)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontWeight: 600
                  }}>
                    PRO
                  </span>
                )}
                {template === tmpl.id && (
                  <span style={{ display: 'inline-block', marginLeft: 8, marginTop: 6, fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>
                    ✓ Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg)', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
          <Link href="/dashboard/invoice-templates" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>
            Customize Templates →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Missing Fields Modal ── */
function MissingFieldsModal({ open, onClose, missing = [] }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} color="#dc2626" /> Missing Information
          </span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
            Please complete the following before continuing:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {missing.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, padding: '9px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b' }}>
                <X size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-brand" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

/* ── Invoice Preview Modal (read-only, NO save) ── */
function InvoicePreviewModal({ open, onClose, data }) {
  if (!open || !data) return null;
  const { number, customer, date, dueDate, items, totals, disc, adjustment, roundOffAmt, grandTotal, advancePaid, notes, terms, logo, fmtMoney } = data;
  const balance = +(grandTotal - (parseFloat(advancePaid) || 0)).toFixed(2);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 760, width: '94%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={17} /> Invoice Preview
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--bg)', padding: '3px 10px', borderRadius: 20 }}>Not saved yet</span>
            <button className="btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div style={{ padding: 28, background: '#fff', color: '#111' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              {logo ? <img src={logo} alt="Logo" style={{ height: 56, objectFit: 'contain', marginBottom: 8 }} /> : null}
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 1, color: '#7c1d4e' }}>INVOICE</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>#{number}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12.5, color: '#444' }}>
              <div><strong>Date:</strong> {date || '—'}</div>
              {dueDate ? <div><strong>Due:</strong> {dueDate}</div> : null}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 0.5, marginBottom: 4 }}>Bill To</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{customer?.name || 'No customer selected'}</div>
            {customer?.gstin ? <div style={{ fontSize: 12, color: '#666' }}>GSTIN: {customer.gstin}</div> : null}
            {customer?.billing_address ? <div style={{ fontSize: 12, color: '#666' }}>{customer.billing_address}</div> : null}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginBottom: 18 }}>
            <thead>
              <tr style={{ background: '#f7eef3', color: '#7c1d4e' }}>
                <th style={{ textAlign: 'left', padding: '9px 10px' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '9px 10px' }}>HSN/SAC</th>
                <th style={{ textAlign: 'center', padding: '9px 10px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '9px 10px' }}>Price</th>
                <th style={{ textAlign: 'center', padding: '9px 10px' }}>GST%</th>
                <th style={{ textAlign: 'right', padding: '9px 10px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.name?.trim()).map((it, idx) => {
                const qty = parseFloat(it.qty) || 0;
                const price = parseFloat(it.price) || 0;
                const lineDisc = parseFloat(it.disc) || 0;
                const amount = qty * price * (1 - lineDisc / 100);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 10px' }}>{it.name}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{it.hsn || '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{qty} {it.unit || ''}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtMoney(price)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{it.gst || 0}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtMoney(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 280, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ color: '#666' }}>Subtotal</span><span>{fmtMoney(totals.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ color: '#666' }}>GST</span><span>{fmtMoney(totals.taxAmt)}</span>
              </div>
              {disc > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#dc2626' }}>
                  <span>Discount</span><span>-{fmtMoney(disc)}</span>
                </div>
              )}
              {adjustment !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span style={{ color: '#666' }}>Adjustment</span><span>{adjustment < 0 ? '-' : '+'}{fmtMoney(Math.abs(adjustment))}</span>
                </div>
              )}
              {roundOffAmt !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span style={{ color: '#666' }}>Round Off</span><span>{roundOffAmt > 0 ? '+' : ''}{fmtMoney(roundOffAmt)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #7c1d4e', marginTop: 4, fontWeight: 800, fontSize: 15 }}>
                <span>Total</span><span style={{ color: '#7c1d4e' }}>{fmtMoney(grandTotal)}</span>
              </div>
              {(parseFloat(advancePaid) || 0) > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#059669' }}>
                    <span>Amount Paid</span><span>-{fmtMoney(parseFloat(advancePaid) || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontWeight: 700 }}>
                    <span>Balance Due</span><span style={{ color: '#dc2626' }}>{fmtMoney(balance)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {(notes || terms) && (
            <div style={{ marginTop: 24, fontSize: 12, color: '#555', borderTop: '1px solid #eee', paddingTop: 14 }}>
              {notes ? <div style={{ marginBottom: 8 }}><strong>Notes:</strong> {notes}</div> : null}
              {terms ? <div><strong>Terms:</strong> {terms}</div> : null}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: 'var(--card-bg)' }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Close Preview</button>
        </div>
      </div>
    </div>
  );
}

/* ── Prefix picker (API-backed: /invoice-prefixes, max 3, inline add/edit/delete) ── */
function PrefixPicker({ value, onChange, prefixes, loading, onAdd, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setEditingId(null); } };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const atMax = (prefixes?.length || 0) >= 3;

  const handleAdd = async () => {
    const v = custom.trim().toUpperCase();
    if (!v) return;
    setBusy(true); setLocalErr(null);
    const err = await onAdd(v);
    setBusy(false);
    if (err) { setLocalErr(err); return; }
    setCustom('');
  };

  const startEdit = (p) => {
    if (p.is_default) { setLocalErr('Cannot edit the default prefix'); return; }
    setEditingId(p.id);
    setEditValue(p.prefix);
    setLocalErr(null);
  };

  const handleEditSave = async (p) => {
    const v = editValue.trim().toUpperCase();
    if (!v) return;
    setBusy(true); setLocalErr(null);
    const err = await onEdit(p.id, v);
    setBusy(false);
    if (err) { setLocalErr(err); return; }
    setEditingId(null);
  };

  const handleDelete = async (p) => {
    if (p.is_default) { setLocalErr('Cannot delete the default prefix'); return; }
    setBusy(true); setLocalErr(null);
    const err = await onDelete(p.id);
    setBusy(false);
    if (err) { setLocalErr(err); return; }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(o => !o); setLocalErr(null); }}
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', border: '2px solid var(--text)', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: 'var(--card-bg)', fontFamily: 'Inter,sans-serif', color: 'var(--text)', whiteSpace: 'nowrap' }}>
        {value || 'INV'} <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 40, left: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-md)', width: 260, zIndex: 300, overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>Add Prefix</span>
              <span style={{ color: atMax ? '#dc2626' : 'var(--muted)' }}>{prefixes?.length || 0}/3</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="form-input" style={{ fontSize: 12, padding: '5px 8px', flex: 1 }}
                placeholder={atMax ? 'Max 3 reached' : 'e.g. INV, ABC'} value={custom}
                disabled={atMax || busy}
                onChange={e => setCustom(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <button className="btn btn-brand btn-sm" onClick={handleAdd} disabled={atMax || busy} style={{ flexShrink: 0 }}>Add</button>
            </div>
            {localErr && <div style={{ fontSize: 10.5, color: '#dc2626', marginTop: 5 }}>{localErr}</div>}
          </div>

          <div style={{ padding: '4px 0', maxHeight: 220, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '12px', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>Loading prefixes...</div>
            ) : (prefixes?.length === 0) ? (
              <div style={{ padding: '12px', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>No prefixes yet</div>
            ) : prefixes.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}>
                {editingId === p.id ? (
                  <>
                    <input className="form-input" style={{ fontSize: 12, padding: '4px 6px', flex: 1 }} value={editValue}
                      disabled={busy}
                      onChange={e => setEditValue(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleEditSave(p)} autoFocus />
                    <button className="btn btn-brand btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleEditSave(p)} disabled={busy}><Check size={12} /></button>
                    <button className="btn-icon" style={{ width: 26, height: 26 }} onClick={() => setEditingId(null)}><X size={12} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { onChange(p.prefix); setOpen(false); }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'Inter,sans-serif', color: 'var(--text)', fontWeight: value === p.prefix ? 700 : 400, borderRadius: 6 }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--brand-bg)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      {p.prefix}
                      {p.is_default && <span style={{ fontSize: 9, background: 'var(--border)', color: 'var(--muted)', padding: '1px 5px', borderRadius: 8, fontWeight: 600 }}>DEFAULT</span>}
                      {value === p.prefix && <span style={{ color: 'var(--brand)', marginLeft: 'auto' }}>✓</span>}
                    </button>
                    {!p.is_default && (
                      <>
                        <button className="btn-icon" style={{ width: 26, height: 26 }} title="Edit" onClick={() => startEdit(p)}><Pencil size={12} /></button>
                        <button className="btn-icon" style={{ width: 26, height: 26, color: '#dc2626' }} title="Delete" onClick={() => handleDelete(p)} disabled={busy}><Trash2 size={12} /></button>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Logo uploader ── */
function LogoUploader({ logo, onLogoChange }) {
  const ref = useRef(null);
  const handleFile = f => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => onLogoChange(e.target.result);
    reader.readAsDataURL(f);
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="form-label">Business Logo</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {logo ? (
          <div style={{ position: 'relative' }}>
            <img src={logo} alt="Logo" style={{ width: 72, height: 72, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, background: '#f9fafb' }} />
            <button onClick={() => onLogoChange(null)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#dc2626', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ) : (
          <div onClick={() => ref.current?.click()}
            style={{ width: 72, height: 72, border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, background: 'var(--bg)' }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <ImageIcon size={20} color="var(--muted)" />
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>Upload</span>
          </div>
        )}
        <div>
          <button className="btn btn-brand btn-sm" onClick={() => ref.current?.click()}>
            <Upload size={13} /> {logo ? 'Change Logo' : 'Upload Logo'}
          </button>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>PNG, JPG up to 2MB</div>
        </div>
      </div>
      <input ref={ref} type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleFile(e.target.files?.[0])} />
    </div>
  );
}

/* ── Send modal ── */
function SendModal({ open, onClose, onSend }) {
  const [ch, setCh] = useState({ whatsapp: true, email: false });
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Send Invoice</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: '18px 20px' }}>
          {[{ key: 'whatsapp', label: 'WhatsApp' }, { key: 'email', label: 'Email' }].map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{c.label}</span>
              <div className={'tog-track' + (ch[c.key] ? ' on' : '')} onClick={() => setCh(p => ({ ...p, [c.key]: !p[c.key] }))}><div className="tog-thumb" /></div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onSend(ch); onClose(); }}>Send Now</button>
        </div>
      </div>
    </div>
  );
}

/* ── Spinner ── */
const Spin = () => (
  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
);

/* ── Quick Add Customer (inline, API-backed) ──
   - checkUnique supports: mobile, email, gstin, pan
   - create returns { message, customer_id } only -> caller re-fetches + selects
*/
function QuickAddCustomer({ open, onClose, onAdded, toast }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [defaultDueDays, setDefaultDueDays] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [debitLimit, setDebitLimit] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState({ mobile: false, email: false, gstin: false, pan: false });

  if (!open) return null;

  const checkUnique = async (field, value) => {
    if (!value) return true;
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/customers/check-unique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ field, value })
      });
      const result = await res.json();
      return result.available !== false;
    } catch (error) {
      console.error(`Check ${field} error:`, error);
      return true;
    }
  };

  const runCheck = async (field, value, takenMsg) => {
    if (!value) { setErrors(p => ({ ...p, [field]: null })); return; }
    setChecking(c => ({ ...c, [field]: true }));
    try {
      const ok = await checkUnique(field, value);
      setErrors(p => ({ ...p, [field]: ok ? null : takenMsg }));
    } finally {
      setChecking(c => ({ ...c, [field]: false }));
    }
  };

  const validateMobileFormat = (num) => (num && !/^[0-9]{10}$/.test(num)) ? 'Enter a valid 10-digit mobile number' : null;
  const validateEmailFormat = (em) => (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) ? 'Enter a valid email address' : null;
  const validateGstinFormat = (g) => (g && g.length !== 15) ? 'GSTIN must be 15 characters' : null;
  const validatePanFormat = (p) => (p && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(p)) ? 'Enter a valid PAN (e.g. ABCDE1234F)' : null;

  const handleNameChange = (value) => {
    setName(value);
    setErrors(p => ({ ...p, name: value.trim() ? null : 'Customer name is required' }));
  };
  const handleMobileChange = async (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 10);
    setMobile(clean);
    const fmt = validateMobileFormat(clean);
    if (fmt) { setErrors(p => ({ ...p, mobile: fmt })); return; }
    setErrors(p => ({ ...p, mobile: null }));
    if (clean.length === 10) await runCheck('mobile', clean, 'Mobile number is already registered');
  };
  const handleEmailChange = async (value) => {
    setEmail(value);
    const fmt = validateEmailFormat(value);
    if (fmt) { setErrors(p => ({ ...p, email: fmt })); return; }
    setErrors(p => ({ ...p, email: null }));
    if (value) await runCheck('email', value, 'Email is already registered');
  };
  const handleGstinChange = async (value) => {
    const v = value.toUpperCase().slice(0, 15);
    setGstin(v);
    const fmt = validateGstinFormat(v);
    if (fmt) { setErrors(p => ({ ...p, gstin: fmt })); return; }
    setErrors(p => ({ ...p, gstin: null }));
    if (v.length === 15) await runCheck('gstin', v, 'GSTIN is already registered');
  };
  const handlePanChange = async (value) => {
    const v = value.toUpperCase().slice(0, 10);
    setPan(v);
    const fmt = validatePanFormat(v);
    if (fmt) { setErrors(p => ({ ...p, pan: fmt })); return; }
    setErrors(p => ({ ...p, pan: null }));
    if (v.length === 10) await runCheck('pan', v, 'PAN is already registered');
  };

  const reset = () => {
    setName(''); setMobile(''); setEmail(''); setGstin(''); setPan('');
    setBillingAddress(''); setCity(''); setStateName(''); setPincode('');
    setDefaultDueDays(''); setOpeningBalance(''); setDebitLimit(''); setNotes('');
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrors(p => ({ ...p, name: 'Customer name is required' }));
      toast('Customer name is required', 'error');
      return;
    }
    const mobErr = validateMobileFormat(mobile);
    const emErr = validateEmailFormat(email);
    const gstErr = validateGstinFormat(gstin);
    const panErr = validatePanFormat(pan);
    if (mobErr || emErr || gstErr || panErr) {
      setErrors(p => ({ ...p, mobile: mobErr || p.mobile, email: emErr || p.email, gstin: gstErr || p.gstin, pan: panErr || p.pan }));
      toast('Please fix validation errors before submitting', 'error');
      return;
    }
    if (errors.name || errors.mobile || errors.email || errors.gstin || errors.pan) {
      toast('Please resolve the highlighted errors first', 'error');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    const apiData = {
      name: name.trim(),
      mobile: mobile.trim() || null,
      email: email.trim() || null,
      gstin: gstin.trim() || null,
      pan: pan.trim() || null,
      billing_address: billingAddress.trim() || null,
      city: city.trim() || null,
      state: stateName || null,
      pincode: pincode.trim() || null,
      opening_balance: openingBalance ? parseFloat(openingBalance) : 0,
      debit_limit: debitLimit ? parseFloat(debitLimit) : null,
      default_due_days: defaultDueDays ? parseInt(defaultDueDays) : null,
      notes: notes.trim() || null
    };

    try {
      const res = await fetch(`${API_BASE}/admin/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) toast(Object.values(data.errors).flat().join(', '), 'error');
        else toast(data.message || 'Failed to create customer', 'error');
        setLoading(false);
        return;
      }
      const newId = data.customer_id || data.customer?.id || data.id || null;
      toast(data.message || 'Customer created successfully', 'success');
      reset();
      if (onAdded) await onAdded(newId, apiData);
      onClose();
    } catch (error) {
      console.error('Create customer error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const okMsg = (field, value) => value && !errors[field] && !checking[field]
    ? <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p> : null;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 550, width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Add New Customer</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: '18px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Customer Name *</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Enter customer name" value={name} onChange={e => handleNameChange(e.target.value)} autoFocus />
            {errors.name && <p className="form-err">{errors.name}</p>}
          </div>

          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Mobile</label>
              <input className={`form-input ${errors.mobile ? 'error' : ''}`} placeholder="9876543210" value={mobile} onChange={e => handleMobileChange(e.target.value)} />
              {checking.mobile && <p className="form-err" style={{ color: '#6b7280' }}>Checking mobile...</p>}
              {errors.mobile && <p className="form-err">{errors.mobile}</p>}
              {okMsg('mobile', mobile)}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="customer@example.com" value={email} onChange={e => handleEmailChange(e.target.value)} />
              {checking.email && <p className="form-err" style={{ color: '#6b7280' }}>Checking email...</p>}
              {errors.email && <p className="form-err">{errors.email}</p>}
              {okMsg('email', email)}
            </div>
          </div>

          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">GSTIN</label>
              <input className={`form-input ${errors.gstin ? 'error' : ''}`} placeholder="29AABCT1332L0Z" value={gstin} onChange={e => handleGstinChange(e.target.value)} />
              {checking.gstin && <p className="form-err" style={{ color: '#6b7280' }}>Checking GSTIN...</p>}
              {errors.gstin && <p className="form-err">{errors.gstin}</p>}
              {okMsg('gstin', gstin)}
            </div>
            <div>
              <label className="form-label">PAN</label>
              <input className={`form-input ${errors.pan ? 'error' : ''}`} placeholder="ABCDE1234F" value={pan} onChange={e => handlePanChange(e.target.value)} />
              {checking.pan && <p className="form-err" style={{ color: '#6b7280' }}>Checking PAN...</p>}
              {errors.pan && <p className="form-err">{errors.pan}</p>}
              {okMsg('pan', pan)}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Billing Address</label>
            <textarea className="form-input form-textarea" rows={2} placeholder="123 Main Street" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
          </div>

          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">City</label>
              <input className="form-input" placeholder="Chennai" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div>
              <label className="form-label">State</label>
              <select className="form-select" value={stateName} onChange={e => setStateName(e.target.value)}>
                <option value="">Select state...</option>
                {(STATES || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Pincode</label>
              <input className="form-input" placeholder="600001" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            </div>
            <div>
              <label className="form-label">Default Due Days</label>
              <input className="form-input" type="number" placeholder="15" value={defaultDueDays} onChange={e => setDefaultDueDays(e.target.value)} />
            </div>
          </div>

          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Opening Balance (Rs)</label>
              <input className="form-input" type="number" placeholder="0" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Debit Limit (Rs)</label>
              <input className="form-input" type="number" placeholder="50000" value={debitLimit} onChange={e => setDebitLimit(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-input form-textarea" rows={2} placeholder="Any notes about this customer..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: 'var(--card-bg)' }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Quick Add Vendor ── */
function QuickAddVendor({ open, onClose, onAdded, toast, refreshVendors }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [vendorType, setVendorType] = useState('third_party');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branch, setBranch] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingName, setCheckingName] = useState(false);
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  if (!open) return null;

  const checkUnique = async (field, value) => {
    if (!value) return true;
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/vendors/check-unique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ field, value })
      });
      const result = await res.json();
      return result.available !== false;
    } catch (error) {
      console.error(`Check ${field} error:`, error);
      return true;
    }
  };

  const checkVendorName = async (v) => {
    if (!v) return true;
    setCheckingName(true);
    try {
      const ok = await checkUnique('name', v);
      setErrors(prev => ({ ...prev, name: ok ? null : 'Vendor name is already taken' }));
      return ok;
    } finally { setCheckingName(false); }
  };
  const checkMobile = async (v) => {
    if (!v) return true;
    setCheckingMobile(true);
    try {
      const ok = await checkUnique('mobile', v);
      setErrors(prev => ({ ...prev, mobile: ok ? null : 'Mobile number is already registered' }));
      return ok;
    } finally { setCheckingMobile(false); }
  };
  const checkEmail = async (v) => {
    if (!v) return true;
    setCheckingEmail(true);
    try {
      const ok = await checkUnique('email', v);
      setErrors(prev => ({ ...prev, email: ok ? null : 'Email is already registered' }));
      return ok;
    } finally { setCheckingEmail(false); }
  };

  const validateMobileFormat = (num) => {
    if (num && !/^[0-9]{10}$/.test(num)) return 'Enter a valid 10-digit mobile number';
    return null;
  };
  const validateEmailFormat = (em) => {
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return 'Enter a valid email address';
    return null;
  };

  const handleNameChange = async (value) => {
    setName(value);
    if (!value.trim()) setErrors(prev => ({ ...prev, name: 'Vendor name is required' }));
    else await checkVendorName(value.trim());
  };
  const handleMobileChange = async (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 10);
    setMobile(clean);
    const fmt = validateMobileFormat(clean);
    if (fmt) setErrors(prev => ({ ...prev, mobile: fmt }));
    else if (clean) { setErrors(prev => ({ ...prev, mobile: null })); await checkMobile(clean); }
    else setErrors(prev => ({ ...prev, mobile: null }));
  };
  const handleEmailChange = async (value) => {
    setEmail(value);
    const fmt = validateEmailFormat(value);
    if (fmt) setErrors(prev => ({ ...prev, email: fmt }));
    else if (value) { setErrors(prev => ({ ...prev, email: null })); await checkEmail(value); }
    else setErrors(prev => ({ ...prev, email: null }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Vendor name is required' }));
      toast('Vendor name is required', 'error');
      return;
    }
    const mobErr = validateMobileFormat(mobile);
    const emErr = validateEmailFormat(email);
    if (mobErr) setErrors(prev => ({ ...prev, mobile: mobErr }));
    if (emErr) setErrors(prev => ({ ...prev, email: emErr }));
    if (errors.name || errors.mobile || errors.email || mobErr || emErr) {
      toast('Please fix validation errors before submitting', 'error');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    const apiData = {
      name: name.trim(),
      mobile: mobile.trim() || null,
      email: email.trim() || null,
      type: vendorType,
      gstin: gstin.trim() || null,
      address: address.trim() || null,
      bank_name: bankName.trim() || null,
      account_number: accountNumber.trim() || null,
      ifsc_code: ifscCode.trim().toUpperCase() || null,
      branch: branch.trim() || null,
      upi_id: upiId.trim() || null
    };

    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) toast(Object.values(data.errors).flat().join(', '), 'error');
        else toast(data.message || 'Failed to create vendor', 'error');
        setLoading(false);
        return;
      }
      const newVendor = data.vendor || (data.vendor_id ? { ...apiData, id: data.vendor_id } : data);
      toast(`${vendorType === 'own' ? 'My Business' : 'Third Party'} vendor created successfully`, 'success');
      if (refreshVendors) await refreshVendors();
      if (onAdded) onAdded(newVendor);
      setName(''); setMobile(''); setEmail(''); setGstin(''); setAddress('');
      setBankName(''); setAccountNumber(''); setIfscCode(''); setBranch(''); setUpiId('');
      setErrors({}); setVendorType('third_party');
      onClose();
    } catch (error) {
      console.error('Create vendor error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 550, width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Add New Vendor</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: '18px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Vendor Type *</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', border: `1px solid ${vendorType === 'own' ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: vendorType === 'own' ? 'var(--brand-bg)' : 'transparent' }}>
                <input type="radio" value="own" checked={vendorType === 'own'} onChange={(e) => setVendorType(e.target.value)} style={{ margin: 0 }} />
                <Shield size={14} color="var(--brand)" />
                <span style={{ fontSize: 13 }}>My Business</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', border: `1px solid ${vendorType === 'third_party' ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: vendorType === 'third_party' ? 'var(--brand-bg)' : 'transparent' }}>
                <input type="radio" value="third_party" checked={vendorType === 'third_party'} onChange={(e) => setVendorType(e.target.value)} style={{ margin: 0 }} />
                <ExternalLink size={14} color="var(--brand)" />
                <span style={{ fontSize: 13 }}>Third Party</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Vendor Name *</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Enter vendor name" value={name} onChange={e => handleNameChange(e.target.value)} autoFocus />
            {checkingName && <p className="form-err" style={{ color: '#6b7280' }}>Checking availability...</p>}
            {errors.name && <p className="form-err">{errors.name}</p>}
            {name && !errors.name && !checkingName && <p className="form-err" style={{ color: '#10b981' }}>✓ Name is available</p>}
          </div>

          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Mobile</label>
              <input className={`form-input ${errors.mobile ? 'error' : ''}`} placeholder="9876543210" value={mobile} onChange={e => handleMobileChange(e.target.value)} />
              {checkingMobile && <p className="form-err" style={{ color: '#6b7280' }}>Checking mobile...</p>}
              {errors.mobile && <p className="form-err">{errors.mobile}</p>}
              {mobile && !errors.mobile && !checkingMobile && <p className="form-err" style={{ color: '#10b981' }}>✓ Mobile is available</p>}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="vendor@example.com" value={email} onChange={e => handleEmailChange(e.target.value)} />
              {checkingEmail && <p className="form-err" style={{ color: '#6b7280' }}>Checking email...</p>}
              {errors.email && <p className="form-err">{errors.email}</p>}
              {email && !errors.email && !checkingEmail && <p className="form-err" style={{ color: '#10b981' }}>✓ Email is available</p>}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">GSTIN</label>
            <input className="form-input" placeholder="29AABCT1332L0Z" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Address</label>
            <textarea className="form-input form-textarea" rows={2} placeholder="123 Supplier Street, Chennai" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--brand)' }}>Bank Details</div>
            <div className="field-row field-row-2" style={{ marginBottom: 10 }}>
              <div>
                <label className="form-label">Bank Name</label>
                <input className="form-input" placeholder="HDFC Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Account Number</label>
                <input className="form-input" placeholder="1234567890" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
              </div>
            </div>
            <div className="field-row field-row-2" style={{ marginBottom: 10 }}>
              <div>
                <label className="form-label">IFSC Code</label>
                <input className="form-input" placeholder="HDFC0001234" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <input className="form-input" placeholder="Anna Nagar" value={branch} onChange={e => setBranch(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="form-label">UPI ID</label>
              <input className="form-input" placeholder="techdist@hdfc" value={upiId} onChange={e => setUpiId(e.target.value)} />
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Product Form Component ── */
function ProductForm({ onSave, onCancel, toast, vendors = [], refreshVendors }) {
  const blank = {
    type: 'product',
    name: '',
    sku: '',
    hsn_sac_code: '',
    category: '',
    selling_price: '',
    purchase_price: '',
    unit: 'Nos',
    gst_rate: 18,
    opening_stock: '',
    low_stock_alert: '',
    description: '',
    vendor_id: '',
    initial_quantity: '',
    initial_cost: '',
    purchase_date: ''
  };

  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingSku, setCheckingSku] = useState(false);
  const [skuAvailable, setSkuAvailable] = useState(true);
  const [showQuickVendor, setShowQuickVendor] = useState(false);
  const [vendorFilter, setVendorFilter] = useState('all');

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const filteredVendors = vendors.filter(v => {
    if (vendorFilter === 'all') return true;
    return v.type === vendorFilter;
  });

  const checkSku = async (sku) => {
    if (!sku || f.type !== 'product') return true;
    setCheckingSku(true);
    try {
      const token = localStorage.getItem('zetsap_token');
      const res = await fetch(`${API_BASE}/admin/products/check-unique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ field: 'sku', value: sku })
      });
      const result = await res.json();
      if (result.available === false) {
        setErr(prev => ({ ...prev, sku: 'SKU is already taken' }));
        setSkuAvailable(false);
        return false;
      }
      setErr(prev => ({ ...prev, sku: null }));
      setSkuAvailable(true);
      return true;
    } catch (error) {
      console.error('Check SKU error:', error);
      return true;
    } finally {
      setCheckingSku(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!f.name?.trim()) e.name = 'Product name is required';
    if (!f.selling_price) e.selling_price = 'Selling price is required';
    if (f.selling_price && parseFloat(f.selling_price) <= 0) e.selling_price = 'Price must be greater than 0';
    if (f.type === 'product') {
      if (!f.hsn_sac_code) e.hsn_sac_code = 'HSN code is required for products';
      if (!f.unit) e.unit = 'Unit is required';
      if (!skuAvailable) e.sku = 'SKU is already taken';
    }
    if (f.type === 'service') {
      if (!f.hsn_sac_code) e.hsn_sac_code = 'SAC code is required for services';
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (f.type === 'product' && f.sku) {
      const isUnique = await checkSku(f.sku);
      if (!isUnique) return;
    }

    setLoading(true);
    const token = localStorage.getItem('zetsap_token');

    const apiData = {
      type: f.type,
      name: f.name,
      hsn_sac_code: f.hsn_sac_code,
      selling_price: parseFloat(f.selling_price),
      unit: f.unit,
      gst_rate: parseInt(f.gst_rate),
      description: f.description || null,
      vendor_id: f.vendor_id ? parseInt(f.vendor_id) : null
    };

    if (f.type === 'product') {
      apiData.sku = f.sku || null;
      apiData.category = f.category || null;
      apiData.purchase_price = f.purchase_price ? parseFloat(f.purchase_price) : null;
      apiData.initial_quantity = f.initial_quantity ? parseInt(f.initial_quantity) : (f.opening_stock ? parseInt(f.opening_stock) : 0);
      apiData.initial_cost = f.initial_cost ? parseFloat(f.initial_cost) : (f.purchase_price ? parseFloat(f.purchase_price) : null);
      if (f.purchase_date) apiData.purchase_date = f.purchase_date;
      apiData.opening_stock = f.opening_stock ? parseInt(f.opening_stock) : 0;
      apiData.low_stock_alert = f.low_stock_alert ? parseInt(f.low_stock_alert) : null;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) toast(Object.values(data.errors).flat().join(', '), 'error');
        else toast(data.message || 'Failed to create product', 'error');
        setLoading(false);
        return;
      }
      const newProduct = data.product || (data.product_id ? { ...apiData, id: data.product_id } : data);
      onSave(newProduct);
      toast(`${f.type === 'product' ? 'Product' : 'Service'} created successfully`, 'success');
    } catch (error) {
      console.error('Create product error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorAdded = async (newVendor) => {
    if (refreshVendors) await refreshVendors();
    if (newVendor?.id) s('vendor_id', newVendor.id);
    toast('Vendor added and selected!', 'success');
  };

  const ownVendorsCount = vendors.filter(v => v.type === 'own').length;
  const thirdPartyVendorsCount = vendors.filter(v => v.type === 'third_party').length;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Type *</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" value="product" checked={f.type === 'product'} onChange={(e) => s('type', e.target.value)} />
            <span>Product</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" value="service" checked={f.type === 'service'} onChange={(e) => s('type', e.target.value)} />
            <span>Service</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Name *</label>
        <input className={`form-input ${err.name ? 'error' : ''}`} placeholder="Enter product/service name" value={f.name} onChange={e => s('name', e.target.value)} autoFocus />
        {err.name && <p className="form-err">{err.name}</p>}
      </div>

      {f.type === 'product' && (
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">SKU</label>
          <input className={`form-input ${err.sku ? 'error' : ''}`} placeholder="e.g., LAP-001" value={f.sku} onChange={e => s('sku', e.target.value.toUpperCase())} onBlur={(e) => e.target.value && checkSku(e.target.value)} />
          {checkingSku && <p className="form-err" style={{ color: '#6b7280' }}>Checking availability...</p>}
          {err.sku && <p className="form-err">{err.sku}</p>}
          {skuAvailable && f.sku && !checkingSku && !err.sku && (
            <p className="form-err" style={{ color: '#10b981' }}>
              <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> SKU is available
            </p>
          )}
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label className="form-label">{f.type === 'product' ? 'HSN Code' : 'SAC Code'} *</label>
        <input className={`form-input ${err.hsn_sac_code ? 'error' : ''}`} placeholder={f.type === 'product' ? 'e.g., 84713000' : 'e.g., 998314'} value={f.hsn_sac_code} onChange={e => s('hsn_sac_code', e.target.value)} />
        {err.hsn_sac_code && <p className="form-err">{err.hsn_sac_code}</p>}
      </div>

      {f.type === 'product' && (
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Category</label>
          <input className="form-input" placeholder="e.g., Electronics, Clothing" value={f.category} onChange={e => s('category', e.target.value)} />
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Unit *</label>
        <select className="form-select" value={f.unit} onChange={e => s('unit', e.target.value)}>
          <option value="Nos">Nos</option>
          <option value="Kg">Kg</option>
          <option value="Ltr">Ltr</option>
          <option value="Hour">Hour</option>
          <option value="Day">Day</option>
          <option value="Month">Month</option>
          <option value="Piece">Piece</option>
          <option value="Box">Box</option>
          <option value="Set">Set</option>
        </select>
      </div>

      {f.type === 'product' && (
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Vendor</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setVendorFilter('all')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: vendorFilter === 'all' ? 600 : 500, borderRadius: 8, border: `1px solid ${vendorFilter === 'all' ? 'var(--brand)' : 'var(--border)'}`, background: vendorFilter === 'all' ? 'var(--brand-bg)' : 'transparent', color: vendorFilter === 'all' ? 'var(--brand)' : 'var(--muted)', cursor: 'pointer' }}>
              All Vendors ({vendors.length})
            </button>
            <button type="button" onClick={() => setVendorFilter('own')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: vendorFilter === 'own' ? 600 : 500, borderRadius: 8, border: `1px solid ${vendorFilter === 'own' ? 'var(--brand)' : 'var(--border)'}`, background: vendorFilter === 'own' ? 'var(--brand-bg)' : 'transparent', color: vendorFilter === 'own' ? 'var(--brand)' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} /> My Business ({ownVendorsCount})
            </button>
            <button type="button" onClick={() => setVendorFilter('third_party')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: vendorFilter === 'third_party' ? 600 : 500, borderRadius: 8, border: `1px solid ${vendorFilter === 'third_party' ? 'var(--brand)' : 'var(--border)'}`, background: vendorFilter === 'third_party' ? 'var(--brand-bg)' : 'transparent', color: vendorFilter === 'third_party' ? 'var(--brand)' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLink size={14} /> Third Party ({thirdPartyVendorsCount})
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select className="form-select" style={{ flex: 1 }} value={f.vendor_id} onChange={e => s('vendor_id', e.target.value)}>
              <option value="">Select Vendor...</option>
              {filteredVendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.type === 'own' ? '🏢 ' : '🔗 '}{v.name}{v.mobile ? ` - ${v.mobile}` : ''}
                </option>
              ))}
            </select>
            <button className="btn btn-outline btn-sm" style={{ flexShrink: 0, fontSize: 12, color: 'var(--brand)', borderColor: 'var(--brand)' }} onClick={() => setShowQuickVendor(true)}>
              <User size={12} /> + Vendor
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label className="form-label">Selling Price *</label>
          <input type="number" className={`form-input ${err.selling_price ? 'error' : ''}`} placeholder="0.00" value={f.selling_price} onChange={e => s('selling_price', e.target.value)} />
          {err.selling_price && <p className="form-err">{err.selling_price}</p>}
        </div>
        {f.type === 'product' && (
          <div>
            <label className="form-label">Purchase / Cost Price</label>
            <input type="number" className="form-input" placeholder="0.00" value={f.purchase_price} onChange={e => s('purchase_price', e.target.value)} />
          </div>
        )}
      </div>

      {f.type === 'product' && (
        <>
          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Initial Quantity</label>
              <input type="number" className="form-input" placeholder="0" value={f.initial_quantity} onChange={e => s('initial_quantity', e.target.value)} />
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Opening stock quantity</p>
            </div>
            <div>
              <label className="form-label">Initial Cost</label>
              <input type="number" className="form-input" placeholder="0.00" value={f.initial_cost} onChange={e => s('initial_cost', e.target.value)} />
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Cost per unit at purchase</p>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Purchase Date</label>
            <input type="date" className="form-input" value={f.purchase_date} onChange={e => s('purchase_date', e.target.value)} style={{ maxWidth: 200 }} />
          </div>
        </>
      )}

      <div style={{ marginBottom: 14 }}>
        <label className="form-label">GST Rate (%) *</label>
        <select className="form-select" value={f.gst_rate} onChange={e => s('gst_rate', e.target.value)}>
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>
      </div>

      {f.type === 'product' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label className="form-label">Opening Stock</label>
            <input type="number" className="form-input" placeholder="0" value={f.opening_stock} onChange={e => s('opening_stock', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Low Stock Alert</label>
            <input type="number" className="form-input" placeholder="2" value={f.low_stock_alert} onChange={e => s('low_stock_alert', e.target.value)} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label className="form-label">Description</label>
        <textarea className="form-input form-textarea" rows={2} placeholder="Enter product/service description..." value={f.description} onChange={e => s('description', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : `Create ${f.type === 'product' ? 'Product' : 'Service'}`}
        </button>
      </div>

      <QuickAddVendor
        open={showQuickVendor}
        onClose={() => setShowQuickVendor(false)}
        onAdded={handleVendorAdded}
        toast={toast}
        refreshVendors={refreshVendors}
      />
    </div>
  );
}

// Stock helper
const getStock = (product) => {
  if (!product) return null;
  if (product.type && product.type !== 'product') return null;
  const raw = product.current_stock ?? product.stock ?? product.opening_stock;
  if (raw === null || raw === undefined) return null;
  const n = parseInt(raw);
  return isNaN(n) ? null : n;
};

const DRAFT_KEY = (id) => `zetsap_invoice_draft_${id || 'new'}`;

/* ── Main invoice create component ── */
function CreateInvoiceInner() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get('id') ? parseInt(params.get('id')) : null;
  const { state, addItem, editItem, toast, fmtMoney, currency } = useApp();

  const [apiCustomers, setApiCustomers] = useState([]);
  const [fetchingCustomers, setFetchingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState(null);

  const [apiProducts, setApiProducts] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  const [vendors, setVendors] = useState([]);

  // Prefixes from API (/invoice-prefixes)
  const [prefixList, setPrefixList] = useState([]);
  const [fetchingPrefixes, setFetchingPrefixes] = useState(true);

  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  const [invoiceNumberValid, setInvoiceNumberValid] = useState(true);
  const [checkingInvoiceNumber, setCheckingInvoiceNumber] = useState(false);
  const [invoiceNumberError, setInvoiceNumberError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const [stockWarnings, setStockWarnings] = useState({});

  // NEW: missing-fields modal + in-page preview modal
  const [missingFields, setMissingFields] = useState([]);
  const [showMissing, setShowMissing] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const blankForm = () => ({
    prefix: 'INV',
    seq: (state.invoices || []).length + 1,
    type: 'Regular',
    customerId: '',
    date: today(),
    dueDate: addDays(30),
    items: [{ id: 1, name: '', qty: 1, price: 0, unit: 'Nos', disc: 0, gst: 18, hsn: '' }],
    notes: '',
    terms: 'Payment due within 30 days.',
    disc: 0, adjustment: 0, roundOff: false,
    advancePaid: 0, paymentMethod: 'cash',  // NEW: initial payment
    status: 'draft', template: 'modern', logo: null,
  });

  const [form, setForm] = useState(blankForm);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiField, setAiField] = useState('notes');
  const [showSend, setShowSend] = useState(false);
  const [showQuickCust, setShowQuickCust] = useState(false);
  const [showUnsaved, setUnsaved] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);

  const restoredRef = useRef(false);

  // Draft persistence
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY(editId));
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          setForm(saved);
        }
      }
    } catch (e) {
      console.warn('Restore draft failed:', e);
    }
  }, [editId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY(editId), JSON.stringify(form));
    } catch (e) {}
  }, [form, editId]);

  const clearDraft = () => {
    try { sessionStorage.removeItem(DRAFT_KEY(editId)); } catch (e) {}
  };

  // ── Invoice number = prefix + "-" + zero-padded seq (display only) ──
  const number = `${form.prefix}-${String(form.seq || 1).padStart(6, '0')}`;

  const checkInvoiceNumber = async (invoiceNumber) => {
    if (!invoiceNumber) return true;
    setCheckingInvoiceNumber(true);
    setInvoiceNumberError(null);
    try {
      const token = localStorage.getItem('zetsap_token');
      const res = await fetch(`${API_BASE}/admin/invoices/check-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ invoice_number: invoiceNumber })
      });
      const result = await res.json();
      if (result.available === false) {
        setInvoiceNumberValid(false);
        setInvoiceNumberError(`Invoice number "${invoiceNumber}" is already taken. Please use a different number.`);
        return false;
      }
      setInvoiceNumberValid(true);
      setInvoiceNumberError(null);
      return true;
    } catch (error) {
      console.error('Check invoice number error:', error);
      return true;
    } finally {
      setCheckingInvoiceNumber(false);
    }
  };

  const getCurrentTemplateName = () => {
    const template = INVOICE_TEMPLATES.find(t => t.id === form.template);
    return template ? template.name : (form.template ? form.template.charAt(0).toUpperCase() + form.template.slice(1) : 'Modern');
  };

  /* ── Prefixes: fetch / add / edit / delete ── */
  const fetchPrefixes = async () => {
    const token = localStorage.getItem('zetsap_token');
    setFetchingPrefixes(true);
    try {
      const res = await fetch(`${API_BASE}/admin/invoice-prefixes`, { method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data.prefixes && Array.isArray(data.prefixes)) list = data.prefixes;
      else if (data.data && Array.isArray(data.data)) list = data.data;
      setPrefixList(list);
      if (list.length > 0) {
        const exists = list.some(p => p.prefix === form.prefix);
        if (!exists) {
          const def = list.find(p => p.is_default) || list[0];
          setForm(f => ({ ...f, prefix: def.prefix }));
        }
      }
      return list;
    } catch (err) {
      console.error('Fetch prefixes error:', err);
      return [];
    } finally {
      setFetchingPrefixes(false);
    }
  };

  const addPrefix = async (prefix) => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoice-prefixes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prefix })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.errors?.prefix?.[0] || data.message || 'Failed to add prefix';
        return msg;
      }
      await fetchPrefixes();
      const added = data.prefix?.prefix || prefix;
      setForm(f => ({ ...f, prefix: added }));
      setDirty(true);
      toast('Prefix added', 'success');
      return null;
    } catch (err) {
      console.error('Add prefix error:', err);
      return 'Network error. Please try again.';
    }
  };

  const editPrefix = async (id, prefix) => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoice-prefixes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prefix })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.errors?.prefix?.[0] || data.message || 'Failed to update prefix';
        return msg;
      }
      const oldPrefix = prefixList.find(p => p.id === id)?.prefix;
      await fetchPrefixes();
      if (oldPrefix && form.prefix === oldPrefix) {
        setForm(f => ({ ...f, prefix }));
      }
      toast('Prefix updated', 'success');
      return null;
    } catch (err) {
      console.error('Edit prefix error:', err);
      return 'Network error. Please try again.';
    }
  };

  const deletePrefix = async (id) => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoice-prefixes/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || 'Failed to delete prefix';
        return msg;
      }
      const removed = prefixList.find(p => p.id === id)?.prefix;
      const fresh = await fetchPrefixes();
      if (removed && form.prefix === removed && fresh.length > 0) {
        const def = fresh.find(p => p.is_default) || fresh[0];
        setForm(f => ({ ...f, prefix: def.prefix }));
      }
      toast('Prefix deleted', 'success');
      return null;
    } catch (err) {
      console.error('Delete prefix error:', err);
      return 'Network error. Please try again.';
    }
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem('zetsap_token');
    setFetchingCustomers(true);
    setCustomerError(null);
    try {
      let data = null, res = null;
      try {
        res = await fetch(`${API_BASE}/admin/customers`, { method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) data = await res.json();
        else console.warn('Customers API returned status:', res.status);
      } catch (err) { console.warn('Error fetching customers:', err); }

      let list = [];
      if (data) {
        if (Array.isArray(data)) list = data;
        else if (data.customers && Array.isArray(data.customers)) list = data.customers;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else { for (let k in data) if (Array.isArray(data[k])) { list = data[k]; break; } }
        setApiCustomers(list);
        if (list.length === 0) setCustomerError('No customers found. Please add customers first.');
      } else {
        const fb = state.customers || [];
        if (fb.length > 0) { setApiCustomers(fb); list = fb; }
        else setCustomerError('Unable to fetch customers. Please check your connection.');
      }
      return list;
    } catch (error) {
      console.error('Fetch customers error:', error);
      const fb = state.customers || [];
      if (fb.length > 0) { setApiCustomers(fb); return fb; }
      setCustomerError('Network error. Please try again.');
      return [];
    } finally {
      setFetchingCustomers(false);
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('zetsap_token');
    setFetchingProducts(true);
    setProductError(null);
    try {
      let data = null, res = null;
      try {
        res = await fetch(`${API_BASE}/admin/products`, { method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) data = await res.json();
        else console.warn('Products API returned status:', res.status);
      } catch (err) { console.warn('Error fetching products:', err); }

      if (data) {
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data.products && Array.isArray(data.products)) list = data.products;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else { for (let k in data) if (Array.isArray(data[k])) { list = data[k]; break; } }
        setApiProducts(list);
        if (list.length === 0) setProductError('No products found. Please add products first.');
      } else {
        const fb = state.products || [];
        if (fb.length > 0) setApiProducts(fb);
        else setProductError('Unable to fetch products. Please check your connection.');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      const fb = state.products || [];
      if (fb.length > 0) setApiProducts(fb);
      else setProductError('Network error. Please try again.');
    } finally {
      setFetchingProducts(false);
    }
  };

  const fetchVendors = async () => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, { method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        let list = [];
        if (data.vendors && Array.isArray(data.vendors)) list = data.vendors;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data)) list = data;
        setVendors(list);
        return list;
      }
    } catch (err) {
      console.error('Fetch vendors error:', err);
    }
    return [];
  };

  const refreshVendors = async () => { return await fetchVendors(); };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchVendors();
    fetchPrefixes();
  }, []);

  useEffect(() => {
    if (editId && !sessionStorage.getItem(DRAFT_KEY(editId))) {
      const inv = (state.invoices || []).find(i => i.id === editId);
      if (inv) setForm(inv);
    }
  }, [editId]);

  const sf = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  const displayCustomers = apiCustomers.length > 0 ? apiCustomers : (state.customers || []);
  const displayProducts = apiProducts.length > 0 ? apiProducts : (state.products || []);

  // Stock guard
  const enforceStockOnItems = (items) => {
    const warnings = {};
    const next = items.map(item => {
      if (!item.name) return item;
      const product = displayProducts.find(p => p.name === item.name);
      const stock = getStock(product);
      if (stock === null) return item;
      if (stock <= 0) {
        warnings[item.id] = `"${item.name}" is out of stock. Please purchase before billing.`;
        return { ...item, name: '', qty: 1, price: 0 };
      }
      const wanted = parseFloat(item.qty) || 0;
      if (wanted > stock) {
        warnings[item.id] = `Only ${stock} available for "${item.name}". Reduce quantity or purchase more.`;
        return { ...item, qty: stock };
      }
      return item;
    });
    setStockWarnings(warnings);
    return next;
  };

  const handleItemsChange = (v) => {
    const guarded = enforceStockOnItems(v);
    sf('items', guarded);
  };

  const getSelectableProducts = () => {
    return displayProducts.filter(product => {
      if (product.type === 'service') return true;
      const stock = getStock(product);
      return stock !== null && stock > 0;
    });
  };

  useEffect(() => {
    if (!fetchingProducts) {
      enforceStockOnItems(form.items);
    }
  }, [fetchingProducts]);

  const totals = calcDoc(form.items, form.disc);
  const adjustment = parseFloat(form.adjustment) || 0;
  const grandTotal = form.roundOff ? Math.round(totals.total + adjustment) : +(totals.total + adjustment).toFixed(2);
  const roundOffAmt = form.roundOff ? grandTotal - totals.total - adjustment : 0;
  const advancePaidNum = parseFloat(form.advancePaid) || 0;
  const balanceDue = +(grandTotal - advancePaidNum).toFixed(2);

  const hasStockProblem = () => {
    for (const item of form.items) {
      if (!item.name) continue;
      const product = displayProducts.find(p => p.name === item.name);
      const stock = getStock(product);
      if (stock === null) continue;
      if (stock <= 0) return item;
      if ((parseFloat(item.qty) || 0) > stock) return item;
    }
    return null;
  };

  const buildItemsPayload = () => form.items.filter(i => i.name?.trim()).map(item => {
    const product = displayProducts.find(p => p.name === item.name);
    return {
      product_id: product?.id || null,
      product_name: item.name,
      hsn_sac_code: item.hsn || product?.hsn_sac_code || '',
      quantity: parseFloat(item.qty) || 1,
      price: parseFloat(item.price) || 0,
      discount_percent: parseFloat(item.disc) || 0,
      gst_rate: parseFloat(item.gst) || 0,
      unit: item.unit || 'Nos'
    };
  });

  // NOTE: backend expects `prefix` (e.g. "ABC"), and `initial_payment` when amount paid > 0.
  const buildApiData = () => {
    const data = {
      prefix: form.prefix,
      customer_id: parseInt(form.customerId),
      invoice_date: form.date,
      due_date: form.dueDate || null,
      subtotal: totals.subtotal,
      gst_amount: totals.taxAmt,
      discount_amount: form.disc || 0,
      adjustment_amount: adjustment,
      round_off: form.roundOff || false,
      tds_applicable: false,
      tcs_applicable: false,
      rcm_applicable: false,
      notes: form.notes || null,
      terms_conditions: form.terms || null,
      items: buildItemsPayload()
    };
    // Only include initial_payment when an amount was actually paid (THIS is the fix)
    if (advancePaidNum > 0) {
      data.initial_payment = {
        amount: advancePaidNum,
        payment_method: form.paymentMethod || 'cash'
      };
    }
    return data;
  };

  // Collect ALL missing required fields into one list for the modal
  const collectMissing = () => {
    const miss = [];
    if (!form.prefix) miss.push('Invoice prefix');
    if (!form.customerId) miss.push('Customer (please select a customer)');
    if (!form.date) miss.push('Invoice date');
    const hasItem = form.items.some(i => i.name?.trim());
    if (!hasItem) miss.push('At least one product/service line item');
    // Items present but missing a price
    form.items.forEach((it, idx) => {
      if (it.name?.trim() && (!(parseFloat(it.price) > 0))) {
        miss.push(`Price for "${it.name}"`);
      }
    });
    // Initial payment sanity: if a method requires amount, or amount exceeds total
    if (advancePaidNum > 0 && advancePaidNum > grandTotal) {
      miss.push('Amount Paid cannot exceed the invoice total');
    }
    return miss;
  };

  const showSuccessModal = (message, redirectPath = null) => {
    setSuccessMessage(message);
    setSuccessModalOpen(true);
    if (redirectPath) {
      setTimeout(() => {
        setSuccessModalOpen(false);
        router.push(redirectPath);
      }, 2000);
    }
  };

  // Update invoice status via PATCH /admin/invoices/{id}/status
  const updateInvoiceStatus = async (id, status) => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('Status update failed:', data);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Update status error:', err);
      return false;
    }
  };

  // Single gate used by Save / Save & Send. Returns false (and opens modal) if invalid.
  const validateOrShowModal = () => {
    const miss = collectMissing();
    if (miss.length > 0) {
      setMissingFields(miss);
      setShowMissing(true);
      return false;
    }
    const stockIssue = hasStockProblem();
    if (stockIssue) {
      const product = displayProducts.find(p => p.name === stockIssue.name);
      const stock = getStock(product);
      if (stock <= 0) toast(`"${stockIssue.name}" is out of stock. Please purchase before billing.`, 'error');
      else toast(`"${stockIssue.name}" only has ${stock} in stock. Please purchase more before billing.`, 'error');
      return false;
    }
    return true;
  };

  const save = async (status = 'draft') => {
    if (!validateOrShowModal()) return;

    const isNumberValid = await checkInvoiceNumber(number);
    if (!isNumberValid) {
      toast(invoiceNumberError || 'Invoice number already exists. Change prefix or sequence.', 'error');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('zetsap_token');
    const apiData = buildApiData();
    const url = editId ? `${API_BASE}/admin/invoices/${editId}` : `${API_BASE}/admin/invoices`;
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) toast(Object.values(data.errors).flat().join(', '), 'error');
        else if (data.message) toast(data.message, 'error');
        else toast('Failed to save invoice', 'error');
        setSaving(false);
        return;
      }

      // Response: { message, invoice_id, invoice_number }
      const newId = data.invoice_id || data.id || (editId || null);
      const savedInvoice = { ...apiData, id: newId, invoice_number: data.invoice_number, status };
      if (editId) editItem('invoices', savedInvoice);
      else addItem('invoices', savedInvoice);

      if (status === 'sent' && newId) {
        await updateInvoiceStatus(newId, 'sent');
        setCreatedInvoiceId(newId);
      }

      setSaving(false);
      setDirty(false);
      clearDraft();

      if (status === 'sent') {
        setShowSend(true);
      } else {
        showSuccessModal('Invoice saved as draft successfully!', '/dashboard/sales');
      }
    } catch (error) {
      console.error('Save invoice error:', error);
      toast('Network error. Please try again.', 'error');
      setSaving(false);
    }
  };

  // PREVIEW: no API call, no save — just open the in-page preview modal.
  const handlePreview = () => {
    if (!validateOrShowModal()) return;
    setShowInvoicePreview(true);
  };

  const previewData = {
    number,
    customer: displayCustomers.find(c => String(c.id) === String(form.customerId)) || null,
    date: form.date,
    dueDate: form.dueDate,
    items: form.items,
    totals,
    disc: form.disc,
    adjustment,
    roundOffAmt,
    grandTotal,
    advancePaid: advancePaidNum,
    notes: form.notes,
    terms: form.terms,
    logo: form.logo,
    fmtMoney,
  };

  const handleProductAdded = async (newProduct) => {
    setShowProductSheet(false);
    await fetchProducts();
    toast('Product added successfully! You can now select it from the dropdown.', 'success');
  };

  const handleCustomerAdded = async (newId, formData) => {
    const list = await fetchCustomers();
    if (newId) {
      const found = (list || []).find(c => String(c.id) === String(newId));
      sf('customerId', found ? found.id : newId);
    }
  };

  const handleTemplateSelect = (templateId) => {
    sf('template', templateId);
    setSelectedTemplate(templateId);
    const template = INVOICE_TEMPLATES.find(t => t.id === templateId);
    toast(`Template changed to ${template?.name || templateId}`, 'success');
  };

  const SuccessModal = ({ open, onClose, message }) => {
    if (!open) return null;
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box modal-sm" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Check size={32} color="#10b981" />
            </div>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Success!</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>{message}</p>
          <button className="btn btn-brand" onClick={onClose} style={{ width: '100%' }}>OK</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SuccessModal open={successModalOpen} onClose={() => setSuccessModalOpen(false)} message={successMessage} />
      <MissingFieldsModal open={showMissing} onClose={() => setShowMissing(false)} missing={missingFields} />
      <InvoicePreviewModal open={showInvoicePreview} onClose={() => setShowInvoicePreview(false)} data={previewData} />

      {/* ── Sticky Topbar ── */}
      <div className="inv-topbar">
        <div className="inv-topbar-left">
          <button className="btn-icon" onClick={() => dirty ? setUnsaved(true) : router.back()}>
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)', whiteSpace: 'nowrap' }}>
            {editId ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PrefixPicker
              value={form.prefix}
              onChange={v => { sf('prefix', v); checkInvoiceNumber(`${v}-${String(form.seq || 1).padStart(6, '0')}`); }}
              prefixes={prefixList}
              loading={fetchingPrefixes}
              onAdd={addPrefix}
              onEdit={editPrefix}
              onDelete={deletePrefix}
            />
            <span style={{ fontWeight: 700, color: 'var(--muted)' }}>-</span>
            <input type="number" min="1" value={form.seq || 1}
              onChange={async e => {
                const newSeq = parseInt(e.target.value) || 1;
                sf('seq', newSeq);
                await checkInvoiceNumber(`${form.prefix}-${String(newSeq).padStart(6, '0')}`);
              }}
              style={{ width: 70, padding: '6px 8px', border: '1.5px solid var(--border)', borderRadius: 6, fontWeight: 700, fontSize: 13, textAlign: 'center', outline: 'none', fontFamily: 'Inter,sans-serif', background: 'var(--card-bg)', color: 'var(--text)' }} />
          </div>
          {invoiceNumberError && (
            <div style={{ fontSize: 10, color: '#dc2626', marginLeft: 8 }}>{invoiceNumberError}</div>
          )}
          {checkingInvoiceNumber && (
            <div style={{ fontSize: 10, color: '#6b7280', marginLeft: 8 }}>Checking...</div>
          )}
          {invoiceNumberValid && number && !checkingInvoiceNumber && !invoiceNumberError && (
            <div style={{ fontSize: 10, color: '#10b981', marginLeft: 8 }}>✓ {number} available</div>
          )}
        </div>
        <div className="inv-topbar-btns">
          <button className="btn btn-outline btn-sm" onClick={handlePreview} disabled={saving}>
            <Eye size={13} /> <span>Preview</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => save('draft')} disabled={saving}>
            <Save size={13} /> <span>{saving ? '' : 'Save as Draft'}</span>{saving && <Spin />}
          </button>
          <button className="btn btn-brand btn-sm" onClick={() => save('sent')} disabled={saving}>
            <Send size={13} /> <span>{saving ? '' : 'Save & Send'}</span>{saving && <Spin />}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="inv-body">
        {/* Left column */}
        <div className="inv-main">

          {/* Card: Logo + Customer + Dates */}
          <div className="card inv-card">
            <LogoUploader logo={form.logo} onLogoChange={v => sf('logo', v)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Type</span>
              <select className="form-select" style={{ width: 140, fontSize: 12 }} value={form.type} onChange={e => sf('type', e.target.value)}>
                {['Regular', 'Export', 'SEZ', 'Deemed Export'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="inv-field-grid">
              <div>
                <label className="form-label">Select Customer</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {fetchingCustomers ? (
                    <div className="form-select" style={{ flex: 1, background: 'var(--bg)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Loading customers...
                    </div>
                  ) : (
                    <select className="form-select" style={{ flex: 1 }} value={form.customerId} onChange={e => sf('customerId', parseInt(e.target.value) || '')}>
                      <option value="">Search customers...</option>
                      {displayCustomers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ''}</option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => setShowQuickCust(true)} className="btn btn-brand btn-sm" style={{ flexShrink: 0, fontSize: 12, whiteSpace: 'nowrap' }}>
                    + Add Customer
                  </button>
                </div>
                {customerError && !fetchingCustomers && (
                  <div style={{ fontSize: 11, color: '#dc2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={12} />
                    {customerError}
                    <button onClick={fetchCustomers} style={{ color: 'var(--brand)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">Invoice Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => sf('date', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="form-label">Due Date <span style={{ color: 'var(--muted)', fontSize: 11 }}>(optional)</span></label>
              <input className="form-input" type="date" value={form.dueDate || ''} onChange={e => sf('dueDate', e.target.value)} style={{ maxWidth: 220 }} />
            </div>
          </div>

          {/* Card: Line Items */}
          <div className="card inv-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Products & Services</h3>
              <button onClick={() => setShowProductSheet(true)} className="btn btn-brand btn-sm" style={{ fontSize: 12 }}>
                <Plus size={12} /> Add Product
              </button>
            </div>
            {fetchingProducts && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                <div style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Loading products...</span>
              </div>
            )}
            {productError && !fetchingProducts && (
              <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 12, padding: '8px 12px', background: '#fee2e2', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={12} />
                {productError}
                <button onClick={fetchProducts} style={{ color: 'var(--brand)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
              </div>
            )}

            {Object.keys(stockWarnings).length > 0 && (
              <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(stockWarnings).map(([rowId, msg]) => (
                  <div key={rowId} style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={13} /> {msg}
                    </span>
                    <Link href="/dashboard/create/purchase" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Go to Purchase →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <LineItems
                items={form.items}
                onChange={handleItemsChange}
                products={getSelectableProducts()}
                advancePaid={form.advancePaid}
                onAdvancePaidChange={v => sf('advancePaid', v)}
                currency={currency}
              />
            </div>
          </div>

          {/* Card: Notes + Terms */}
          <div className="card inv-card">
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Notes, terms & more</h3>
            <div className="inv-field-grid">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label className="form-label" style={{ margin: 0 }}>Notes</label>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--brand)', gap: 4, padding: '3px 8px' }} onClick={() => { setAiField('notes'); setShowAI(true); }}>
                    <Sparkles size={11} /> AI
                  </button>
                </div>
                <textarea className="form-input form-textarea" rows={3} placeholder="Thank you for your business..." value={form.notes} onChange={e => sf('notes', e.target.value)} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label className="form-label" style={{ margin: 0 }}>Terms & Conditions</label>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--brand)', gap: 4, padding: '3px 8px' }} onClick={() => { setAiField('invoice'); setShowAI(true); }}>
                    <Sparkles size={11} /> AI
                  </button>
                </div>
                <textarea className="form-input form-textarea" rows={3} value={form.terms} onChange={e => sf('terms', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--bg)', borderRadius: 9, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Additional Settings</div>
              <div className="inv-field-grid">
                <div>
                  <label className="form-label">Discount (Rs) on all items</label>
                  <input className="form-input" type="number" min="0" value={form.disc} onChange={e => sf('disc', Math.max(0, parseInt(e.target.value) || 0))} placeholder="0" />
                </div>
                <div>
                  <label className="form-label">Adjustment Amount (Rs)</label>
                  <input className="form-input" type="number" step="0.01" value={form.adjustment} onChange={e => sf('adjustment', e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={'tog-track' + (form.roundOff ? ' on' : '')} onClick={() => sf('roundOff', !form.roundOff)}><div className="tog-thumb" /></div>
                <label style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => sf('roundOff', !form.roundOff)}>
                  Round off total to nearest whole number
                </label>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="form-label">Attach Files</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
                <Paperclip size={14} /> Click to upload or drag a file here
                <input type="file" style={{ display: 'none' }} multiple accept=".pdf,.jpg,.png,.xlsx" />
              </label>
            </div>

            <div style={{ marginTop: 20, padding: '18px', background: 'var(--brand-bg)', borderRadius: 10, border: '1px solid var(--brand)', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--brand)', marginBottom: 6 }}>Want to see how it looks?</div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>Preview your invoice with the selected template. This will NOT save it.</p>
              <button className="btn btn-brand" style={{ justifyContent: 'center', padding: '10px 28px', fontSize: 14, width: '100%' }} onClick={handlePreview} disabled={saving}>
                <Eye size={15} /> Preview Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Right column — Summary */}
        <div className="inv-sidebar">
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Summary</h3>
            {[['Subtotal', fmtMoney(totals.subtotal)], ['GST', fmtMoney(totals.taxAmt)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>{l}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            {form.disc > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Discount</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>-{fmtMoney(form.disc)}</span>
              </div>
            )}
            {adjustment !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Adjustment</span>
                <span style={{ fontWeight: 600 }}>{adjustment < 0 ? '-' : '+'}{fmtMoney(Math.abs(adjustment))}</span>
              </div>
            )}
            {form.roundOff && roundOffAmt !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Round Off</span>
                <span style={{ fontWeight: 600 }}>{roundOffAmt > 0 ? '+' : ''}{fmtMoney(roundOffAmt)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid var(--border)', fontSize: 16, fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: 'var(--brand)' }}>{fmtMoney(grandTotal)}</span>
            </div>

            {/* ── Initial Payment (Amount Paid + Method) ── */}
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg)', borderRadius: 9, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                Initial Payment <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Amount Paid</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.advancePaid}
                  onChange={e => sf('advancePaid', e.target.value)} />
              </div>
              {advancePaidNum > 0 && (
                <div style={{ marginBottom: 4 }}>
                  <label className="form-label" style={{ fontSize: 11 }}>Payment Method</label>
                  <select className="form-select" value={form.paymentMethod} onChange={e => sf('paymentMethod', e.target.value)}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              )}
              {advancePaidNum > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border)', fontSize: 13.5, fontWeight: 700 }}>
                  <span>Balance Due</span>
                  <span style={{ color: balanceDue > 0 ? '#dc2626' : '#10b981' }}>{fmtMoney(balanceDue)}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-brand" style={{ width: '100%', justifyContent: 'center' }} onClick={() => save('sent')} disabled={saving}>
                <Send size={14} /> Save & Send
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => save('draft')} disabled={saving}>
                <Save size={14} /> Save as Draft
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--brand)' }} onClick={handlePreview} disabled={saving}>
                <Eye size={14} /> Preview (no save)
              </button>
            </div>

            <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Invoice Template</label>
                <button onClick={() => setShowTemplatePreview(true)} className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--brand)', gap: 4 }}>
                  <FileText size={12} /> View All ({INVOICE_TEMPLATES.length})
                </button>
              </div>
              <div onClick={() => setShowTemplatePreview(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--brand-bg)', border: '1px solid var(--brand)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={14} color="var(--brand)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>{getCurrentTemplateName()} Template</span>
                </div>
                <ChevronRight size={14} color="var(--brand)" />
              </div>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>Click to browse and change invoice template</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UnsavedModal open={showUnsaved} onDiscard={() => { setUnsaved(false); setDirty(false); clearDraft(); router.back(); }} onSave={() => { setUnsaved(false); save(); }} />
      <QuickAddCustomer open={showQuickCust} onClose={() => setShowQuickCust(false)} onAdded={handleCustomerAdded} toast={toast} />
      <AIModal open={showAI} onClose={() => setShowAI(false)} context={aiField} onUse={text => { aiField === 'notes' ? sf('notes', text) : sf('terms', text); }} />
      <SendModal open={showSend} onClose={() => { setShowSend(false); clearDraft(); router.push('/dashboard/sales'); }} onSend={() => { toast('Invoice sent!', 'success'); clearDraft(); router.push('/dashboard/sales'); }} />

      {/* Product Sheet */}
      <Sheet open={showProductSheet} onClose={() => setShowProductSheet(false)} title="Add Product / Service" size="md">
        <ProductForm
          onSave={handleProductAdded}
          onCancel={() => setShowProductSheet(false)}
          toast={toast}
          vendors={vendors}
          refreshVendors={refreshVendors}
        />
      </Sheet>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        open={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        template={form.template}
        onSelect={handleTemplateSelect}
        templates={INVOICE_TEMPLATES}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .field-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .field-row-2 { grid-template-columns: 1fr; } }

        .inv-topbar {
          background: var(--card-bg);
          border-bottom: 1px solid var(--border);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          position: sticky;
          top: var(--topbar-h);
          z-index: 50;
          flex-wrap: wrap;
        }
        .inv-topbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; min-width: 0; }
        .inv-topbar-btns { display: flex; gap: 8px; flex-shrink: 0; }
        .inv-body {
          display: grid;
          grid-template-columns: minmax(0,1fr) 280px;
          gap: 20px;
          padding: 16px;
          max-width: 1280px;
          margin: 0 auto;
          align-items: start;
        }
        .inv-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .inv-card { padding: 20px; }
        .inv-sidebar { position: sticky; top: calc(var(--banner-h) + var(--topbar-h) + 52px); }
        .inv-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        @media (max-width: 1024px) { .inv-body { grid-template-columns: minmax(0,1fr) 260px; } }
        @media (max-width: 768px) {
          .inv-topbar { padding: 8px 10px; row-gap: 8px; }
          .inv-topbar-btns { width: 100%; }
          .inv-topbar-btns .btn { flex: 1; justify-content: center; }
          .inv-body { grid-template-columns: 1fr !important; padding: 10px !important; gap: 12px !important; }
          .inv-card { padding: 14px !important; }
          .inv-sidebar { position: static !important; }
          .inv-field-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .inv-topbar-left { gap: 6px; }
          h1[style] { font-size: 15px !important; }
        }
      `}</style>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)' }}>
        Loading...
      </div>
    }>
      <CreateInvoiceInner />
    </Suspense>
  );
}