'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GST_RATES, UNITS, HSN_DATA } from '@/lib/data';
import AIModal from '@/components/AIModal';

export default function CreateProductPage() {
  const router = useRouter();
  const { addItem, editItem, toast, fmtMoney, currency } = useApp();
  const [f, setF] = useState({ name:'', type:'product', price:0, gst:18, hsn:'', sku:'', unit:'Nos', stock:0, lowStockAlert:5, purchasePrice:0, category:'', desc:'', barcode:'' });
  const [err, setErr] = useState({});
  const [hsnSugg, setHsnSugg] = useState([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleHsn = val => {
    s('hsn', val);
    setHsnSugg(val.length >= 2 ? HSN_DATA.filter(h => h.code.startsWith(val) || h.desc.toLowerCase().includes(val.toLowerCase())).slice(0, 6) : []);
  };

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    setErr(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    addItem('products', f);
    toast('Product added successfully', 'success');
    router.push('/dashboard/products');
  };

  const handleImage = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ background:'var(--card-bg)', borderBottom:'1px solid var(--border)', padding:'12px 20px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:10 }}>
        <button className="btn-icon" onClick={() => router.back()}><ChevronLeft size={20}/></button>
        <h1 style={{ fontWeight:800, fontSize:18, color:'var(--text)' }}>Add Product / Service</h1>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => router.back()}>Cancel</button>
          <button className="btn btn-brand btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </div>

      <div style={{ padding:'10px', maxWidth:760, margin:'0 auto' }}>
        {/* Type toggle */}
        <div className="card" style={{ padding:20, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12, color:'var(--text)' }}>Type</div>
          <div style={{ display:'flex', gap:8 }}>
            {['product','service'].map(t => (
              <button key={t} className={`btn btn-sm ${f.type===t ? 'btn-brand' : 'btn-outline'}`} onClick={() => s('type', t)}>
                {t[0].toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:20, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:'var(--text)' }}>Basic Details</div>

          <div style={{ marginBottom:14 }}>
            <label className="form-label">Name <span className="req">*</span></label>
            <input className={`form-input${err.name?' error':''}`} placeholder={f.type==='service'?'Service name':'Product name'} value={f.name} onChange={e => s('name', e.target.value)} autoFocus/>
            {err.name && <p className="form-err">{err.name}</p>}
          </div>

          <div className="field-row field-row-2" style={{ marginBottom:14 }}>
            <div>
              <label className="form-label">Selling Price (₹)</label>
              <div style={{ display:'flex', border:'1.5px solid var(--border)', borderRadius:8, overflow:'hidden', background:'var(--card-bg)' }}>
                <span style={{ padding:'8px 10px', background:'var(--bg)', borderRight:'1px solid var(--border)', fontSize:13, fontWeight:600, flexShrink:0, color:'var(--text)' }}>₹</span>
                <input style={{ flex:1, border:'none', outline:'none', padding:'8px 10px', fontSize:13, fontFamily:'Inter,sans-serif', background:'transparent', color:'var(--text)' }} type="number" min="0" value={f.price||''} onChange={e => s('price', Math.max(0, parseInt(e.target.value)||0))} placeholder="0"/>
              </div>
            </div>
            <div>
              <label className="form-label">Unit</label>
              <select className="form-select" value={f.unit} onChange={e => s('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row field-row-2" style={{ marginBottom:14 }}>
            <div>
              <label className="form-label">GST Rate</label>
              <select className="form-select" value={f.gst} onChange={e => s('gst', parseInt(e.target.value))}>
                {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Purchase Price (₹)</label>
              <input className="form-input" type="number" min="0" value={f.purchasePrice||''} onChange={e => s('purchasePrice', Math.max(0,parseInt(e.target.value)||0))} placeholder="0"/>
            </div>
          </div>

          {f.type === 'product' && (
            <div style={{ marginBottom:14 }}>
              <label className="form-label">Opening Stock</label>
              <input className="form-input" type="number" min="0" style={{ maxWidth:180 }} value={f.stock||''} onChange={e => s('stock', Math.max(0,parseInt(e.target.value)||0))} placeholder="0"/>
            </div>
          )}
        </div>

        <div className="card" style={{ padding:20, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:'var(--text)' }}>Tax & Classification</div>
          <div className="field-row field-row-2">
            <div style={{ position:'relative' }}>
              <label className="form-label">HSN / SAC Code</label>
              <input className="form-input" placeholder="e.g. 998314" value={f.hsn} onChange={e => handleHsn(e.target.value)}/>
              {hsnSugg.length > 0 && (
                <div style={{ position:'absolute', top:64, left:0, right:0, background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'var(--shadow-md)', zIndex:20, maxHeight:200, overflowY:'auto' }}>
                  {hsnSugg.map(h => (
                    <div key={h.code} onClick={() => { s('hsn', h.code); setHsnSugg([]); }}
                      style={{ padding:'9px 12px', cursor:'pointer', fontSize:13, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, color:'var(--text)' }}
                      onMouseOver={e => e.currentTarget.style.background='var(--brand-bg)'}
                      onMouseOut={e => e.currentTarget.style.background='var(--card-bg)'}>
                      <span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--brand)', minWidth:76 }}>{h.code}</span>
                      <span style={{ fontSize:12 }}>{h.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="form-label">SKU Code</label>
              <input className="form-input" placeholder="e.g. PAINT-WHT-20L" value={f.sku} onChange={e => s('sku', e.target.value.toUpperCase())}/>
              <p style={{fontSize:11,color:'var(--muted)',marginTop:3}}>Your internal product code for tracking</p>
            </div>
          </div>
          <div className="field-row field-row-2" style={{marginTop:14}}>
            <div>
              <label className="form-label">Category</label>
              <input className="form-input" placeholder="e.g. Electronics" value={f.category} onChange={e => s('category', e.target.value)}/>
            </div>
            <div>
              <label className="form-label">Low Stock Alert (Qty)</label>
              <input className="form-input" type="number" min="0" placeholder="5" value={f.lowStockAlert||''} onChange={e => s('lowStockAlert', Math.max(0,parseInt(e.target.value)||0))}/>
              <p style={{fontSize:11,color:'var(--muted)',marginTop:3}}>Alert when stock falls below this</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>Description</div>
            <button className="btn btn-ghost btn-sm" style={{ gap:5, color:'var(--brand)', fontSize:12 }} onClick={() => setAiOpen(true)}>
              <Sparkles size={12}/> Generate with AI
            </button>
          </div>
          <textarea className="form-input form-textarea" rows={4} placeholder="Describe this product or service…" value={f.desc} onChange={e => s('desc', e.target.value)}/>
        </div>

        <div className="card" style={{ padding:20, marginBottom:24 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--text)' }}>Product Image</div>
          <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'28px 20px', border:'2px dashed var(--border)', borderRadius:10, cursor:'pointer', gap:10, transition:'border-color 0.14s' }}
            onMouseOver={e => e.currentTarget.style.borderColor='var(--brand)'}
            onMouseOut={e => e.currentTarget.style.borderColor='var(--border)'}>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ width:120, height:120, objectFit:'cover', borderRadius:8 }}/>
            ) : (
              <>
                <ImageIcon size={28} color="var(--muted)"/>
                <span style={{ fontSize:13, color:'var(--muted)' }}>Click to upload product image</span>
                <span style={{ fontSize:11.5, color:'var(--muted)', opacity:0.7 }}>PNG, JPG up to 5MB</span>
              </>
            )}
            <input type="file" style={{ display:'none' }} accept="image/*" onChange={handleImage}/>
          </label>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
          <button className="btn btn-brand" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </div>

      <AIModal open={aiOpen} onClose={() => setAiOpen(false)} context="product" onUse={text => s('desc', text)}/>
    </div>
  );
}
