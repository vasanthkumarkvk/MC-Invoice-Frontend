'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, RefreshCw, AlertCircle, X, Package, Building2, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { fmtDate } from '@/lib/data';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import Sheet from '@/components/Sheet';

const API_BASE = 'https://api.crazystory.in/api';

// Edit Purchase Form Component
function EditPurchaseForm({ data, onSave, onCancel, toast, vendors = [] }) {
  const [f, setF] = useState({
    product_id: data?.product_id || '',
    quantity: data?.quantity || '',
    cost_price: data?.cost_price || '',
    vendor_id: data?.vendor_id || '',
    purchase_date: data?.purchase_date?.split('T')[0] || new Date().toISOString().split('T')[0]
  });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Fetch products for dropdown
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.products || data.data || (Array.isArray(data) ? data : []);
        setProducts(list.filter(p => p.type === 'product'));
      }
    } catch (e) { console.error('Fetch products error:', e); }
    finally { setLoadingProducts(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const validate = () => {
    const e = {};
    if (!f.product_id) e.product_id = 'Product is required';
    if (!f.quantity || parseFloat(f.quantity) <= 0) e.quantity = 'Quantity must be greater than 0';
    if (!f.cost_price || parseFloat(f.cost_price) <= 0) e.cost_price = 'Cost price must be greater than 0';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');

    const apiData = {
      quantity: parseFloat(f.quantity),
      cost_price: parseFloat(f.cost_price),
      vendor_id: f.vendor_id ? parseInt(f.vendor_id) : null,
      purchase_date: f.purchase_date
    };

    try {
      const res = await fetch(`${API_BASE}/admin/purchases/${data.id}`, {
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
        toast(result.message || 'Failed to update purchase', 'error');
        setLoading(false);
        return;
      }
      toast('Purchase updated successfully', 'success');
      onSave(result.purchase || result);
    } catch (error) {
      console.error('Update purchase error:', error);
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(f.product_id));

  return (
    <div>
      {/* Product Selection */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Product *</label>
        <div style={{ position: 'relative' }}>
          <select 
            className={`form-select ${err.product_id ? 'error' : ''}`}
            value={f.product_id}
            onChange={e => s('product_id', e.target.value)}
            disabled={true} // Product cannot be changed in edit
            style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
          >
            <option value="">Select Product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
            ))}
          </select>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
            Product cannot be changed after creation
          </div>
        </div>
        {err.product_id && <p className="form-err">{err.product_id}</p>}
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Quantity *</label>
        <input 
          type="number" 
          step="1"
          className={`form-input ${err.quantity ? 'error' : ''}`}
          placeholder="Enter quantity"
          value={f.quantity}
          onChange={e => s('quantity', e.target.value)}
        />
        {err.quantity && <p className="form-err">{err.quantity}</p>}
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
          Original quantity: {data?.quantity}
        </div>
      </div>

      {/* Cost Price */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Cost Price (₹) *</label>
        <input 
          type="number" 
          step="0.01"
          className={`form-input ${err.cost_price ? 'error' : ''}`}
          placeholder="Enter cost price"
          value={f.cost_price}
          onChange={e => s('cost_price', e.target.value)}
        />
        {err.cost_price && <p className="form-err">{err.cost_price}</p>}
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
          Original cost: ₹{parseFloat(data?.cost_price || 0).toFixed(2)}
        </div>
      </div>

      {/* Vendor */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Vendor</label>
        <select 
          className="form-select"
          value={f.vendor_id}
          onChange={e => s('vendor_id', e.target.value)}
        >
          <option value="">Select Vendor (Optional)</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Purchase Date */}
      <div style={{ marginBottom: 14 }}>
        <label className="form-label">Purchase Date</label>
        <input 
          type="date" 
          className="form-input"
          value={f.purchase_date}
          onChange={e => s('purchase_date', e.target.value)}
        />
      </div>

      {/* Stock Info */}
      {selectedProduct && (
        <div style={{ 
          marginTop: 16, 
          padding: '12px', 
          background: '#f0fdf4', 
          borderRadius: 8,
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#166534' }}>
            Current Stock Info
          </div>
          <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
            <span>Available Stock:</span>
            <span style={{ fontWeight: 700 }}>{selectedProduct.opening_stock || 0} units</span>
          </div>
          <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span>After Update:</span>
            <span style={{ fontWeight: 700, color: '#059669' }}>
              {(selectedProduct.opening_stock || 0) - (data?.quantity || 0) + (parseFloat(f.quantity) || 0)} units
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Updating...' : 'Update Purchase'}
        </button>
      </div>
    </div>
  );
}

// Main Purchases Page Component
export default function PurchasesPage() {
  const router = useRouter();
  const { toast, fmtMoney } = useApp();
  const [search, setSearch] = useState('');
  const [del, setDel] = useState(null);
  const [delL, setDelL] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  // GET /admin/purchases - Fetch all purchases
  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('zetsap_token');

    try {
      const res = await fetch(`${API_BASE}/admin/purchases`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        let purchasesList = Array.isArray(data) ? data : (data.data || []);
        setPurchases(purchasesList);
      } else {
        console.error('Failed to fetch purchases:', data);
        setError(data.message || 'Failed to load purchases. Please try again.');
        setPurchases([]);
      }
    } catch (err) {
      console.error('Fetch purchases error:', err);
      setError('Network error. Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // GET /admin/vendors - Fetch vendors
  const fetchVendors = async () => {
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
        let vendorsList = data.vendors || data.data || (Array.isArray(data) ? data : []);
        setVendors(vendorsList);
      }
    } catch (err) {
      console.error('Fetch vendors error:', err);
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchVendors();
  }, []);

  // Handle Edit
  const handleEdit = (purchase) => {
    setEditData(purchase);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    setSheetOpen(false);
    await fetchPurchases();
    setEditData(null);
  };

  // DELETE /admin/purchases/{id} - Delete purchase
  const handleDelete = async () => {
    setDelL(true);
    const token = localStorage.getItem('zetsap_token');

    try {
      const res = await fetch(`${API_BASE}/admin/purchases/${del.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        await fetchPurchases();
        toast(data.message || 'Purchase batch deleted successfully', 'success');
        setDel(null);
      } else {
        setErrorModal({
          open: true,
          message: data.message || 'Cannot delete this batch because some stock has already been sold.'
        });
        setDel(null);
      }
    } catch (error) {
      console.error('Delete purchase error:', error);
      setErrorModal({
        open: true,
        message: 'Network error. Please try again.'
      });
      setDel(null);
    } finally {
      setDelL(false);
    }
  };

  const filtered = purchases.filter(p => {
    const vendor = p.vendor;
    const product = p.product;
    return !search || 
      (product?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (product?.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (vendor?.name || '').toLowerCase().includes(search.toLowerCase());
  });

  // Calculate total value
  const totalValue = purchases.reduce((sum, p) => sum + (parseFloat(p.cost_price) * parseInt(p.remaining_quantity)), 0);
  const totalBatches = purchases.length;
  const lowStockBatches = purchases.filter(p => p.remaining_quantity > 0 && p.remaining_quantity < (p.quantity * 0.2)).length;
  const consumedBatches = purchases.filter(p => p.remaining_quantity === 0).length;

  // Error Modal Component
  const ErrorModal = ({ open, message, onClose }) => {
    if (!open) return null;
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box modal-sm" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <AlertCircle size={32} color="#dc2626" />
            </div>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Cannot Delete</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>{message}</p>
          <button className="btn btn-brand" onClick={onClose} style={{ width: '100%' }}>Got it</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading purchase batches...</p>
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
          <h1 style={{ fontWeight: 800, fontSize: 22 }}>Purchase Batches</h1>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchPurchases} title="Refresh">
            <RefreshCw size={13} /> Refresh
          </button>
          <Link href="/dashboard/create/purchase" className="btn btn-brand btn-sm">
            <Plus size={14} /> Add Stock
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={18} color="var(--brand)" />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total Batches</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{totalBatches}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <DollarSign size={18} color="var(--brand)" />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Inventory Value</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{fmtMoney(totalValue)}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingDown size={18} color={lowStockBatches > 0 ? '#f59e0b' : 'var(--brand)'} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Low Stock Batches</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 24, color: lowStockBatches > 0 ? '#f59e0b' : 'var(--text)' }}>{lowStockBatches}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingUp size={18} color={consumedBatches > 0 ? '#059669' : 'var(--muted)'} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Consumed Batches</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 24, color: consumedBatches > 0 ? '#059669' : 'var(--text)' }}>{consumedBatches}</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#991b1b' }}>{error}</span>
          </div>
          <button onClick={fetchPurchases} className="btn btn-outline btn-sm">Try Again</button>
        </div>
      )}

      {/* Main Card */}
      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="search-bar" style={{ maxWidth: 320 }}>
            <Search size={14} color="#9ca3af" />
            <input 
              placeholder="Search by product name, SKU or vendor..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState 
            type="purchase" 
            title="No purchase batches" 
            desc={['Add stock to start managing your inventory', 'Track each batch with remaining quantity']}
            action={
              <Link href="/dashboard/create/purchase" className="btn btn-brand btn-lg" style={{ justifyContent: 'center' }}>
                <Plus size={16} /> Add First Stock
              </Link>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Vendor</th>
                  <th>Quantity</th>
                  <th>Remaining</th>
                  <th>Cost Price</th>
                  <th>Total Value</th>
                  <th>Purchase Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const product = p.product;
                  const vendor = p.vendor;
                  const remaining = p.remaining_quantity;
                  const totalQty = p.quantity;
                  const percentage = (remaining / totalQty) * 100;
                  const isLowStock = remaining > 0 && remaining < (totalQty * 0.2);
                  const isConsumed = remaining === 0;
                  
                  return (
                    <tr key={p.id} style={{ background: isLowStock ? '#fffbeb' : isConsumed ? '#f3f4f6' : 'transparent' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} color="var(--brand)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{product?.name || '—'}</div>
                            {product?.category && <div style={{ fontSize: 10, color: 'var(--muted)' }}>{product.category}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{product?.sku || '—'}</td>
                      <td>
                        {vendor ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={12} color="var(--muted)" />
                            <span>{vendor.name}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600 }}>{totalQty}</span>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>units</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ 
                            fontWeight: 600, 
                            color: isLowStock ? '#f59e0b' : isConsumed ? '#9ca3af' : '#10b981'
                          }}>
                            {remaining}
                          </span>
                          <div style={{ 
                            width: 60, 
                            height: 4, 
                            background: '#e5e7eb', 
                            borderRadius: 2, 
                            marginTop: 4,
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              background: isLowStock ? '#f59e0b' : isConsumed ? '#9ca3af' : '#10b981',
                              borderRadius: 2
                            }} />
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                            {percentage.toFixed(0)}% available
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{parseFloat(p.cost_price).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand)' }}>
                        ₹{(parseFloat(p.cost_price) * parseInt(remaining)).toFixed(2)}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{fmtDate(p.purchase_date)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEdit(p)} 
                            title="Edit"
                            disabled={isConsumed}
                            style={{ opacity: isConsumed ? 0.5 : 1, cursor: isConsumed ? 'not-allowed' : 'pointer' }}
                          >
                            <Pencil size={13} color={isConsumed ? '#9ca3af' : 'var(--text)'} />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => setDel(p)} 
                            title="Delete"
                            disabled={isConsumed}
                            style={{ opacity: isConsumed ? 0.5 : 1, cursor: isConsumed ? 'not-allowed' : 'pointer' }}
                          >
                            <Trash2 size={13} color={isConsumed ? '#9ca3af' : '#dc2626'} />
                          </button>
                        </div>
                        {isConsumed && (
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                            Fully consumed
                          </div>
                        )}
                        {isLowStock && !isConsumed && (
                          <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 4 }}>
                            Low stock alert
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

      {/* Edit Purchase Sheet */}
      <Sheet 
        open={sheetOpen} 
        onClose={() => { setSheetOpen(false); setEditData(null); }} 
        title="Edit Purchase Batch" 
        size="md"
      >
        <EditPurchaseForm 
          data={editData} 
          onSave={handleSave} 
          onCancel={() => { setSheetOpen(false); setEditData(null); }} 
          toast={toast}
          vendors={vendors}
        />
      </Sheet>

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        open={!!del} 
        onClose={() => setDel(null)} 
        onConfirm={handleDelete} 
        loading={delL} 
        itemName="Purchase Batch"
        message={del?.remaining_quantity > 0 && del?.remaining_quantity < del?.quantity ? 
          "This batch has partial stock consumed. Deleting will remove remaining stock from inventory." : 
          "Are you sure you want to delete this purchase batch?"}
      />

      {/* Error Modal for Delete Failure */}
      <ErrorModal 
        open={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: '' })}
      />

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}