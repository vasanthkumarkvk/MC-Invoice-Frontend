'use client';
import { useState } from 'react';
import { Search, Trash2, ShoppingCart, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { fmtRs, calcItem, PAYMENT_TYPES } from '@/lib/data';

export default function POSPage() {
  const {state, addItem, toast, fmtMoney, currency } = useApp();
  const [search, setSearch]   = useState('');
  const [cart, setCart]       = useState([]);
  const [payType, setPayType] = useState('Cash');
  const [custSearch, setCust] = useState('');

  const products = (state.products||[]).filter(p => p.type === 'product');
  const customers = state.customers||[];
  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode||'').includes(search)
  );
  const selCust = customers.find(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) && custSearch.length > 1);

  const addToCart = p => setCart(c => {
    const ex = c.find(x => x.id === p.id);
    if (ex) return c.map(x => x.id === p.id ? {...x, qty: x.qty+1} : x);
    return [...c, {...p, qty:1, disc:0}];
  });
  const removeFromCart = id => setCart(c => c.filter(x => x.id !== id));
  const updateQty = (id, qty) => { if (qty < 1) { removeFromCart(id); return; } setCart(c => c.map(x => x.id===id ? {...x, qty} : x)); };

  const totals = cart.reduce((acc, item) => {
    const c = calcItem(item);
    return { sub: acc.sub+c.base, tax: acc.tax+c.gstAmt, total: acc.total+c.total };
  }, {sub:0, tax:0, total:0});

  const handleCheckout = () => {
    if (!cart.length) { toast('Add items to cart first', 'error'); return; }
    addItem('invoices', {
      number: 'POS-'+Date.now(),
      type: 'invoice', status: 'paid',
      date: new Date().toISOString().split('T')[0],
      customerId: selCust?.id || '',
      items: cart.map(i => ({ name:i.name, qty:i.qty, price:i.price, disc:i.disc||0, gst:i.gst, unit:i.unit||'Nos', hsn:i.hsn||'' })),
      disc: 0, paymentType: payType
    });
    setCart([]);
    toast('Sale completed successfully!', 'success');
  };

  return (
    <div className="page-content">
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:20}}>
        <h1 style={{fontWeight:800, fontSize:22}}>POS Billing</h1>
        <span style={{width:8, height:8, borderRadius:'50%', background:'#10b981', display:'inline-block'}}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start'}}>
        {/* Products grid */}
        <div>
          <div className="search-bar" style={{marginBottom:14, background:'#fff'}}>
            <Search size={14} color="#9ca3af"/>
            <input placeholder="Search products or scan barcode…" value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
          </div>

          {products.length === 0 ? (
            <div className="card" style={{padding:'40px 24px', textAlign:'center'}}>
              <Package size={48} style={{opacity:0.12, margin:'0 auto 16px', display:'block'}}/>
              <div style={{fontWeight:700, fontSize:17, marginBottom:8}}>No products added yet</div>
              <p style={{color:'#6b7280', fontSize:13.5, marginBottom:20}}>Add products from the Products page to start billing</p>
              <Link href="/dashboard/products" className="btn btn-brand btn-lg" style={{justifyContent:'center'}}>
                <Plus size={16}/> Add Products
              </Link>
            </div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))', gap:10}}>
              {filtered.map(p => (
                <div key={p.id} className="card" style={{padding:14, cursor:'pointer', transition:'all .14s', userSelect:'none'}}
                  onClick={() => addToCart(p)}
                  onMouseOver={e => {e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.background='var(--brand-bg)';}}
                  onMouseOut={e => {e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='#fff';}}>
                  <div style={{width:40, height:40, borderRadius:8, background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'var(--brand)', fontSize:18, marginBottom:10}}>{p.name[0].toUpperCase()}</div>
                  <div style={{fontWeight:600, fontSize:13, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.name}</div>
                  <div style={{fontWeight:800, color:'var(--brand)', fontSize:15}}>{fmtMoney(p.price)}</div>
                  <div style={{fontSize:11.5, color: p.stock === 0 ? '#dc2626' : '#9ca3af', marginTop:3}}>
                    {p.stock === 0 ? 'Out of stock' : `Stock: ${p.stock}`}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{gridColumn:'1/-1', padding:'40px 0', textAlign:'center', color:'#9ca3af', fontSize:13}}>No products found for "{search}"</div>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="card" style={{position:'sticky', top:72, padding:20}}>
          {/* Customer search */}
          <div style={{marginBottom:14}}>
            <label className="form-label">Customer (Optional)</label>
            <div className="search-bar" style={{background:'#f9fafb'}}>
              <Search size={13} color="#9ca3af"/>
              <input placeholder="Search customer…" value={custSearch} onChange={e=>setCust(e.target.value)}/>
            </div>
            {selCust && <div style={{fontSize:12, color:'#065f46', background:'#d1fae5', borderRadius:6, padding:'4px 8px', marginTop:4}}> {selCust.name}</div>}
          </div>

          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16, fontWeight:700, fontSize:15}}>
            <ShoppingCart size={17} color="var(--brand)"/>
            Cart
            {cart.length > 0 && <span style={{background:'var(--brand)', color:'#fff', borderRadius:'50%', width:20, height:20, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700}}>{cart.length}</span>}
          </div>

          {cart.length === 0 ? (
            <div style={{textAlign:'center', padding:'30px 0', color:'#9ca3af', fontSize:13}}>
              Cart is empty.<br/>Click products to add.
            </div>
          ) : (
            <div>
              <div style={{maxHeight:280, overflowY:'auto', marginBottom:12}}>
                {cart.map(item => (
                  <div key={item.id} style={{display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.name}</div>
                      <div style={{fontSize:12, color:'var(--muted)'}}>{fmtMoney(item.price)} each</div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:3}}>
                      <button onClick={()=>updateQty(item.id,item.qty-1)} style={{width:24,height:24,borderRadius:5,border:'1.5px solid var(--border)',background:'#fff',cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                      <span style={{width:22, textAlign:'center', fontWeight:700, fontSize:13}}>{item.qty}</span>
                      <button onClick={()=>updateQty(item.id,item.qty+1)} style={{width:24,height:24,borderRadius:5,border:'1.5px solid var(--brand)',background:'var(--brand-bg)',cursor:'pointer',fontWeight:700,fontSize:14,color:'var(--brand)',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                    </div>
                    <div style={{fontWeight:700, fontSize:13, minWidth:60, textAlign:'right'}}>{fmtMoney(calcItem(item).total)}</div>
                    <button className="btn-icon" style={{width:20,height:20,flexShrink:0}} onClick={()=>removeFromCart(item.id)}><Trash2 size={12} color="#dc2626"/></button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{paddingTop:8, borderTop:'1px solid var(--border)', marginBottom:12}}>
                {[['Subtotal', totals.sub],['GST', totals.tax]].map(([l,v])=>(
                  <div key={l} style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5}}>
                    <span style={{color:'var(--muted)'}}>{l}</span><span style={{fontWeight:600}}>{fmtMoney(v)}</span>
                  </div>
                ))}
                <div style={{display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800, borderTop:'2px solid var(--border)', paddingTop:8, marginTop:4}}>
                  <span>Total</span><span style={{color:'var(--brand)'}}>{fmtMoney(totals.total)}</span>
                </div>
              </div>

              {/* Payment type */}
              <div style={{marginBottom:14}}>
                <label className="form-label">Payment Type</label>
                <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
                  {['Cash','UPI','Card','Net Banking'].map(t=>(
                    <button key={t} className={`chip${payType===t?' active':''}`} style={{fontSize:11.5}} onClick={()=>setPayType(t)}>{t}</button>
                  ))}
                </div>
              </div>

              <button className="btn btn-brand" style={{width:'100%', justifyContent:'center', padding:'11px'}} onClick={handleCheckout}>
                Checkout — {fmtMoney(totals.total)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive POS layout for mobile */}
      <style>{`
        @media(max-width:768px){
          .page-content > div > div:first-child { grid-template-columns:1fr !important; }
          .page-content > div > div > div:last-child { position:static !important; }
        }
      `}</style>
    </div>
  );
}
