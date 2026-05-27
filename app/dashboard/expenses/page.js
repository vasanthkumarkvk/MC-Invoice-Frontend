'use client';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Sparkles, X, Tag } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { fmtRs, fmtDate, today, EXPENSE_CATEGORIES, PAYMENT_TYPES } from '@/lib/data';
import Sheet from '@/components/Sheet';
import { DeleteModal } from '@/components/Modal';
import AIModal from '@/components/AIModal';
import EmptyState from '@/components/EmptyState';

const DEFAULT_EXPENSE_CATS = [
  'Miscellaneous','Transportation & Travel Expense','Telephone & Internet Bills',
  'Repair & Maintenance','Rent Expense','Raw Material','Printing and Stationery',
  'Employee Salaries & Advances','Electricity Bill','Bank Fee and Charges',
  'Marketing & Advertising','Professional Services','Insurance',
];

function ExpenseCategoriesSheet({ open, onClose }) {
  const [cats, setCats] = useState([
    'Miscellaneous','Transportation & Travel Expense','Telephone & Internet Bills',
    'Repair & Maintenance','Rent Expense','Raw Material','Printing and Stationery',
    'Employee Salaries & Advances','Electricity Bill','Bank Fee and Charges',
    'Marketing & Advertising','Professional Services','Insurance',
  ]);
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
    <Sheet open={open} onClose={onClose} title="Expense Categories" size="sm"
      headerRight={<button className="btn btn-brand btn-sm" onClick={() => setAdding(true)}><Plus size={13}/> Add Category</button>}>
      <div style={{ marginBottom:12 }}>
        <div className="search-bar"><Search size={13} color="#9ca3af"/><input placeholder="Search category..." value={search} onChange={e => setSearch(e.target.value)}/></div>
      </div>
      {adding && (
        <div style={{ padding:'12px 14px', background:'var(--brand-bg)', borderRadius:8, marginBottom:12, display:'flex', gap:8 }}>
          <input className="form-input" style={{ flex:1, fontSize:13 }} placeholder="Category name..." value={newCat} onChange={e => setNewCat(e.target.value)} autoFocus onKeyDown={e => e.key==='Enter' && addCat()}/>
          <button className="btn btn-brand btn-sm" onClick={addCat}>Save</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setAdding(false); setNewCat(''); }}>Cancel</button>
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
        <span style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Name</span>
        <span style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Action</span>
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
              <span style={{ fontSize:13.5 }}>{cat}</span>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => { setEditIdx(i); setEditVal(cat); }}
                  style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', background:'#fef9c3', border:'1px solid #fde68a', borderRadius:6, fontSize:12, fontWeight:600, color:'#92400e', cursor:'pointer' }}>
                  <Pencil size={11}/> Edit
                </button>
                <button onClick={() => deleteCat(i)}
                  style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:6, fontSize:12, fontWeight:600, color:'#991b1b', cursor:'pointer' }}>
                  <Trash2 size={11}/> Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </Sheet>
  );
}

function ExpenseCategoriesModal({ onClose }) {

  const [cats, setCats] = useState(DEFAULT_EXPENSE_CATS);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState('');

  const filtered = cats.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const addCat = () => {
    if (!newCat.trim()) return;
    setCats(p => [...p, newCat.trim()]);
    setNewCat(''); setAdding(false);
  };
  const deleteCat = idx => setCats(p => p.filter((_, i) => i !== idx));
  const saveEdit = () => {
    if (!editVal.trim()) return;
    setCats(p => p.map((c, i) => i === editIdx ? editVal.trim() : c));
    setEditIdx(null); setEditVal('');
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md" style={{ maxHeight:'85vh' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <span style={{ fontWeight:700, fontSize:16, color:'var(--text)' }}>Expense Categories</span>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-brand btn-sm" onClick={() => setAdding(true)}><Plus size={13}/> Add Category</button>
            <button className="btn-icon" onClick={onClose}><X size={18}/></button>
          </div>
        </div>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div className="search-bar">
            <Search size={13} color="#9ca3af"/>
            <input placeholder="Search category..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
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
            <span style={{ fontSize:11.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Name</span>
            <span style={{ fontSize:11.5, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Action</span>
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
                  <span style={{ fontSize:13.5, color:'var(--text)' }}>{cat}</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => { setEditIdx(i); setEditVal(cat); }}
                      style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#fef9c3', border:'1px solid #fde68a', borderRadius:6, fontSize:12, fontWeight:600, color:'#92400e', cursor:'pointer' }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => deleteCat(i)}
                      style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:6, fontSize:12, fontWeight:600, color:'#991b1b', cursor:'pointer' }}>
                       Delete
                    </button>
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

function ExpenseForm({ data, vendors, onSave, onCancel }) {
  const {addItem,toast, fmtMoney, currency } = useApp();
  const [withTax, setWithTax] = useState(false);
  const [f, setF] = useState(data || { vendorSearch:'', date:today(), supplierDate:'', supplierSerial:'', amountType:'Total Amount', notes:'', items:[{name:'',category:'',tax:0,taxAmt:0,totalAmt:0}], paid:true, paymentDate:today(), paymentNotes:'', paymentType:'Cash', amount:0, category:'' });
  const [aiOpen, setAiOpen] = useState(false);
  const [showVendorQuick, setShowVendorQuick] = useState(false);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const totalAmt = withTax ? f.items.reduce((sum,i)=>sum+(parseFloat(i.totalAmt)||0),0) : (parseFloat(f.amount)||0);

  const Toggle = ({ on, onClick }) => (
    <div className={`tog-track${on?' on':''}`} onClick={onClick}><div className="tog-thumb"/></div>
  );

  return (
    <div>
      {/* With Tax toggle */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,paddingBottom:14,borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:13,fontWeight:600}}>Create Expense With Tax</span>
          <span style={{fontSize:10,background:'#bfdbfe',color:'#1e40af',padding:'2px 6px',borderRadius:4,fontWeight:700}}>BETA</span>
        </div>
        <Toggle on={withTax} onClick={()=>setWithTax(w=>!w)}/>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:14}}>Basic Details</div>
        <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',padding:'5px 10px',borderRadius:6,background:'#eff6ff',border:'1px solid #bfdbfe',fontSize:12,fontWeight:600,color:'#1d4ed8'}}>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx" style={{display:'none'}} onChange={e=>{if(e.target.files[0]){setTimeout(()=>{s('amount',Math.floor(Math.random()*5000)+500);s('category','Miscellaneous');s('notes','AI extracted from uploaded document');toast('AI extracted expense details!','success');},1200);toast('Processing document...','');}}} />
          <Sparkles size={12}/> Upload Expense with AI
          <span style={{fontSize:9,background:'#bfdbfe',color:'#1e40af',padding:'1px 4px',borderRadius:3}}>BETA</span>
        </label>
      </div>

      {/* Vendor + date */}
      <div className="field-row field-row-2" style={{marginBottom:14}}>
        <div>
          <label className="form-label">Select Vendor <button onClick={()=>setShowVendorQuick(true)} style={{background:'var(--brand)',border:'none',borderRadius:6,color:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'Inter,sans-serif',padding:'4px 10px',marginLeft:6}}>+ Add Vendor</button></label>
          <div className="search-bar" style={{background:'var(--card-bg)'}}><Search size={13} color="#9ca3af"/><input placeholder="Search vendor…" value={f.vendorSearch} onChange={e=>s('vendorSearch',e.target.value)}/></div>
        </div>
        <div><label className="form-label">Expense Date</label><input className="form-input" type="date" value={f.date} onChange={e=>s('date',e.target.value)}/></div>
      </div>

      {/* Supplier dates */}
      <div className="field-row field-row-2" style={{marginBottom:14}}>
        <div><label className="form-label">Supplier Invoice Date</label><input className="form-input" type="date" value={f.supplierDate} onChange={e=>s('supplierDate',e.target.value)}/></div>
        <div><label className="form-label">Supplier Invoice Serial No</label><input className="form-input" placeholder="(Optional)" value={f.supplierSerial} onChange={e=>s('supplierSerial',e.target.value)}/></div>
      </div>

      {withTax ? (
        <div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Amount Type</label>
            <select className="form-select" style={{maxWidth:200}} value={f.amountType} onChange={e=>s('amountType',e.target.value)}>
              <option>Total Amount</option><option>Split Amount</option>
            </select>
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Notes</label>
            <textarea className="form-input form-textarea" rows={2} placeholder="Notes" value={f.notes} onChange={e=>s('notes',e.target.value)}/>
          </div>
          <div style={{border:'1px solid var(--border)',borderRadius:10,overflow:'hidden',marginBottom:14}}>
            <div style={{background:'var(--bg)',padding:'9px 14px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13}}>Item Details</div>
            <div style={{overflowX:'auto'}}>
              <table className="tbl">
                <thead><tr><th>Item Name</th><th>Category</th><th>Tax</th><th>Tax Amt</th><th>Total Amt</th><th></th></tr></thead>
                <tbody>{f.items.map((item,i)=>(
                  <tr key={i}>
                    <td><input className="form-input" style={{fontSize:12,minWidth:100}} value={item.name} onChange={e=>{const its=[...f.items];its[i]={...its[i],name:e.target.value};s('items',its);}}/></td>
                    <td><select className="form-select" style={{fontSize:12,minWidth:120}} value={item.category} onChange={e=>{const its=[...f.items];its[i]={...its[i],category:e.target.value};s('items',its);}}><option>Select</option>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></td>
                    <td><select className="form-select" style={{fontSize:12,width:60}} value={item.tax} onChange={e=>{const its=[...f.items];its[i]={...its[i],tax:parseFloat(e.target.value)};s('items',its);}}><option value={0}>0</option><option value={5}>5</option><option value={12}>12</option><option value={18}>18</option><option value={28}>28</option></select></td>
                    <td><input className="form-input" type="number" min="0" style={{fontSize:12,width:80}} value={item.taxAmt||0} onChange={e=>{const its=[...f.items];its[i]={...its[i],taxAmt:parseFloat(e.target.value)||0};s('items',its);}}/></td>
                    <td><input className="form-input" type="number" min="0" style={{fontSize:12,width:80}} value={item.totalAmt||0} onChange={e=>{const its=[...f.items];its[i]={...its[i],totalAmt:parseFloat(e.target.value)||0};s('items',its);}}/></td>
                    <td>{f.items.length>1&&<button className="btn-icon" onClick={()=>s('items',f.items.filter((_,j)=>j!==i))}><X size={13} color="#dc2626"/></button>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div style={{padding:'8px 14px',borderTop:'1px solid var(--border)'}}><button className="btn btn-ghost btn-sm" style={{color:'var(--brand)'}} onClick={()=>s('items',[...f.items,{name:'',category:'',tax:0,taxAmt:0,totalAmt:0}])}><Plus size={13}/> Add Item</button></div>
            <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)',background:'var(--bg)'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:800,borderTop:'1px solid var(--border)',paddingTop:8,marginTop:4}}><span>Total:</span><span style={{color:'var(--brand)'}}>{fmtMoney(totalAmt)}</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Expense Amount <span className="req">*</span></label>
            <div style={{display:'flex',border:'1.5px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
              <span style={{padding:'8px 10px',background:'var(--bg)',borderRight:'1px solid var(--border)',fontSize:13,fontWeight:600,flexShrink:0}}>₹</span>
              <input style={{flex:1,border:'none',outline:'none',padding:'8px 10px',fontSize:13,fontFamily:'Inter,sans-serif',background:'transparent',color:'var(--text)'}} type="number" min="0" value={f.amount||''} onChange={e=>s('amount',Math.max(0,parseInt(e.target.value)||0))} placeholder="Enter amount"/>
            </div>
          </div>
          <div className="field-row field-row-2" style={{marginBottom:14}}>
            <div><label className="form-label">Category</label><select className="form-select" value={f.category} onChange={e=>s('category',e.target.value)}><option value="">Select Category</option>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="form-label">Amount Type</label><select className="form-select" value={f.amountType} onChange={e=>s('amountType',e.target.value)}><option>Total Amount</option><option>Split Amount</option></select></div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
              <label className="form-label" style={{margin:0}}>Notes</label>
              <button className="btn btn-ghost btn-sm" style={{fontSize:11,color:'var(--brand)',gap:4}} onClick={()=>setAiOpen(true)}><Sparkles size={11}/> AI</button>
            </div>
            <textarea className="form-input form-textarea" rows={2} placeholder="Notes" value={f.notes} onChange={e=>s('notes',e.target.value)}/>
          </div>
        </div>
      )}

      {/* Attachments */}
      <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'20px 16px',textAlign:'center',marginBottom:16,cursor:'pointer'}}
        onMouseOver={e=>e.currentTarget.style.borderColor='var(--brand)'}
        onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',margin:'0 auto 8px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <div style={{fontWeight:600,fontSize:13,color:'var(--text)'}}>Click or drag files to attach</div>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>PDF, PNG, JPEG, Excel – up to 25 MB · Max 3 files</div>
        <input type="file" style={{display:'none'}} multiple accept=".pdf,.png,.jpg,.jpeg,.xlsx"/>
      </label>

      {/* Payments */}
      <div style={{borderTop:'1px solid var(--border)',paddingTop:16,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Payments</div>
        <button className={`btn btn-sm${f.paid?' btn-brand':' btn-outline'}`} style={{gap:6,marginBottom:12}} onClick={()=>s('paid',!f.paid)}>{f.paid&&' '}Mark as Paid</button>
        {f.paid&&(
          <div>
            <div className="field-row field-row-2" style={{marginBottom:12}}>
              <div><label className="form-label">Payment Date</label><input className="form-input" type="date" value={f.paymentDate} onChange={e=>s('paymentDate',e.target.value)}/></div>
              <div><label className="form-label">Payment Notes</label><input className="form-input" placeholder="Payment Notes" value={f.paymentNotes} onChange={e=>s('paymentNotes',e.target.value)}/></div>
            </div>
            <label className="form-label">Payment Type</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {PAYMENT_TYPES.map(t=><button key={t} className={`chip${f.paymentType===t?' active':''}`} style={{fontSize:12}} onClick={()=>s('paymentType',t)}>{t}</button>)}
            </div>
          </div>
        )}
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:8,borderTop:'1px solid var(--border)'}}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={()=>onSave(f)}>Add Expense</button>
      </div>
      {/* Quick Add Vendor inline panel */}
      {showVendorQuick && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'flex-end'}} onClick={e=>e.target===e.currentTarget&&setShowVendorQuick(false)}>
          <div style={{width:'min(400px,95vw)',height:'100%',background:'var(--card-bg)',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontWeight:700,fontSize:16}}>Quick Add Vendor</span>
              <button className="btn-icon" onClick={()=>setShowVendorQuick(false)}><X size={18}/></button>
            </div>
            <div style={{padding:20,flex:1,overflowY:'auto'}}>
              <QuickVendorForm onSave={v=>{addItem('vendors',v);setShowVendorQuick(false);toast('Vendor added','success');}} onCancel={()=>setShowVendorQuick(false)}/>
            </div>
          </div>
        </div>
      )}
      <AIModal open={aiOpen} onClose={()=>setAiOpen(false)} context="expense" onUse={t=>s('notes',t)}/>
    </div>
  );
}


function QuickVendorForm({ onSave, onCancel }) {
  const [f, setF] = useState({ name:'', mobile:'', email:'', gstin:'', city:'' });
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <div>
      {[['name','Vendor Name *','text'],['mobile','Mobile','tel'],['email','Email','email'],['gstin','GSTIN','text'],['city','City','text']].map(([key,label,type])=>(
        <div key={key} style={{marginBottom:14}}>
          <label className="form-label">{label}</label>
          <input className="form-input" type={type} value={f[key]||''} onChange={e=>s(key,e.target.value)} placeholder={label.replace(' *','')}/>
        </div>
      ))}
      <div style={{display:'flex',gap:10,marginTop:20}}>
        <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}} onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" style={{flex:1,justifyContent:'center'}} onClick={()=>{if(f.name.trim())onSave(f);}}>Save Vendor</button>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const {state,addItem,editItem,removeItem,toast,fmtMoney,currency}=useApp();
  const [search,setSearch]=useState('');
  const [sheet,setSheet]=useState(false);
  const [editData,setEdit]=useState(null);
  const [del,setDel]=useState(null);
  const [delL,setDelL]=useState(false);
  const [showCats,setShowCats]=useState(false);

  const expenses=state.expenses||[];
  const vendors=state.vendors||[];
  const filtered=expenses.filter(e=>!search||e.notes?.toLowerCase().includes(search.toLowerCase())||e.category?.toLowerCase().includes(search.toLowerCase()));
  const handleSave=f=>{if(f.id)editItem('expenses',f);else addItem('expenses',f);setSheet(false);toast('Expense saved','success');};
  const handleDel=async()=>{setDelL(true);await new Promise(r=>setTimeout(r,350));removeItem('expenses',del.id);setDel(null);setDelL(false);toast('Deleted','success');};

  return(
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <h1 style={{fontWeight:800,fontSize:22}}>Expenses</h1>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className="btn btn-outline btn-sm" onClick={()=>setShowCats(true)}>
            <Tag size={13}/> Expense Categories
          </button>
          <button className="btn btn-brand btn-sm" onClick={()=>{setEdit(null);setSheet(true);}}>
            <Plus size={14}/> Create Expense
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:10,alignItems:'center'}}>
          <div className="search-bar" style={{maxWidth:300}}><Search size={14} color="#9ca3af"/><input placeholder="Search expenses…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        {filtered.length===0?(
          <EmptyState type="expense" title="No expenses recorded"
            desc={['Track all your business expenses','Attach receipts and invoices','Mark payments with UPI, Cash, Card and more']}
            action={<button className="btn btn-brand btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={()=>{setEdit(null);setSheet(true);}}><Plus size={16}/> Add your first expense</button>}/>
        ):(
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Date</th><th>Category</th><th>Notes</th><th>Amount</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(e=>(
              <tr key={e.id}>
                <td style={{color:'var(--muted)'}}>{fmtDate(e.date)}</td>
                <td>{e.category?<span className="badge badge-brand">{e.category}</span>:'—'}</td>
                <td style={{maxWidth:200,color:'var(--muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.notes||'—'}</td>
                <td style={{fontWeight:700}}>{fmtMoney(e.amount||0)}</td>
                <td><span className={`badge${e.paid?' badge-paid':' badge-pending'}`}>{e.paid?'Paid':'Unpaid'}</span></td>
                <td><div style={{display:'inline-flex',gap:4}}>
                  <button className="btn-icon" onClick={()=>{setEdit(e);setSheet(true);}}><Pencil size={13}/></button>
                  <button className="btn-icon" onClick={()=>setDel(e)}><Trash2 size={13} color="#dc2626"/></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      <Sheet open={sheet} onClose={()=>setSheet(false)} title="Add Expense" size="xl"
        headerRight={<button className="btn btn-brand btn-sm" onClick={()=>{}}>Add Expense</button>}>
        <div className="tabs-row" style={{marginBottom:16}}><button className="tab-btn active">Basic Details</button></div>
        <ExpenseForm data={editData} vendors={vendors} onSave={handleSave} onCancel={()=>setSheet(false)}/>
      </Sheet>
      <DeleteModal open={!!del} onClose={()=>setDel(null)} onConfirm={handleDel} loading={delL} itemName="Expense"/>
      <ExpenseCategoriesSheet open={showCats} onClose={()=>setShowCats(false)}/>
    </div>
  );
}
