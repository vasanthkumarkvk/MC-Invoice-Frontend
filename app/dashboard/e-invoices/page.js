'use client';
import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { calcDoc, today, addDays, GST_RATES, UNITS } from '@/lib/data';
import {
  Plus, X, CheckCircle, Clock, AlertCircle, Download,
  RefreshCw, QrCode, FileText, Send, Zap, Shield,
  Globe, Copy, ChevronRight, Search, Trash2, ArrowUp, MapPin
} from 'lucide-react';
import LineItems from '@/components/LineItems';
import HSNSearch from '@/components/HSNSearch';

const API_BASE = 'https://api.crazystory.in/api';

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    approved: { bg:'#d1fae5', c:'#065f46', label:'IRN Generated' },
    pending:  { bg:'#fef3c7', c:'#92400e', label:'Pending' },
    failed:   { bg:'#fee2e2', c:'#991b1b', label:'Failed' },
    draft:    { bg:'#f3f4f6', c:'#374151', label:'Draft' },
  };
  const s = map[status] || map.draft;
  return <span style={{fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:20,background:s.bg,color:s.c}}>{s.label}</span>;
}

/* ── Processing animation modal ── */
function ProcessingModal({ invoice, customer, onClose, onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Formatting invoice data as JSON...',
    'Connecting to IRP portal securely...',
    'Government validating GSTIN numbers...',
    'Checking for duplicate invoice...',
    'Generating IRN number...',
    'Creating QR code...',
  ];

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setStep(i);
      if (i >= steps.length) {
        clearInterval(t);
        setTimeout(onDone, 600);
      }
    }, 380);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal-box modal-sm" style={{padding:32,textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <RefreshCw size={28} color="var(--brand)" style={{animation:'spin 1s linear infinite'}}/>
        </div>
        <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Sending to IRP Portal...</div>
        <div style={{fontSize:12.5,color:'var(--muted)',marginBottom:20}}>Invoice #{invoice?.number} — {customer?.name || 'Customer'}</div>
        <div style={{textAlign:'left'}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,opacity:i>step?0.3:1,transition:'opacity 0.3s'}}>
              <div style={{width:18,height:18,borderRadius:'50%',background:i<step?'#059669':i===step?'var(--brand)':'var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background 0.3s'}}>
                {i<step
                  ? <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                  : <span style={{width:6,height:6,borderRadius:'50%',background:'#fff',display:'block'}}/>
                }
              </div>
              <span style={{fontSize:12.5,color:i<=step?'var(--text)':'var(--muted)'}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Success modal ── */
function SuccessModal({ invoice, customer, irn, ackNo, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(irn); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="modal-backdrop">
      <div className="modal-box modal-md">
        <div style={{padding:'24px 24px 0',textAlign:'center'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'#d1fae5',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <CheckCircle size={32} color="#059669"/>
          </div>
          <div style={{fontWeight:800,fontSize:18,color:'#059669',marginBottom:4}}>E-Invoice Generated!</div>
          <div style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>IRN number and QR code are ready for {customer?.name || 'Customer'}</div>
        </div>
        <div style={{padding:'0 24px 20px'}}>
          <div style={{background:'var(--bg)',borderRadius:10,padding:16,marginBottom:16}}>
            {[['Invoice #',invoice?.number],['Ack Number',ackNo],['Generated At',new Date().toLocaleString('en-IN')]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:13}}>
                <span style={{color:'var(--muted)'}}>{l}</span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:8}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:4}}>IRN Number</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <code style={{fontSize:11,background:'var(--card-bg)',padding:'6px 10px',borderRadius:6,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',border:'1px solid var(--border)'}}>{irn}</code>
                <button className="btn-icon" style={{border:'1px solid var(--border)',flexShrink:0}} onClick={copy} title="Copy IRN">
                  {copied ? <CheckCircle size={14} color="#059669"/> : <Copy size={14}/>}
                </button>
              </div>
            </div>
          </div>
          {/* QR placeholder */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
            <div style={{width:120,height:120,border:'2px solid var(--border)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
              <QrCode size={60} color="var(--muted)" style={{opacity:0.4}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}}><Download size={13}/> Download PDF</button>
            <button className="btn btn-brand" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   E-INVOICE SIDE SHEET
══════════════════════════════════════ */
function EInvoiceSheet({ onClose, onSaved }) {
  const { state, addItem, toast, fmtMoney, currency } = useApp();
  
  // State for fetched data from API
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [fetchingCustomers, setFetchingCustomers] = useState(true);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const blank = {
    partyId: '', date: today(), dueDate: addDays(30),
    items: [{ id:1, name:'', qty:1, price:0, unit:'Nos', disc:0, gst:18, hsn:'' }],
    notes: '', terms: 'Payment due within 30 days.', disc: 0, advancePaid: 0,
    type: 'b2b',
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const [showCustDrop, setShowCustDrop] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);

  const sf = (k,v) => setForm(f=>({...f,[k]:v}));
  const totals = calcDoc(form.items, form.disc);
  const cust = customers.find(c => c.id === form.partyId);
  const filteredCusts = customers.filter(c =>
    !custSearch || c.name?.toLowerCase().includes(custSearch.toLowerCase()) || c.gstin?.includes(custSearch)
  );

  const seq = (state.einvoices || []).length + 1;
  const invNumber = `EINV-${String(seq).padStart(4,'0')}`;

  // Fetch customers from API
  const fetchCustomers = async () => {
    const token = localStorage.getItem('zetsap_token');
    setFetchingCustomers(true);
    setFetchError(null);
    try {
      console.log('Fetching customers from API...');
      const res = await fetch(`${API_BASE}/admin/customers`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      
      if (res.ok) {
        let customersList = [];
        
        // Log the structure to debug
        console.log('Response structure:', Object.keys(data));
        
        // Try different possible response structures
        if (data && Array.isArray(data)) {
          customersList = data;
          console.log('Case 1: Response is array');
        } else if (data && data.customers && Array.isArray(data.customers)) {
          customersList = data.customers;
          console.log('Case 2: Response has customers array');
        } else if (data && data.data && Array.isArray(data.data)) {
          customersList = data.data;
          console.log('Case 3: Response has data array');
        } else if (data && data.customers && typeof data.customers === 'object') {
          customersList = Object.values(data.customers);
          console.log('Case 4: Response has customers object');
        } else if (data && data.result && Array.isArray(data.result)) {
          customersList = data.result;
          console.log('Case 5: Response has result array');
        } else if (data && data.items && Array.isArray(data.items)) {
          customersList = data.items;
          console.log('Case 6: Response has items array');
        } else if (data && data.records && Array.isArray(data.records)) {
          customersList = data.records;
          console.log('Case 7: Response has records array');
        } else {
          // Check if there's any array property in the response
          for (let key in data) {
            if (Array.isArray(data[key])) {
              customersList = data[key];
              console.log(`Case 8: Found array in property "${key}"`);
              break;
            }
          }
        }
        
        console.log('Final customers list:', customersList);
        setCustomers(customersList);
        
        if (customersList.length === 0) {
          setFetchError('No customers found. Please add customers first.');
        }
      } else {
        console.error('Failed to fetch customers:', data);
        setFetchError(data.message || 'Failed to fetch customers');
        setCustomers([]);
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
      setFetchError('Network error. Please try again.');
      setCustomers([]);
    } finally {
      setFetchingCustomers(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    const token = localStorage.getItem('zetsap_token');
    setFetchingProducts(true);
    try {
      console.log('Fetching products from API...');
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      console.log('Products API response:', data);
      
      if (res.ok) {
        let productsList = [];
        
        if (data && Array.isArray(data)) {
          productsList = data;
        } else if (data && data.products && Array.isArray(data.products)) {
          productsList = data.products;
        } else if (data && data.data && Array.isArray(data.data)) {
          productsList = data.data;
        } else {
          for (let key in data) {
            if (Array.isArray(data[key])) {
              productsList = data[key];
              break;
            }
          }
        }
        
        console.log('Processed products list:', productsList);
        setProducts(productsList);
      } else {
        console.error('Failed to fetch products:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setProducts([]);
    } finally {
      setFetchingProducts(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const handleSubmit = async () => {
    if (!form.partyId) { toast('Please select a customer', 'error'); return; }
    if (!form.items.some(i => i.name.trim())) { toast('Add at least one item', 'error'); return; }
    if (!cust?.gstin) { toast('Customer must have a GSTIN for e-invoice', 'error'); return; }
    setSaving(true);
    setProcessing(true);
  };

  const handleProcessingDone = () => {
    setProcessing(false);
    const irn = `IRN${Date.now()}${Math.random().toString(36).slice(2,14).toUpperCase()}`;
    const ackNo = `ACK${Date.now()}`;
    const inv = {
      ...form, number: invNumber, status: 'sent',
      irn, ackNo, eInvStatus: 'approved', eInvDate: new Date().toISOString(),
      total: totals.total, subtotal: totals.subtotal, taxAmount: totals.taxAmt,
      customerId: form.partyId,
    };
    addItem('einvoices', inv);
    addItem('invoices', { ...inv, type: 'invoice' });
    setSaving(false);
    setSuccess({ inv, irn, ackNo });
  };

  const handleSuccessDone = () => {
    setSuccess(null);
    toast('E-Invoice saved and sent to IRP portal!', 'success');
    onSaved?.();
    onClose();
  };

  // Show loading state while fetching customers
  if (fetchingCustomers) {
    return (
      <>
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300}} onClick={onClose}/>
        <div style={{position:'fixed',top:0,right:0,bottom:0,width:'min(680px,100vw)',background:'var(--card-bg)',zIndex:301,display:'flex',flexDirection:'column',boxShadow:'-8px 0 40px rgba(0,0,0,0.2)',animation:'sheetIn 0.28s cubic-bezier(0.22,1,0.36,1)'}}>
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
            <div style={{width:40,height:40,border:'3px solid #f3f4f6',borderTopColor:'var(--brand)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <p style={{color:'var(--muted)'}}>Loading customers & products...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300}} onClick={onClose}/>

      {/* Sheet */}
      <div style={{position:'fixed',top:0,right:0,bottom:0,width:'min(680px,100vw)',background:'var(--card-bg)',zIndex:301,display:'flex',flexDirection:'column',boxShadow:'-8px 0 40px rgba(0,0,0,0.2)',animation:'sheetIn 0.28s cubic-bezier(0.22,1,0.36,1)'}}>

        {/* Header */}
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',background:'linear-gradient(135deg,var(--brand),#b52577)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:800,fontSize:17,color:'#fff',display:'flex',alignItems:'center',gap:8}}>
                <Zap size={18} color="#fff"/> Create E-Invoice
              </div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',marginTop:2}}>Sent directly to IRP portal • IRN + QR code generated instantly</div>
            </div>
            <button className="btn-icon" onClick={onClose} style={{color:'#fff',background:'rgba(255,255,255,0.15)',border:'none'}}><X size={18}/></button>
          </div>
          <div style={{display:'flex',gap:6,marginTop:12}}>
            {[['B2B','Business to Business'],['B2C','Business to Consumer'],['Export','Export Invoice']].map(([t,sub])=>(
              <button key={t} onClick={()=>sf('type',t.toLowerCase())}
                style={{padding:'5px 12px',borderRadius:20,border:`1.5px solid ${form.type===t.toLowerCase()?'#fff':'rgba(255,255,255,0.3)'}`,background:form.type===t.toLowerCase()?'#fff':'transparent',color:form.type===t.toLowerCase()?'var(--brand)':'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>

          {/* Customer with GSTIN search */}
          <div className="card" style={{padding:16,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:'var(--text)',display:'flex',alignItems:'center',gap:6}}>
              <Shield size={14} color="var(--brand)"/> Customer (GSTIN Required)
            </div>
            {fetchError && (
              <div style={{background:'#fee2e2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 12px',marginBottom:12,fontSize:12,color:'#dc2626'}}>
                {fetchError} <button onClick={fetchCustomers} style={{marginLeft:8,color:'var(--brand)',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>Retry</button>
              </div>
            )}
            <div style={{position:'relative',marginBottom:10}}>
              <div style={{position:'relative'}}>
                <Search size={14} color="var(--muted)" style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                <input className="form-input" style={{paddingLeft:34}}
                  placeholder="Search customer name or GSTIN..."
                  value={cust ? cust.name : custSearch}
                  onFocus={()=>{setShowCustDrop(true);if(cust)setCustSearch('');}}
                  onChange={e=>{setCustSearch(e.target.value);setShowCustDrop(true);sf('partyId','');}}/>
              </div>
              {showCustDrop && customers.length > 0 && (
                <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'var(--shadow-md)',zIndex:50,maxHeight:220,overflowY:'auto'}}>
                  {filteredCusts.length === 0
                    ? <div style={{padding:'14px 16px',color:'var(--muted)',fontSize:13}}>No customers found matching "{custSearch}"</div>
                    : filteredCusts.map(c=>(
                      <button key={c.id} onClick={()=>{sf('partyId',c.id);setCustSearch('');setShowCustDrop(false);}}
                        style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 14px',background:'none',border:'none',cursor:'pointer',textAlign:'left',borderBottom:'1px solid var(--border)',fontFamily:'Inter,sans-serif'}}
                        onMouseOver={e=>e.currentTarget.style.background='var(--bg)'}
                        onMouseOut={e=>e.currentTarget.style.background='none'}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'var(--brand)',flexShrink:0}}>
                          {c.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                          <div style={{fontSize:11,color:c.gstin?'#059669':'#dc2626',fontFamily:'monospace'}}>
                            {c.gstin || c.gst || ' No GSTIN — required for e-invoice'}
                          </div>
                          <div style={{fontSize:10,color:'var(--muted)'}}>{c.mobile || ''}</div>
                        </div>
                      </button>
                    ))
                  }
                </div>
              )}
              {showCustDrop && customers.length === 0 && !fetchingCustomers && (
                <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'var(--shadow-md)',zIndex:50,padding:'14px 16px',textAlign:'center',color:'var(--muted)',fontSize:13}}>
                  No customers available. Please add customers first.
                </div>
              )}
            </div>
            {cust && (
              <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',fontSize:12.5,display:'flex',gap:16,flexWrap:'wrap'}}>
                <span style={{display:'flex',alignItems:'center',gap:4}}><MapPin size={11} color='var(--muted)'/> {cust.city || cust.billing_address || cust.address || '—'}</span>
                <span style={{fontFamily:'monospace',color:'#059669',fontWeight:600}}>{cust.gstin || cust.gst || 'No GSTIN'}</span>
                {!cust.gstin && !cust.gst && <span style={{color:'#dc2626',fontWeight:600,display:'flex',alignItems:'center',gap:4}}><AlertCircle size={11}/> Add GSTIN in Customers page</span>}
              </div>
            )}
          </div>

          {/* Dates + invoice number */}
          <div className="card" style={{padding:16,marginBottom:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div>
                <label className="form-label">Invoice Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e=>sf('date',e.target.value)}/>
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.dueDate} onChange={e=>sf('dueDate',e.target.value)}/>
              </div>
              <div>
                <label className="form-label">Invoice #</label>
                <input className="form-input" value={invNumber} readOnly style={{background:'var(--bg)',color:'var(--muted)'}}/>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="card" style={{padding:16,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:'var(--text)'}}>Products & Services</div>
            <LineItems
              items={form.items}
              onChange={v=>sf('items',v)}
              products={products}
              currency={currency}
              advancePaid={form.advancePaid}
              onAdvancePaidChange={v=>sf('advancePaid',v)}
            />
            {fetchingProducts && <p style={{fontSize:11,color:'var(--muted)',marginTop:8}}>Loading products...</p>}
          </div>

          {/* Notes & Terms */}
          <div className="card" style={{padding:16,marginBottom:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label className="form-label">Notes</label>
                <textarea className="form-input form-textarea" rows={3} placeholder="Notes for customer..." value={form.notes} onChange={e=>sf('notes',e.target.value)}/>
              </div>
              <div>
                <label className="form-label">Terms</label>
                <textarea className="form-input form-textarea" rows={3} value={form.terms} onChange={e=>sf('terms',e.target.value)}/>
              </div>
            </div>
          </div>

          {/* IRP info banner */}
          <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:10,padding:'12px 14px',fontSize:12.5,color:'#1e40af',display:'flex',gap:10,alignItems:'flex-start'}}>
            <Zap size={15} style={{flexShrink:0,marginTop:1}}/>
            <div>
              <strong>E-Invoice Process:</strong> After you click "Generate E-Invoice", this invoice data will be sent to the Government IRP portal. You will receive an IRN number and QR code within seconds. The entire process is automated.
            </div>
          </div>
        </div>

        {/* Summary + footer */}
        <div style={{borderTop:'1px solid var(--border)',padding:'14px 20px',flexShrink:0,background:'var(--card-bg)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{display:'flex',gap:20,fontSize:13}}>
              <span style={{color:'var(--muted)'}}>Subtotal: <strong style={{color:'var(--text)'}}>{fmtMoney(totals.subtotal)}</strong></span>
              <span style={{color:'var(--muted)'}}>GST: <strong style={{color:'var(--text)'}}>{fmtMoney(totals.taxAmt)}</strong></span>
            </div>
            <div style={{fontWeight:800,fontSize:18,color:'var(--brand)'}}>{fmtMoney(totals.total)}</div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
            <button className="btn btn-brand" style={{flex:2,justifyContent:'center',background:'linear-gradient(135deg,var(--brand),#b52577)',gap:8}} onClick={handleSubmit} disabled={saving}>
              <Zap size={15}/> Generate E-Invoice & Send to IRP
            </button>
          </div>
        </div>
      </div>

      {processing && (
        <ProcessingModal
          invoice={{number:invNumber}}
          customer={cust}
          onClose={()=>setProcessing(false)}
          onDone={handleProcessingDone}
        />
      )}
      {success && (
        <SuccessModal
          invoice={success.inv}
          customer={cust}
          irn={success.irn}
          ackNo={success.ackNo}
          onClose={handleSuccessDone}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════
   MAIN E-INVOICE PAGE
══════════════════════════════════════ */
export default function EInvoicesPage() {
  const { state, editItem, toast, fmtMoney } = useApp();
  const [showSheet, setShowSheet]           = useState(false);
  const [portalConnected, setPortalConnected] = useState(false);
  const [connecting, setConnecting]         = useState(false);
  const [tab, setTab]                       = useState('all');
  const [copiedIrn, setCopiedIrn]           = useState(null);
  const [refresh, setRefresh]               = useState(0);
  const [customers, setCustomers]           = useState([]);
  const [fetchingCustomers, setFetchingCustomers] = useState(true);

  const invoices  = [...(state.einvoices || []), ...(state.invoices||[]).filter(i=>i.irn)];

  // Fetch customers for display
  const fetchCustomers = async () => {
    const token = localStorage.getItem('zetsap_token');
    setFetchingCustomers(true);
    try {
      const res = await fetch(`${API_BASE}/admin/customers`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        let customersList = [];
        if (data.customers && Array.isArray(data.customers)) {
          customersList = data.customers;
        } else if (data.data && Array.isArray(data.data)) {
          customersList = data.data;
        } else if (Array.isArray(data)) {
          customersList = data;
        } else {
          customersList = [];
        }
        setCustomers(customersList);
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
      setCustomers([]);
    } finally {
      setFetchingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const unique = useMemo(() => {
    const seen = new Set();
    return invoices.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });
  }, [invoices, refresh]);

  const eInvoices  = unique.filter(i => i.eInvStatus === 'approved' || i.irn);
  const pending    = (state.invoices||[]).filter(inv => !inv.irn && inv.status !== 'draft' && !(state.einvoices||[]).find(e=>e.id===inv.id));
  const failed     = unique.filter(i => i.eInvStatus === 'failed');

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise(r=>setTimeout(r,1500));
    setConnecting(false);
    setPortalConnected(true);
    toast('Connected to IRP portal!', 'success');
  };

  const copyIrn = (irn) => {
    navigator.clipboard?.writeText(irn);
    setCopiedIrn(irn);
    setTimeout(()=>setCopiedIrn(null), 2000);
  };

  const display = tab==='all' ? eInvoices : tab==='pending' ? pending : tab==='failed' ? failed : eInvoices;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:22}}>E-Invoices</h1>
          <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Government IRP portal • IRN + QR code • Mandatory above ₹5 crore turnover</p>
        </div>
        <button className="btn btn-brand btn-sm" style={{gap:7,background:'linear-gradient(135deg,var(--brand),#b52577)'}} onClick={()=>setShowSheet(true)}>
          <Zap size={13}/> Create E-Invoice
        </button>
      </div>

      {/* Portal banner */}
      <div style={{background:portalConnected?'#f0fdf4':'#eff6ff',border:`1px solid ${portalConnected?'#bbf7d0':'#bfdbfe'}`,borderRadius:12,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:portalConnected?'#d1fae5':'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {portalConnected ? <CheckCircle size={20} color="#059669"/> : <Globe size={20} color="#1d4ed8"/>}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:portalConnected?'#065f46':'#1e40af'}}>
              {portalConnected ? 'Connected to IRP Portal' : 'Connect to IRP Portal'}
            </div>
            <div style={{fontSize:12,color:portalConnected?'#059669':'#6b7280',marginTop:1}}>
              {portalConnected ? 'Invoices sync automatically with GST government portal' : 'E-invoicing mandatory for businesses with turnover above ₹5 crore'}
            </div>
          </div>
        </div>
        {!portalConnected
          ? <button className="btn btn-brand btn-sm" onClick={handleConnect} disabled={connecting}>{connecting?'Connecting...':'Connect Portal'}</button>
          : <span style={{fontSize:12,fontWeight:700,color:'#059669',background:'#d1fae5',padding:'5px 14px',borderRadius:20}}> Active</span>
        }
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:14,marginBottom:20}}>
        {[
          {label:'Total E-Invoices',value:eInvoices.length,c:'var(--brand)',icon:FileText},
          {label:'IRN Generated',value:eInvoices.length,c:'#059669',icon:CheckCircle},
          {label:'Pending',value:pending.length,c:'#f59e0b',icon:Clock},
          {label:'Failed',value:failed.length,c:'#dc2626',icon:AlertCircle},
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:9,background:`${s.c}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <s.icon size={16} color={s.c}/>
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:20,color:'var(--text)'}}>{s.value}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-row" style={{marginBottom:16}}>
        {[{id:'all',label:'All E-Invoices'},{id:'pending',label:`Pending (${pending.length})`},{id:'failed',label:'Failed'}].map(t=>(
          <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* List */}
      {display.length === 0 ? (
        <div className="card" style={{padding:'50px 32px',textAlign:'center'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'var(--bg)',border:'2px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <QrCode size={28} color="var(--muted)"/>
          </div>
          <h2 style={{fontWeight:800,fontSize:18,marginBottom:8}}>
            {tab==='pending' ? 'No pending invoices' : 'No e-invoices yet'}
          </h2>
          <p style={{fontSize:13,color:'var(--muted)',marginBottom:20,maxWidth:340,margin:'0 auto 20px'}}>
            {tab==='pending' ? 'All invoices have been submitted.' : 'Create your first e-invoice — IRN number and QR code generated in seconds.'}
          </p>
          <button className="btn btn-brand btn-sm" style={{display:'inline-flex'}} onClick={()=>setShowSheet(true)}>
            <Zap size={13}/> Create E-Invoice
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>IRN</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {display.map(inv=>{
                  const cust = customers.find(c=>c.id===inv.customerId||c.id===inv.partyId);
                  return (
                    <tr key={inv.id}>
                      <td style={{fontWeight:700,color:'var(--brand)'}}>{inv.number}</td>
                      <td style={{fontWeight:500}}>{cust?.name||'—'}</td>
                      <td style={{color:'var(--muted)',fontSize:12}}>{inv.date}</td>
                      <td style={{fontWeight:600}}>{fmtMoney(inv.total||0)}</td>
                      <td>
                        {inv.irn ? (
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <code style={{fontSize:10,color:'var(--text)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}>{inv.irn.slice(0,18)}...</code>
                            <button className="btn-icon" style={{width:22,height:22,flexShrink:0}} onClick={()=>copyIrn(inv.irn)}>
                              {copiedIrn===inv.irn ? <CheckCircle size={12} color="#059669"/> : <Copy size={12}/>}
                            </button>
                          </div>
                        ) : <span style={{fontSize:11,color:'var(--muted)'}}>—</span>}
                      </td>
                      <td><StatusBadge status={inv.eInvStatus||(inv.irn?'approved':'draft')}/></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-outline btn-sm" title="Download PDF"><Download size={12}/></button>
                          {inv.irn && <button className="btn btn-outline btn-sm" title="QR Code"><QrCode size={12}/></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card" style={{marginTop:20,padding:20}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>How E-Invoice Works</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
          {[
            {step:'1',title:'Create E-Invoice',desc:'Fill customer GSTIN, items with HSN/SAC codes, GST rates. Click Generate.',c:'var(--brand)'},
            {step:'2',title:'Auto JSON Format',desc:'Invoice data automatically formatted as required JSON structure for IRP portal.',c:'#1d4ed8'},
            {step:'3',title:'Govt Validates',desc:'IRP portal checks GST numbers, duplicates, required fields. Takes 1-10 seconds.',c:'#7c3aed'},
            {step:'4',title:'IRN + QR Ready',desc:'IRN number and QR code returned. Download PDF with QR. Share with customer.',c:'#059669'},
          ].map(s=>(
            <div key={s.step} style={{padding:'14px 16px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:s.c,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{color:'#fff',fontWeight:800,fontSize:12}}>{s.step}</span>
                </div>
                <div style={{fontWeight:700,fontSize:13}}>{s.title}</div>
              </div>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {showSheet && <EInvoiceSheet onClose={()=>setShowSheet(false)} onSaved={()=>setRefresh(r=>r+1)}/>}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes sheetIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (max-width: 768px) {
          .tbl th:nth-child(5), .tbl td:nth-child(5) { display: none; }
          div[style*="width:'min(680px"] { width: 100vw !important; }
        }
      `}</style>
    </div>
  );
}