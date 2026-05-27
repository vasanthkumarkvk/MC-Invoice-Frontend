'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Upload, AlertCircle, X, Check } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import Sheet from '@/components/Sheet';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

const API_BASE = 'https://api.crazystory.in/api';

function VendorForm({ data, onSave, onCancel, toast }) {
  const [f, setF] = useState(data || { 
    name: '', 
    mobile: '', 
    email: '', 
    gstin: '', 
    address: '', 
    openingBalance: 0, 
    bank_name: '', 
    account_number: '', 
    ifsc_code: '', 
    branch: '', 
    upi_id: '', 
    pan: '',
    type: 'third_party'
  });
  const [err, setErr] = useState({});
  const [gstinLoading, setGstinLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingFields, setCheckingFields] = useState({});
  const [showCustomFields, setShowCustomFields] = useState(!!(f.bank_name || f.account_number || f.ifsc_code || f.branch || f.upi_id || f.pan));
  
  const isEditMode = !!data?.id;
  
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Generic function to check uniqueness for any field
  const checkUniqueness = async (field, value, ignoreCurrentId = false) => {
    if (!value) return true;
    
    setCheckingFields(prev => ({ ...prev, [field]: true }));
    try {
      const token = localStorage.getItem('zetsap_token');
      const body = ignoreCurrentId && data?.id 
        ? { field, value, vendor_id: data.id }
        : { field, value };
      
      const res = await fetch(`${API_BASE}/admin/vendors/check-unique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      const result = await res.json();
      
      if (result.available === false) {
        let errorMessage = '';
        switch (field) {
          case 'name':
            errorMessage = 'Vendor name is already taken';
            break;
          case 'mobile':
            errorMessage = 'Mobile number is already registered';
            break;
          case 'email':
            errorMessage = 'Email is already registered';
            break;
          case 'gstin':
            errorMessage = 'GSTIN is already registered';
            break;
          default:
            errorMessage = `${field} is already taken`;
        }
        setErr(prev => ({ ...prev, [field]: errorMessage }));
        return false;
      }
      
      setErr(prev => ({ ...prev, [field]: null }));
      return true;
    } catch (error) {
      console.error(`Check ${field} error:`, error);
      return true;
    } finally {
      setCheckingFields(prev => ({ ...prev, [field]: false }));
    }
  };

  // Validation functions for format
  const validateMobileFormat = (num) => {
    const mobileRegex = /^[0-9]{10}$/;
    if (num && !mobileRegex.test(num)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  };

  const validateEmailFormat = (em) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (em && !emailRegex.test(em)) {
      return 'Enter a valid email address';
    }
    return null;
  };

  const validateGstinFormat = (gst) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (gst && !gstinRegex.test(gst)) {
      return 'Enter a valid 15-digit GSTIN';
    }
    return null;
  };

  // Handle field changes with validation
  const handleNameChange = async (value) => {
    s('name', value);
    if (!value.trim()) {
      setErr(prev => ({ ...prev, name: 'Vendor name is required' }));
    } else {
      await checkUniqueness('name', value, true);
    }
  };

  const handleMobileChange = async (value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    s('mobile', cleanValue);
    
    const formatError = validateMobileFormat(cleanValue);
    if (formatError) {
      setErr(prev => ({ ...prev, mobile: formatError }));
    } else if (cleanValue) {
      setErr(prev => ({ ...prev, mobile: null }));
      await checkUniqueness('mobile', cleanValue, true);
    } else {
      setErr(prev => ({ ...prev, mobile: null }));
    }
  };

  const handleEmailChange = async (value) => {
    s('email', value);
    
    const formatError = validateEmailFormat(value);
    if (formatError) {
      setErr(prev => ({ ...prev, email: formatError }));
    } else if (value) {
      setErr(prev => ({ ...prev, email: null }));
      await checkUniqueness('email', value, true);
    } else {
      setErr(prev => ({ ...prev, email: null }));
    }
  };

  const handleGstinChange = async (value) => {
    const upperValue = value.toUpperCase();
    s('gstin', upperValue);
    
    const formatError = validateGstinFormat(upperValue);
    if (formatError) {
      setErr(prev => ({ ...prev, gstin: formatError }));
    } else if (upperValue) {
      setErr(prev => ({ ...prev, gstin: null }));
      await checkUniqueness('gstin', upperValue, true);
    } else {
      setErr(prev => ({ ...prev, gstin: null }));
    }
  };

  const validate = () => { 
    const e = {}; 
    if (!f.name.trim()) e.name = 'Vendor name is required'; 
    setErr(e); 
    return !Object.keys(e).length; 
  };

  // Verify GSTIN via API
  const fetchGstin = async () => {
    if (!f.gstin || f.gstin.length !== 15) { 
      toast('Enter a 15-digit GSTIN', 'error'); 
      return; 
    }
    setGstinLoading(true);
    try {
      const token = localStorage.getItem('zetsap_token');
      const res = await fetch(`${API_BASE}/admin/vendors/verify-gstin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gstin: f.gstin })
      });
      
      const result = await res.json();
      
      if (res.ok && result.data) {
        if (result.data.legal_name && !f.name) s('name', result.data.legal_name);
        if (result.data.trade_name && !f.name) s('name', result.data.trade_name);
        if (result.data.address?.address) s('address', result.data.address.address);
        toast('GSTIN verified successfully', 'success');
      } else {
        toast(result.message || 'GSTIN verification failed', 'error');
      }
    } catch (error) {
      console.error('GSTIN verification error:', error);
      toast('Error verifying GSTIN', 'error');
    } finally {
      setGstinLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    // Check for any remaining validation errors
    const hasErrors = Object.values(err).some(error => error !== null);
    if (hasErrors) {
      toast('Please fix all validation errors before submitting', 'error');
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    
    const apiData = {
      name: f.name.trim(),
      mobile: f.mobile || null,
      email: f.email || null,
      gstin: f.gstin || null,
      address: f.address || null,
      opening_balance: parseFloat(f.openingBalance) || 0,
      bank_name: f.bank_name || null,
      account_number: f.account_number || null,
      ifsc_code: f.ifsc_code || null,
      branch: f.branch || null,
      upi_id: f.upi_id || null,
      pan: f.pan || null,
      type: f.type || 'third_party'
    };
    
    const url = isEditMode ? `${API_BASE}/admin/vendors/${data.id}` : `${API_BASE}/admin/vendors`;
    const method = isEditMode ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          toast(errorMessages, 'error');
        } else {
          toast(result.message || `Failed to ${isEditMode ? 'update' : 'create'} vendor`, 'error');
        }
        setLoading(false);
        return;
      }
      
      const savedVendor = result.vendor || result;
      onSave(savedVendor);
      toast(`${isEditMode ? 'Vendor updated' : 'Vendor created'} successfully`, 'success');
    } catch (error) {
      console.error('Save vendor error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Vendor Type Selection */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Vendor Type *</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', border: `1px solid ${f.type === 'own' ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: f.type === 'own' ? 'var(--brand-bg)' : 'transparent' }}>
            <input type="radio" value="own" checked={f.type === 'own'} onChange={(e) => s('type', e.target.value)} style={{ margin: 0 }} />
            <span>🏢 My Business</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', border: `1px solid ${f.type === 'third_party' ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 8, background: f.type === 'third_party' ? 'var(--brand-bg)' : 'transparent' }}>
            <input type="radio" value="third_party" checked={f.type === 'third_party'} onChange={(e) => s('type', e.target.value)} style={{ margin: 0 }} />
            <span>🔗 Third Party</span>
          </label>
        </div>
      </div>

      {/* Vendor Name */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Vendor Name <span className="req">*</span></label>
        <input 
          className={`form-input${err.name ? ' error' : ''}`} 
          placeholder="Enter vendor name" 
          value={f.name} 
          onChange={e => handleNameChange(e.target.value)}
          autoFocus
        />
        {checkingFields.name && <p className="form-err" style={{ color: '#6b7280' }}>Checking availability...</p>}
        {err.name && <p className="form-err">{err.name}</p>}
        {f.name && !err.name && !checkingFields.name && <p className="form-err" style={{ color: '#10b981' }}>✓ Name is available</p>}
      </div>

      {/* Mobile and Email */}
      <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">Mobile</label>
          <input 
            className={`form-input${err.mobile ? ' error' : ''}`} 
            placeholder="9876543210" 
            value={f.mobile} 
            onChange={e => handleMobileChange(e.target.value)}
          />
          {checkingFields.mobile && <p className="form-err" style={{ color: '#6b7280' }}>Checking mobile...</p>}
          {err.mobile && <p className="form-err">{err.mobile}</p>}
          {f.mobile && !err.mobile && !checkingFields.mobile && <p className="form-err" style={{ color: '#10b981' }}>✓ Mobile is available</p>}
        </div>
        <div>
          <label className="form-label">Email</label>
          <input 
            className={`form-input${err.email ? ' error' : ''}`} 
            type="email" 
            placeholder="vendor@example.com" 
            value={f.email} 
            onChange={e => handleEmailChange(e.target.value)}
          />
          {checkingFields.email && <p className="form-err" style={{ color: '#6b7280' }}>Checking email...</p>}
          {err.email && <p className="form-err">{err.email}</p>}
          {f.email && !err.email && !checkingFields.email && <p className="form-err" style={{ color: '#10b981' }}>✓ Email is available</p>}
        </div>
      </div>

      {/* GSTIN */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">GSTIN</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input 
            className={`form-input${err.gstin ? ' error' : ''}`} 
            style={{ flex: 1 }} 
            placeholder="29AABCT1332L0Z" 
            maxLength={15} 
            value={f.gstin} 
            onChange={e => handleGstinChange(e.target.value)}
          />
          <button 
            className="btn btn-outline btn-sm" 
            onClick={fetchGstin} 
            disabled={gstinLoading || !!err.gstin} 
            title="Auto-fill name and address from GSTIN"
          >
            {gstinLoading ? 'Verifying…' : 'Verify GSTIN'}
          </button>
        </div>
        {checkingFields.gstin && <p className="form-err" style={{ color: '#6b7280' }}>Checking GSTIN...</p>}
        {err.gstin && <p className="form-err">{err.gstin}</p>}
        {f.gstin && !err.gstin && !checkingFields.gstin && <p className="form-err" style={{ color: '#10b981' }}>✓ GSTIN is valid and available</p>}
      </div>

      {/* Address */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Address</label>
        <textarea 
          className="form-input form-textarea" 
          rows={2} 
          placeholder="123 Supplier Street, Chennai" 
          value={f.address || ''} 
          onChange={e => s('address', e.target.value)}
        />
      </div>

      {/* Opening Balance */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Opening Balance (₹)</label>
        <input 
          className="form-input" 
          type="number" 
          min="0" 
          step="1" 
          style={{ maxWidth: 200 }} 
          value={f.openingBalance || ''} 
          onChange={e => s('openingBalance', Math.max(0, parseInt(e.target.value) || 0))}
        />
      </div>

      {/* Bank Details - Custom Fields */}
      <div style={{ marginBottom: 16 }}>
        <button 
          style={{
            width: '100%', 
            padding: '11px 14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: showCustomFields ? '10px 10px 0 0' : 10,
            cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#92400e',
            textAlign: 'left'
          }}
          onClick={() => setShowCustomFields(!showCustomFields)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{'>'}</span>
            <span style={{ fontWeight: 700, color: 'var(--brand)' }}>Bank Details</span>
            <span style={{ fontSize: 11, color: '#92400e', fontWeight: 400 }}>Bank account, IFSC, UPI, etc.</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" style={{ transform: showCustomFields ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {showCustomFields && (
          <div style={{ border: '1px solid #fde68a', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '16px', background: '#fffbeb' }}>
            <div className="field-row field-row-2" style={{ marginBottom: 12 }}>
              <div>
                <label className="form-label">Bank Name</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. HDFC Bank" 
                  value={f.bank_name || ''} 
                  onChange={e => s('bank_name', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Account Number</label>
                <input 
                  className="form-input" 
                  placeholder="1234567890" 
                  value={f.account_number || ''} 
                  onChange={e => s('account_number', e.target.value)}
                />
              </div>
            </div>
            <div className="field-row field-row-2" style={{ marginBottom: 12 }}>
              <div>
                <label className="form-label">IFSC Code</label>
                <input 
                  className="form-input" 
                  placeholder="HDFC0001234" 
                  value={f.ifsc_code || ''} 
                  onChange={e => s('ifsc_code', e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <input 
                  className="form-input" 
                  placeholder="Anna Nagar" 
                  value={f.branch || ''} 
                  onChange={e => s('branch', e.target.value)}
                />
              </div>
            </div>
            <div className="field-row field-row-2">
              <div>
                <label className="form-label">UPI ID</label>
                <input 
                  className="form-input" 
                  placeholder="vendor@upi" 
                  value={f.upi_id || ''} 
                  onChange={e => s('upi_id', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">PAN Number</label>
                <input 
                  className="form-input" 
                  placeholder="ABCDE1234F" 
                  value={f.pan || ''} 
                  onChange={e => s('pan', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : (isEditMode ? 'Update Vendor' : 'Create Vendor')}
        </button>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const { state, toast } = useApp();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [del, setDel] = useState(null);
  const [delL, setDelL] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GET /admin/vendors - Fetch all vendors
  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('zetsap_token');
    
    try {
      const res = await fetch(`${API_BASE}/admin/vendors`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        let vendorsList = [];
        if (Array.isArray(data)) {
          vendorsList = data;
        } else if (data.vendors && Array.isArray(data.vendors)) {
          vendorsList = data.vendors;
        } else if (data.data && Array.isArray(data.data)) {
          vendorsList = data.data;
        } else {
          vendorsList = [];
        }
        setVendors(vendorsList);
      } else {
        console.error('Failed to fetch vendors:', data);
        setError(data.message || 'Failed to load vendors. Please try again.');
        const fallbackVendors = state.vendors || [];
        if (fallbackVendors.length > 0) {
          setVendors(fallbackVendors);
        }
      }
    } catch (err) {
      console.error('Fetch vendors error:', err);
      setError('Network error. Unable to connect to server.');
      const fallbackVendors = state.vendors || [];
      if (fallbackVendors.length > 0) {
        setVendors(fallbackVendors);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSave = async (vendor) => {
    setSheetOpen(false);
    await fetchVendors();
    setEditData(null);
  };

  const handleDelete = async () => {
    setDelL(true);
    const token = localStorage.getItem('zetsap_token');
    
    try {
      const res = await fetch(`${API_BASE}/admin/vendors/${del.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await fetchVendors();
        toast(data.message || 'Vendor deleted successfully', 'success');
      } else {
        toast(data.message || 'Failed to delete vendor', 'error');
      }
    } catch (error) {
      console.error('Delete vendor error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setDel(null);
      setDelL(false);
    }
  };

  const filtered = vendors.filter(v => 
    !search || 
    v.name?.toLowerCase().includes(search.toLowerCase()) || 
    v.mobile?.includes(search) || 
    v.gstin?.toLowerCase().includes(search.toLowerCase())
  );

  const openForm = (data = null) => {
    setEditData(data);
    setSheetOpen(true);
  };

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading vendors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22 }}>Vendors</h1>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchVendors} title="Refresh">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {' '}Refresh
          </button>
          <button className="btn btn-outline btn-sm"><Upload size={13}/> Import</button>
          <button className="btn btn-brand btn-sm" onClick={() => openForm()}><Plus size={14}/> Add Vendor</button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#991b1b' }}>{error}</span>
          </div>
          <button onClick={fetchVendors} className="btn btn-outline btn-sm">Try Again</button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { l: 'Total Vendors', v: vendors.length },
          { l: 'With GSTIN', v: vendors.filter(v => v.gstin).length },
          { l: 'My Business', v: vendors.filter(v => v.type === 'own').length },
          { l: 'Third Party', v: vendors.filter(v => v.type === 'third_party' || !v.type).length }
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div style={{ fontWeight: 800, fontSize: 22 }}>{s.v}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-bar" style={{ maxWidth: 300 }}>
            <Search size={14} color="#9ca3af"/>
            <input 
              placeholder="Search name, mobile, GSTIN…" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {filtered.length === 0 ? (
          <EmptyState 
            type="generic" 
            title="No vendors yet"
            desc={['Add vendors to create purchase orders', 'Track outstanding payables', 'Store GSTIN and contact details']}
            action={
              <button className="btn btn-brand btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openForm()}>
                <Plus size={16}/> Add your first vendor
              </button>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Type</th>
                  <th>Mobile</th>
                  <th>GSTIN</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 8, 
                          background: v.type === 'own' ? '#d1fae5' : '#dbeafe', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 700, 
                          color: v.type === 'own' ? '#065f46' : '#1e40af', 
                          fontSize: 13 
                        }}>
                          {v.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{v.name}</div>
                          <div style={{ fontSize: 11.5, color: '#9ca3af' }}>{v.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4, 
                        fontSize: 12,
                        padding: '4px 8px',
                        borderRadius: 20,
                        background: v.type === 'own' ? '#d1fae5' : '#e0e7ff',
                        color: v.type === 'own' ? '#065f46' : '#1e40af',
                        width: 'fit-content'
                      }}>
                        {v.type === 'own' ? '🏢 My Business' : '🔗 Third Party'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.mobile || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.gstin || '—'}</td>
                    <td style={{ maxWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word' }}>{v.address || '—'}</td>
                    <td>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openForm(v)}>
                          <Pencil size={13}/>
                        </button>
                        <button className="btn-icon" onClick={() => setDel(v)}>
                          <Trash2 size={13} color="#dc2626"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Vendor Sheet */}
      <Sheet 
        open={sheetOpen} 
        onClose={() => setSheetOpen(false)} 
        title={editData?.id ? 'Edit Vendor' : 'Add Vendor'} 
        size="md"
      >
        <VendorForm 
          data={editData} 
          onSave={handleSave} 
          onCancel={() => setSheetOpen(false)} 
          toast={toast}
        />
      </Sheet>

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        open={!!del} 
        onClose={() => setDel(null)} 
        onConfirm={handleDelete} 
        loading={delL} 
        itemName="Vendor"
      />

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .field-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 640px) {
          .field-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}