'use client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

function BankForm({ data, onSave, onCancel }) {
  const [f, setF] = useState(data || { bankName:'', accountName:'', accountNumber:'', ifsc:'', branch:'', accountType:'Savings', upi:'' });
  const [err, setErr] = useState({});
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  const [qrImage, setQrImage] = useState(data?.qrImage || null);
  const qrRef = require('react').useRef(null);
  const handleQr = file => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { setQrImage(e.target.result); s('qrImage', e.target.result); };
    reader.readAsDataURL(file);
  };
  const validate = () => {
    const e={};
    if(!f.bankName.trim()) e.bankName='Required';
    if(!f.accountNumber.trim()) e.accountNumber='Required';
    if(!f.ifsc.trim()) e.ifsc='Required';
    setErr(e); return !Object.keys(e).length;
  };
  return (
    <div>
      <div style={{marginBottom:14}}>
        <label className="form-label">Bank Name <span className="req">*</span></label>
        <input className={`form-input${err.bankName?' error':''}`} placeholder="State Bank of India" value={f.bankName} onChange={e=>s('bankName',e.target.value)} autoFocus/>
        {err.bankName&&<p className="form-err">{err.bankName}</p>}
      </div>
      <div style={{marginBottom:14}}>
        <label className="form-label">Account Holder Name</label>
        <input className="form-input" placeholder="Full name as per bank" value={f.accountName} onChange={e=>s('accountName',e.target.value)}/>
      </div>
      <div className="field-row field-row-2" style={{marginBottom:14}}>
        <div>
          <label className="form-label">Account Number <span className="req">*</span></label>
          <input className={`form-input${err.accountNumber?' error':''}`} placeholder="000000000000" value={f.accountNumber} onChange={e=>s('accountNumber',e.target.value.replace(/\D/g,''))}/>
          {err.accountNumber&&<p className="form-err">{err.accountNumber}</p>}
        </div>
        <div>
          <label className="form-label">IFSC Code <span className="req">*</span></label>
          <input className={`form-input${err.ifsc?' error':''}`} placeholder="SBIN0001234" value={f.ifsc} onChange={e=>s('ifsc',e.target.value.toUpperCase())} maxLength={11}/>
          {err.ifsc&&<p className="form-err">{err.ifsc}</p>}
        </div>
      </div>
      <div className="field-row field-row-2" style={{marginBottom:14}}>
        <div>
          <label className="form-label">Branch</label>
          <input className="form-input" placeholder="Branch name" value={f.branch} onChange={e=>s('branch',e.target.value)}/>
        </div>
        <div>
          <label className="form-label">Account Type</label>
          <select className="form-select" value={f.accountType} onChange={e=>s('accountType',e.target.value)}>
            {['Savings','Current','Overdraft','Cash Credit'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <label className="form-label">UPI ID</label>
        <input className="form-input" placeholder="yourname@upi" value={f.upi} onChange={e=>s('upi',e.target.value)}/>
        <p style={{fontSize:11.5,color:'#6b7280',marginTop:4}}>Customers can pay you via UPI on invoices</p>
      </div>
      {/* QR Code upload */}
    <div style={{marginBottom:16,padding:'16px',background:'var(--brand-bg)',borderRadius:10,border:'1px solid var(--brand)'}}>
      <div style={{fontWeight:700,fontSize:13,marginBottom:4,color:'var(--brand)'}}>Payment QR Code</div>
      <div style={{fontSize:12,color:'var(--muted)',marginBottom:12,lineHeight:1.5}}>
        Open any UPI app (GPay, PhonePe, Paytm), go to your profile and take a screenshot of your QR code. Crop and upload it here. This QR code will appear on every invoice you generate.
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        {qrImage ? (
          <div style={{position:'relative'}}>
            <img src={qrImage} alt="QR Code" style={{width:100,height:100,objectFit:'contain',border:'1px solid var(--border)',borderRadius:8,background:'#fff'}}/>
            <button onClick={()=>{setQrImage(null);s('qrImage',null);}} style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#dc2626',border:'none',color:'#fff',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
        ) : (
          <div onClick={()=>qrRef.current?.click()} style={{width:100,height:100,border:'2px dashed var(--brand)',borderRadius:8,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:6,background:'rgba(143,25,92,0.05)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style={{fontSize:10,fontWeight:600,color:'var(--brand)'}}>Upload QR</span>
          </div>
        )}
        <div style={{flex:1,minWidth:140}}>
          <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>How to get your QR code:</div>
          <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>
            1. Open GPay / PhonePe / Paytm<br/>
            2. Go to your profile or payment QR<br/>
            3. Screenshot & crop just the QR code<br/>
            4. Upload the cropped image here
          </div>
        </div>
      </div>
      <input ref={qrRef} type="file" style={{display:'none'}} accept="image/*" onChange={e=>handleQr(e.target.files?.[0])}/>
    </div>
    <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:8,borderTop:'1px solid var(--border)'}}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={()=>{if(validate())onSave(f);}}>Save Bank Account</button>
      </div>
    </div>
  );
}

export default function BankDetailsPage() {
  const {state,addItem,editItem,removeItem,toast}=useApp();
  const [sheet,setSheet]=useState(false);const [editData,setEdit]=useState(null);const [del,setDel]=useState(null);const [delL,setDelL]=useState(false);
  const banks=state.bankDetails||[];
  const openForm=(d=null)=>{setEdit(d);setSheet(true);};
  const handleSave=f=>{if(f.id)editItem('bankDetails',f);else addItem('bankDetails',f);setSheet(false);toast(f.id?'Updated':'Bank account added','success');};
  const handleDel=async()=>{setDelL(true);await new Promise(r=>setTimeout(r,350));removeItem('bankDetails',del.id);setDel(null);setDelL(false);toast('Deleted','success');};
  return(
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h1 style={{fontWeight:800,fontSize:22}}>Bank Details</h1>
        <button className="btn btn-brand btn-sm" onClick={()=>openForm()}><Plus size={14}/> Add Bank Account</button>
      </div>
      <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
        <Building2 size={18} color="#1e40af"/>
        <div><div style={{fontWeight:700,fontSize:13}}>Add bank details to receive payments faster</div><div style={{fontSize:12.5,color:'#6b7280'}}>Your bank details will appear on all invoices so customers can pay you directly.</div></div>
      </div>
      <div className="card">
        {banks.length===0?(
          <EmptyState type="generic" title="No bank accounts yet"
            desc={['Add your bank account to receive payments','Show account details on invoices','Support UPI, NEFT, RTGS transfers']}
            action={<button className="btn btn-brand btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={()=>openForm()}><Plus size={16}/> Add Bank Account</button>}/>
        ):(
          <div style={{overflowX:'auto'}}><table className="tbl">
            <thead><tr><th>Bank</th><th>Account Number</th><th>IFSC</th><th>Type</th><th>UPI</th><th>Actions</th></tr></thead>
            <tbody>{banks.map(b=>(
              <tr key={b.id}>
                <td><div style={{fontWeight:600}}>{b.bankName}</div><div style={{fontSize:11.5,color:'#9ca3af'}}>{b.accountName}</div></td>
                <td style={{fontFamily:'monospace'}}>{b.accountNumber?.replace(/(.{4})/g,'$1 ').trim()}</td>
                <td style={{fontFamily:'monospace',fontSize:12}}>{b.ifsc}</td>
                <td><span className="badge badge-brand">{b.accountType}</span></td>
                <td style={{fontSize:12,color:'#6b7280'}}>{b.upi||'—'}</td>
                <td><div style={{display:'inline-flex',gap:4}}><button className="btn-icon" onClick={()=>openForm(b)}><Pencil size={13}/></button><button className="btn-icon" onClick={()=>setDel(b)}><Trash2 size={13} color="#dc2626"/></button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {sheet&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setSheet(false)}>
          <div className="modal-box modal-md">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontWeight:700,fontSize:16}}>{editData?.id?'Edit Bank Account':'Add Bank Account'}</span>
              <button className="btn-icon" onClick={()=>setSheet(false)}>✕</button>
            </div>
            <div style={{padding:20}}><BankForm data={editData} onSave={handleSave} onCancel={()=>setSheet(false)}/></div>
          </div>
        </div>
      )}
      <DeleteModal open={!!del} onClose={()=>setDel(null)} onConfirm={handleDel} loading={delL} itemName="Bank Account"/>
    </div>
  );
}
