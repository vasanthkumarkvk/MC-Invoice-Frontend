'use client';
import { useState } from 'react';
import { Save, FileText, Hash, Calendar } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function DocumentSettingsPage() {
  const { state, update, toast } = useApp();
  const saved = state.documentSettings || {};
  const [f, setF] = useState({
    invoicePrefix: saved.invoicePrefix || 'INV-',
    invoiceStart: saved.invoiceStart || '001',
    quotePrefix: saved.quotePrefix || 'QUO-',
    purchasePrefix: saved.purchasePrefix || 'PO-',
    defaultDueDate: saved.defaultDueDate || '30',
    defaultTax: saved.defaultTax || '18',
    defaultCurrency: saved.defaultCurrency || 'INR',
    defaultNotes: saved.defaultNotes || 'Thank you for your business.',
    defaultTerms: saved.defaultTerms || 'Payment is due within 30 days of the invoice date.',
    showHSN: saved.showHSN !== undefined ? saved.showHSN : true,
    showGST: saved.showGST !== undefined ? saved.showGST : true,
    roundOff: saved.roundOff !== undefined ? saved.roundOff : false,
    invoiceSize: saved.invoiceSize || 'A4',
  });
  const s = (k, v) => setF(p => ({...p, [k]: v}));
  const Toggle = ({ on, onClick }) => (
    <div className={'tog-track' + (on?' on':'')} onClick={onClick}><div className="tog-thumb"/></div>
  );

  const handleSave = () => { update('documentSettings', f); toast('Document settings saved', 'success'); };

  return (
    <div className="page-content">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:10}}>
        <div>
          <h1 style={{fontWeight:800, fontSize:22}}>Document Settings</h1>
          <p style={{color:'var(--muted)', fontSize:13, marginTop:3}}>Configure defaults for all your invoices and documents</p>
        </div>
        <button className="btn btn-brand" onClick={handleSave}><Save size={14}/> Save Settings</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}} className="doc-grid">
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:700, fontSize:15, marginBottom:16, display:'flex', alignItems:'center', gap:8}}><Hash size={16} color="var(--brand)"/> Document Numbering</div>
          <div className="field-row field-row-2" style={{marginBottom:14}}>
            <div><label className="form-label">Invoice Prefix</label><input className="form-input" value={f.invoicePrefix} onChange={e=>s('invoicePrefix',e.target.value)}/></div>
            <div><label className="form-label">Starting Number</label><input className="form-input" value={f.invoiceStart} onChange={e=>s('invoiceStart',e.target.value)}/></div>
          </div>
          <div className="field-row field-row-2">
            <div><label className="form-label">Quotation Prefix</label><input className="form-input" value={f.quotePrefix} onChange={e=>s('quotePrefix',e.target.value)}/></div>
            <div><label className="form-label">Purchase Prefix</label><input className="form-input" value={f.purchasePrefix} onChange={e=>s('purchasePrefix',e.target.value)}/></div>
          </div>
        </div>
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:700, fontSize:15, marginBottom:16, display:'flex', alignItems:'center', gap:8}}><Calendar size={16} color="var(--brand)"/> Default Values</div>
          <div className="field-row field-row-2" style={{marginBottom:14}}>
            <div>
              <label className="form-label">Default Due Date</label>
              <select className="form-select" value={f.defaultDueDate} onChange={e=>s('defaultDueDate',e.target.value)}>
                {[['0','On Receipt'],['7','7 Days'],['15','15 Days'],['30','30 Days'],['60','60 Days'],['90','90 Days']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Default GST Rate</label>
              <select className="form-select" value={f.defaultTax} onChange={e=>s('defaultTax',e.target.value)}>
                {[0,5,12,18,28].map(r=><option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label className="form-label">Default Currency</label>
            <select className="form-select" value={f.defaultCurrency} onChange={e=>s('defaultCurrency',e.target.value)}>
              <option value="INR">INR (₹) Indian Rupee</option>
              <option value="USD">USD ($) US Dollar</option>
              <option value="EUR">EUR (€) Euro</option>
              <option value="GBP">GBP (£) British Pound</option>
              <option value="AED">AED UAE Dirham</option>
            </select>
          </div>
          <label className="form-label">Invoice Size</label>
          <div style={{display:'flex', gap:8}}>
            {['A4','Letter','A5'].map(sz=>(
              <button key={sz} onClick={()=>s('invoiceSize',sz)} className={'chip'+(f.invoiceSize===sz?' active':'')} style={{fontSize:13}}>{sz}</button>
            ))}
          </div>
        </div>
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:700, fontSize:15, marginBottom:16, display:'flex', alignItems:'center', gap:8}}><FileText size={16} color="var(--brand)"/> Invoice Display</div>
          {[{k:'showHSN',label:'Show HSN/SAC Code column'},{k:'showGST',label:'Show GST % column'},{k:'roundOff',label:'Auto round off total'}].map(opt=>(
            <div key={opt.k} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:13, fontWeight:500}}>{opt.label}</span>
              <Toggle on={f[opt.k]} onClick={()=>s(opt.k,!f[opt.k])}/>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:700, fontSize:15, marginBottom:16}}>Default Notes & Terms</div>
          <div style={{marginBottom:14}}><label className="form-label">Default Notes</label><textarea className="form-input form-textarea" rows={3} value={f.defaultNotes} onChange={e=>s('defaultNotes',e.target.value)}/></div>
          <div><label className="form-label">Default Terms</label><textarea className="form-input form-textarea" rows={4} value={f.defaultTerms} onChange={e=>s('defaultTerms',e.target.value)}/></div>
        </div>
      </div>
      <style>{`.doc-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}@media(max-width:768px){.doc-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
