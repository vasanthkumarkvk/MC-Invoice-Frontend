'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Pencil, Trash2, Package, Tag, List, Grid3X3, RefreshCw, AlertCircle, X, Check, User, Building2, Shield, ExternalLink, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import Sheet from '@/components/Sheet';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

const API_BASE = 'https://invoice.crazystory.in/api';
const HSN_API_BASE = 'https://invoice.crazystory.in/api'; // Change to your actual domain

// ─── HSN Code Search Input Component ───────────────────────────────────────
function HsnCodeInput({ value, onChange, placeholder, error, label }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync external value changes (e.g. edit mode pre-fill)
  useEffect(() => {
    if (value !== query) {
      setQuery(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${HSN_API_BASE}/hsn/search?q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.status === 404) {
        setSuggestions([]);
        setOpen(true);
        return;
      }
      const data = await res.json();
      
      // 🚨 FIX: Handle both single object (exact match) and array (partial match)
      if (data.status && data.data) {
        const resultList = Array.isArray(data.data) ? data.data : [data.data];
        setSuggestions(resultList.slice(0, 10)); // cap at 10 results
        setOpen(true);
      } else {
        setSuggestions([]);
        setOpen(true);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(false);
    onChange(val); // keep parent form state in sync while typing

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (item) => {
    setQuery(item.hsn_code);
    setSelected(true);
    setOpen(false);
    setSuggestions([]);
    onChange(item.hsn_code, item); // pass full item so parent can also read gst_rate etc.
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          className={`form-input ${error ? 'error' : ''}`}
          placeholder={placeholder || 'e.g., 84713000'}
          value={query}
          onChange={handleChange}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {loading && (
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #e5e7eb', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </span>
        )}
        {selected && !loading && (
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#10b981' }}>
            <Check size={14} />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 9999,
          maxHeight: 260,
          overflowY: 'auto'
        }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
              No HSN/SAC codes found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={() => handleSelect(item)} // mousedown fires before blur
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--brand)' }}>
                    {item.hsn_code}
                  </span>
                  {item.gst_rate !== null && item.gst_rate !== undefined && (
                    <span style={{ fontSize: 11, padding: '2px 7px', background: 'var(--brand-bg)', color: 'var(--brand)', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      GST {item.gst_rate}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>
                  {item.description}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="form-err">{error}</p>}
    </div>
  );
}

// ─── Quick Add Vendor Component ─────────────────────────────────────────────
// NOTE: Only the three "main" details — name, mobile, email — are uniqueness-checked.
// Mobile/email are validated for FORMAT only if the user fills them; they are NOT mandatory.
// GSTIN and all bank fields are fully optional with no uniqueness/format blocking.
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ field, value })
      });
      const result = await res.json();
      return result.available !== false;
    } catch (error) {
      console.error(`Check ${field} error:`, error);
      return true;
    }
  };

  const checkVendorName = async (vendorName) => {
    if (!vendorName) return true;
    setCheckingName(true);
    try {
      const available = await checkUnique('name', vendorName);
      setErrors(prev => ({ ...prev, name: available ? null : 'Vendor name is already taken' }));
      return available;
    } finally {
      setCheckingName(false);
    }
  };

  const checkMobile = async (mobileNumber) => {
    if (!mobileNumber) return true;
    setCheckingMobile(true);
    try {
      const available = await checkUnique('mobile', mobileNumber);
      setErrors(prev => ({ ...prev, mobile: available ? null : 'Mobile number is already registered' }));
      return available;
    } finally {
      setCheckingMobile(false);
    }
  };

  const checkEmail = async (emailAddress) => {
    if (!emailAddress) return true;
    setCheckingEmail(true);
    try {
      const available = await checkUnique('email', emailAddress);
      setErrors(prev => ({ ...prev, email: available ? null : 'Email is already registered' }));
      return available;
    } finally {
      setCheckingEmail(false);
    }
  };

  const validateMobileFormat = (num) => {
    const mobileRegex = /^[0-9]{10}$/;
    if (num && !mobileRegex.test(num)) return 'Enter a valid 10-digit mobile number';
    return null;
  };

  const validateEmailFormat = (em) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (em && !emailRegex.test(em)) return 'Enter a valid email address';
    return null;
  };

  const handleNameChange = async (value) => {
    setName(value);
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: 'Vendor name is required' }));
    } else {
      await checkVendorName(value.trim());
    }
  };

  const handleMobileChange = async (value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    setMobile(cleanValue);
    const formatError = validateMobileFormat(cleanValue);
    if (formatError) {
      setErrors(prev => ({ ...prev, mobile: formatError }));
    } else if (cleanValue) {
      setErrors(prev => ({ ...prev, mobile: null }));
      await checkMobile(cleanValue);
    } else {
      setErrors(prev => ({ ...prev, mobile: null }));
    }
  };

  const handleEmailChange = async (value) => {
    setEmail(value);
    const formatError = validateEmailFormat(value);
    if (formatError) {
      setErrors(prev => ({ ...prev, email: formatError }));
    } else if (value) {
      setErrors(prev => ({ ...prev, email: null }));
      await checkEmail(value);
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handleGstinChange = (value) => {
    setGstin(value.toUpperCase());
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Vendor name is required' }));
      toast('Vendor name is required', 'error');
      return;
    }

    const mobileFormatError = validateMobileFormat(mobile);
    const emailFormatError = validateEmailFormat(email);
    if (mobileFormatError) setErrors(prev => ({ ...prev, mobile: mobileFormatError }));
    if (emailFormatError) setErrors(prev => ({ ...prev, email: emailFormatError }));

    if (errors.name || errors.mobile || errors.email || mobileFormatError || emailFormatError) {
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          toast(errorMessages, 'error');
        } else {
          toast(data.message || 'Failed to create vendor', 'error');
        }
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
            <input
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter vendor name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              autoFocus
            />
            {checkingName && <p className="form-err" style={{ color: '#6b7280' }}>Checking availability...</p>}
            {errors.name && <p className="form-err">{errors.name}</p>}
            {name && !errors.name && !checkingName && <p className="form-err" style={{ color: '#10b981' }}>✓ Name is available</p>}
          </div>

          <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="form-label">Mobile</label>
              <input
                className={`form-input ${errors.mobile ? 'error' : ''}`}
                placeholder="9876543210"
                value={mobile}
                onChange={e => handleMobileChange(e.target.value)}
              />
              {checkingMobile && <p className="form-err" style={{ color: '#6b7280' }}>Checking mobile...</p>}
              {errors.mobile && <p className="form-err">{errors.mobile}</p>}
              {mobile && !errors.mobile && !checkingMobile && <p className="form-err" style={{ color: '#10b981' }}>✓ Mobile is available</p>}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="vendor@example.com"
                value={email}
                onChange={e => handleEmailChange(e.target.value)}
              />
              {checkingEmail && <p className="form-err" style={{ color: '#6b7280' }}>Checking email...</p>}
              {errors.email && <p className="form-err">{errors.email}</p>}
              {email && !errors.email && !checkingEmail && <p className="form-err" style={{ color: '#10b981' }}>✓ Email is available</p>}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">GSTIN</label>
            <input className="form-input" placeholder="29AABCT1332L0Z" value={gstin} onChange={e => handleGstinChange(e.target.value)} />
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

// ─── Product Form Component ──────────────────────────────────────────────────
function ProductForm({ data, onSave, onCancel, toast, vendors = [], refreshVendors }) {
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

  const [f, setF] = useState(data || blank);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingSku, setCheckingSku] = useState(false);
  const [skuAvailable, setSkuAvailable] = useState(true);
  const [showQuickVendor, setShowQuickVendor] = useState(false);
  const [vendorFilter, setVendorFilter] = useState('all');

  const isEditMode = !!data?.id;

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const filteredVendors = vendors.filter(v => {
    if (vendorFilter === 'all') return true;
    if (vendorFilter === 'own') return v.type === 'own';
    if (vendorFilter === 'third_party') return v.type === 'third_party';
    return true;
  });

  const checkSku = async (sku) => {
    if (!sku || f.type !== 'product' || (data && data.sku === sku)) return true;
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
    } catch {
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

    if (f.type === 'product' && f.sku && (!data || data.sku !== f.sku)) {
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
      gst_rate: (f.gst_rate === '' || f.gst_rate === null || f.gst_rate === undefined) ? null : parseInt(f.gst_rate),
      description: f.description || null,
      vendor_id: f.vendor_id ? parseInt(f.vendor_id) : null
    };

    if (f.type === 'product') {
      apiData.sku = f.sku || null;
      apiData.category = f.category || null;
      apiData.purchase_price = f.purchase_price ? parseFloat(f.purchase_price) : null;
      if (!isEditMode) {
        apiData.initial_quantity = f.initial_quantity ? parseInt(f.initial_quantity) : (f.opening_stock ? parseInt(f.opening_stock) : 0);
        apiData.initial_cost = f.initial_cost ? parseFloat(f.initial_cost) : (f.purchase_price ? parseFloat(f.purchase_price) : null);
        if (f.purchase_date) apiData.purchase_date = f.purchase_date;
        apiData.opening_stock = f.opening_stock ? parseInt(f.opening_stock) : 0;
      }
      apiData.low_stock_alert = f.low_stock_alert ? parseInt(f.low_stock_alert) : null;
    }

    const url = data?.id ? `${API_BASE}/admin/products/${data.id}` : `${API_BASE}/admin/products`;
    const method = data?.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(apiData)
      });
      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          toast(Object.values(result.errors).flat().join(', '), 'error');
        } else {
          toast(result.message || `Failed to ${data?.id ? 'update' : 'create'} product`, 'error');
        }
        setLoading(false);
        return;
      }

      const savedProduct = result.product || (result.product_id ? { ...apiData, id: result.product_id } : result);
      onSave(savedProduct);
      toast(`${f.type === 'product' ? 'Product' : 'Service'} ${data?.id ? 'updated' : 'created'} successfully`, 'success');
    } catch {
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

  // Handle HSN selection from autocomplete — also auto-fill GST if provided
  const handleHsnChange = (code, item) => {
    s('hsn_sac_code', code);
    // If the HSN record has a gst_rate, auto-fill the GST field
    if (item && item.gst_rate !== null && item.gst_rate !== undefined) {
      s('gst_rate', String(item.gst_rate));
    }
    // Clear error on change
    if (code) setErr(prev => ({ ...prev, hsn_sac_code: null }));
  };

  const ownVendorsCount = vendors.filter(v => v.type === 'own').length;
  const thirdPartyVendorsCount = vendors.filter(v => v.type === 'third_party').length;

  return (
    <div>
      {/* Type */}
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

      {/* Name */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Name *</label>
        <input className={`form-input ${err.name ? 'error' : ''}`} placeholder="Enter product/service name" value={f.name} onChange={e => s('name', e.target.value)} autoFocus />
        {err.name && <p className="form-err">{err.name}</p>}
      </div>

      {/* SKU (product only) */}
      {f.type === 'product' && (
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">SKU</label>
          <input
            className={`form-input ${err.sku ? 'error' : ''}`}
            placeholder="e.g., LAP-001"
            value={f.sku}
            onChange={e => s('sku', e.target.value.toUpperCase())}
            onBlur={(e) => e.target.value && checkSku(e.target.value)}
          />
          {checkingSku && <p className="form-err" style={{ color: '#6b7280' }}>Checking availability...</p>}
          {err.sku && <p className="form-err">{err.sku}</p>}
          {skuAvailable && f.sku && !checkingSku && !err.sku && (
            <p className="form-err" style={{ color: '#10b981' }}>
              <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> SKU is available
            </p>
          )}
        </div>
      )}

      {/* HSN / SAC Code — now with live search autocomplete */}
      <div style={{ marginBottom: 14 }}>
        <HsnCodeInput
          label={`${f.type === 'product' ? 'HSN Code' : 'SAC Code'} *`}
          value={f.hsn_sac_code}
          onChange={handleHsnChange}
          placeholder={f.type === 'product' ? 'e.g., 84713000' : 'e.g., 998314'}
          error={err.hsn_sac_code}
        />
      </div>

      {/* Category (product only) */}
      {f.type === 'product' && (
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Category</label>
          <input className="form-input" placeholder="e.g., Electronics, Clothing" value={f.category} onChange={e => s('category', e.target.value)} />
        </div>
      )}

      {/* Unit */}
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

      {/* Vendor (product only) */}
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

      {/* Selling / Purchase price */}
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

      {/* Initial quantity / cost / date (product, create only) */}
      {f.type === 'product' && !isEditMode && (
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

      {/* GST Rate */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">GST Rate (%)</label>
        <select className="form-select" value={f.gst_rate} onChange={e => s('gst_rate', e.target.value)}>
          <option value="">Not applicable</option>
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>
      </div>

      {/* Opening stock / low stock alert (product only) */}
      {f.type === 'product' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label className="form-label">Opening Stock</label>
            <input
              type="number"
              className={`form-input ${isEditMode ? 'form-input-disabled' : ''}`}
              placeholder="0"
              value={f.opening_stock}
              onChange={e => s('opening_stock', e.target.value)}
              disabled={isEditMode}
              style={isEditMode ? { background: 'var(--bg)', color: 'var(--muted)', cursor: 'not-allowed' } : {}}
            />
            {isEditMode && <p className="form-err" style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>Opening stock cannot be changed after product creation</p>}
          </div>
          <div>
            <label className="form-label">Low Stock Alert</label>
            <input type="number" className="form-input" placeholder="2" value={f.low_stock_alert} onChange={e => s('low_stock_alert', e.target.value)} />
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <label className="form-label">Description</label>
        <textarea className="form-input form-textarea" rows={2} placeholder="Enter product/service description..." value={f.description} onChange={e => s('description', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : (data?.id ? 'Update' : 'Create')}
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

// ─── Main Products Page ──────────────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const { toast, fmtMoney, currency } = useApp();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [del, setDel] = useState(null);
  const [delL, setDelL] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('products');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        let list = [];
        if (data.products && Array.isArray(data.products)) list = data.products;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data)) list = data;
        setProducts(list);
      } else {
        setError(data.message || 'Failed to load items. Please try again.');
      }
    } catch {
      setError('Network error. Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
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

  useEffect(() => {
    fetchProducts();
    fetchVendors();
  }, []);

  const handleSave = async () => {
    setSheetOpen(false);
    await fetchProducts();
    setEditData(null);
  };

  const handleDelete = async () => {
    setDelL(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/products/${del.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        await fetchProducts();
        toast('Item deleted successfully', 'success');
      } else {
        const data = await res.json();
        toast(data.message || 'Failed to delete item', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setDel(null);
      setDelL(false);
    }
  };

  const refreshVendors = async () => await fetchVendors();

  const getVendorName = (vendorId) => vendors.find(v => v.id === vendorId) || null;

  const filteredItems = products.filter(item => {
    const matchesType = activeTab === 'products' ? item.type === 'product' : item.type === 'service';
    const matchesSearch = !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.hsn_sac_code?.includes(search);
    return matchesType && matchesSearch;
  });

  const totalProducts = products.filter(p => p.type === 'product').length;
  const totalServices = products.filter(p => p.type === 'service').length;
  const lowStockCount = products.filter(p => p.type === 'product' && (parseInt(p.opening_stock) || 0) < (parseInt(p.low_stock_alert) || 5)).length;

  const handleAddClick = () => { setEditData(null); setSheetOpen(true); };

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>Products & Services</h1>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchProducts} title="Refresh"><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-brand btn-sm" onClick={handleAddClick}><Plus size={14} /> Add {activeTab === 'products' ? 'Product' : 'Service'}</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 22 }}>{totalProducts + totalServices}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Total Items</div></div>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 22 }}>{totalProducts}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Products</div></div>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 22 }}>{totalServices}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Services</div></div>
        <div className="stat-card"><div style={{ fontWeight: 800, fontSize: 22, color: lowStockCount > 0 ? '#dc2626' : 'var(--text)' }}>{lowStockCount}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Low Stock Items</div></div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => { setActiveTab('products'); setSearch(''); }} style={{ padding: '10px 20px', fontSize: 14, fontWeight: activeTab === 'products' ? 600 : 500, color: activeTab === 'products' ? 'var(--brand)' : 'var(--muted)', borderBottom: activeTab === 'products' ? '2px solid var(--brand)' : '2px solid transparent', background: 'transparent', cursor: 'pointer' }}>📦 Products ({totalProducts})</button>
          <button onClick={() => { setActiveTab('services'); setSearch(''); }} style={{ padding: '10px 20px', fontSize: 14, fontWeight: activeTab === 'services' ? 600 : 500, color: activeTab === 'services' ? 'var(--brand)' : 'var(--muted)', borderBottom: activeTab === 'services' ? '2px solid var(--brand)' : '2px solid transparent', background: 'transparent', cursor: 'pointer' }}>⚙️ Services ({totalServices})</button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><AlertCircle size={18} color="#dc2626" /><span style={{ fontSize: 13, color: '#991b1b' }}>{error}</span></div>
          <button onClick={fetchProducts} className="btn btn-outline btn-sm">Try Again</button>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ maxWidth: 400, flex: 1 }}>
            <Search size={14} color="var(--muted)" />
            <input placeholder={`Search by name, SKU or HSN${activeTab === 'services' ? '/SAC' : ''}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button className={`btn-icon${viewMode === 'list' ? ' btn-brand' : ''}`} onClick={() => setViewMode('list')}><List size={15} color={viewMode === 'list' ? 'var(--brand)' : 'var(--muted)'} /></button>
            <button className={`btn-icon${viewMode === 'grid' ? ' btn-brand' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 size={15} color={viewMode === 'grid' ? 'var(--brand)' : 'var(--muted)'} /></button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState type={activeTab === 'products' ? 'product' : 'service'} title={`No ${activeTab} found`} desc={search ? ['Try a different search term', `Or add a new ${activeTab.slice(0, -1)}`] : [`Click "Add ${activeTab === 'products' ? 'Product' : 'Service'}" to create your first ${activeTab.slice(0, -1)}`]} action={<button className="btn btn-brand btn-lg" onClick={handleAddClick}><Plus size={16} /> Add {activeTab === 'products' ? 'Product' : 'Service'}</button>} />
        ) : viewMode === 'grid' ? (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
            {filteredItems.map(p => {
              const vendor = getVendorName(p.vendor_id);
              return (
                <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--card-bg)', position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{p.type === 'product' ? <Package size={20} color="var(--brand)" /> : <Tag size={20} color="var(--brand)" />}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{p.type === 'product' ? (p.sku || 'No SKU') : (p.hsn_sac_code || 'No SAC')} · GST {p.gst_rate ?? 0}%</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand)' }}>{fmtMoney(p.selling_price || 0)}</div>
                  {p.type === 'product' && (
                    <>
                      <div style={{ fontSize: 11.5, color: (parseInt(p.opening_stock) || 0) < (parseInt(p.low_stock_alert) || 5) ? '#dc2626' : 'var(--muted)', marginTop: 4 }}>Stock: {p.opening_stock || 0}</div>
                      {vendor && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>{vendor.type === 'own' ? <Shield size={10} /> : <ExternalLink size={10} />}{vendor.name}</div>}
                    </>
                  )}
                  <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={() => { setEditData(p); setSheetOpen(true); }}><Pencil size={12} color="var(--text)" /></button>
                    <button className="btn-icon" onClick={() => setDel(p)}><Trash2 size={12} color="#dc2626" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  {activeTab === 'products' && <th>SKU</th>}
                  <th>{activeTab === 'products' ? 'HSN' : 'SAC'}</th>
                  <th>GST</th>
                  <th>Selling Price</th>
                  {activeTab === 'products' && <th>Stock</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(p => {
                  const vendor = getVendorName(p.vendor_id);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.type === 'product' ? <Package size={14} color="var(--brand)" /> : <Tag size={14} color="var(--brand)" />}</div>
                          <div><div style={{ fontWeight: 600 }}>{p.name}</div>{p.description && <div style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}</div>
                        </div>
                      </td>
                      <td><span className={`badge ${p.type === 'product' ? 'badge-brand' : 'badge-sent'}`}>{p.type}</span></td>
                      {activeTab === 'products' && <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.sku || '—'}</td>}
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.hsn_sac_code || '—'}</td>
                      <td><span className="badge badge-brand">{p.gst_rate ?? 0}%</span></td>
                      <td style={{ fontWeight: 700 }}>{fmtMoney(p.selling_price || 0)}</td>
                      {activeTab === 'products' && <td style={{ fontWeight: 600, color: (parseInt(p.opening_stock) || 0) < (parseInt(p.low_stock_alert) || 5) ? '#dc2626' : 'var(--text)' }}>{p.opening_stock || 0}</td>}
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => { setEditData(p); setSheetOpen(true); }}><Pencil size={13} /></button>
                          <button className="btn-icon" onClick={() => setDel(p)}><Trash2 size={13} color="#dc2626" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditData(null); }} title={editData?.id ? 'Edit Item' : `Add ${activeTab === 'products' ? 'Product' : 'Service'}`} size="lg">
        <ProductForm data={editData} onSave={handleSave} onCancel={() => { setSheetOpen(false); setEditData(null); }} toast={toast} vendors={vendors} refreshVendors={refreshVendors} />
      </Sheet>

      <DeleteModal open={!!del} onClose={() => setDel(null)} onConfirm={handleDelete} loading={delL} itemName={del?.type === 'product' ? 'Product' : 'Service'} />

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-input-disabled { background: var(--bg); color: var(--muted); cursor: not-allowed; }
        .field-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .field-row-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}