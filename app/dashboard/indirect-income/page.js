'use client';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Tag, X, Upload, Check } from 'lucide-react';
import Sheet from '@/components/Sheet';
import { useApp } from '@/lib/AppContext';
import { fmtRs, fmtDate, today, PAYMENT_TYPES } from '@/lib/data';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

const INCOME_CATS = ['Dividend','Referral','Affiliate','Advertising','Consulting','Commission','Royalty','Rent','Investment','Interest','Other'];

function IncomeCategoriesSheet({ open, onClose }) {
  const [cats, setCats] = useState(INCOME_CATS);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState('');
  const filtered = cats.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const addCat = () => { if (!newCat.trim()) return; setCats(p => [...p, newCat.trim()]); setNewCat(''); setAdding(false); };
  const deleteCat = idx => setCats(p => p.filter((_, i) => i !== idx));
  const saveEdit = () => { if (!editVal.trim()) return; setCats(p => p.map((c, i) => i === editIdx ? editVal.trim() : c)); setEditIdx(null); setEditVal(''); };
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md" style={{ maxHeight:'85vh' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <span style={{ fontWeight:700, fontSize:16 }}>Categories</span>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-brand btn-sm" onClick={() => setAdding(true)}><Plus size={13}/> Add Category</button>
            <button className="btn-icon" onClick={onClose}><X size={18}/></button>
          </div>
        </div>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)' }}>
          <div className="search-bar"><Search size={13} color="#9ca3af"/><input placeholder="Search category..." value={search} onChange={e => setSearch(e.target.value)}/></div>
        </div>
        {adding && (
          <div style={{ padding:'12px 20px', background:'var(--brand-bg)', borderBottom:'1px solid var(--border)', display:'flex', gap:8 }}>
            <input className="form-input" style={{ flex:1, fontSize:13 }} placeholder="Category name..." value={newCat} onChange={e => setNewCat(e.target.value)} autoFocus onKeyDown={e => e.key==='Enter' && addCat()}/>
            <button className="btn btn-brand btn-sm" onClick={addCat}>Save</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setAdding(false); setNewCat(''); }}>Cancel</button>
          </div>
        )}
        <div style={{ overflowY:'auto', flex:1, padding:'0 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:11.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase' }}>Name</span>
            <span style={{ fontSize:11.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase' }}>Action</span>
          </div>
          {filtered.map((cat, i) => (
            <div key={i} className="cat-modal-item">
              {editIdx === i ? (
                <div style={{ display:'flex', gap:8, flex:1 }}>
                  <input className="form-input" style={{ flex:1, fontSize:13 }} value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus onKeyDown={e => e.key==='Enter' && saveEdit()}/>
                  <button className="btn btn-brand btn-sm" onClick={saveEdit}>Save</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditIdx(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <span>{cat}</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => { setEditIdx(i); setEditVal(cat); }} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', background:'#fef9c3', border:'1px solid #fde68a', borderRadius:6, fontSize:12, fontWeight:600, color:'#92400e', cursor:'pointer' }}><Pencil size={11}/> Edit</button>
                    <button onClick={() => deleteCat(i)} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:6, fontSize:12, fontWeight:600, color:'#991b1b', cursor:'pointer' }}><Trash2 size={11}/> Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IncomeForm({ data, onSave, onCancel }) {
  const [f, setF] = useState(data || { amount:0, date:today(), category:'', notes:'', paid:true, paymentDate:today(), paymentNotes:'', paymentType:'Cash' });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div>
      <div style={{marginBottom:14}}>
        <label className="form-label">Income Amount <span className="req">*</span></label>
        <div style={{display:'flex',border:'1.5px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          <span style={{padding:'8px 10px',background:'var(--bg)',borderRight:'1px solid var(--border)',fontSize:13,fontWeight:600,flexShrink:0}}>₹</span>
          <input style={{flex:1,border:'none',outline:'none',padding:'8px 10px',fontSize:13,fontFamily:'Inter,sans-serif',background:'transparent',color:'var(--text)'}} type="number" min="0" step="1" value={f.amount||''} onChange={e=>s('amount',Math.max(0,parseInt(e.target.value)||0))} placeholder="Enter amount"/>
        </div>
      </div>
      <div className="field-row field-row-2" style={{marginBottom:14}}>
        <div><label className="form-label">Income Date</label><input className="form-input" type="date" value={f.date} onChange={e=>s('date',e.target.value)}/></div>
        <div>
          <label className="form-label">Category</label>
          <select className="form-select" value={f.category} onChange={e=>s('category',e.target.value)}>
            <option value="">Select Category</option>
            {INCOME_CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginBottom:14}}><label className="form-label">Notes</label><textarea className="form-input form-textarea" rows={2} placeholder="Notes" value={f.notes} onChange={e=>s('notes',e.target.value)}/></div>
      <div style={{border:'2px dashed var(--border)',borderRadius:10,padding:'20px 16px',textAlign:'center',marginBottom:16,cursor:'pointer'}}
        onMouseOver={e=>e.currentTarget.style.borderColor='var(--brand)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
          <Upload size={28} color="var(--muted)"/>
        </div>
        <div style={{fontWeight:600,fontSize:13}}>Click or drag files to attach</div>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>PDF, PNG, JPEG, Excel – up to 25 MB · Max 3 files</div>
      </div>
      <div style={{borderTop:'1px solid var(--border)',paddingTop:16,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Payments</div>
        <button className={`btn btn-sm${f.paid?' btn-brand':' btn-outline'}`} style={{gap:6,marginBottom:12}} onClick={()=>s('paid',!f.paid)}>{f.paid&&<Check size={13}/>}Mark as Paid</button>
        {f.paid&&(
          <div>
            <div className="field-row field-row-2" style={{marginBottom:12}}>
              <div><label className="form-label">Payment Date</label><input className="form-input" type="date" value={f.paymentDate} onChange={e=>s('paymentDate',e.target.value)}/></div>
              <div><label className="form-label">Payment Notes</label><input className="form-input" value={f.paymentNotes} onChange={e=>s('paymentNotes',e.target.value)}/></div>
            </div>
            <label className="form-label">Payment Type</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{PAYMENT_TYPES.map(t=><button key={t} className={`chip${f.paymentType===t?' active':''}`} style={{fontSize:12}} onClick={()=>s('paymentType',t)}>{t}</button>)}</div>
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:8,borderTop:'1px solid var(--border)'}}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={()=>onSave(f)}>Add Income</button>
      </div>
    </div>
  );
}

export default function IndirectIncomePage() {
  const {state,addItem,editItem,removeItem,toast,fmtMoney}=useApp();
  const [search,setSearch]=useState('');const [sheet,setSheet]=useState(false);const [editData,setEdit]=useState(null);const [del,setDel]=useState(null);const [delL,setDelL]=useState(false);
  const [showCats,setShowCats]=useState(false);
  const income=state.indirectIncome||[];
  const filtered=income.filter(e=>!search||e.notes?.toLowerCase().includes(search.toLowerCase())||e.category?.toLowerCase().includes(search.toLowerCase()));
  const handleSave=f=>{if(f.id)editItem('indirectIncome',f);else addItem('indirectIncome',f);setSheet(false);toast('Income saved','success');};
  const handleDel=async()=>{setDelL(true);await new Promise(r=>setTimeout(r,350));removeItem('indirectIncome',del.id);setDel(null);setDelL(false);toast('Deleted','success');};
  return(
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><h1 style={{fontWeight:800,fontSize:22}}>Indirect Income</h1><span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className="btn btn-outline btn-sm" onClick={()=>setShowCats(true)}><Tag size={13}/> Categories</button>
          <button className="btn btn-brand btn-sm" onClick={()=>{setEdit(null);setSheet(true);}}><Plus size={14}/> Add Income</button>
        </div>
      </div>
      <div className="card">
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:10,alignItems:'center'}}>
          <div className="search-bar" style={{maxWidth:300}}><Search size={14} color="#9ca3af"/><input placeholder="Search income…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        {filtered.length===0?(
          <EmptyState type="generic" title="No indirect income recorded"
            desc={['Track your indirect income sources','Organise by category','Attach supporting documents']}
            action={<button className="btn btn-brand btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={()=>{setEdit(null);setSheet(true);}}><Plus size={16}/> Add your first income</button>}/>
        ):(
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Date</th><th>Category</th><th>Notes</th><th>Amount</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(e=>(
              <tr key={e.id}>
                <td style={{color:'var(--muted)'}}>{fmtDate(e.date)}</td>
                <td>{e.category?<span className="badge badge-brand">{e.category}</span>:'—'}</td>
                <td style={{maxWidth:200,color:'var(--muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.notes||'—'}</td>
                <td style={{fontWeight:700,color:'#059669'}}>{fmtMoney(e.amount||0)}</td>
                <td><span className={`badge${e.paid?' badge-paid':' badge-pending'}`}>{e.paid?'Paid':'Unpaid'}</span></td>
                <td><div style={{display:'inline-flex',gap:4}}><button className="btn-icon" onClick={()=>{setEdit(e);setSheet(true);}}><Pencil size={13}/></button><button className="btn-icon" onClick={()=>setDel(e)}><Trash2 size={13} color="#dc2626"/></button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      <Sheet open={sheet} onClose={()=>setSheet(false)} title={editData?.id?'Edit Income':'Add Indirect Income'} size="md">
        <IncomeForm data={editData} onSave={handleSave} onCancel={()=>setSheet(false)}/>
      </Sheet>
      <DeleteModal open={!!del} onClose={()=>setDel(null)} onConfirm={handleDel} loading={delL} itemName="Income"/>
      {showCats && <IncomeCategoriesSheet onClose={()=>setShowCats(false)}/>}
    </div>
  );
}
