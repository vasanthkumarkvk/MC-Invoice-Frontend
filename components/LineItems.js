// components/LineItems.js
import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function LineItems({ items, onChange, products = [], advancePaid = 0, onAdvancePaidChange, currency = 'INR' }) {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(amount || 0);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount based on quantity and price
    if (field === 'qty' || field === 'price') {
      const qty = parseFloat(newItems[index].qty) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].amount = qty * price;
    }
    
    onChange(newItems);
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      const newItems = [...items];
      const qty = newItems[index].qty || 1;
      const price = product.selling_price || product.price || 0;
      
      newItems[index] = {
        ...newItems[index],
        id: product.id,
        name: product.name,
        hsn: product.hsn_sac_code || product.hsn || '',  // Fix: Use hsn_sac_code
        price: price,
        gst: product.gst_rate || product.gst || 0,      // Fix: Use gst_rate
        unit: product.unit || 'Nos',
        qty: qty,
        disc: newItems[index].disc || 0,
        amount: qty * price,
      };
      
      onChange(newItems);
    }
  };

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    onChange([...items, { 
      id: newId, 
      name: '', 
      qty: 1, 
      price: 0, 
      unit: 'Nos', 
      disc: 0, 
      gst: 18, 
      hsn: '', 
      amount: 0 
    }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  // Calculate totals for each item and overall
  const itemTotals = items.map(item => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const disc = parseFloat(item.disc) || 0;
    const taxableAmount = (qty * price) - disc;
    const gstAmount = taxableAmount * (parseFloat(item.gst) || 0) / 100;
    const total = taxableAmount + gstAmount;
    
    return { taxableAmount, gstAmount, total };
  });

  const subtotal = itemTotals.reduce((sum, t) => sum + t.taxableAmount, 0);
  const taxAmount = itemTotals.reduce((sum, t) => sum + t.gstAmount, 0);
  const totalBeforeAdvance = subtotal + taxAmount;
  const advance = parseFloat(advancePaid) || 0;
  const balanceDue = totalBeforeAdvance - advance;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="line-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>PRODUCT NAME</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>HSN/SAC</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>QTY</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>UNIT</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>PRICE</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>DISC</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>GST%</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>AMOUNT</th>
              <th style={{ padding: '10px 8px', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = parseFloat(item.qty) || 0;
              const price = parseFloat(item.price) || 0;
              const disc = parseFloat(item.disc) || 0;
              const taxableAmount = (qty * price) - disc;
              const gstAmount = taxableAmount * (parseFloat(item.gst) || 0) / 100;
              const total = taxableAmount + gstAmount;

              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px', minWidth: 180 }}>
                    <select
                      className="form-select"
                      style={{ width: '100%', fontSize: 13 }}
                      value={item.name ? (products.find(p => p.name === item.name)?.id || '') : ''}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginTop: 4, fontSize: 12 }}
                      placeholder="Custom item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    />
                   </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: 100, fontSize: 12, textAlign: 'center' }}
                      value={item.hsn}
                      onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                      placeholder="HSN/SAC"
                    />
                   </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 70, fontSize: 12, textAlign: 'center' }}
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      min="0"
                      step="1"
                    />
                   </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <select
                      className="form-select"
                      style={{ width: 80, fontSize: 12 }}
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    >
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
                   </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 110, fontSize: 12, textAlign: 'right' }}
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                   </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 70, fontSize: 12, textAlign: 'center' }}
                      value={item.disc}
                      onChange={(e) => handleItemChange(idx, 'disc', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                   </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <select
                      className="form-select"
                      style={{ width: 70, fontSize: 12 }}
                      value={item.gst}
                      onChange={(e) => handleItemChange(idx, 'gst', e.target.value)}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                   </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                    {formatMoney(total)}
                   </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button
                      className="btn-icon"
                      onClick={() => removeItem(idx)}
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={14} />
                    </button>
                   </td>
                 </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-outline btn-sm" onClick={addItem}>
          <Plus size={14} /> Add Item
        </button>
        
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Subtotal</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{formatMoney(subtotal)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>GST</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--brand)' }}>{formatMoney(taxAmount)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Total</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand)' }}>{formatMoney(totalBeforeAdvance)}</div>
          </div>
        </div>
      </div>

      {onAdvancePaidChange && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Amount Paid</label>
            <input
              type="number"
              className="form-input"
              style={{ width: 120, textAlign: 'right' }}
              value={advancePaid}
              onChange={(e) => onAdvancePaidChange(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Balance Due</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: balanceDue > 0 ? '#dc2626' : '#059669' }}>
              {formatMoney(balanceDue)}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-items-table input,
        .line-items-table select {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 8px;
          font-family: inherit;
        }
        .line-items-table input:focus,
        .line-items-table select:focus {
          outline: none;
          border-color: var(--brand);
        }
        @media (max-width: 768px) {
          .line-items-table th:nth-child(2),
          .line-items-table td:nth-child(2),
          .line-items-table th:nth-child(4),
          .line-items-table td:nth-child(4),
          .line-items-table th:nth-child(6),
          .line-items-table td:nth-child(6) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}