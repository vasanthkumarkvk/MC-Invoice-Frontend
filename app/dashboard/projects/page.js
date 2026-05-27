'use client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderKanban } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { today } from '@/lib/data';
import { DeleteModal } from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

function ProjectForm({ data, customers, onSave, onCancel }) {
  const [f, setF] = useState(data || { name:'', customerId:'', startDate:today(), deadline:'', status:'active', description:'', budget:0 });
  const [err, setErr] = useState({});
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  const validate = () => { const e={}; if(!f.name.trim()) e.name='Required'; setErr(e); return !Object.keys(e).length; };
  return (
    <div>
      <div style={{marginBottom:14}}><label className="form-label">Project Name <span className="req">*</span></label>
        <input className={`form-input${err.name?' error':''}`} placeholder="Project name" value={f.name} onChange={e=>s('name',e.target.value)} autoFocus/>
        {err.name&&<p className="form-err">{err.name}</p>}
      </div>
      <div className="field-row field-row-2" style={{marginBottom:14}}>
        <div><label className="form-label">Customer</label>
          <select className="form-select" value={f.customerId} onChange={e=>s('customerId',e.target.value)}>
            <option value="">Select Customer</option>
            {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="form-label">Status</label>
          <select className="form-select" value={f.status} onChange={e=>s('status',e.target.value)}>
            {['active','completed','on-hold','cancelled'].map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className="field-row field-row-2" style={{marginBottom:14}}>
        <div><label className="form-label">Start Date</label><input className="form-input" type="date" value={f.startDate} onChange={e=>s('startDate',e.target.value)}/></div>
        <div><label className="form-label">Deadline</label><input className="form-input" type="date" value={f.deadline} onChange={e=>s('deadline',e.target.value)}/></div>
      </div>
      <div style={{marginBottom:14}}>
        <label className="form-label">Budget (₹)</label>
        <input className="form-input" type="number" min="0" step="1" value={f.budget||''} onChange={e=>s('budget',Math.max(0,parseInt(e.target.value)||0))}/>
      </div>
      <div style={{marginBottom:20}}><label className="form-label">Description</label><textarea className="form-input form-textarea" rows={3} value={f.description} onChange={e=>s('description',e.target.value)}/></div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:8,borderTop:'1px solid var(--border)'}}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-brand" onClick={()=>{if(validate())onSave(f);}}>Save Project</button>
      </div>
    </div>
  );
}

const ST = { active:{l:'Active',c:'badge-sent'}, completed:{l:'Completed',c:'badge-paid'}, 'on-hold':{l:'On Hold',c:'badge-pending'}, cancelled:{l:'Cancelled',c:'badge-overdue'} };

export default function ProjectsPage() {
  const {state,addItem,editItem,removeItem,toast}=useApp();
  const [sheet,setSheet]=useState(false);const [editData,setEdit]=useState(null);const [del,setDel]=useState(null);const [delL,setDelL]=useState(false);
  const projects=state.projects||[];const customers=state.customers||[];
  const openForm=(d=null)=>{setEdit(d);setSheet(true);};
  const handleSave=f=>{if(f.id)editItem('projects',f);else addItem('projects',f);setSheet(false);toast(f.id?'Updated':'Project added','success');};
  const handleDel=async()=>{setDelL(true);await new Promise(r=>setTimeout(r,350));removeItem('projects',del.id);setDel(null);setDelL(false);toast('Deleted','success');};
  return(
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><h1 style={{fontWeight:800,fontSize:22}}>Projects</h1><span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block'}}/></div>
        <button className="btn btn-brand btn-sm" onClick={()=>openForm()}><Plus size={14}/> New Project</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:20}}>
        {[{l:'Total',v:projects.length},{l:'Active',v:projects.filter(p=>p.status==='active').length},{l:'Completed',v:projects.filter(p=>p.status==='completed').length}].map(s=>(
          <div key={s.l} className="stat-card"><div style={{fontWeight:800,fontSize:24}}>{s.v}</div><div style={{fontSize:12.5,color:'var(--muted)',marginTop:3}}>{s.l}</div></div>
        ))}
      </div>
      <div className="card">
        {projects.length===0?(
          <EmptyState type="generic" title="No projects yet"
            desc={['Create projects to track work for customers','Set deadlines, budgets and track status','Link invoices and expenses to projects']}
            action={<button className="btn btn-brand btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={()=>openForm()}><Plus size={16}/> Create Project</button>}/>
        ):(
          <div style={{overflowX:'auto'}}><table className="tbl">
            <thead><tr><th>Project</th><th>Customer</th><th>Start</th><th>Deadline</th><th>Budget</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{projects.map(p=>{const c=customers.find(x=>x.id==p.customerId);const st=ST[p.status]||ST.active;return(
              <tr key={p.id}>
                <td><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:11.5,color:'#9ca3af'}}>{p.description?.slice(0,40)||''}</div></td>
                <td>{c?.name||'—'}</td>
                <td style={{color:'var(--muted)',fontSize:12.5}}>{p.startDate||'—'}</td>
                <td style={{color:p.status==='active'&&p.deadline<new Date().toISOString().split('T')[0]?'#dc2626':'var(--muted)',fontSize:12.5}}>{p.deadline||'—'}</td>
                <td style={{fontWeight:600}}>₹{(p.budget||0).toLocaleString()}</td>
                <td><span className={`badge ${st.c}`}>{st.l}</span></td>
                <td><div style={{display:'inline-flex',gap:4}}><button className="btn-icon" onClick={()=>openForm(p)}><Pencil size={13}/></button><button className="btn-icon" onClick={()=>setDel(p)}><Trash2 size={13} color="#dc2626"/></button></div></td>
              </tr>
            );})}
            </tbody>
          </table></div>
        )}
      </div>
      {sheet&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setSheet(false)}>
          <div className="modal-box modal-md">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontWeight:700,fontSize:16}}>{editData?.id?'Edit Project':'New Project'}</span>
              <button className="btn-icon" onClick={()=>setSheet(false)}>✕</button>
            </div>
            <div style={{padding:20}}><ProjectForm data={editData} customers={customers} onSave={handleSave} onCancel={()=>setSheet(false)}/></div>
          </div>
        </div>
      )}
      <DeleteModal open={!!del} onClose={()=>setDel(null)} onConfirm={handleDel} loading={delL} itemName="Project"/>
    </div>
  );
}
