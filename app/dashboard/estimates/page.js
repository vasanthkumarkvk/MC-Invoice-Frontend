'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Copy, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { calcDoc, fmtRs, fmtDate, today, addDays, nextId } from '@/lib/data';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import Sheet from '@/components/Sheet';

const API_BASE = 'https://api.crazystory.in/api';

const ST = { 
  draft: { l: 'Draft', c: 'badge-draft' }, 
  sent: { l: 'Sent', c: 'badge-sent' }, 
  accepted: { l: 'Accepted', c: 'badge-paid' }, 
  expired: { l: 'Expired', c: 'badge-overdue' },
  rejected: { l: 'Rejected', c: 'badge-draft' }
};

// Edit Quotation Form Component
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
          toast(result.message || 'Failed to update quotation', 'error');
        }
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
        <select 
          className={`form-select ${err.customer_id ? 'error' : ''}`}
          value={f.customer_id}
          onChange={e => s('customer_id', e.target.value)}
        >
          <option value="">Select Customer...</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
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
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="rejected">Rejected</option>
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
        <button className="btn btn-brand" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Updating...' : 'Update Quotation'}
        </button>
      </div>
    </div>
  );
}

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

  // GET /admin/quotations - Fetch all quotations
  const fetchEstimates = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('zetsap_token');

    try {
      const res = await fetch(`${API_BASE}/admin/quotations`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        let estimatesList = [];
        if (data.quotations && Array.isArray(data.quotations)) {
          estimatesList = data.quotations;
        } else if (data.data && Array.isArray(data.data)) {
          estimatesList = data.data;
        } else if (Array.isArray(data)) {
          estimatesList = data;
        } else {
          estimatesList = [];
        }
        setEstimates(estimatesList);
      } else {
        console.error('Failed to fetch quotations:', data);
        setError(data.message || 'Failed to load quotations. Please try again.');
        const fallbackEstimates = state.estimates || [];
        if (fallbackEstimates.length > 0) {
          setEstimates(fallbackEstimates);
        }
      }
    } catch (err) {
      console.error('Fetch quotations error:', err);
      setError('Network error. Unable to connect to server.');
      const fallbackEstimates = state.estimates || [];
      if (fallbackEstimates.length > 0) {
        setEstimates(fallbackEstimates);
      }
    } finally {
      setLoading(false);
    }
  };

  // GET /admin/customers - Fetch customers
  const fetchCustomers = async () => {
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
        } else {
          customersList = [];
        }
        setCustomers(customersList);
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
  };

  // GET /admin/quotations/{id} - Fetch single quotation for edit
  const fetchEstimateById = async (id) => {
    const token = localStorage.getItem('zetsap_token');

    try {
      const res = await fetch(`${API_BASE}/admin/quotations/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        return data.quotation || data;
      }
      return null;
    } catch (error) {
      console.error('Fetch quotation error:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchEstimates();
    fetchCustomers();
  }, []);

  // Handle Edit
  const handleEdit = async (estimate) => {
    const freshData = await fetchEstimateById(estimate.id);
    if (freshData) {
      setEditData(freshData);
      setSheetOpen(true);
    }
  };

  const handleSave = async (updatedEstimate) => {
    setSheetOpen(false);
    await fetchEstimates();
    setEditData(null);
  };

  // Convert quotation to invoice
  const handleConvert = async (est) => {
    const token = localStorage.getItem('zetsap_token');

    try {
      // First get the full quotation details
      const quotation = await fetchEstimateById(est.id);
      if (!quotation) {
        toast('Failed to load quotation details', 'error');
        return;
      }

      // Create invoice from quotation
      const invoiceData = {
        customer_id: quotation.customer_id,
        invoice_date: today(),
        due_date: addDays(30),
        reference: quotation.reference,
        notes: quotation.notes,
        terms_conditions: quotation.terms,
        items: (quotation.items || []).map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          hsn_sac_code: item.hsn_sac_code || '',
          quantity: parseFloat(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          discount_percent: parseFloat(item.discount_percent) || 0,
          gst_rate: parseFloat(item.gst_rate) || 0,
          unit: item.unit || 'Nos'
        })),
        subtotal: parseFloat(quotation.subtotal) || 0,
        gst_amount: parseFloat(quotation.gst_amount) || 0,
        discount_amount: 0,
        adjustment_amount: 0,
        round_off: false,
        status: 'draft'
      };

      const res = await fetch(`${API_BASE}/admin/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData)
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.message || 'Failed to convert to invoice', 'error');
        return;
      }

      toast('Converted to Invoice successfully!', 'success');
      router.push('/dashboard/sales');
    } catch (error) {
      console.error('Convert to invoice error:', error);
      toast('Network error. Please try again.', 'error');
    }
  };

  // DELETE /admin/quotations/{id} - Delete quotation
  const handleDelete = async () => {
    setDelL(true);
    const token = localStorage.getItem('zetsap_token');

    try {
      const res = await fetch(`${API_BASE}/admin/quotations/${del.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        await fetchEstimates();
        removeItem('estimates', del.id);
        toast(data.message || 'Quotation deleted successfully', 'success');
      } else {
        toast(data.message || 'Failed to delete quotation', 'error');
      }
    } catch (error) {
      console.error('Delete quotation error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setDel(null);
      setDelL(false);
    }
  };

  // Calculate total for a quotation
  const calculateTotal = (quotation) => {
    const subtotal = parseFloat(quotation.subtotal) || 0;
    const gst = parseFloat(quotation.gst_amount) || 0;
    return subtotal + gst;
  };

  const filtered = estimates.filter(e => {
    const customer = customers.find(x => x.id === e.customer_id);
    return (!search || 
      (e.quotation_number || e.number || '').toLowerCase().includes(search.toLowerCase()) || 
      (customer?.name || '').toLowerCase().includes(search.toLowerCase())) && 
      (sf === 'all' || e.status === sf);
  });

  // Status counts
  const totalCount = estimates.length;
  const sentCount = estimates.filter(e => e.status === 'sent').length;
  const acceptedCount = estimates.filter(e => e.status === 'accepted').length;

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
          <button className="btn btn-outline btn-sm" onClick={fetchEstimates} title="Refresh">
            <RefreshCw size={13} /> Refresh
          </button>
          <Link href="/dashboard/create/estimate" className="btn btn-brand btn-sm">
            <Plus size={14} /> Create Quotation
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#991b1b' }}>{error}</span>
          </div>
          <button onClick={fetchEstimates} className="btn btn-outline btn-sm">Try Again</button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <div style={{ fontWeight: 800, fontSize: 24 }}>{totalCount}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Total Quotations</div>
        </div>
        <div className="stat-card">
          <div style={{ fontWeight: 800, fontSize: 24, color: '#f59e0b' }}>{sentCount}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Sent</div>
        </div>
        <div className="stat-card">
          <div style={{ fontWeight: 800, fontSize: 24, color: '#10b981' }}>{acceptedCount}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Accepted</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ maxWidth: 280 }}>
            <Search size={14} color="#9ca3af" />
            <input placeholder="Search by number or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['all', 'draft', 'sent', 'accepted', 'expired', 'rejected'].map(s => (
              <button 
                key={s} 
                className={`chip${sf === s ? ' active' : ''}`} 
                style={{ fontSize: 12, textTransform: 'capitalize' }} 
                onClick={() => setSf(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState 
            type="generic" 
            title="No quotations yet" 
            desc={['Create quotations and convert them to invoices', 'Share quotes with customers via WhatsApp or email']}
            action={
              <Link href="/dashboard/create/estimate" className="btn btn-brand btn-lg" style={{ justifyContent: 'center' }}>
                <Plus size={16} /> Create Quotation
              </Link>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Valid Till</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const customer = customers.find(x => x.id === e.customer_id);
                  const total = calculateTotal(e);
                  const st = ST[e.status] || ST.draft;
                  const quotationNumber = e.quotation_number || e.number || `QT-${e.id}`;
                  
                  return (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{quotationNumber}</td>
                      <td style={{ fontWeight: 600 }}>{customer?.name || '—'}</td>
                      <td style={{ color: 'var(--muted)' }}>{fmtDate(e.quotation_date || e.date)}</td>
                      <td style={{ color: 'var(--muted)' }}>{fmtDate(e.validity_date || e.dueDate) || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{fmtMoney(total)}</td>
                      <td>
                        <span className={`badge ${st.c}`} style={{ 
                          background: e.status === 'accepted' ? '#d1fae5' : e.status === 'sent' ? '#dbeafe' : '#f3f4f6',
                          color: e.status === 'accepted' ? '#065f46' : e.status === 'sent' ? '#1e40af' : '#6b7280'
                        }}>
                          {st.l}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            className="btn btn-sm" 
                            style={{ fontSize: 11.5, background: 'var(--brand-bg)', color: 'var(--brand)', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }} 
                            onClick={() => handleConvert(e)}
                          >
                            Convert →
                          </button>
                          <button className="btn-icon" onClick={() => handleEdit(e)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button className="btn-icon" onClick={() => setDel(e)} title="Delete">
                            <Trash2 size={13} color="#dc2626" />
                          </button>
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

      {/* Edit Quotation Sheet */}
      <Sheet 
        open={sheetOpen} 
        onClose={() => { setSheetOpen(false); setEditData(null); }} 
        title="Edit Quotation" 
        size="md"
      >
        <EditQuotationForm 
          data={editData} 
          onSave={handleSave} 
          onCancel={() => { setSheetOpen(false); setEditData(null); }} 
          toast={toast}
          customers={customers}
        />
      </Sheet>

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        open={!!del} 
        onClose={() => setDel(null)} 
        onConfirm={handleDelete} 
        loading={delL} 
        itemName="Quotation"
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
        .chip {
          padding: 4px 12px;
          border-radius: 20px;
          background: var(--bg);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
        }
        .chip.active {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }
        .chip:hover:not(.active) {
          background: var(--brand-bg);
          border-color: var(--brand);
        }
      `}</style>
    </div>
  );
}