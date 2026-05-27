'use client';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Eye, EyeOff, Camera } from 'lucide-react';

export default function ProfilePage() {
  const {state,setProfile,toast}=useApp();
  const [f,setF]=useState({ firstName:state.profile?.firstName||'', lastName:state.profile?.lastName||'', email:state.profile?.email||'', mobile:state.user?.mobile||'', username:state.profile?.username||'', password:'', confirmPassword:'' });
  const [showPw,setShowPw]=useState(false);const [showCpw,setShowCpw]=useState(false);const [saving,setSaving]=useState(false);
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=async()=>{
    if(f.password&&f.password!==f.confirmPassword){toast('Passwords do not match','error');return;}
    setSaving(true);await new Promise(r=>setTimeout(r,400));
    setProfile({...state.profile,...f});
    setSaving(false);toast('Profile updated','success');
  };
  return(
    <div className="page-content" style={{maxWidth:640}}>
      <h1 style={{fontWeight:800,fontSize:22,marginBottom:20}}>My Profile</h1>
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
          <div style={{position:'relative'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:28,color:'#fff'}}>
              {f.firstName?.[0]?.toUpperCase()||'U'}
            </div>
            <button style={{position:'absolute',bottom:0,right:0,width:24,height:24,borderRadius:'50%',background:'#374151',border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <Camera size={11} color="#fff"/>
            </button>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:17}}>{f.firstName||'Your Name'}</div>
            <div style={{fontSize:12.5,color:'#6b7280'}}>Admin · FREE Plan</div>
          </div>
        </div>
        <div className="field-row field-row-2" style={{marginBottom:14}}>
          <div><label className="form-label">First Name</label><input className="form-input" value={f.firstName} onChange={e=>s('firstName',e.target.value)}/></div>
          <div><label className="form-label">Last Name</label><input className="form-input" value={f.lastName} onChange={e=>s('lastName',e.target.value)}/></div>
        </div>
        <div className="field-row field-row-2" style={{marginBottom:14}}>
          <div><label className="form-label">Email</label><input className="form-input" type="email" value={f.email} onChange={e=>s('email',e.target.value)}/></div>
          <div><label className="form-label">Mobile</label><input className="form-input" value={f.mobile} readOnly style={{background:'#f9fafb',color:'var(--muted)'}}/></div>
        </div>
        <div style={{marginBottom:14}}><label className="form-label">Username</label><input className="form-input" value={f.username} onChange={e=>s('username',e.target.value.replace(/\s/g,''))}/></div>
        <div className="field-row field-row-2" style={{marginBottom:20}}>
          <div>
            <label className="form-label">New Password</label>
            <div style={{position:'relative'}}>
              <input className="form-input" type={showPw?'text':'password'} style={{paddingRight:40}} placeholder="Leave blank to keep current" value={f.password} onChange={e=>s('password',e.target.value)}/>
              <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',display:'flex'}}>{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>
            </div>
          </div>
          <div>
            <label className="form-label">Confirm Password</label>
            <div style={{position:'relative'}}>
              <input className="form-input" type={showCpw?'text':'password'} style={{paddingRight:40}} value={f.confirmPassword} onChange={e=>s('confirmPassword',e.target.value)}/>
              <button type="button" onClick={()=>setShowCpw(p=>!p)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',display:'flex'}}>{showCpw?<EyeOff size={15}/>:<Eye size={15}/>}</button>
            </div>
          </div>
        </div>
        <button className="btn btn-brand" onClick={save} disabled={saving}>{saving?'Saving…':'Save Profile'}</button>
      </div>
    </div>
  );
}
