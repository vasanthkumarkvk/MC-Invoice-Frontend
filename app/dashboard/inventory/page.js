'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Search, Plus, X, ArrowUp, ArrowDown, RotateCcw, Package,
  AlertTriangle, ChevronDown, Warehouse, BarChart3, Edit3,
  TrendingUp, TrendingDown, RefreshCw, Filter, Tag, 
  AlertCircle, CheckCircle, Clock, Download, Upload
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import Link from 'next/link';

/* ── Adjust Stock Modal ── */
function AdjustModal({ product, onClose, onSave }) {
  const [mode, setMode] = useState('add');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('Purchase received');
  const REASONS = {
    add:    ['Purchase received','Return from customer','Stock correction','Opening stock','Transfer in','Found during audit'],
    remove: ['Sold','Damaged / Spoiled','Theft / Loss','Transfer out','Write off','Used in production'],
    set:    ['Physical count','Stock audit','Manual correction','System reset'],
  };
  const newStock = mode==='set'
    ? Math.max(0, parseInt(qty)||0)
    : mode==='add'
      ? (product.stock||0) + (parseInt(qty)||0)
      : Math.max(0, (product.stock||0) - (parseInt(qty)||0));

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-sm">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>Adjust Stock</div>
            <div style={{fontSize:12,color:'var(--muted)',marginTop:1}}>{product.name}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {[{k:'add',label:'Add',Icon:ArrowUp,c:'#10b981'},{k:'remove',label:'Remove',Icon:ArrowDown,c:'#ef4444'},{k:'set',label:'Set',Icon:RotateCcw,c:'#6366f1'}].map(({k,label,Icon,c})=>(
              <button key={k} onClick={()=>{setMode(k);setReason(REASONS[k][0]);}}
                style={{flex:1,padding:'8px',borderRadius:8,border:`1.5px solid ${mode===k?c:'var(--border)'}`,background:mode===k?`${c}15`:'transparent',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,fontSize:13,color:mode===k?c:'var(--muted)',display:'flex',alignItems:'center',gap:5,justifyContent:'center'}}>
                <Icon size={13}/> {label}
              </button>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Quantity</label>
            <input className="form-input" type="number" min="0" value={qty} onChange={e=>setQty(e.target.value)} autoFocus/>
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Reason</label>
            <select className="form-select" value={reason} onChange={e=>setReason(e.target.value)}>
              {REASONS[mode].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13}}>
            <span style={{color:'var(--muted)'}}>Current: <strong style={{color:'var(--text)'}}>{product.stock||0}</strong></span>
            <span style={{color:'var(--muted)'}}>→</span>
            <span>New: <strong style={{color:'var(--brand)',fontSize:15}}>{newStock}</strong></span>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
            <button className="btn btn-brand" style={{flex:1,justifyContent:'center'}} onClick={()=>onSave({mode,qty:parseInt(qty)||0,reason,newStock})}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Add Warehouse Modal ── */
function AddWarehouseModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [manager, setManager] = useState('');
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-sm">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:'1px solid var(--border)'}}>
          <span style={{fontWeight:700,fontSize:15}}>Add Warehouse / Location</span>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{marginBottom:14}}>
            <label className="form-label">Warehouse Name <span className="req">*</span></label>
            <input className="form-input" placeholder="e.g. Chennai Main Godown" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Location / Address</label>
            <textarea className="form-input form-textarea" rows={2} placeholder="City, Area, Pincode" value={location} onChange={e=>setLocation(e.target.value)}/>
          </div>
          <div style={{marginBottom:20}}>
            <label className="form-label">Manager Name</label>
            <input className="form-input" placeholder="In-charge name" value={manager} onChange={e=>setManager(e.target.value)}/>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
            <button className="btn btn-brand" style={{flex:1,justifyContent:'center'}} onClick={()=>{if(name.trim())onSave({name,location,manager,id:Date.now()});}}>Add Warehouse</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Transfer Stock Modal ── */
function TransferModal({ product, warehouses, onClose, onSave }) {
  const [from, setFrom] = useState(warehouses[0]?.id||'');
  const [to, setTo]     = useState(warehouses[1]?.id||'');
  const [qty, setQty]   = useState(1);
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-sm">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:'1px solid var(--border)'}}>
          <span style={{fontWeight:700,fontSize:15}}>Transfer Stock — {product?.name}</span>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{marginBottom:14}}>
            <label className="form-label">From Warehouse</label>
            <select className="form-select" value={from} onChange={e=>setFrom(e.target.value)}>
              {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">To Warehouse</label>
            <select className="form-select" value={to} onChange={e=>setTo(e.target.value)}>
              {warehouses.filter(w=>w.id!==from).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div style={{marginBottom:20}}>
            <label className="form-label">Quantity to Transfer</label>
            <input className="form-input" type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)}/>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
            <button className="btn btn-brand" style={{flex:1,justifyContent:'center'}} onClick={()=>onSave({from,to,qty:parseInt(qty)||1})}>Transfer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN INVENTORY PAGE
══════════════════════════════════════════ */
function InventoryPageInner() {
  const { state, editItem, addItem, toast, fmtMoney } = useApp();
  const searchParams = useSearchParams();
  const [tab, setTab]         = useState(() => searchParams?.get('tab') || 'warehouse');
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [adjusting, setAdjusting]   = useState(null);
  const [transferProd, setTransferProd] = useState(null);
  const [showAddWH, setShowAddWH] = useState(false);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    const t = searchParams?.get('tab');
    if (t) setTab(t);
  }, [searchParams]);

  const products = (state.products || []).filter(p => p.type === 'product');
  const warehouses = state.warehouses || [
    { id: 'wh-main', name: 'Main Warehouse', location: 'Head Office', manager: '' },
  ];
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const lowStock = products.filter(p => (p.stock||0) <= (p.lowStockAlert||5));
  const positiveStock = products.filter(p => (p.stock||0) > 0);
  const totalSalesValue = products.reduce((s,p) => s+(p.price||0)*(p.stock||0), 0);
  const totalCostValue  = products.reduce((s,p) => s+(p.purchasePrice||0)*(p.stock||0), 0);

  const filtered = products.filter(p =>
    (!search   || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category) &&
    (!skuFilter || p.sku?.toLowerCase().includes(skuFilter.toLowerCase()))
  );

  const handleAdjust = ({ mode, qty, reason, newStock }) => {
    if (!adjusting) return;
    editItem('products', { ...adjusting, stock: newStock });
    const mv = { id: Date.now(), product: adjusting.name, type: mode==='add'?'in':'out', qty, reason, date: new Date().toLocaleDateString('en-IN'), stock: newStock };
    setMovements(prev => [mv, ...prev]);
    setAdjusting(null);
    toast('Stock updated', 'success');
  };

  const handleTransfer = ({ from, to, qty }) => {
    const fromWH = warehouses.find(w => w.id === from);
    const toWH   = warehouses.find(w => w.id === to);
    if (transferProd) {
      const mv1 = { id: Date.now(),   product: transferProd.name, type:'out', qty, reason:`Transfer to ${toWH?.name}`,   date: new Date().toLocaleDateString('en-IN'), stock: (transferProd.stock||0)-qty };
      const mv2 = { id: Date.now()+1, product: transferProd.name, type:'in',  qty, reason:`Received from ${fromWH?.name}`, date: new Date().toLocaleDateString('en-IN'), stock: (transferProd.stock||0) };
      setMovements(prev => [mv2, mv1, ...prev]);
    }
    setTransferProd(null);
    toast(`Transferred ${qty} units from ${fromWH?.name} to ${toWH?.name}`, 'success');
  };

  const handleAddWarehouse = (wh) => {
    addItem('warehouses', wh);
    setShowAddWH(false);
    toast(`${wh.name} added`, 'success');
  };

  const TABS = [
    { id:'warehouse', label:'Warehouse', icon: Warehouse },
    { id:'timeline',  label:'Timeline',  icon: RotateCcw },
    { id:'warehouses', label:'Manage Warehouses', icon: Package },
  ];

  return (
    <div className="page-content">
      {/* ── Header ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:22}}>Inventory</h1>
          <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Track stock, warehouses and movement history</p>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={()=>setShowAddWH(true)} className="btn btn-outline btn-sm">
            <Plus size={13}/> Add Warehouse
          </button>
          <Link href="/dashboard/products" className="btn btn-brand btn-sm" style={{textDecoration:'none'}}>
            <Plus size={13}/> Add Product
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12,marginBottom:20}}>
        {[
          {label:'Total Products',value:products.length,bg:'var(--brand-bg)',border:'var(--brand)',c:'var(--brand)',icon:Package},
          {label:'Low Stock',value:`${lowStock.length} items`,bg:'#fff7ed',border:'#fed7aa',c:'#ea580c',icon:AlertTriangle},
          {label:'In Stock',value:`${positiveStock.length} items`,bg:'#f0fdf4',border:'#bbf7d0',c:'#16a34a',icon:CheckCircle},
          {label:'Sales Value',value:fmtMoney(totalSalesValue),bg:'#eff6ff',border:'#bfdbfe',c:'#1d4ed8',icon:TrendingUp},
          {label:'Cost Value',value:fmtMoney(totalCostValue),bg:'#fefce8',border:'#fde68a',c:'#b45309',icon:BarChart3},
          {label:'Warehouses',value:warehouses.length,bg:'#f5f3ff',border:'#e4d9ff',c:'#7c3aed',icon:Warehouse},
        ].map(s=>(
          <div key={s.label} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,padding:'14px 16px',display:'flex',alignItems:'center',gap:10}}>
            <s.icon size={18} color={s.c} style={{flexShrink:0}}/>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:s.c,textTransform:'uppercase',letterSpacing:'0.04em'}}>{s.label}</div>
              <div style={{fontSize:16,fontWeight:800,color:'#111827',marginTop:1}}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{display:'flex',borderBottom:'1px solid var(--border)',marginBottom:20,gap:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'10px 18px',fontSize:13,fontWeight:600,color:tab===t.id?'var(--brand)':'var(--muted)',background:'none',border:'none',borderBottom:`2.5px solid ${tab===t.id?'var(--brand)':'transparent'}`,cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
            <t.icon size={13}/> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ WAREHOUSE TAB ══════════════ */}
      {tab === 'warehouse' && (
        <>
          {/* Search + Filter */}
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <div className="search-bar" style={{flex:1,minWidth:180}}>
              <Search size={14} color="#9ca3af"/>
              <input placeholder="Search by name or SKU..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-select" style={{maxWidth:180}} value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{padding:'60px 32px',textAlign:'center'}}>
              <Package size={60} color="var(--border)" style={{margin:'0 auto 16px',display:'block'}}/>
              <h2 style={{fontWeight:800,fontSize:20,marginBottom:10}}>No products in inventory</h2>
              {['Track stock levels in real time','Get low stock alerts automatically','Know exactly what you have and where'].map(t=>(
                <div key={t} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,justifyContent:'center'}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:'#d1fae5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{fontSize:13,color:'var(--muted)'}}>{t}</span>
                </div>
              ))}
              <Link href="/dashboard/products" className="btn btn-brand btn-sm" style={{marginTop:16,display:'inline-flex',textDecoration:'none'}}>
                <Plus size={13}/> Add Products
              </Link>
            </div>
          ) : (
            <div className="card">
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU Code</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Low Stock Alert</th>
                      <th>Sales Price</th>
                      <th>Cost Price</th>
                      <th>Stock Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p=>{
                      const isLow = (p.stock||0) <= (p.lowStockAlert||5);
                      const stockVal = (p.price||0)*(p.stock||0);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
                            {p.hsn && <div style={{fontSize:11,color:'var(--muted)'}}>HSN: {p.hsn}</div>}
                          </td>
                          <td>
                            {p.sku
                              ? <span style={{fontFamily:'monospace',fontSize:12,background:'var(--bg)',padding:'2px 8px',borderRadius:4,fontWeight:600,color:'var(--brand)'}}>{p.sku}</span>
                              : <span style={{fontSize:11,color:'var(--muted)'}}>—</span>
                            }
                          </td>
                          <td>
                            {p.category
                              ? <span className="badge badge-brand">{p.category}</span>
                              : <span style={{color:'var(--muted)',fontSize:12}}>—</span>
                            }
                          </td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <span style={{fontWeight:700,fontSize:14,color:isLow?'#ef4444':'#059669'}}>{p.stock||0}</span>
                              <span style={{fontSize:11,color:'var(--muted)'}}>{p.unit||'Nos'}</span>
                              {isLow && <span style={{fontSize:10,background:'#fee2e2',color:'#dc2626',padding:'2px 6px',borderRadius:4,fontWeight:700}}>LOW</span>}
                            </div>
                          </td>
                          <td style={{fontSize:12,color:'var(--muted)'}}>{p.lowStockAlert||5} {p.unit||'Nos'}</td>
                          <td style={{fontWeight:500}}>{fmtMoney(p.price||0)}</td>
                          <td style={{fontWeight:500,color:'var(--muted)'}}>{fmtMoney(p.purchasePrice||0)}</td>
                          <td style={{fontWeight:600,color:'#1d4ed8'}}>{fmtMoney(stockVal)}</td>
                          <td>
                            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                              <button className="btn btn-outline btn-sm" onClick={()=>setAdjusting(p)}>
                                Adjust
                              </button>
                              {warehouses.length > 1 && (
                                <button className="btn btn-outline btn-sm" onClick={()=>setTransferProd(p)} style={{color:'#7c3aed',borderColor:'#e4d9ff'}}>
                                  Transfer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {lowStock.length > 0 && (
                <div style={{padding:'12px 16px',borderTop:'1px solid var(--border)',background:'#fff7ed',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <AlertTriangle size={14} color="#ea580c"/>
                  <span style={{fontSize:12.5,color:'#92400e',fontWeight:600}}>{lowStock.length} product(s) are low on stock:</span>
                  {lowStock.map(p=>(
                    <span key={p.id} style={{fontSize:11.5,background:'#fed7aa',color:'#92400e',padding:'2px 8px',borderRadius:4,fontWeight:600}}>
                      {p.name} ({p.stock||0})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════════ TIMELINE TAB ══════════════ */}
      {tab === 'timeline' && (
        <>
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <div className="search-bar" style={{flex:1,minWidth:180}}>
              <Search size={14} color="#9ca3af"/>
              <input placeholder="Search product in timeline..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>

          {/* Timeline stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:16}}>
            {[
              {label:'Total Movements',value:movements.length + products.length,c:'var(--brand)',icon:RotateCcw},
              {label:'Stock In',value:movements.filter(m=>m.type==='in').length,c:'#059669',icon:ArrowUp},
              {label:'Stock Out',value:movements.filter(m=>m.type==='out').length,c:'#dc2626',icon:ArrowDown},
              {label:'Products Tracked',value:products.length,c:'#1d4ed8',icon:Package},
            ].map(s=>(
              <div key={s.label} className="stat-card" style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:`${s.c}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <s.icon size={15} color={s.c}/>
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:18,color:'var(--text)'}}>{s.value}</div>
                  <div style={{fontSize:10.5,color:'var(--muted)'}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
              <RotateCcw size={14} color="var(--brand)"/>
              <span style={{fontWeight:700,fontSize:14}}>Stock Movement History</span>
              <span style={{fontSize:11,color:'var(--muted)',marginLeft:'auto'}}>All stock changes appear here</span>
            </div>

            {[...movements, ...products.map(p=>({id:`init-${p.id}`,product:p.name,type:'in',qty:p.stock||0,reason:'Opening stock',date:'Initial',stock:p.stock||0}))].length === 0 ? (
              <div style={{padding:'60px 32px',textAlign:'center',color:'var(--muted)'}}>
                <RotateCcw size={40} style={{margin:'0 auto 12px',display:'block',opacity:0.12}}/>
                <p style={{fontWeight:600,color:'var(--text)',marginBottom:6}}>No movements yet</p>
                <p style={{fontSize:13}}>Adjust stock or create invoices to see movement history here.</p>
              </div>
            ) : (
              <div>
                {/* Manual adjustments first, then opening stock */}
                {[...movements, ...products.filter(p=>(p.stock||0)>0).map(p=>({
                  id:`init-${p.id}`, product:p.name, type:'in', qty:p.stock||0, reason:'Opening stock', date:'Setup', stock:p.stock||0
                }))].filter(m => !search || m.product?.toLowerCase().includes(search.toLowerCase())).map((m,idx,arr)=>(
                  <div key={m.id} style={{display:'flex',gap:14,padding:'14px 18px',borderBottom:idx<arr.length-1?'1px solid var(--border)':'none',alignItems:'flex-start'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:m.type==='in'?'#d1fae5':'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                      {m.type==='in'?<ArrowUp size={15} color="#059669"/>:<ArrowDown size={15} color="#dc2626"/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:'var(--text)'}}>{m.product}</div>
                      <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{m.reason}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{m.date}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontWeight:700,fontSize:14,color:m.type==='in'?'#059669':'#dc2626'}}>
                        {m.type==='in'?'+':'-'}{m.qty} units
                      </div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>Balance: {m.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════ WAREHOUSES TAB ══════════════ */}
      {tab === 'warehouses' && (
        <>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
            <button className="btn btn-brand btn-sm" onClick={()=>setShowAddWH(true)}>
              <Plus size={13}/> Add Warehouse
            </button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16,marginBottom:24}}>
            {warehouses.map(wh=>{
              const whProducts = products.filter(p => p.warehouseId === wh.id || !p.warehouseId);
              const whValue    = whProducts.reduce((s,p) => s+(p.price||0)*(p.stock||0), 0);
              return (
                <div key={wh.id} className="card" style={{padding:20}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
                    <div style={{width:40,height:40,borderRadius:10,background:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Warehouse size={18} color="var(--brand)"/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>{wh.name}</div>
                      {wh.location && <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{wh.location}</div>}
                      {wh.manager && <div style={{fontSize:12,color:'var(--muted)'}}>Manager: {wh.manager}</div>}
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {[
                      {label:'Products',value:whProducts.length,c:'var(--brand)'},
                      {label:'Stock Value',value:fmtMoney(whValue),c:'#059669'},
                    ].map(s=>(
                      <div key={s.label} style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                        <div style={{fontWeight:700,fontSize:14,color:s.c}}>{s.value}</div>
                        <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Product × Warehouse grid */}
          {products.length > 0 && warehouses.length > 1 && (
            <div className="card">
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:14}}>
                Stock by Warehouse
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      {warehouses.map(w=><th key={w.id}>{w.name}</th>)}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0,20).map(p=>(
                      <tr key={p.id}>
                        <td style={{fontWeight:600}}>{p.name}</td>
                        <td style={{fontFamily:'monospace',fontSize:12,color:'var(--brand)'}}>{p.sku||'—'}</td>
                        {warehouses.map(w=>(
                          <td key={w.id} style={{textAlign:'center',fontWeight:600}}>
                            {p.warehouseId===w.id ? p.stock||0 : w.id==='wh-main' ? p.stock||0 : 0}
                          </td>
                        ))}
                        <td style={{fontWeight:700,color:'var(--brand)'}}>{p.stock||0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      {adjusting   && <AdjustModal product={adjusting} onClose={()=>setAdjusting(null)} onSave={handleAdjust}/>}
      {showAddWH   && <AddWarehouseModal onClose={()=>setShowAddWH(false)} onSave={handleAddWarehouse}/>}
      {transferProd && <TransferModal product={transferProd} warehouses={warehouses} onClose={()=>setTransferProd(null)} onSave={handleTransfer}/>}

      <style>{`
        @media (max-width: 768px) {
          .tbl th, .tbl td { font-size: 12px; padding: 8px 8px; }
        }
      `}</style>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={null}>
      <InventoryPageInner/>
    </Suspense>
  );
}
