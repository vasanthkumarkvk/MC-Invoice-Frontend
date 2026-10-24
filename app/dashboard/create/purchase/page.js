'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Save, Send, Sparkles, User, Check,
  Shield, ExternalLink, Package, Tag, CheckCircle2, Plus, Minus
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { today } from '@/lib/data';
import { UnsavedModal } from '@/components/Modal';
import AIModal from '@/components/AIModal';
import Sheet from '@/components/Sheet';

const API_BASE = 'https://invoice.crazystory.in/api';

/* ══════════════════════════════════════════════════
   SUCCESS MODAL
══════════════════════════════════════════════════ */
function SuccessModal({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--card-bg)', borderRadius: 16, padding: '36px 32px',
        maxWidth: 380, width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px'
        }}>
          <CheckCircle2 size={32} color="#059669" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, color: 'var(--text)' }}>
          Saved Successfully!
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          {message}
        </div>
        <button
          className="btn btn-brand"
          style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '10px 0' }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   VENDOR FORM CONTENT (inside Sheet)
══════════════════════════════════════════════════ */
function VendorSheetContent({ onSaved, onCancel, toast }) {
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
    } catch { return true; }
  };

  const checkVendorName = async (val) => {
    if (!val) return true;
    setCheckingName(true);
    try {
      const ok = await checkUnique('name', val);
      setErrors(p => ({ ...p, name: ok ? null : 'Vendor name already taken' }));
      return ok;
    } finally { setCheckingName(false); }
  };

  const checkMobile = async (val) => {
    if (!val) return true;
    setCheckingMobile(true);
    try {
      const ok = await checkUnique('mobile', val);
      setErrors(p => ({ ...p, mobile: ok ? null : 'Mobile already registered' }));
      return ok;
    } finally { setCheckingMobile(false); }
  };

  const checkEmail = async (val) => {
    if (!val) return true;
    setCheckingEmail(true);
    try {
      const ok = await checkUnique('email', val);
      setErrors(p => ({ ...p, email: ok ? null : 'Email already registered' }));
      return ok;
    } finally { setCheckingEmail(false); }
  };

  const validateMobile = (v) => v && !/^[0-9]{10}$/.test(v) ? 'Enter a valid 10-digit number' : null;
  const validateEmail = (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email' : null;

  const handleNameChange = async (v) => { setName(v); if (!v.trim()) setErrors(p => ({ ...p, name: 'Required' })); else await checkVendorName(v.trim()); };
  const handleMobileChange = async (v) => { const c = v.replace(/\D/g, '').slice(0, 10); setMobile(c); const fe = validateMobile(c); if (fe) { setErrors(p => ({ ...p, mobile: fe })); return; } setErrors(p => ({ ...p, mobile: null })); if (c) await checkMobile(c); };
  const handleEmailChange = async (v) => { setEmail(v); const fe = validateEmail(v); if (fe) { setErrors(p => ({ ...p, email: fe })); return; } setErrors(p => ({ ...p, email: null })); if (v) await checkEmail(v); };

  const reset = () => {
    setName(''); setMobile(''); setEmail(''); setGstin(''); setAddress('');
    setBankName(''); setAccountNumber(''); setIfscCode(''); setBranch(''); setUpiId('');
    setErrors({}); setVendorType('third_party');
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setErrors(p => ({ ...p, name: 'Vendor name is required' })); toast('Vendor name is required', 'error'); return; }
    const mfe = validateMobile(mobile), efe = validateEmail(email);
    if (mfe) setErrors(p => ({ ...p, mobile: mfe }));
    if (efe) setErrors(p => ({ ...p, email: efe }));
    if (errors.name || errors.mobile || errors.email || mfe || efe) { toast('Please fix validation errors', 'error'); return; }

    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    const apiData = {
      name: name.trim(), mobile: mobile || null, email: email || null,
      type: vendorType, gstin: gstin || null, address: address || null,
      bank_name: bankName || null, account_number: accountNumber || null,
      ifsc_code: ifscCode.toUpperCase() || null, branch: branch || null, upi_id: upiId || null
    };
    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || 'Failed to create vendor', 'error'); setLoading(false); return; }
      const newVendor = data.vendor || (data.vendor_id ? { ...apiData, id: data.vendor_id } : data);
      toast('Vendor created successfully', 'success');
      reset();
      onSaved(newVendor);
    } catch { toast('Network error. Please try again.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        {/* Vendor Type */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Vendor Type *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['own', 'My Business', Shield], ['third_party', 'Third Party', ExternalLink]].map(([val, label, Icon]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '9px 14px', border: `1.5px solid ${vendorType === val ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: vendorType === val ? 'var(--brand-bg)' : 'transparent', flex: 1, justifyContent: 'center' }}>
                <input type="radio" value={val} checked={vendorType === val} onChange={e => setVendorType(e.target.value)} style={{ margin: 0 }} />
                <Icon size={13} color="var(--brand)" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Vendor Name *</label>
          <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Enter vendor name" value={name} onChange={e => handleNameChange(e.target.value)} autoFocus />
          {checkingName && <p className="form-err" style={{ color: '#6b7280' }}>Checking availability...</p>}
          {errors.name && <p className="form-err">{errors.name}</p>}
          {name && !errors.name && !checkingName && <p className="form-err" style={{ color: '#10b981' }}>✓ Name is available</p>}
        </div>

        {/* Mobile + Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label className="form-label">Mobile</label>
            <input className={`form-input ${errors.mobile ? 'error' : ''}`} placeholder="9876543210" value={mobile} onChange={e => handleMobileChange(e.target.value)} />
            {checkingMobile && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {errors.mobile && <p className="form-err">{errors.mobile}</p>}
            {mobile && !errors.mobile && !checkingMobile && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="vendor@example.com" value={email} onChange={e => handleEmailChange(e.target.value)} />
            {checkingEmail && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {errors.email && <p className="form-err">{errors.email}</p>}
            {email && !errors.email && !checkingEmail && <p className="form-err" style={{ color: '#10b981' }}>✓ Available</p>}
          </div>
        </div>

        {/* GSTIN */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">GSTIN</label>
          <input className="form-input" placeholder="29AABCT1332L0Z" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} />
        </div>

        {/* Address */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Address</label>
          <textarea className="form-input form-textarea" rows={2} placeholder="123 Supplier Street, Chennai" value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        {/* Bank Details */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Bank Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label className="form-label">Bank Name</label><input className="form-input" placeholder="HDFC Bank" value={bankName} onChange={e => setBankName(e.target.value)} /></div>
            <div><label className="form-label">Account Number</label><input className="form-input" placeholder="1234567890" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label className="form-label">IFSC Code</label><input className="form-input" placeholder="HDFC0001234" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} /></div>
            <div><label className="form-label">Branch</label><input className="form-input" placeholder="Anna Nagar" value={branch} onChange={e => setBranch(e.target.value)} /></div>
          </div>
          <div>
            <label className="form-label">UPI ID</label>
            <input className="form-input" placeholder="vendor@hdfc" value={upiId} onChange={e => setUpiId(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--card-bg)' }}>
        <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Vendor'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PRODUCT FORM CONTENT (inside Sheet)
══════════════════════════════════════════════════ */
function ProductSheetContent({ onSaved, onCancel, toast, vendors = [], onNeedVendor }) {
  const blank = {
    type: 'product', name: '', sku: '', hsn_sac_code: '', category: '',
    selling_price: '', purchase_price: '', unit: 'Nos',
    gst_rate: 0,
    opening_stock: '', low_stock_alert: '', description: '', vendor_id: ''
  };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingSku, setCheckingSku] = useState(false);
  const [skuAvailable, setSkuAvailable] = useState(true);

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

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
      if (result.available === false) { setErr(p => ({ ...p, sku: 'SKU already taken' })); setSkuAvailable(false); return false; }
      setErr(p => ({ ...p, sku: null })); setSkuAvailable(true); return true;
    } catch { return true; }
    finally { setCheckingSku(false); }
  };

  const validate = () => {
    const e = {};
    if (!f.name?.trim()) e.name = 'Product name is required';
    if (!f.selling_price) e.selling_price = 'Selling price is required';
    if (f.selling_price && parseFloat(f.selling_price) <= 0) e.selling_price = 'Price must be greater than 0';
    if (!f.hsn_sac_code) e.hsn_sac_code = `${f.type === 'product' ? 'HSN' : 'SAC'} code is required`;
    if (f.type === 'product' && !f.unit) e.unit = 'Unit is required';
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
      type: f.type,
      name: f.name,
      hsn_sac_code: f.hsn_sac_code,
      selling_price: parseFloat(f.selling_price),
      unit: f.unit,
      gst_rate: f.gst_rate === '' || f.gst_rate === null ? null : parseInt(f.gst_rate),
      description: f.description || null,
      vendor_id: f.vendor_id ? parseInt(f.vendor_id) : null,
      sku: f.sku || null,
      category: f.category || null,
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
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          toast(errorMessages, 'error');
        } else {
          toast(result.message || 'Failed to create product', 'error');
        }
        setLoading(false);
        return;
      }
      const saved = result.product || (result.product_id ? { ...apiData, id: result.product_id } : result);
      toast('Product created successfully', 'success');
      setF(blank); setErr({}); setSkuAvailable(true);
      onSaved(saved);
    } catch { toast('Network error. Please try again.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        {/* Type */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Type *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['product', 'Product', Package], ['service', 'Service', Tag]].map(([val, label, Icon]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '9px 14px', border: `1.5px solid ${f.type === val ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: f.type === val ? 'var(--brand-bg)' : 'transparent', flex: 1, justifyContent: 'center' }}>
                <input type="radio" value={val} checked={f.type === val} onChange={e => s('type', e.target.value)} style={{ margin: 0 }} />
                <Icon size={13} color="var(--brand)" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Name *</label>
          <input className={`form-input ${err.name ? 'error' : ''}`} placeholder="Enter product/service name" value={f.name} onChange={e => s('name', e.target.value)} autoFocus />
          {err.name && <p className="form-err">{err.name}</p>}
        </div>

        {/* SKU */}
        {f.type === 'product' && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">SKU</label>
            <input className={`form-input ${err.sku ? 'error' : ''}`} placeholder="e.g., LAP-001" value={f.sku} onChange={e => s('sku', e.target.value.toUpperCase())} onBlur={e => e.target.value && checkSku(e.target.value)} />
            {checkingSku && <p className="form-err" style={{ color: '#6b7280' }}>Checking...</p>}
            {err.sku && <p className="form-err">{err.sku}</p>}
            {skuAvailable && f.sku && !checkingSku && !err.sku && <p className="form-err" style={{ color: '#10b981' }}><Check size={11} style={{ display: 'inline', marginRight: 3 }} />Available</p>}
          </div>
        )}

        {/* HSN / SAC */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">{f.type === 'product' ? 'HSN Code' : 'SAC Code'} *</label>
          <input className={`form-input ${err.hsn_sac_code ? 'error' : ''}`} placeholder={f.type === 'product' ? 'e.g., 84713000' : 'e.g., 998314'} value={f.hsn_sac_code} onChange={e => s('hsn_sac_code', e.target.value)} />
          {err.hsn_sac_code && <p className="form-err">{err.hsn_sac_code}</p>}
        </div>

        {/* Category */}
        {f.type === 'product' && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Category</label>
            <input className="form-input" placeholder="e.g., Electronics" value={f.category} onChange={e => s('category', e.target.value)} />
          </div>
        )}

        {/* Unit */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Unit *</label>
          <select className="form-select" value={f.unit} onChange={e => s('unit', e.target.value)}>
            {['Nos', 'Kg', 'Ltr', 'Hour', 'Day', 'Month', 'Piece', 'Box', 'Set'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>

        {/* Vendor */}
        {f.type === 'product' && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Vendor</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <select className="form-select" style={{ flex: 1 }} value={f.vendor_id} onChange={e => s('vendor_id', e.target.value)}>
                <option value="">Select Vendor...</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.type === 'own' ? '🏢 ' : '🔗 '}{v.name}{v.mobile ? ` - ${v.mobile}` : ''}</option>
                ))}
              </select>
              <button className="btn btn-outline btn-sm" style={{ flexShrink: 0, fontSize: 12, color: 'var(--brand)', borderColor: 'var(--brand)' }} onClick={onNeedVendor}>
                <User size={12} /> + Vendor
              </button>
            </div>
          </div>
        )}

        {/* Prices */}
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

        {/* Stock */}
        {f.type === 'product' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label className="form-label">Opening Stock</label><input type="number" className="form-input" placeholder="0" value={f.opening_stock} onChange={e => s('opening_stock', e.target.value)} /></div>
            <div><label className="form-label">Low Stock Alert</label><input type="number" className="form-input" placeholder="2" value={f.low_stock_alert} onChange={e => s('low_stock_alert', e.target.value)} /></div>
          </div>
        )}

        {/* GST */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">GST Rate (%)</label>
          <select className="form-select" value={f.gst_rate} onChange={e => s('gst_rate', e.target.value)}>
            <option value="">Not applicable</option>
            {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Description</label>
          <textarea className="form-input form-textarea" rows={2} placeholder="Enter description..." value={f.description} onChange={e => s('description', e.target.value)} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--card-bg)' }}>
        <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PURCHASE ITEMS TABLE
   Simple rows: product select (name only) + qty + cost_price
══════════════════════════════════════════════════ */
function PurchaseItemsTable({ items, onChange, products, fmtMoney }) {

  const updateItem = (index, key, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [key]: value };
      // When product selected, only set product_id — no pre-fill of cost_price
      if (key === 'product_id') {
        const prod = products.find(p => p.id === parseInt(value));
        newItem.product_name = prod ? prod.name : '';
      }
      return newItem;
    });
    onChange(updated);
  };

  const addRow = () => {
    onChange([...items, { product_id: '', product_name: '', quantity: 1, cost_price: '' }]);
  };

  const removeRow = (index) => {
    if (items.length === 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const lineTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.cost_price) || 0;
    return qty * price;
  };

  const grandTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(160px,2fr) 90px 130px 100px 36px',
        gap: 8, padding: '0 0 8px', borderBottom: '1px solid var(--border)',
        fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        <span>Product</span>
        <span>Qty</span>
        <span>Cost Price</span>
        <span style={{ textAlign: 'right' }}>Total</span>
        <span />
      </div>

      {/* Rows */}
      {items.map((item, index) => (
        <div key={index} style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(160px,2fr) 90px 130px 100px 36px',
          gap: 8, alignItems: 'center', padding: '8px 0',
          borderBottom: '1px solid var(--border)'
        }}>
          {/* Product select — shows only name */}
          <select
            className="form-select"
            value={item.product_id}
            onChange={e => updateItem(index, 'product_id', e.target.value)}
          >
            <option value="">Select product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Quantity */}
          <input
            type="number"
            className="form-input"
            min="1"
            placeholder="1"
            value={item.quantity}
            onChange={e => updateItem(index, 'quantity', e.target.value)}
            style={{ textAlign: 'center' }}
          />

          {/* Cost Price — always blank, user enters manually */}
          <input
            type="number"
            className="form-input"
            min="0"
            placeholder="0.00"
            value={item.cost_price}
            onChange={e => updateItem(index, 'cost_price', e.target.value)}
          />

          {/* Line total */}
          <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 13, color: lineTotal(item) > 0 ? 'var(--text)' : 'var(--muted)' }}>
            {lineTotal(item) > 0 ? fmtMoney(lineTotal(item)) : '—'}
          </div>

          {/* Remove */}
          <button
            onClick={() => removeRow(index)}
            disabled={items.length === 1}
            style={{
              background: 'none', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer',
              color: items.length === 1 ? 'var(--muted)' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4, borderRadius: 4
            }}
          >
            <Minus size={14} />
          </button>
        </div>
      ))}

      {/* Add row + Grand total */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ fontSize: 12, gap: 4 }}
          onClick={addRow}
        >
          <Plus size={12} /> Add Row
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>
          Grand Total: {fmtMoney(grandTotal)}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN CREATE PURCHASE PAGE
══════════════════════════════════════════════════ */
function Inner() {
  const router = useRouter();
  const { toast, fmtMoney, currency } = useApp();

  // ── Form state ──
  // Each item maps directly to one POST /admin/purchases call
  const blankItem = () => ({ product_id: '', product_name: '', quantity: 1, cost_price: '' });
  const [form, setForm] = useState({
    vendorId: '',
    date: today(),
    items: [blankItem()],
    notes: '',
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // ── Success modal ──
  const [successModal, setSuccessModal] = useState({ open: false, message: '' });

  // ── Vendor Sheet state ──
  const [vendorSheetOpen, setVendorSheetOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(true);

  // ── Product Sheet state ──
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);

  // ── Vendor Sheet opened from inside Product Sheet ──
  const [vendorFromProduct, setVendorFromProduct] = useState(false);

  const sf = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  /* ── Derived totals ── */
  const grandTotal = form.items.reduce((sum, item) => {
    return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.cost_price) || 0));
  }, 0);

  /* ── Fetch vendors ── */
  const fetchVendors = async () => {
    setVendorLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.vendors || data.data || (Array.isArray(data) ? data : []);
        setVendors(list);
        return list;
      }
    } catch (e) { console.error('Fetch vendors error:', e); }
    finally { setVendorLoading(false); }
    return [];
  };

  /* ── Fetch products ── */
  const fetchProducts = async () => {
    setProductLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.products || data.data || (Array.isArray(data) ? data : []);
        setProducts(list);
        return list;
      }
    } catch (e) { console.error('Fetch products error:', e); }
    finally { setProductLoading(false); }
    return [];
  };

  useEffect(() => { fetchVendors(); fetchProducts(); }, []);

  /* ══════════════════════════════════════════════
     SAVE — posts one request per item row
     POST /admin/purchases with flat payload:
     { product_id, quantity, cost_price, vendor_id, purchase_date }
  ══════════════════════════════════════════════ */
  const save = async () => {
    // Validate
    if (!form.vendorId) { toast('Please select a vendor', 'error'); return; }

    const validItems = form.items.filter(i => i.product_id && parseFloat(i.quantity) > 0 && parseFloat(i.cost_price) > 0);
    if (validItems.length === 0) {
      toast('Add at least one item with product, quantity and cost price', 'error');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('zetsap_token');

    try {
      // Fire one POST per item row (as the API expects flat single-product payloads)
      const requests = validItems.map(item =>
        fetch(`${API_BASE}/admin/purchases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: parseInt(item.product_id),
            quantity: parseFloat(item.quantity),
            cost_price: parseFloat(item.cost_price),
            vendor_id: parseInt(form.vendorId),
            purchase_date: form.date,
            notes: form.notes || null
          })
        }).then(res => res.json().then(data => ({ ok: res.ok, data, status: res.status })))
      );

      const results = await Promise.all(requests);
      const failed = results.filter(r => !r.ok);

      if (failed.length > 0) {
        const msg = failed.map(r => r.data?.message || 'Unknown error').join(', ');
        toast(`${failed.length} item(s) failed: ${msg}`, 'error');
        setSaving(false);
        return;
      }

      setDirty(false);
      setSuccessModal({
        open: true,
        message: `${validItems.length} purchase record${validItems.length > 1 ? 's' : ''} saved successfully. Stock has been updated.`
      });
    } catch (e) {
      console.error('Save purchase error:', e);
      toast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Vendor saved from main Vendor Sheet ── */
  const handleVendorSaved = async (newVendor) => {
    setVendorSheetOpen(false);
    const list = await fetchVendors();
    if (!vendorFromProduct && newVendor?.id) {
      sf('vendorId', newVendor.id);
      toast('Vendor added and selected!', 'success');
    } else {
      toast('Vendor added!', 'success');
    }
    setVendorFromProduct(false);
  };

  /* ── Product saved ── */
  const handleProductSaved = async () => {
    setProductSheetOpen(false);
    await fetchProducts();
    toast('Product added! You can now select it in the items table.', 'success');
  };

  const Spin = () => (
    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
  );

  const selectedVendor = vendors.find(v => v.id === parseInt(form.vendorId));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top Bar ── */}
      <div style={{
        background: 'var(--card-bg)', borderBottom: '1px solid var(--border)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap'
      }}>
        <button className="btn-icon" onClick={() => dirty ? setUnsaved(true) : router.back()}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontWeight: 800, fontSize: 18 }}>Create Purchase</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-brand btn-sm" onClick={save} disabled={saving}>
            <Save size={13} /> {saving ? <Spin /> : 'Save Purchase'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="create-page-body" style={{ padding: '16px 10px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="invoice-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>

          {/* ── Left Column ── */}
          <div>

            {/* Vendor + Date */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                {/* Vendor select */}
                <div>
                  <label className="form-label">Vendor *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select
                      className="form-select"
                      style={{ flex: 1 }}
                      value={form.vendorId}
                      onChange={e => sf('vendorId', parseInt(e.target.value) || '')}
                      disabled={vendorLoading}
                    >
                      <option value="">{vendorLoading ? 'Loading...' : 'Select Vendor...'}</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.type === 'own' ? '🏢 ' : '🔗 '}{v.name}{v.mobile ? ` - ${v.mobile}` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-brand btn-sm"
                      style={{ flexShrink: 0, fontSize: 12 }}
                      onClick={() => { setVendorFromProduct(false); setVendorSheetOpen(true); }}
                    >
                      <User size={12} /> + Vendor
                    </button>
                  </div>
                </div>

                {/* Purchase date */}
                <div>
                  <label className="form-label">Purchase Date *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.date}
                    onChange={e => sf('date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15 }}>Purchase Items</h3>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    Select product, enter quantity and cost price. Each row creates a separate stock entry.
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" style={{ fontSize: 12 }} onClick={() => setProductSheetOpen(true)}>
                  <Plus size={12} /> New Product
                </button>
              </div>
              {productLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>
                  Loading products...
                </div>
              ) : (
                <PurchaseItemsTable
                  items={form.items}
                  onChange={v => sf('items', v)}
                  products={products}
                  fmtMoney={fmtMoney}
                />
              )}
            </div>

            {/* Notes */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Notes</h3>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, color: 'var(--brand)', gap: 4 }} onClick={() => setAiOpen(true)}>
                  <Sparkles size={12} /> AI
                </button>
              </div>
              <textarea
                className="form-input form-textarea"
                rows={3}
                value={form.notes}
                onChange={e => sf('notes', e.target.value)}
                placeholder="Optional notes for this purchase..."
              />
            </div>

          </div>

          {/* ── Summary Sidebar ── */}
          <div className="card summary-sidebar" style={{ padding: 20, position: 'sticky', top: 70 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Summary</h3>

            {/* Item count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Items</span>
              <span style={{ fontWeight: 600 }}>
                {form.items.filter(i => i.product_id).length} / {form.items.length}
              </span>
            </div>

            {/* Total qty */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Total Qty</span>
              <span style={{ fontWeight: 600 }}>
                {form.items.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0)}
              </span>
            </div>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid var(--border)', fontSize: 16, fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: 'var(--brand)' }}>{fmtMoney(grandTotal)}</span>
            </div>

            {/* Vendor chip */}
            {selectedVendor && (
              <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--brand-bg)', borderRadius: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 4 }}>
                  {selectedVendor.type === 'own'
                    ? <Shield size={12} color="var(--brand)" />
                    : <ExternalLink size={12} color="var(--brand)" />}
                  {selectedVendor.name}
                </div>
                {selectedVendor.mobile && <div style={{ color: 'var(--muted)' }}>{selectedVendor.mobile}</div>}
                {selectedVendor.email && <div style={{ color: 'var(--muted)' }}>{selectedVendor.email}</div>}
                {selectedVendor.gstin && <div style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>GSTIN: {selectedVendor.gstin}</div>}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button
                className="btn btn-brand"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={save}
                disabled={saving}
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Purchase'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══ VENDOR SHEET ══ */}
      <Sheet
        open={vendorSheetOpen}
        onClose={() => { setVendorSheetOpen(false); setVendorFromProduct(false); }}
        title="Add New Vendor"
        size="md"
      >
        <VendorSheetContent
          onSaved={handleVendorSaved}
          onCancel={() => { setVendorSheetOpen(false); setVendorFromProduct(false); }}
          toast={toast}
        />
      </Sheet>

      {/* ══ PRODUCT SHEET ══ */}
      <Sheet
        open={productSheetOpen}
        onClose={() => setProductSheetOpen(false)}
        title="Add New Product / Service"
        size="lg"
      >
        <ProductSheetContent
          onSaved={handleProductSaved}
          onCancel={() => setProductSheetOpen(false)}
          toast={toast}
          vendors={vendors}
          onNeedVendor={() => {
            setVendorFromProduct(true);
            setVendorSheetOpen(true);
          }}
        />
      </Sheet>

      {/* ══ UNSAVED CHANGES MODAL ══ */}
      <UnsavedModal
        open={unsaved}
        onDiscard={() => { setUnsaved(false); setDirty(false); router.back(); }}
        onSave={() => { setUnsaved(false); save(); }}
      />

      {/* ══ AI NOTES MODAL ══ */}
      <AIModal open={aiOpen} onClose={() => setAiOpen(false)} context="notes" onUse={t => sf('notes', t)} />

      {/* ══ SUCCESS MODAL ══ */}
      <SuccessModal
        open={successModal.open}
        message={successModal.message}
        onClose={() => {
          setSuccessModal({ open: false, message: '' });
          router.back();
        }}
      />

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .invoice-grid { grid-template-columns: 1fr !important; }
          .summary-sidebar { position: static !important; }
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}