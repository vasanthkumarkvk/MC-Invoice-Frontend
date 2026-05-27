'use client';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Save, Send, Sparkles, Plus, Minus, X,
  User, Upload, Check, AlertCircle, RefreshCw,
  Shield, ExternalLink, Package, Tag, CheckCircle2
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { calcDoc, today, addDays } from '@/lib/data';
import { UnsavedModal } from '@/components/Modal';
import AIModal from '@/components/AIModal';
import Sheet from '@/components/Sheet';

const API_BASE = 'https://api.crazystory.in/api';

/* ═══════════════════════════════════════════════════════
   HELPER — Spinner
═══════════════════════════════════════════════════════ */
const Spin = ({ white = true }) => (
  <span style={{
    width: 14, height: 14,
    border: `2px solid ${white ? 'rgba(255,255,255,0.3)' : 'var(--border)'}`,
    borderTopColor: white ? '#fff' : 'var(--brand)',
    borderRadius: '50%', display: 'inline-block',
    animation: 'spin 0.8s linear infinite', flexShrink: 0
  }} />
);

/* ═══════════════════════════════════════════════════════
   SUCCESS MODAL
═══════════════════════════════════════════════════════ */
function SuccessModal({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '36px 32px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <CheckCircle2 size={32} color="#059669" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, color: 'var(--text)' }}>Saved Successfully!</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>{message}</div>
        <button className="btn btn-brand" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '10px 0' }} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   QUICK ADD CUSTOMER (Sheet)
   Uniqueness check: mobile, email, gstin, pan
═══════════════════════════════════════════════════════ */
function QuickAddCustomerSheet({ onSaved, onCancel, toast }) {
  const blank = { name: '', mobile: '', email: '', gstin: '', pan: '', address: '', city: '', state: '', pincode: '' };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [checking, setChecking] = useState({});
  const [loading, setLoading] = useState(false);

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setE = (k, v) => setErr(p => ({ ...p, [k]: v }));
  const setC = (k, v) => setChecking(p => ({ ...p, [k]: v }));

  const checkUnique = async (field, value) => {
    if (!value) return true;
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/customers/check-unique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ field, value })
      });
      const data = await res.json();
      return data.available !== false;
    } catch { return true; }
  };

  const runCheck = async (field, value, label) => {
    setC(field, true);
    try {
      const ok = await checkUnique(field, value);
      setE(field, ok ? null : `${label} already registered`);
      return ok;
    } finally { setC(field, false); }
  };

  const validateMobile = v => v && !/^[0-9]{10}$/.test(v) ? 'Enter 10-digit number' : null;
  const validateEmail = v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter valid email' : null;
  const validateGstin = v => v && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) ? 'Enter valid GSTIN (15 chars)' : null;
  const validatePan = v => v && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) ? 'Enter valid PAN (10 chars)' : null;

  const handleMobile = async v => {
    const c = v.replace(/\D/g, '').slice(0, 10); s('mobile', c);
    const fe = validateMobile(c);
    if (fe) { setE('mobile', fe); return; }
    setE('mobile', null);
    if (c.length === 10) await runCheck('mobile', c, 'Mobile');
  };

  const handleEmail = async v => {
    s('email', v);
    const fe = validateEmail(v);
    if (fe) { setE('email', fe); return; }
    setE('email', null);
    if (v) await runCheck('email', v, 'Email');
  };

  const handleGstin = async v => {
    const up = v.toUpperCase(); s('gstin', up);
    const fe = validateGstin(up);
    if (fe) { setE('gstin', fe); return; }
    setE('gstin', null);
    if (up.length === 15) await runCheck('gstin', up, 'GSTIN');
  };

  const handlePan = async v => {
    const up = v.toUpperCase(); s('pan', up);
    const fe = validatePan(up);
    if (fe) { setE('pan', fe); return; }
    setE('pan', null);
    if (up.length === 10) await runCheck('pan', up, 'PAN');
  };

  const handleSubmit = async () => {
    if (!f.name.trim()) { setE('name', 'Name is required'); toast('Customer name is required', 'error'); return; }
    const mfe = validateMobile(f.mobile), efe = validateEmail(f.email);
    const gfe = validateGstin(f.gstin), pfe = validatePan(f.pan);
    if (mfe) setE('mobile', mfe);
    if (efe) setE('email', efe);
    if (gfe) setE('gstin', gfe);
    if (pfe) setE('pan', pfe);
    if (err.name || err.mobile || err.email || err.gstin || err.pan || mfe || efe || gfe || pfe) {
      toast('Fix validation errors first', 'error'); return;
    }
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: f.name.trim(), mobile: f.mobile || null, email: f.email || null,
          gstin: f.gstin || null, pan: f.pan || null,
          address: f.address || null, city: f.city || null, state: f.state || null, pincode: f.pincode || null
        })
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || 'Failed to create customer', 'error'); return; }
      const newCust = data.customer || (data.customer_id ? { ...f, id: data.customer_id } : data);
      toast('Customer created!', 'success');
      setF(blank); setErr({});
      onSaved(newCust);
    } catch { toast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  const Field = ({ label, k, placeholder, type = 'text', checking: chk, err: e, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label className="form-label">{label}</label>
      {children || <input className={`form-input ${e ? 'error' : ''}`} type={type} placeholder={placeholder} value={f[k]} onChange={ev => s(k, ev.target.value)} />}
      {chk && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
      {e && <p className="form-err">{e}</p>}
      {!chk && !e && f[k] && ['mobile', 'email', 'gstin', 'pan'].includes(k) && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Customer Name *</label>
          <input className={`form-input ${err.name ? 'error' : ''}`} placeholder="e.g. Ravi Kumar" value={f.name} onChange={e => s('name', e.target.value)} autoFocus />
          {err.name && <p className="form-err">{err.name}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label className="form-label">Mobile</label>
            <input className={`form-input ${err.mobile ? 'error' : ''}`} placeholder="9876543210" value={f.mobile} onChange={e => handleMobile(e.target.value)} />
            {checking.mobile && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {err.mobile && <p className="form-err">{err.mobile}</p>}
            {!checking.mobile && !err.mobile && f.mobile?.length === 10 && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className={`form-input ${err.email ? 'error' : ''}`} type="email" placeholder="ravi@example.com" value={f.email} onChange={e => handleEmail(e.target.value)} />
            {checking.email && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {err.email && <p className="form-err">{err.email}</p>}
            {!checking.email && !err.email && f.email && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label className="form-label">GSTIN</label>
            <input className={`form-input ${err.gstin ? 'error' : ''}`} placeholder="29AABCT1332L0Z" value={f.gstin} onChange={e => handleGstin(e.target.value)} />
            {checking.gstin && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {err.gstin && <p className="form-err">{err.gstin}</p>}
            {!checking.gstin && !err.gstin && f.gstin?.length === 15 && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
          </div>
          <div>
            <label className="form-label">PAN</label>
            <input className={`form-input ${err.pan ? 'error' : ''}`} placeholder="ABCDE1234F" value={f.pan} onChange={e => handlePan(e.target.value)} />
            {checking.pan && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {err.pan && <p className="form-err">{err.pan}</p>}
            {!checking.pan && !err.pan && f.pan?.length === 10 && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Address</label>
          <textarea className="form-input form-textarea" rows={2} placeholder="123 Main Street..." value={f.address} onChange={e => s('address', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[['city', 'City', 'Chennai'], ['state', 'State', 'Tamil Nadu'], ['pincode', 'Pincode', '600001']].map(([k, lbl, ph]) => (
            <div key={k}>
              <label className="form-label">{lbl}</label>
              <input className="form-input" placeholder={ph} value={f[k]} onChange={e => s(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--card-bg)' }}>
        <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spin /> Creating...</> : 'Create Customer'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   QUICK ADD VENDOR (Sheet — opened from inside Product Sheet)
   Uniqueness check: mobile, email, gstin
═══════════════════════════════════════════════════════ */
function QuickAddVendorSheet({ onSaved, onCancel, toast }) {
  const [f, setF] = useState({ name: '', mobile: '', email: '', gstin: '', vendorType: 'third_party', address: '', bankName: '', accountNumber: '', ifscCode: '', branch: '', upiId: '' });
  const [err, setErr] = useState({});
  const [checking, setChecking] = useState({});
  const [loading, setLoading] = useState(false);

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setE = (k, v) => setErr(p => ({ ...p, [k]: v }));

  const checkUnique = async (field, value) => {
    if (!value) return true;
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/vendors/check-unique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ field, value })
      });
      const data = await res.json();
      return data.available !== false;
    } catch { return true; }
  };

  const runCheck = async (field, value, label) => {
    setChecking(p => ({ ...p, [field]: true }));
    try {
      const ok = await checkUnique(field, value);
      setE(field, ok ? null : `${label} already registered`);
      return ok;
    } finally { setChecking(p => ({ ...p, [field]: false })); }
  };

  const validateMobile = v => v && !/^[0-9]{10}$/.test(v) ? 'Enter 10-digit number' : null;
  const validateEmail = v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter valid email' : null;
  const validateGstin = v => v && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) ? 'Enter valid GSTIN (15 chars)' : null;

  const handleMobile = async v => {
    const c = v.replace(/\D/g, '').slice(0, 10); s('mobile', c);
    const fe = validateMobile(c); if (fe) { setE('mobile', fe); return; }
    setE('mobile', null); if (c.length === 10) await runCheck('mobile', c, 'Mobile');
  };
  const handleEmail = async v => {
    s('email', v); const fe = validateEmail(v); if (fe) { setE('email', fe); return; }
    setE('email', null); if (v) await runCheck('email', v, 'Email');
  };
  const handleGstin = async v => {
    const up = v.toUpperCase(); s('gstin', up); const fe = validateGstin(up); if (fe) { setE('gstin', fe); return; }
    setE('gstin', null); if (up.length === 15) await runCheck('gstin', up, 'GSTIN');
  };

  const handleSubmit = async () => {
    if (!f.name.trim()) { setE('name', 'Required'); toast('Vendor name is required', 'error'); return; }
    if (err.name || err.mobile || err.email || err.gstin) { toast('Fix errors first', 'error'); return; }
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: f.name.trim(), mobile: f.mobile || null, email: f.email || null,
          type: f.vendorType, gstin: f.gstin || null, address: f.address || null,
          bank_name: f.bankName || null, account_number: f.accountNumber || null,
          ifsc_code: f.ifscCode.toUpperCase() || null, branch: f.branch || null, upi_id: f.upiId || null
        })
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || 'Failed to create vendor', 'error'); return; }
      const nv = data.vendor || (data.vendor_id ? { ...f, id: data.vendor_id } : data);
      toast('Vendor created!', 'success');
      onSaved(nv);
    } catch { toast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        {/* Vendor type */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Vendor Type *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['own', 'My Business', Shield], ['third_party', 'Third Party', ExternalLink]].map(([val, lbl, Icon]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '9px 14px', border: `1.5px solid ${f.vendorType === val ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: f.vendorType === val ? 'var(--brand-bg)' : 'transparent', flex: 1, justifyContent: 'center' }}>
                <input type="radio" value={val} checked={f.vendorType === val} onChange={e => s('vendorType', e.target.value)} style={{ margin: 0 }} />
                <Icon size={13} color="var(--brand)" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{lbl}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Vendor Name *</label>
          <input className={`form-input ${err.name ? 'error' : ''}`} placeholder="Enter vendor name" value={f.name} onChange={e => s('name', e.target.value)} autoFocus />
          {err.name && <p className="form-err">{err.name}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {[['mobile', 'Mobile', '9876543210', handleMobile], ['email', 'Email', 'vendor@example.com', handleEmail]].map(([k, lbl, ph, handler]) => (
            <div key={k}>
              <label className="form-label">{lbl}</label>
              <input className={`form-input ${err[k] ? 'error' : ''}`} placeholder={ph} value={f[k]} onChange={e => handler(e.target.value)} />
              {checking[k] && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
              {err[k] && <p className="form-err">{err[k]}</p>}
              {!checking[k] && !err[k] && f[k] && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">GSTIN</label>
          <input className={`form-input ${err.gstin ? 'error' : ''}`} placeholder="29AABCT1332L0Z" value={f.gstin} onChange={e => handleGstin(e.target.value)} />
          {checking.gstin && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
          {err.gstin && <p className="form-err">{err.gstin}</p>}
          {!checking.gstin && !err.gstin && f.gstin?.length === 15 && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Address</label>
          <textarea className="form-input form-textarea" rows={2} value={f.address} onChange={e => s('address', e.target.value)} placeholder="123 Supplier Street, Chennai" />
        </div>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bank Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[['bankName', 'Bank Name', 'HDFC Bank'], ['accountNumber', 'Account No.', '1234567890']].map(([k, lbl, ph]) => (
            <div key={k}><label className="form-label">{lbl}</label><input className="form-input" placeholder={ph} value={f[k]} onChange={e => s(k, e.target.value)} /></div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[['ifscCode', 'IFSC', 'HDFC0001234'], ['branch', 'Branch', 'Anna Nagar']].map(([k, lbl, ph]) => (
            <div key={k}><label className="form-label">{lbl}</label><input className="form-input" placeholder={ph} value={f[k]} onChange={e => s(k, k === 'ifscCode' ? e.target.value.toUpperCase() : e.target.value)} /></div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">UPI ID</label>
          <input className="form-input" placeholder="vendor@hdfc" value={f.upiId} onChange={e => s('upiId', e.target.value)} />
        </div>
      </div>
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--card-bg)' }}>
        <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spin /> Creating...</> : 'Create Vendor'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   QUICK ADD PRODUCT (Sheet)
   Same as products page ProductForm — with vendor filter tabs
═══════════════════════════════════════════════════════ */
function QuickAddProductSheet({ onSaved, onCancel, toast, vendors = [], onNeedVendor }) {
  const blank = { type: 'product', name: '', sku: '', hsn_sac_code: '', category: '', selling_price: '', purchase_price: '', unit: 'Nos', gst_rate: 18, opening_stock: '', low_stock_alert: '', description: '', vendor_id: '' };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingSku, setCheckingSku] = useState(false);
  const [skuAvailable, setSkuAvailable] = useState(true);
  const [vendorFilter, setVendorFilter] = useState('all');

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const filteredVendors = vendors.filter(v => vendorFilter === 'all' ? true : v.type === vendorFilter);

  const checkSku = async sku => {
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
      if (result.available === false) { setErr(p => ({ ...p, sku: 'SKU already taken' })); setSkuAvailable(false); return false; }
      setErr(p => ({ ...p, sku: null })); setSkuAvailable(true); return true;
    } catch { return true; }
    finally { setCheckingSku(false); }
  };

  const validate = () => {
    const e = {};
    if (!f.name?.trim()) e.name = 'Name is required';
    if (!f.selling_price) e.selling_price = 'Selling price is required';
    if (f.selling_price && parseFloat(f.selling_price) <= 0) e.selling_price = 'Price must be > 0';
    if (!f.hsn_sac_code) e.hsn_sac_code = `${f.type === 'product' ? 'HSN' : 'SAC'} code required`;
    if (f.type === 'product' && !f.unit) e.unit = 'Unit required';
    if (!skuAvailable) e.sku = 'SKU already taken';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (f.type === 'product' && f.sku) { const ok = await checkSku(f.sku); if (!ok) return; }
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    const apiData = {
      type: f.type, name: f.name, hsn_sac_code: f.hsn_sac_code,
      selling_price: parseFloat(f.selling_price), unit: f.unit,
      gst_rate: f.gst_rate === '' ? null : parseInt(f.gst_rate),
      description: f.description || null,
      vendor_id: f.vendor_id ? parseInt(f.vendor_id) : null,
      sku: f.sku || null, category: f.category || null,
      purchase_price: f.purchase_price ? parseFloat(f.purchase_price) : null,
      initial_quantity: f.opening_stock ? parseInt(f.opening_stock) : 0,
      initial_cost: f.purchase_price ? parseFloat(f.purchase_price) : null,
      opening_stock: f.opening_stock ? parseInt(f.opening_stock) : 0,
      low_stock_alert: f.low_stock_alert ? parseInt(f.low_stock_alert) : null,
    };
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const result = await res.json();
      if (!res.ok) {
        toast(result.errors ? Object.values(result.errors).flat().join(', ') : result.message || 'Failed', 'error');
        return;
      }
      const saved = result.product || (result.product_id ? { ...apiData, id: result.product_id } : result);
      toast('Product created!', 'success');
      setF(blank); setErr({}); setSkuAvailable(true);
      onSaved(saved);
    } catch { toast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        {/* Type toggle */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Type *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['product', 'Product', Package], ['service', 'Service', Tag]].map(([val, lbl, Icon]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '9px 14px', border: `1.5px solid ${f.type === val ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: f.type === val ? 'var(--brand-bg)' : 'transparent', flex: 1, justifyContent: 'center' }}>
                <input type="radio" value={val} checked={f.type === val} onChange={e => s('type', e.target.value)} style={{ margin: 0 }} />
                <Icon size={13} color="var(--brand)" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{lbl}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Name *</label>
          <input className={`form-input ${err.name ? 'error' : ''}`} placeholder="Product / service name" value={f.name} onChange={e => s('name', e.target.value)} autoFocus />
          {err.name && <p className="form-err">{err.name}</p>}
        </div>
        {f.type === 'product' && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">SKU</label>
            <input className={`form-input ${err.sku ? 'error' : ''}`} placeholder="LAP-001" value={f.sku} onChange={e => s('sku', e.target.value.toUpperCase())} onBlur={e => e.target.value && checkSku(e.target.value)} />
            {checkingSku && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {err.sku && <p className="form-err">{err.sku}</p>}
            {skuAvailable && f.sku && !checkingSku && !err.sku && <p className="form-err" style={{ color: '#10b981' }}><Check size={11} style={{ display: 'inline', marginRight: 3 }} />Available</p>}
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">{f.type === 'product' ? 'HSN Code' : 'SAC Code'} *</label>
          <input className={`form-input ${err.hsn_sac_code ? 'error' : ''}`} placeholder={f.type === 'product' ? '84713000' : '998314'} value={f.hsn_sac_code} onChange={e => s('hsn_sac_code', e.target.value)} />
          {err.hsn_sac_code && <p className="form-err">{err.hsn_sac_code}</p>}
        </div>
        {f.type === 'product' && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Category</label>
            <input className="form-input" placeholder="Electronics, Clothing..." value={f.category} onChange={e => s('category', e.target.value)} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Unit *</label>
          <select className="form-select" value={f.unit} onChange={e => s('unit', e.target.value)}>
            {['Nos', 'Kg', 'Ltr', 'Hour', 'Day', 'Month', 'Piece', 'Box', 'Set'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        {f.type === 'product' && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Vendor</label>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {[['all', `All (${vendors.length})`], ['own', `My Business (${vendors.filter(v => v.type === 'own').length})`], ['third_party', `Third Party (${vendors.filter(v => v.type === 'third_party').length})`]].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => setVendorFilter(val)} style={{ padding: '5px 12px', fontSize: 12, fontWeight: vendorFilter === val ? 600 : 500, borderRadius: 6, border: `1px solid ${vendorFilter === val ? 'var(--brand)' : 'var(--border)'}`, background: vendorFilter === val ? 'var(--brand-bg)' : 'transparent', color: vendorFilter === val ? 'var(--brand)' : 'var(--muted)', cursor: 'pointer' }}>{lbl}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <select className="form-select" style={{ flex: 1 }} value={f.vendor_id} onChange={e => s('vendor_id', e.target.value)}>
                <option value="">Select Vendor...</option>
                {filteredVendors.map(v => <option key={v.id} value={v.id}>{v.type === 'own' ? '🏢 ' : '🔗 '}{v.name}{v.mobile ? ` - ${v.mobile}` : ''}</option>)}
              </select>
              <button className="btn btn-outline btn-sm" style={{ flexShrink: 0, fontSize: 12, color: 'var(--brand)', borderColor: 'var(--brand)' }} onClick={onNeedVendor}>
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
              <label className="form-label">Purchase Price</label>
              <input type="number" className="form-input" placeholder="0.00" value={f.purchase_price} onChange={e => s('purchase_price', e.target.value)} />
            </div>
          )}
        </div>
        {f.type === 'product' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label className="form-label">Opening Stock</label><input type="number" className="form-input" placeholder="0" value={f.opening_stock} onChange={e => s('opening_stock', e.target.value)} /></div>
            <div><label className="form-label">Low Stock Alert</label><input type="number" className="form-input" placeholder="2" value={f.low_stock_alert} onChange={e => s('low_stock_alert', e.target.value)} /></div>
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">GST Rate (%)</label>
          <select className="form-select" value={f.gst_rate} onChange={e => s('gst_rate', e.target.value)}>
            <option value="">Not applicable</option>
            {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Description</label>
          <textarea className="form-input form-textarea" rows={2} value={f.description} onChange={e => s('description', e.target.value)} placeholder="Optional description..." />
        </div>
      </div>
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--card-bg)' }}>
        <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spin /> Creating...</> : `Create ${f.type === 'product' ? 'Product' : 'Service'}`}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AI QUOTATION UPLOAD MODAL
═══════════════════════════════════════════════════════ */
function AIQuotationModal({ open, onClose, onConfirm }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(null);
  const inputRef = useRef(null);

  if (!open) return null;

  const handleAnalyse = async () => {
    if (!file) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setItems([
      { name: 'Product A', qty: 10, price: 500, unit: 'Nos', disc: 0, gst: 18, hsn: '8471', id: 1 },
      { name: 'Service B', qty: 2, price: 2500, unit: 'Hr', disc: 5, gst: 18, hsn: '998314', id: 2 },
    ]);
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-xl" style={{ maxHeight: '85vh', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} color="var(--brand)" />
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--brand)' }}>Create Quotation with AI</span>
            <span style={{ fontSize: 9, background: '#bfdbfe', color: '#1e40af', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>BETA</span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {!items ? (
          <div style={{ padding: 24 }}>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? 'var(--brand)' : '#d1d5db'}`, borderRadius: 12, padding: '60px 32px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--brand-bg)' : 'var(--bg)', transition: 'all 0.18s', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={28} color="var(--brand)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>
                  Drop your <span style={{ color: 'var(--brand)' }}>PDF, Image, CSV or Excel</span> here
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>AI will extract items automatically</div>
              </div>
              {file && <div style={{ background: '#d1fae5', color: '#065f46', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{file.name}</div>}
              <button className="btn btn-outline" style={{ marginTop: 4 }}>Select File</button>
              <input ref={inputRef} type="file" style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" onChange={e => setFile(e.target.files?.[0])} />
            </div>
          </div>
        ) : (
          <div style={{ padding: 20, overflowY: 'auto' }}>
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#d1fae5', borderRadius: 8, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
              ✨ AI extracted {items.length} items from your file
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr><th></th><th>Product Name</th><th>Qty</th><th>Unit Price</th><th>GST</th><th>Discount</th><th>Net Amt</th></tr></thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ background: '#f0fdf4' }}>
                      <td><button className="btn-icon" onClick={() => setItems(p => p.filter((_, j) => j !== i))}><X size={13} color="#dc2626" /></button></td>
                      <td><span style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</span></td>
                      <td>{item.qty}</td>
                      <td>₹{item.price.toFixed(2)}</td>
                      <td>{item.gst}%</td>
                      <td>{item.disc}%</td>
                      <td>₹{(item.price * item.qty * (1 - item.disc / 100)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          {!items ? (
            <button className="btn btn-brand" onClick={handleAnalyse} disabled={!file || loading}>
              {loading ? <><Spin /> Analysing…</> : 'Analyse'}
            </button>
          ) : (
            <button className="btn btn-brand" onClick={() => { onConfirm(items); onClose(); }}>
              <Plus size={14} /> Add to Quotation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   QUOTATION LINE ITEMS TABLE
   Matches the API: product_id, product_name, quantity, price, discount_percent, gst_rate
═══════════════════════════════════════════════════════ */
function QuotationLineItems({ items, onChange, products, fmtMoney }) {
  const updateItem = (index, key, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [key]: value };
      if (key === 'product_id') {
        const prod = products.find(p => p.id === parseInt(value));
        if (prod) {
          newItem.product_name = prod.name;
          newItem.price = prod.selling_price || 0;
          newItem.gst_rate = prod.gst_rate ?? 18;
          newItem.hsn_sac_code = prod.hsn_sac_code || '';
          newItem.unit = prod.unit || 'Nos';
        } else {
          newItem.product_name = '';
        }
      }
      return newItem;
    });
    onChange(updated);
  };

  const lineTotal = item => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const disc = parseFloat(item.discount_percent) || 0;
    return qty * price * (1 - disc / 100);
  };

  const grandTotal = items.reduce((s, i) => s + lineTotal(i), 0);

  return (
    <div>
      {/* Desktop header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px,2.5fr) 70px 110px 80px 70px 90px 36px', gap: 8, padding: '0 0 8px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span>Product / Service</span>
        <span>Qty</span>
        <span>Price</span>
        <span>Disc %</span>
        <span>GST %</span>
        <span style={{ textAlign: 'right' }}>Total</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(160px,2.5fr) 70px 110px 80px 70px 90px 36px', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <select className="form-select" value={item.product_id || ''} onChange={e => updateItem(index, 'product_id', e.target.value)} style={{ marginBottom: item.product_name ? 3 : 0 }}>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {/* Allow manual name entry if not from list */}
            {!item.product_id && (
              <input className="form-input" placeholder="Or type name..." value={item.product_name || ''} onChange={e => updateItem(index, 'product_name', e.target.value)} style={{ marginTop: 4, fontSize: 12 }} />
            )}
          </div>
          <input type="number" className="form-input" min="1" placeholder="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ textAlign: 'center' }} />
          <input type="number" className="form-input" min="0" placeholder="0.00" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} />
          <input type="number" className="form-input" min="0" max="100" placeholder="0" value={item.discount_percent} onChange={e => updateItem(index, 'discount_percent', e.target.value)} style={{ textAlign: 'center' }} />
          <select className="form-select" value={item.gst_rate ?? 18} onChange={e => updateItem(index, 'gst_rate', e.target.value)} style={{ fontSize: 12 }}>
            {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
          <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 13, color: lineTotal(item) > 0 ? 'var(--text)' : 'var(--muted)' }}>
            {lineTotal(item) > 0 ? fmtMoney(lineTotal(item)) : '—'}
          </div>
          <button onClick={() => items.length > 1 && onChange(items.filter((_, i) => i !== index))}
            disabled={items.length === 1}
            style={{ background: 'none', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer', color: items.length === 1 ? 'var(--muted)' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 4 }}>
            <Minus size={14} />
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
        <button className="btn btn-outline btn-sm" style={{ fontSize: 12 }}
          onClick={() => onChange([...items, { product_id: '', product_name: '', quantity: 1, price: 0, discount_percent: 0, gst_rate: 18, unit: 'Nos', hsn_sac_code: '' }])}>
          <Plus size={12} /> Add Row
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>
          Total (excl. GST): {fmtMoney(grandTotal)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN CREATE QUOTATION PAGE
═══════════════════════════════════════════════════════ */
function Inner() {
  const router = useRouter();
  const { toast, fmtMoney, currency } = useApp();

  // ── Form state ──
  const blankItem = () => ({ product_id: '', product_name: '', quantity: 1, price: 0, discount_percent: 0, gst_rate: 18, unit: 'Nos', hsn_sac_code: '' });
  const [form, setForm] = useState({
    customerId: '',
    quotationDate: today(),
    validityDate: addDays(30),
    reference: '',
    notes: '',
    terms: '',
    items: [blankItem()],
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuotOpen, setAiQuotOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: '' });

  // ── Data lists ──
  const [customers, setCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  // ── Sheet open states ──
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [vendorSheetOpen, setVendorSheetOpen] = useState(false);
  const [vendorFromProduct, setVendorFromProduct] = useState(false);

  const sf = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  /* ── Derived totals ── */
  const subtotal = form.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const disc = parseFloat(item.discount_percent) || 0;
    return sum + qty * price * (1 - disc / 100);
  }, 0);

  const gstAmount = form.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const disc = parseFloat(item.discount_percent) || 0;
    const gst = parseFloat(item.gst_rate) || 0;
    const lineBase = qty * price * (1 - disc / 100);
    return sum + lineBase * (gst / 100);
  }, 0);

  const grandTotal = subtotal + gstAmount;

  /* ── Fetchers ── */
  const fetchCustomers = async () => {
    setCustomerLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/customers`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCustomers(data.customers || data.data || (Array.isArray(data) ? data : []));
    } catch (e) { console.error(e); }
    finally { setCustomerLoading(false); }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/products`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setProducts(data.products || data.data || (Array.isArray(data) ? data : []));
    } catch (e) { console.error(e); }
    finally { setProductLoading(false); }
  };

  const fetchVendors = async () => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setVendors(data.vendors || data.data || (Array.isArray(data) ? data : []));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCustomers(); fetchProducts(); fetchVendors(); }, []);

  /* ═══════════════════════════════════════════════
     SAVE — POST /admin/quotations
     Exact payload matching the API spec
  ═══════════════════════════════════════════════ */
  const save = async (status = 'draft') => {
    if (!form.customerId) { toast('Please select a customer', 'error'); return; }
    const validItems = form.items.filter(i => (i.product_id || i.product_name?.trim()) && parseFloat(i.quantity) > 0);
    if (validItems.length === 0) { toast('Add at least one item', 'error'); return; }

    setSaving(true);
    const token = localStorage.getItem('zetsap_token');

    const payload = {
      customer_id: parseInt(form.customerId),
      quotation_date: form.quotationDate,
      validity_date: form.validityDate || null,
      reference: form.reference || null,
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst_amount: parseFloat(gstAmount.toFixed(2)),
      notes: form.notes || null,
      terms: form.terms || null,
      items: validItems.map(item => ({
        product_id: item.product_id ? parseInt(item.product_id) : null,
        product_name: item.product_name || (products.find(p => p.id === parseInt(item.product_id))?.name || ''),
        quantity: parseFloat(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        discount_percent: parseFloat(item.discount_percent) || 0,
        gst_rate: parseFloat(item.gst_rate) ?? 18,
      }))
    };

    try {
      const res = await fetch(`${API_BASE}/admin/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.errors ? Object.values(data.errors).flat().join(', ') : data.message || 'Failed to save', 'error');
        setSaving(false); return;
      }

      // If status needs to change from default (draft), PATCH the status
      if (status !== 'draft' && (data.quotation?.id || data.id)) {
        const qId = data.quotation?.id || data.id;
        await fetch(`${API_BASE}/admin/quotations/${qId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status })
        });
      }

      setDirty(false);
      setSuccessModal({
        open: true,
        message: status === 'sent'
          ? 'Quotation saved and sent to customer successfully.'
          : 'Quotation saved as draft.'
      });
    } catch (e) {
      console.error('Save quotation error:', e);
      toast('Network error. Please try again.', 'error');
    } finally { setSaving(false); }
  };

  /* ── Handlers ── */
  const handleCustomerSaved = async newCust => {
    setCustomerSheetOpen(false);
    await fetchCustomers();
    if (newCust?.id) { sf('customerId', newCust.id); toast('Customer added and selected!', 'success'); }
  };

  const handleProductSaved = async () => {
    setProductSheetOpen(false);
    await fetchProducts();
    toast('Product added! You can now select it from the dropdown.', 'success');
  };

  const handleVendorSaved = async newVendor => {
    setVendorSheetOpen(false);
    await fetchVendors();
    if (!vendorFromProduct) toast('Vendor added!', 'success');
    setVendorFromProduct(false);
  };

  const handleAIItems = items => {
    sf('items', items.map((item, i) => ({ product_id: '', product_name: item.name, quantity: item.qty, price: item.price, discount_percent: item.disc, gst_rate: item.gst, unit: item.unit || 'Nos', hsn_sac_code: item.hsn || '' })));
    toast('Items added from AI!', 'success');
  };

  const selectedCustomer = customers.find(c => c.id === parseInt(form.customerId));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top Bar ── */}
      <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap', rowGap: 8 }}>
        <button className="btn-icon" onClick={() => dirty ? setUnsaved(true) : router.back()}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontWeight: 800, fontSize: 18 }}>Create Quotation</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => save('draft')} disabled={saving}>
            <Save size={13} /> {saving ? <Spin /> : 'Save Draft'}
          </button>
          <button className="btn btn-brand btn-sm" onClick={() => save('sent')} disabled={saving}>
            <Send size={13} /> {saving ? <Spin /> : 'Save & Send'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px 10px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="quot-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>

          {/* ── Left Column ── */}
          <div>

            {/* Customer + Dates + Reference */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {/* Customer */}
                <div>
                  <label className="form-label">Customer *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {customerLoading ? (
                      <div className="form-select" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
                        <Spin white={false} /> Loading...
                      </div>
                    ) : (
                      <select className="form-select" style={{ flex: 1 }} value={form.customerId} onChange={e => sf('customerId', parseInt(e.target.value) || '')}>
                        <option value="">Select Customer...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.mobile ? ` - ${c.mobile}` : ''}</option>)}
                      </select>
                    )}
                    <button className="btn btn-brand btn-sm" style={{ flexShrink: 0, fontSize: 12 }} onClick={() => setCustomerSheetOpen(true)}>
                      <User size={12} /> + Customer
                    </button>
                  </div>
                </div>
                {/* Quotation Date */}
                <div>
                  <label className="form-label">Quotation Date</label>
                  <input className="form-input" type="date" value={form.quotationDate} onChange={e => sf('quotationDate', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Validity */}
                <div>
                  <label className="form-label">Valid Until</label>
                  <input className="form-input" type="date" value={form.validityDate} onChange={e => sf('validityDate', e.target.value)} />
                </div>
                {/* Reference */}
                <div>
                  <label className="form-label">Reference</label>
                  <input className="form-input" placeholder="PO Number, Sales Person, etc. (Optional)" value={form.reference} onChange={e => sf('reference', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15 }}>Products & Services</h3>
                  {productLoading && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Loading products...</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-brand btn-sm" style={{ fontSize: 12 }} onClick={() => setProductSheetOpen(true)}>
                    <Plus size={12} /> Add Product
                  </button>
                  <button className="btn btn-outline btn-sm" style={{ fontSize: 12 }} onClick={() => setAiQuotOpen(true)}>
                    <Sparkles size={13} color="var(--brand)" /> Create with AI
                    <span style={{ fontSize: 9, background: '#bfdbfe', color: '#1e40af', padding: '1px 4px', borderRadius: 3, marginLeft: 2 }}>BETA</span>
                  </button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <QuotationLineItems
                  items={form.items}
                  onChange={v => sf('items', v)}
                  products={products}
                  fmtMoney={fmtMoney}
                />
              </div>
            </div>

            {/* Notes + Terms */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Notes & Terms</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label className="form-label" style={{ margin: 0 }}>Notes</label>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, color: 'var(--brand)', gap: 4 }} onClick={() => setAiOpen(true)}>
                      <Sparkles size={12} /> AI
                    </button>
                  </div>
                  <textarea className="form-input form-textarea" rows={3} value={form.notes} onChange={e => sf('notes', e.target.value)} placeholder="Notes to customer..." />
                </div>
                <div>
                  <label className="form-label">Terms & Conditions</label>
                  <textarea className="form-input form-textarea" rows={3} value={form.terms} onChange={e => sf('terms', e.target.value)} placeholder="Payment terms, validity, etc." />
                </div>
              </div>
            </div>

          </div>

          {/* ── Summary Sidebar ── */}
          <div className="card quot-sidebar" style={{ padding: 20, position: 'sticky', top: 70 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{fmtMoney(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>GST</span>
              <span style={{ fontWeight: 600 }}>{fmtMoney(gstAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid var(--border)', fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
              <span>Total</span>
              <span style={{ color: 'var(--brand)' }}>{fmtMoney(grandTotal)}</span>
            </div>

            {/* Customer preview chip */}
            {selectedCustomer && (
              <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--brand-bg)', borderRadius: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                  <User size={12} color="var(--brand)" />
                  {selectedCustomer.name}
                </div>
                {selectedCustomer.mobile && <div style={{ color: 'var(--muted)' }}>{selectedCustomer.mobile}</div>}
                {selectedCustomer.email && <div style={{ color: 'var(--muted)' }}>{selectedCustomer.email}</div>}
                {selectedCustomer.gstin && <div style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>GSTIN: {selectedCustomer.gstin}</div>}
              </div>
            )}

            {/* Validity info */}
            {form.validityDate && (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--muted)' }}>
                Valid until: <strong style={{ color: 'var(--text)' }}>{new Date(form.validityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
              </div>
            )}

            {/* Item count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12, color: 'var(--muted)' }}>
              <span>Items</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.items.filter(i => i.product_id || i.product_name).length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-brand" style={{ width: '100%', justifyContent: 'center' }} onClick={() => save('sent')} disabled={saving}>
                <Send size={14} /> Save and Send
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => save('draft')} disabled={saving}>
                <Save size={14} /> Save as Draft
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══ CUSTOMER SHEET ══ */}
      <Sheet open={customerSheetOpen} onClose={() => setCustomerSheetOpen(false)} title="Add New Customer" size="md">
        <QuickAddCustomerSheet
          onSaved={handleCustomerSaved}
          onCancel={() => setCustomerSheetOpen(false)}
          toast={toast}
        />
      </Sheet>

      {/* ══ PRODUCT SHEET ══ */}
      <Sheet open={productSheetOpen} onClose={() => setProductSheetOpen(false)} title="Add New Product / Service" size="lg">
        <QuickAddProductSheet
          onSaved={handleProductSaved}
          onCancel={() => setProductSheetOpen(false)}
          toast={toast}
          vendors={vendors}
          onNeedVendor={() => { setVendorFromProduct(true); setVendorSheetOpen(true); }}
        />
      </Sheet>

      {/* ══ VENDOR SHEET (opened from inside Product Sheet) ══ */}
      <Sheet open={vendorSheetOpen} onClose={() => { setVendorSheetOpen(false); setVendorFromProduct(false); }} title="Add New Vendor" size="md">
        <QuickAddVendorSheet
          onSaved={handleVendorSaved}
          onCancel={() => { setVendorSheetOpen(false); setVendorFromProduct(false); }}
          toast={toast}
        />
      </Sheet>

      {/* ══ UNSAVED MODAL ══ */}
      <UnsavedModal open={unsaved} onDiscard={() => { setUnsaved(false); setDirty(false); router.back(); }} onSave={() => { setUnsaved(false); save(); }} />

      {/* ══ AI NOTES MODAL ══ */}
      <AIModal open={aiOpen} onClose={() => setAiOpen(false)} context="notes" onUse={t => sf('notes', t)} />

      {/* ══ AI QUOTATION MODAL ══ */}
      <AIQuotationModal open={aiQuotOpen} onClose={() => setAiQuotOpen(false)} onConfirm={handleAIItems} />

      {/* ══ SUCCESS MODAL ══ */}
      <SuccessModal
        open={successModal.open}
        message={successModal.message}
        onClose={() => { setSuccessModal({ open: false, message: '' }); router.back(); }}
      />

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .quot-grid { grid-template-columns: 1fr !important; }
          .quot-sidebar { position: static !important; }
        }
        @media (max-width: 640px) {
          .quot-grid > div:first-child .card > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}