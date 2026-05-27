'use client';
import { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';

const NOTES = {
  professional: [
    "Thank you for your valued business. We appreciate your trust and look forward to serving you again. Please review the invoice and feel free to contact us for any queries.",
    "We sincerely appreciate your continued partnership. This invoice reflects the services delivered as agreed. Please process payment at your earliest convenience.",
    "Thank you for choosing us. We remain committed to delivering exceptional service. Kindly review the attached invoice and confirm receipt.",
    "It has been a pleasure working with you. We value your business and look forward to a continued relationship. Payment by the due date would be greatly appreciated."
  ],
  friendly: [
    "Thanks so much for working with us! We loved this project and hope you are happy with the results. Do not hesitate to reach out anytime!",
    "Hey! It was great working with you. Here is the invoice for the work done. Let us know if you have any questions!",
    "We had a wonderful time on this project! Hope everything looks good. Feel free to ping us if anything needs clarification!",
    "Thank you for trusting us with your work! We genuinely enjoyed it. Looking forward to working together again soon!"
  ],
  formal: [
    "We hereby acknowledge completion of the services rendered as per the agreed scope. Kindly remit payment within the stipulated timeframe.",
    "This invoice is submitted in accordance with the terms of our service agreement. Please arrange for payment at the earliest possible convenience.",
    "We respectfully submit this invoice for professional services rendered. We request timely settlement as per the agreed payment terms.",
    "Please find enclosed the invoice for services duly rendered. Payment must be processed in accordance with the agreed terms and conditions."
  ],
  concise: [
    "Thank you. Please pay by the due date.",
    "Invoice enclosed. Payment due as noted above.",
    "Thanks for your business. Please review and pay on time.",
    "Services delivered. Payment requested by due date."
  ]
};

const TERMS = {
  weekly: [
    "Payment is due within 7 days of the invoice date. Late payments will incur a 2% weekly interest charge. Please ensure timely payment to avoid any disruption of services.",
    "Full payment must be received within 7 days. We reserve the right to suspend services if payment is not received by the due date.",
    "Payment terms: Net 7 days. Interest at 1.5% per week applies on overdue amounts. Disputes must be raised within 3 days of invoice receipt.",
    "This invoice is payable within 7 days. Any delays beyond the due date will attract a late payment fee as per our service agreement."
  ],
  monthly: [
    "Payment is due within 30 days of the invoice date. Late payments may incur a 1.5% monthly interest charge. All disputes must be raised within 7 days of receipt.",
    "Net 30 payment terms apply. Please process payment within 30 days to avoid late fees. Thank you for your prompt attention.",
    "Full payment is expected within 30 days. We accept bank transfer, UPI, and cheque. Kindly mention the invoice number in your payment reference.",
    "Payment due: Net 30 days from invoice date. Goods and services remain property of the company until full payment is received."
  ],
  advance: [
    "50% advance payment is required before commencement of work. The remaining balance is due upon project completion. Work will begin only after advance payment is received.",
    "This invoice requires advance payment. Kindly transfer the amount before the work begins. No deliverables will be shared until payment is confirmed.",
    "Payment in advance is required for this engagement. Please transfer the full amount or the agreed advance before the project start date.",
    "As per our agreement, advance payment is required. Work will be initiated upon receipt of payment. Please use the bank details provided above."
  ],
  delivery: [
    "Payment is due upon delivery of goods or completion of services. Cash, UPI, and bank transfer are accepted. Goods remain the property of the seller until full payment.",
    "Full payment is expected on delivery. No credit terms apply. Please ensure payment is ready at the time of delivery or service completion.",
    "Payment on delivery terms apply to this invoice. Please arrange for payment at the time of receiving the goods or service.",
    "This is a cash-on-delivery invoice. Payment must be made upon receipt of goods. No returns without prior written approval."
  ]
};

export default function AIModal({ open, onClose, context, onUse }) {
  const [tone, setTone] = useState('professional');
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | loading | done

  if (!open) return null;

  const isTerms = context === 'invoice';
  const tones = isTerms
    ? [{ key:'weekly', label:'Due in 7 Days' }, { key:'monthly', label:'Net 30 Days' }, { key:'advance', label:'Advance Payment' }, { key:'delivery', label:'On Delivery' }]
    : [{ key:'professional', label:'Professional' }, { key:'friendly', label:'Friendly' }, { key:'formal', label:'Formal' }, { key:'concise', label:'Concise' }];
  const variations = isTerms ? (TERMS[tone] || TERMS.monthly) : (NOTES[tone] || NOTES.professional);
  const title = isTerms ? 'Generate Terms & Conditions' : 'Generate Notes';

  const handleGenerate = () => {
    setPhase('loading');
    setSelected(null);
    setTimeout(() => setPhase('done'), 1200);
  };

  const handleToneChange = (key) => {
    setTone(key);
    if (phase === 'done') {
      setPhase('loading');
      setSelected(null);
      setTimeout(() => setPhase('done'), 800);
    }
  };

  const handleUse = () => {
    if (selected !== null && onUse) onUse(variations[selected]);
    onClose();
    setSelected(null);
    setPhase('idle');
    setTone('professional');
  };

  const handleClose = () => {
    onClose();
    setSelected(null);
    setPhase('idle');
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box modal-md" style={{ maxHeight:'calc(100dvh - 32px)' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Sparkles size={16} color="var(--brand)"/>
            <span style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{title}</span>
          </div>
          <button className="btn-icon" onClick={handleClose}><X size={18}/></button>
        </div>

        <div style={{ padding:'16px 20px', flex:1, overflowY:'auto' }}>

          {/* IDLE: just the generate button */}
          {phase === 'idle' && (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--brand-bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <Sparkles size={26} color="var(--brand)"/>
              </div>
              <p style={{ fontSize:14, color:'var(--muted)', marginBottom:20, lineHeight:1.6, maxWidth:320, margin:'0 auto 20px' }}>
                {isTerms ? 'Generate professional payment terms and conditions using AI.' : 'Generate professional invoice notes using AI.'}
              </p>
              <button className="btn btn-brand" style={{ gap:8, padding:'11px 28px', fontSize:14 }} onClick={handleGenerate}>
                <Sparkles size={15}/> Generate using AI
              </button>
            </div>
          )}

          {/* LOADING: spinner */}
          {phase === 'loading' && (
            <div style={{ textAlign:'center', padding:'48px 0' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid var(--brand-bg)', borderTopColor:'var(--brand)', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
              <p style={{ fontSize:14, color:'var(--muted)', fontWeight:500 }}>Generating variations...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* DONE: tone + variations */}
          {phase === 'done' && (
            <div>
              {/* Tone selector */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
                  {isTerms ? 'Payment Timeline' : 'Tone'}
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {tones.map(t => (
                    <button key={t.key} onClick={() => handleToneChange(t.key)}
                      style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${tone===t.key?'var(--brand)':'var(--border)'}`, background:tone===t.key?'var(--brand-bg)':'var(--card-bg)', color:tone===t.key?'var(--brand)':'var(--muted)', fontWeight:600, fontSize:12.5, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variations */}
              <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Choose a variation</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {variations.map((text, i) => (
                  <div key={i} onClick={() => setSelected(i)}
                    style={{ padding:'12px 14px', borderRadius:10, border:`2px solid ${selected===i?'var(--brand)':'var(--border)'}`, background:selected===i?'var(--brand-bg)':'var(--card-bg)', cursor:'pointer', position:'relative', transition:'all 0.12s' }}>
                    {selected===i && (
                      <div style={{ position:'absolute', top:10, right:10, width:18, height:18, borderRadius:'50%', background:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Check size={11} color="#fff" strokeWidth={3}/>
                      </div>
                    )}
                    <div style={{ fontSize:10, fontWeight:700, color:selected===i?'var(--brand)':'var(--muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>Option {i+1}</div>
                    <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.6, paddingRight:selected===i?22:0 }}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === 'done' && (
          <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10, justifyContent:'flex-end', flexShrink:0 }}>
            <button className="btn btn-outline" onClick={handleClose}>Cancel</button>
            <button className="btn btn-brand" onClick={handleUse} disabled={selected===null} style={{ opacity:selected===null?0.5:1 }}>
              <Sparkles size={14}/> Use this
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
