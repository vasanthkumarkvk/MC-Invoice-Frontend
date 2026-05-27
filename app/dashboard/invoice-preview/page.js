// app/dashboard/invoice-preview/page.js
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Printer, Send, Share2, ChevronDown, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { INVOICE_TEMPLATES, fmtRs, today } from '@/lib/data';

const API_BASE = 'https://api.crazystory.in/api';

/* ── Invoice Preview Component ── */
function InvoicePreviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const invoiceId = params.get('id');
  const { state, toast, fmtMoney, currency } = useApp();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [company, setCompany] = useState(null);

  // Fetch invoice from API
  const fetchInvoice = async () => {
    if (!invoiceId) {
      setError('No invoice ID provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('zetsap_token');
    
    try {
      const res = await fetch(`${API_BASE}/admin/invoices/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const inv = data.invoice || data;
        setInvoice(inv);
        
        // Get customer details from response or fetch separately
        if (inv.customer) {
          setCustomer(inv.customer);
        } else if (inv.customer_id) {
          const custRes = await fetch(`${API_BASE}/admin/customers/${inv.customer_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const custData = await custRes.json();
          if (custRes.ok) setCustomer(custData.customer || custData);
        }
        
        // Get company details
        const companyData = localStorage.getItem('zetsap_company');
        if (companyData) setCompany(JSON.parse(companyData));
        else setCompany(state.company);
      } else {
        setError(data.message || 'Failed to load invoice');
      }
    } catch (err) {
      console.error('Fetch invoice error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const handleDownloadPDF = () => {
    toast('PDF download started...', 'success');
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    toast('Invoice sent to customer!', 'success');
  };

  // Get template style
  const getTemplateStyle = () => {
    const templateId = invoice?.template || 'modern';
    const template = INVOICE_TEMPLATES.find(t => t.id === templateId);
    return {
      primaryColor: template?.colors?.accent || '#8f195c',
      secondaryColor: template?.colors?.primary || '#ffffff',
      borderStyle: template?.id === 'classic' ? '1px solid #e5e7eb' : 'none'
    };
  };

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#8f195c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)' }}>Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="page-content">
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Invoice Not Found</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{error || 'The invoice you are looking for does not exist.'}</p>
          <button className="btn btn-brand" onClick={() => router.push('/dashboard/sales')}>
            Go to Invoices
          </button>
        </div>
      </div>
    );
  }

  const templateStyle = getTemplateStyle();
  const companyLogo = company?.logo || invoice?.logo || null;
  
  // Calculate totals if not provided
  const subtotal = invoice.subtotal || invoice.items?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;
  const gstAmount = invoice.gst_amount || invoice.items?.reduce((sum, i) => sum + (i.price * i.quantity * (i.gst_rate / 100)), 0) || 0;
  const total = invoice.total_amount || subtotal + gstAmount;

  return (
    <div className="page-content" style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      {/* Action Bar */}
      <div style={{ 
        background: 'white', 
        borderRadius: 12, 
        padding: '12px 20px', 
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => router.back()} style={{ border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 18 }}>Invoice Preview</h1>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>#{invoice.invoice_number || invoice.number}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleDownloadPDF}>
            <Download size={14} /> PDF
          </button>
          <button className="btn btn-brand btn-sm" onClick={handleSend}>
            <Send size={14} /> Send to Customer
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="card" style={{ padding: 32, maxWidth: 900, margin: '0 auto', background: templateStyle.secondaryColor }}>
        {/* Header with Logo and Company Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          borderBottom: `2px solid ${templateStyle.primaryColor}`,
          paddingBottom: 20,
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" style={{ height: 60, objectFit: 'contain', marginBottom: 10 }} />
            ) : (
              <div style={{ fontWeight: 800, fontSize: 24, color: templateStyle.primaryColor }}>
                {company?.name || 'Zetsap'}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              {company?.address && <div>{company.address}</div>}
              {company?.city && company?.state && <div>{company.city}, {company.state} - {company.pincode}</div>}
              {company?.gstin && <div>GSTIN: {company.gstin}</div>}
              {company?.email && <div>{company.email}</div>}
              {company?.mobile && <div>Phone: {company.mobile}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: templateStyle.primaryColor,
              marginBottom: 10
            }}>
              INVOICE
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>Invoice #:</strong> {invoice.invoice_number || invoice.number}</div>
              <div><strong>Date:</strong> {invoice.invoice_date || invoice.date}</div>
              {invoice.due_date && <div><strong>Due Date:</strong> {invoice.due_date}</div>}
              <div><strong>Status:</strong> <span className={`badge ${invoice.status === 'paid' ? 'badge-success' : invoice.status === 'sent' ? 'badge-brand' : 'badge-warning'}`}>{invoice.status || 'Draft'}</span></div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: templateStyle.primaryColor }}>Bill To:</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <div><strong>{customer?.name}</strong></div>
            {customer?.billing_address && <div>{customer.billing_address}</div>}
            {customer?.city && <div>{customer.city}, {customer.state} - {customer.pincode}</div>}
            {customer?.gstin && <div>GSTIN: {customer.gstin}</div>}
            {customer?.email && <div>Email: {customer.email}</div>}
            {customer?.mobile && <div>Phone: {customer.mobile}</div>}
          </div>
        </div>

        {/* Items Table */}
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: templateStyle.primaryColor + '10', borderBottom: `2px solid ${templateStyle.primaryColor}` }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, fontWeight: 700 }}>#</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Item</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>HSN/SAC</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Qty</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Unit</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>Price</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>GST%</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, idx) => {
                const qty = parseFloat(item.quantity) || 1;
                const price = parseFloat(item.price) || 0;
                const gst = parseFloat(item.gst_rate) || 0;
                const amount = qty * price;
                const gstAmount = amount * (gst / 100);
                const total = amount + gstAmount;
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 8px', fontSize: 13 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 8px', fontSize: 13 }}>{item.product_name || item.name}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontFamily: 'monospace' }}>{item.hsn_sac_code || '-'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 13 }}>{qty}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 13 }}>{item.unit || 'Nos'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 13 }}>{fmtMoney(price)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 13 }}>{gst}%</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{fmtMoney(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Subtotal:</span>
              <span>{fmtMoney(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>GST Amount:</span>
              <span>{fmtMoney(gstAmount)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#dc2626' }}>
                <span>Discount:</span>
                <span>-{fmtMoney(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.adjustment_amount !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span>Adjustment:</span>
                <span>{invoice.adjustment_amount > 0 ? '+' : ''}{fmtMoney(invoice.adjustment_amount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `2px solid ${templateStyle.primaryColor}`, marginTop: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Total:</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: templateStyle.primaryColor }}>{fmtMoney(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms_conditions) && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${templateStyle.primaryColor}20` }}>
            {invoice.notes && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: templateStyle.primaryColor }}>Notes:</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{invoice.notes}</div>
              </div>
            )}
            {invoice.terms_conditions && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: templateStyle.primaryColor }}>Terms & Conditions:</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{invoice.terms_conditions}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          marginTop: 32, 
          paddingTop: 16, 
          textAlign: 'center', 
          fontSize: 11, 
          color: '#9ca3af',
          borderTop: `1px solid ${templateStyle.primaryColor}20`
        }}>
          <p>This is a computer generated invoice and does not require a physical signature.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .badge-brand {
          background: #8f195c15;
          color: #8f195c;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-success {
          background: #10b98115;
          color: #10b981;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-warning {
          background: #f59e0b15;
          color: #f59e0b;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        @media print {
          .page-content {
            padding: 0;
            margin: 0;
            background: white;
          }
          .card {
            box-shadow: none;
            padding: 20px;
            margin: 0;
          }
          div[style*="action-bar"],
          button {
            display: none !important;
          }
          .btn, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function InvoicePreviewPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)' }}>
        Loading...
      </div>
    }>
      <InvoicePreviewInner />
    </Suspense>
  );
}