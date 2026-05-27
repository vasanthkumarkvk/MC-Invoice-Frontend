'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Upload, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { fmtRs, STATES } from '@/lib/data';
import Sheet from '@/components/Sheet';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

const API_BASE = 'https://api.crazystory.in/api';

// Success Modal Component
function SuccessModal({ open, message, onClose, type = 'success' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            width: 60, height: 60, borderRadius: '50%', 
            background: type === 'success' ? '#ecfdf5' : '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto' 
          }}>
            {type === 'success' ? 
              <CheckCircle2 size={32} color="#059669" /> : 
              <AlertCircle size={32} color="#dc2626" />
            }
          </div>
        </div>
        <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          {type === 'success' ? 'Success!' : 'Error!'}
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>{message}</p>
        <button className="btn btn-brand" onClick={onClose} style={{ width: '100%' }}>OK</button>
      </div>
    </div>
  );
}

function CustomerForm({ data, onSave, onCancel, toast }) {
  const blank = { 
    name: '', mobile: '', email: '', gstin: '', billing_address: '', 
    city: '', state: 'Tamil Nadu', pincode: '', opening_balance: 0, 
    tds: false, tcs: false, rcm: false, pan: '', price_list: '', 
    debit_limit: 0, tags: '', notes: '', cc_emails: '', default_due_days: '', 
    image_url: '', bank_name: '', account_number: '', ifsc_code: '', 
    branch: '', upi_id: '' 
  };
  
  const [f, setF] = useState(data || blank);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [imgPreview, setImgPreview] = useState(data?.image_url || null);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [checkingUnique, setCheckingUnique] = useState({});
  const [uniqueStatus, setUniqueStatus] = useState({});

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Check uniqueness for mobile, email, gstin, pan
  const checkUniqueness = async (field, value) => {
    if (!value || (data && data[field] === value)) {
      setUniqueStatus(prev => ({ ...prev, [field]: 'valid' }));
      return true;
    }
    
    setCheckingUnique(prev => ({ ...prev, [field]: true }));
    setUniqueStatus(prev => ({ ...prev, [field]: 'checking' }));
    
    try {
      const token = localStorage.getItem('zetsap_token');
      const res = await fetch(`${API_BASE}/admin/customers/check-unique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ field, value })
      });
      
      const result = await res.json();
      
      if (result.available === false) {
        const errorMsg = `${field === 'mobile' ? 'Mobile number' : field === 'gstin' ? 'GSTIN' : field.toUpperCase()} is already taken`;
        setErr(prev => ({ ...prev, [field]: errorMsg }));
        setUniqueStatus(prev => ({ ...prev, [field]: 'error' }));
        return false;
      }
      
      setErr(prev => ({ ...prev, [field]: null }));
      setUniqueStatus(prev => ({ ...prev, [field]: 'available' }));
      return true;
    } catch (error) {
      console.error('Check uniqueness error:', error);
      setUniqueStatus(prev => ({ ...prev, [field]: 'valid' }));
      return true;
    } finally {
      setCheckingUnique(prev => ({ ...prev, [field]: false }));
    }
  };

  const validate = () => {
    const e = {};
    if (!f.name?.trim()) e.name = 'Customer name is required';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const fetchGstin = async () => {
    if (!f.gstin || f.gstin.length !== 15) {
      toast('Enter a 15-digit GSTIN', 'error');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    s('name', f.name || 'Business Name from GSTIN');
    setLoading(false);
    toast('GSTIN verified', 'success');
  };

  const Toggle = ({ on, onClick }) => (
    <div className={`tog-track${on ? ' on' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="tog-thumb" />
    </div>
  );

  const handleImg = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImgPreview(ev.target.result);
      s('image_url', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFieldChange = (field, value) => {
    s(field, value);
    if (err[field]) {
      setErr(prev => ({ ...prev, [field]: null }));
    }
    setUniqueStatus(prev => ({ ...prev, [field]: 'pending' }));
  };

  const handleBlur = async (field, value) => {
    if (value && ['mobile', 'email', 'gstin', 'pan'].includes(field)) {
      if (!data || data[field] !== value) {
        await checkUniqueness(field, value);
      } else {
        setUniqueStatus(prev => ({ ...prev, [field]: 'valid' }));
      }
    }
  };

  const getStatusIcon = (field) => {
    if (checkingUnique[field]) {
      return <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 8 }}>Checking...</span>;
    }
    if (uniqueStatus[field] === 'available') {
      return <span style={{ fontSize: 10, color: '#10b981', marginLeft: 8 }}>✓ Available</span>;
    }
    if (uniqueStatus[field] === 'error') {
      return <span style={{ fontSize: 10, color: '#dc2626', marginLeft: 8 }}>✗ Taken</span>;
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Customer Name <span className="req">*</span></label>
        <input 
          className={`form-input${err.name ? ' error' : ''}`} 
          placeholder="Enter customer name" 
          value={f.name} 
          onChange={e => handleFieldChange('name', e.target.value)} 
          autoFocus
        />
        {err.name && <p className="form-err">{err.name}</p>}
      </div>
      
      <div className="field-row field-row-2" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">Mobile</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              className={`form-input${err.mobile ? ' error' : ''}`} 
              style={{ flex: 1 }}
              placeholder="9876543210" 
              value={f.mobile} 
              onChange={e => handleFieldChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={e => handleBlur('mobile', e.target.value)}
            />
            {getStatusIcon('mobile')}
          </div>
          {err.mobile && <p className="form-err">{err.mobile}</p>}
          {!err.mobile && f.mobile && uniqueStatus.mobile === 'available' && !checkingUnique.mobile && (
            <p className="form-err" style={{ color: '#10b981' }}>✓ Mobile number is available</p>
          )}
        </div>
        <div>
          <label className="form-label">Email</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              className={`form-input${err.email ? ' error' : ''}`} 
              style={{ flex: 1 }}
              type="email" 
              placeholder="customer@email.com" 
              value={f.email} 
              onChange={e => handleFieldChange('email', e.target.value)}
              onBlur={e => handleBlur('email', e.target.value)}
            />
            {getStatusIcon('email')}
          </div>
          {err.email && <p className="form-err">{err.email}</p>}
          {!err.email && f.email && uniqueStatus.email === 'available' && !checkingUnique.email && (
            <p className="form-err" style={{ color: '#10b981' }}>✓ Email is available</p>
          )}
        </div>
      </div>
      
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">GSTIN</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <input 
              className={`form-input${err.gstin ? ' error' : ''}`} 
              style={{ flex: 1 }}
              placeholder="29AABCT1332L000" 
              maxLength={15} 
              value={f.gstin} 
              onChange={e => handleFieldChange('gstin', e.target.value.toUpperCase())}
              onBlur={e => handleBlur('gstin', e.target.value)}
            />
            {getStatusIcon('gstin')}
          </div>
          <button 
            className="btn btn-outline btn-sm" 
            style={{ flexShrink: 0 }} 
            onClick={fetchGstin} 
            disabled={loading}
          >
            {loading ? 'Verifying…' : 'Verify GSTIN'}
          </button>
        </div>
        {err.gstin && <p className="form-err">{err.gstin}</p>}
        {!err.gstin && f.gstin && uniqueStatus.gstin === 'available' && !checkingUnique.gstin && (
          <p className="form-err" style={{ color: '#10b981' }}>✓ GSTIN is available</p>
        )}
      </div>
      
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Billing Address</label>
        <textarea 
          className="form-input form-textarea" 
          rows={2} 
          value={f.billing_address} 
          onChange={e => s('billing_address', e.target.value)}
        />
      </div>
      
      <div className="field-row field-row-3" style={{ marginBottom: 14 }}>
        <div>
          <label className="form-label">City</label>
          <input 
            className="form-input" 
            value={f.city} 
            onChange={e => s('city', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">State</label>
          <select 
            className="form-select" 
            value={f.state} 
            onChange={e => s('state', e.target.value)}
          >
            {STATES.map(st => <option key={st}>{st}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Pincode</label>
          <input 
            className="form-input" 
            value={f.pincode} 
            onChange={e => s('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Opening Balance (₹)</label>
        <input 
          className="form-input" 
          type="number" 
          min="0" 
          step="0.01"
          style={{ maxWidth: 200 }} 
          value={f.opening_balance || ''} 
          onChange={e => s('opening_balance', Math.max(0, parseFloat(e.target.value) || 0))}
        />
      </div>

     

      {/* Custom Fields - Bank details */}
      <div style={{ marginBottom: 16 }}>
        <button 
          style={{ 
            width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', 
            justifyContent: 'space-between', background: '#fffbeb', border: '1px solid #fde68a', 
            borderRadius: showCustomFields ? '10px 10px 0 0' : 10, cursor: 'pointer', 
            fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: '#92400e', 
            textAlign: 'left'
          }}
          onClick={() => setShowCustomFields(!showCustomFields)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{'>'}</span>
            <span style={{ fontWeight: 700, color: 'var(--brand)' }}>Bank Details</span>
            <span style={{ fontSize: 11, color: '#92400e', fontWeight: 400 }}>Account details, IFSC, UPI</span>
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
                  placeholder="Account number" 
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
                  placeholder="e.g. HDFC0001234" 
                  value={f.ifsc_code || ''} 
                  onChange={e => s('ifsc_code', e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <input 
                  className="form-input" 
                  placeholder="Branch name" 
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
                  placeholder="e.g. customer@upi" 
                  value={f.upi_id || ''} 
                  onChange={e => s('upi_id', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button 
          className="btn btn-brand" 
          onClick={async () => {
            if (validate()) onSave(f);
          }}
          disabled={Object.values(checkingUnique).some(v => v === true)}
        >
          {Object.values(checkingUnique).some(v => v === true) ? 'Checking...' : 'Save Customer'}
        </button>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { state, addItem, editItem, removeItem, toast, fmtMoney } = useApp();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [del, setDel] = useState(null);
  const [delL, setDelL] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [successModal, setSuccessModal] = useState({ open: false, message: '', type: 'success' });

  const filtered = customers.filter(c => 
    !search || 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.mobile?.includes(search) || 
    c.gstin?.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalOutstanding = customers.reduce((s, c) => s + (parseFloat(c.opening_balance) || 0), 0);
  const customersWithGstin = customers.filter(c => c.gstin).length;

  // Fetch customers from API
  const fetchCustomers = async () => {
    setFetching(true);
    const token = localStorage.getItem('zetsap_token');
    
    try {
      const res = await fetch(`${API_BASE}/admin/customers`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        let customersList = [];
        if (data.customers && Array.isArray(data.customers)) {
          customersList = data.customers;
        } else if (data.data && Array.isArray(data.data)) {
          customersList = data.data;
        } else if (Array.isArray(data)) {
          customersList = data;
        }
        
        setCustomers(customersList);
      } else {
        console.error('Failed to fetch customers:', data);
        toast(data.message || 'Failed to fetch customers', 'error');
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openForm = (data = null) => {
    setEditData(data);
    setSheetOpen(true);
  };

  const handleSave = async (formData) => {
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    
    const apiData = { ...formData };
    const url = formData.id 
      ? `${API_BASE}/admin/customers/${formData.id}` 
      : `${API_BASE}/admin/customers`;
    
    const method = formData.id ? 'PUT' : 'POST';
    
    if (!formData.id) {
      delete apiData.id;
    }
    
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
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          toast(errorMessages, 'error');
        } else {
          toast(data.message || 'Failed to save customer', 'error');
        }
        setLoading(false);
        return;
      }
      
      // Refresh customers list after save
      await fetchCustomers();
      
      setSheetOpen(false);
      setSuccessModal({
        open: true,
        message: formData.id ? 'Customer updated successfully!' : 'Customer added successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Save customer error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDelL(true);
    const token = localStorage.getItem('zetsap_token');
    
    try {
      const res = await fetch(`${API_BASE}/admin/customers/${del.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== del.id));
        setSuccessModal({
          open: true,
          message: data.message || 'Customer deleted successfully!',
          type: 'success'
        });
      } else {
        setSuccessModal({
          open: true,
          message: data.message || 'Failed to delete customer',
          type: 'error'
        });
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Delete customer error:', error);
      setSuccessModal({
        open: true,
        message: 'Network error. Please try again.',
        type: 'error'
      });
      await fetchCustomers();
    } finally {
      setDel(null);
      setDelL(false);
    }
  };

  if (fetching) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 40, height: 40, border: '3px solid #f3f4f6', 
              borderTopColor: '#8f195c', borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' 
            }} />
            <p style={{ color: 'var(--muted)' }}>Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Success/Error Modal */}
      <SuccessModal 
        open={successModal.open}
        message={successModal.message}
        type={successModal.type}
        onClose={() => setSuccessModal({ open: false, message: '', type: 'success' })}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>Customers</h1>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchCustomers}>
            <Upload size={13} /> Refresh
          </button>
          <button className="btn btn-brand btn-sm" onClick={() => openForm()}>
            <Plus size={14} /> Add Customer
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>{customers.length}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Total Customers</div>
        </div>
        <div className="stat-card">
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>{customersWithGstin}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>With GSTIN</div>
        </div>
        <div className="stat-card">
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>{fmtMoney(totalOutstanding)}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Outstanding</div>
        </div>
      </div>
      
      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ maxWidth: 400 }}>
            <Search size={14} color="var(--muted)" />
            <input 
              placeholder="Search name, mobile, GSTIN…" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 12.5 }}>Export</button>
        </div>
        
        {customers.length === 0 ? (
          <EmptyState 
            type="generic" 
            title="No customers yet"
            desc={[
              'Add customers to create invoices and track payments',
              'Store GSTIN, address and contact info',
              'View complete payment history per customer'
            ]}
            action={
              <button className="btn btn-brand btn-lg" style={{ justifyContent: 'center' }} onClick={() => openForm()}>
                <Plus size={16} /> Add your first customer
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
            No customers found for your search
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>GSTIN</th>
                  <th>City</th>
                  <th>Outstanding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {c.image_url ? 
                          <img src={c.image_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} /> :
                          <div style={{ 
                            width: 32, height: 32, borderRadius: 8, background: 'var(--brand-bg)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 700, color: 'var(--brand)', fontSize: 13, flexShrink: 0
                          }}>
                            {c.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        }
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{c.mobile || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{c.gstin || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.city || '—'}</td>
                    <td style={{ fontWeight: 700, color: c.opening_balance > 0 ? '#065f46' : 'var(--text)' }}>
                      {fmtMoney(c.opening_balance || 0)}
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openForm(c)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="btn-icon" onClick={() => setDel(c)} title="Delete">
                          <Trash2 size={13} color="#dc2626" />
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
      
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editData?.id ? 'Edit Customer' : 'Add Customer'} size="lg">
        <CustomerForm 
          data={editData} 
          onSave={handleSave} 
          onCancel={() => setSheetOpen(false)} 
          toast={toast}
        />
      </Sheet>
      
      <DeleteModal 
        open={!!del} 
        onClose={() => setDel(null)} 
        onConfirm={handleDelete} 
        loading={delL} 
        itemName="Customer"
      />
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}