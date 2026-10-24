'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Eye, Download, Send, FileText,
  CheckCircle, Clock, AlertCircle,
  X, User, CreditCard, RefreshCw,
  BarChart2, Filter,
  IndianRupee, Receipt, AlertTriangle, Pencil, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';

const API_BASE = 'https://invoice.crazystory.in/api';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const todayDate = () => new Date();
const fmt = d => (d ? String(d).split('T')[0] : '—');

function getDateRange(period) {
  const now = todayDate();
  const start = new Date(now);
  switch (period) {
    case 'today': start.setHours(0,0,0,0); return { start, end: now };
    case 'week': { const day = now.getDay(); start.setDate(now.getDate()-day); start.setHours(0,0,0,0); return { start, end: now }; }
    case 'month': start.setDate(1); start.setHours(0,0,0,0); return { start, end: now };
    case 'year': start.setMonth(0,1); start.setHours(0,0,0,0); return { start, end: now };
    default: return null;
  }
}
function calcPaid(invoice) { return (invoice.payments||[]).reduce((s,p)=>s+(parseFloat(p.amount)||0),0); }
function calcBalance(invoice) { return (parseFloat(invoice.total_amount)||0)-calcPaid(invoice); }
function isOverdue(inv) { return inv.due_date && new Date(inv.due_date)<todayDate() && inv.status!=='paid' && calcBalance(inv)>0; }
function buildStats(list) {
  const total=list.length, totalAmt=list.reduce((s,i)=>s+(parseFloat(i.total_amount)||0),0),
    totalPaid=list.reduce((s,i)=>s+calcPaid(i),0), totalBalance=totalAmt-totalPaid,
    overdueCount=list.filter(isOverdue).length, paidCount=list.filter(i=>i.status==='paid').length,
    draftCount=list.filter(i=>i.status==='draft').length, sentCount=list.filter(i=>i.status==='sent').length;
  return {total,totalAmt,totalPaid,totalBalance,overdueCount,paidCount,draftCount,sentCount};
}
const INR = v => `₹${(parseFloat(v)||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

/* ─────────────────────────────────────────────
   ══════════════════════════════════════════
   INVOICE HTML GENERATORS — 4 EXACT DESIGNS
   ══════════════════════════════════════════
───────────────────────────────────────────── */

/* ── TEMPLATE 1: Zylker Classic (Image 1)
   White bg, red Z logo circle, black INVOICE top-right,
   gray meta table, light gray item table, notes + payment options, terms footer ── */
function buildTemplate1(inv) {
  const paidAmt = calcPaid(inv);
  const balance = (parseFloat(inv.total_amount)||0) - paidAmt;
  const items = inv.items || [];
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Invoice ${inv.invoice_number}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:32px 40px;}
.logo-circle{width:44px;height:44px;background:#e53e3e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;margin-bottom:4px;}
.company-name{font-size:16px;font-weight:700;color:#111;margin-bottom:2px;}
.company-addr{font-size:11px;color:#555;line-height:1.5;}
.header-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;}
.invoice-title{font-size:32px;font-weight:300;color:#111;letter-spacing:0.05em;}
.meta-table{width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #ddd;}
.meta-table td{padding:5px 10px;font-size:11px;border:1px solid #ddd;}
.meta-table td:first-child{color:#555;width:110px;}
.meta-table td.label-col{background:#f7f7f7;font-weight:600;color:#333;}
.bill-to-bar{background:#f0f0f0;padding:5px 10px;font-size:11px;font-weight:700;color:#333;margin-bottom:6px;border:1px solid #ddd;border-bottom:none;}
.bill-to-content{padding:8px 10px;border:1px solid #ddd;border-top:none;margin-bottom:16px;}
.bill-to-content .name{font-size:13px;font-weight:700;margin-bottom:3px;}
.bill-to-content .addr{font-size:11px;color:#555;line-height:1.6;}
.subject-label{font-size:11px;color:#555;margin-bottom:2px;}
.subject-value{font-size:12px;margin-bottom:14px;}
.items-table{width:100%;border-collapse:collapse;margin-bottom:0;}
.items-table th{background:#f0f0f0;border:1px solid #ddd;padding:7px 8px;font-size:11px;font-weight:700;text-align:left;}
.items-table th.center{text-align:center;}
.items-table th.right{text-align:right;}
.items-table td{border:1px solid #ddd;padding:6px 8px;font-size:11px;vertical-align:top;}
.items-table td.center{text-align:center;}
.items-table td.right{text-align:right;}
.item-name{font-weight:700;margin-bottom:2px;}
.item-desc{color:#777;font-size:10px;}
.bottom-section{display:flex;margin-top:0;border:1px solid #ddd;border-top:none;}
.notes-col{flex:1;padding:12px;border-right:1px solid #ddd;}
.notes-col .notes-label{font-size:11px;font-weight:700;margin-bottom:6px;}
.notes-col .notes-text{font-size:11px;color:#555;}
.payment-options{padding:12px;min-width:180px;}
.payment-label{font-size:11px;font-weight:700;margin-bottom:6px;}
.totals-col{padding:10px 14px;min-width:240px;border-left:1px solid #ddd;}
.t-row{display:flex;justify-content:space-between;padding:3px 0;font-size:11px;}
.t-row.total-row{font-weight:700;font-size:13px;border-top:1px solid #ddd;margin-top:4px;padding-top:6px;}
.balance-due{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;color:#e53e3e;}
.terms-footer{margin-top:40px;padding-top:12px;border-top:1px solid #ddd;}
.terms-label{font-size:11px;font-weight:700;margin-bottom:4px;}
.terms-text{font-size:10px;color:#777;line-height:1.5;}
.dl-btn{position:fixed;top:16px;right:16px;background:#e53e3e;color:#fff;border:none;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;z-index:9999;box-shadow:0 2px 8px rgba(229,62,62,0.4);}
@media print{.dl-btn{display:none;}}
</style></head>
<body>
<button class="dl-btn" onclick="downloadPDF()">⬇ Download PDF</button>
<div id="invoice-content">
<div class="header-row">
  <div>
    <div class="logo-circle">Z</div>
    <div class="company-name">${inv.company_name || 'Your Company'}</div>
    <div class="company-addr">${inv.company_address || '3317 Buddy Shoals, Lake Colt,<br>Oklahoma 2505'}</div>
  </div>
  <div class="invoice-title">INVOICE</div>
</div>

<table class="meta-table">
  <tr><td class="label-col">Invoice#</td><td>: ${inv.invoice_number}</td><td class="label-col">Project Name</td><td>: ${inv.project_name||'—'}</td></tr>
  <tr><td class="label-col">Invoice Date</td><td>: ${fmt(inv.invoice_date)}</td><td></td><td></td></tr>
  <tr><td class="label-col">Terms</td><td>: ${inv.terms||'Due On Receipt'}</td><td></td><td></td></tr>
  <tr><td class="label-col">Due Date</td><td>: ${fmt(inv.due_date)}</td><td></td><td></td></tr>
  <tr><td class="label-col">P.O.#</td><td>: ${inv.po_number||'—'}</td><td></td><td></td></tr>
</table>

<div class="bill-to-bar">Bill To</div>
<div class="bill-to-content">
  <div class="name">${inv.customer?.name||'—'}</div>
  <div class="addr">${inv.customer?.address||inv.customer?.mobile||''}</div>
</div>

<div class="subject-label">Subject :</div>
<div class="subject-value">Description</div>

<table class="items-table">
  <thead>
    <tr>
      <th style="width:28px">#</th>
      <th>Item &amp; Description</th>
      <th class="center" style="width:60px">Qty</th>
      <th class="right" style="width:70px">Rate</th>
      <th class="right" style="width:80px">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${items.map((item,i)=>`
    <tr>
      <td class="center">${i+1}</td>
      <td><div class="item-name">${item.product_name}</div><div class="item-desc">${item.description||''}</div></td>
      <td class="center">${item.quantity}<br><span style="font-size:10px;color:#777">Nos</span></td>
      <td class="right">${parseFloat(item.price).toFixed(2)}</td>
      <td class="right">${parseFloat(item.amount).toFixed(2)}</td>
    </tr>`).join('')}
  </tbody>
</table>

<div class="bottom-section">
  <div class="notes-col">
    <div class="notes-label">Notes</div>
    <div class="notes-text">${inv.notes||'Thanks for your business.'}</div>
    <div style="margin-top:14px" class="payment-label">Payment Options</div>
    <div style="margin-top:4px;font-size:10px;color:#777">Bank Transfer / UPI / Cash</div>
  </div>
  <div class="totals-col">
    <div class="t-row"><span>Sub Total</span><span>${parseFloat(inv.subtotal||0).toFixed(2)}</span></div>
    <div class="t-row"><span>Discount</span><span>${parseFloat(inv.discount_amount||0).toFixed(2)}</span></div>
    <div class="t-row total-row"><span>Total</span><span>${parseFloat(inv.total_amount||0).toFixed(2)}</span></div>
    ${paidAmt>0?`<div class="balance-due"><span>Payment Made</span><span>(-)${paidAmt.toFixed(2)}</span></div>`:''}
    <div class="t-row" style="font-weight:700;color:#e53e3e;font-size:12px;border-top:1px solid #ddd;padding-top:5px;margin-top:4px">
      <span>Balance Due</span><span>${balance.toFixed(2)}</span>
    </div>
  </div>
</div>

<div class="terms-footer">
  <div class="terms-label">Terms &amp; Conditions</div>
  <div class="terms-text">${inv.terms_conditions||"Your company's Terms and Conditions will be displayed here. You can add it in the Invoice Preferences page under Settings."}</div>
</div>
</div>

<script>
async function downloadPDF() {
  const btn = document.querySelector('.dl-btn');
  btn.textContent = '⏳ Generating...';
  btn.disabled = true;
  try {
    const el = document.getElementById('invoice-content');
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    const pageH = pdf.internal.pageSize.getHeight();
    let yOffset = 0;
    while (yOffset < pdfH) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, pdfH);
      yOffset += pageH;
    }
    pdf.save('Invoice_${inv.invoice_number}_Classic.pdf');
    btn.textContent = '✓ Downloaded!';
    setTimeout(()=>{ btn.textContent='⬇ Download PDF'; btn.disabled=false; }, 2000);
  } catch(e) {
    btn.textContent = '✗ Error - Retry';
    btn.disabled = false;
    console.error(e);
  }
}
<\/script>
</body></html>`;
}

/* ── TEMPLATE 2: Corporate Blue (Image 2)
   White bg, geometric blue hex logo top-right, bold company name,
   navy table header, Bill To + Ship To, tax rate row, blue balance due ── */
function buildTemplate2(inv) {
  const paidAmt = calcPaid(inv);
  const balance = (parseFloat(inv.total_amount)||0) - paidAmt;
  const items = inv.items || [];
  const gstRate = inv.gst_rate || 5;
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Invoice ${inv.invoice_number}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;background:#f0f0f0;padding:30px;}
.page{background:#fff;max-width:680px;margin:0 auto;padding:32px 36px;box-shadow:0 2px 16px rgba(0,0,0,0.1);}
.top-bar{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
.company-name{font-size:18px;font-weight:700;color:#111;margin-bottom:4px;}
.company-addr{font-size:11px;color:#555;line-height:1.6;}
.logo-hex{display:flex;gap:3px;align-items:center;}
.hex{width:22px;height:22px;background:linear-gradient(135deg,#4a90d9,#2c6fad);clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);}
.hex2{background:linear-gradient(135deg,#e07b54,#c0553a);}
.invoice-title-right{text-align:right;}
.invoice-title-right h1{font-size:30px;font-weight:700;color:#2c6fad;letter-spacing:0.06em;}
.meta-table{width:100%;border-collapse:collapse;margin-bottom:18px;}
.meta-table td{padding:4px 6px;font-size:11px;}
.meta-table td:first-child{color:#555;width:100px;}
.meta-table td:nth-child(2){font-weight:600;color:#111;}
.bill-section{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #ddd;margin-bottom:18px;}
.bill-col{padding:10px 14px;}
.bill-col:first-child{border-right:1px solid #ddd;}
.bill-col-label{font-size:11px;font-weight:700;color:#333;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.04em;}
.bill-col .name{font-size:13px;font-weight:700;color:#111;margin-bottom:3px;}
.bill-col .detail{font-size:11px;color:#555;line-height:1.6;}
.items-table{width:100%;border-collapse:collapse;margin-bottom:0;}
.items-table thead tr{background:#1a3a5c;}
.items-table th{color:#fff;padding:9px 10px;font-size:11px;font-weight:700;text-align:left;}
.items-table th.center{text-align:center;}
.items-table th.right{text-align:right;}
.items-table tbody tr{border-bottom:1px solid #eee;}
.items-table tbody tr:last-child{border-bottom:2px solid #ddd;}
.items-table td{padding:8px 10px;font-size:11px;vertical-align:top;}
.items-table td.center{text-align:center;}
.items-table td.right{text-align:right;}
.item-name{font-weight:700;color:#111;margin-bottom:2px;}
.item-sub{font-size:10px;color:#888;}
.bottom-wrap{display:flex;justify-content:flex-end;}
.totals-box{min-width:260px;}
.t-row{display:flex;justify-content:space-between;padding:5px 10px;font-size:11px;}
.t-row.tax{background:#f7f7f7;}
.t-row.total-row{background:#1a3a5c;color:#fff;font-weight:700;font-size:13px;}
.t-row.balance-row{background:#2c6fad;color:#fff;font-weight:700;font-size:13px;}
.footer-section{margin-top:18px;font-size:11px;}
.thanks{margin-bottom:8px;color:#333;}
.terms-label{font-weight:700;color:#333;margin-bottom:4px;}
.terms-text{color:#777;font-size:10px;line-height:1.5;}
.dl-btn{position:fixed;top:16px;right:16px;background:#1a3a5c;color:#fff;border:none;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;z-index:9999;box-shadow:0 2px 8px rgba(26,58,92,0.4);}
@media print{.dl-btn{display:none;}}
</style></head>
<body>
<button class="dl-btn" onclick="downloadPDF()">⬇ Download PDF</button>
<div class="page" id="invoice-content">
  <div class="top-bar">
    <div>
      <div class="company-name">${inv.company_name||'Zylker Electronics Hub'}</div>
      <div class="company-addr">14B, Northern Street<br>Greater South Avenue<br>New York New York 10001<br>U.S.A</div>
    </div>
    <div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
        <div class="logo-hex"><div class="hex"></div><div class="hex" style="margin-top:10px"></div><div class="hex hex2" style="margin-top:0"></div></div>
      </div>
      <div class="invoice-title-right"><h1>INVOICE</h1></div>
    </div>
  </div>

  <table class="meta-table">
    <tr><td>Invoice#</td><td>: ${inv.invoice_number}</td></tr>
    <tr><td>Invoice Date</td><td>: ${fmt(inv.invoice_date)}</td></tr>
    <tr><td>Terms</td><td>: ${inv.terms||'Due on Receipt'}</td></tr>
    <tr><td>Due Date</td><td>: ${fmt(inv.due_date)}</td></tr>
  </table>

  <div class="bill-section">
    <div class="bill-col">
      <div class="bill-col-label">Bill To</div>
      <div class="name">${inv.customer?.name||'—'}</div>
      <div class="detail">${inv.customer?.address||''}<br>${inv.customer?.mobile||''}<br>${inv.customer?.email||''}</div>
    </div>
    <div class="bill-col">
      <div class="bill-col-label">Ship To</div>
      <div class="detail">${inv.ship_to||inv.customer?.address||'Same as billing address'}</div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Item &amp; Description</th>
        <th class="center" style="width:60px">Qty</th>
        <th class="right" style="width:75px">Rate</th>
        <th class="right" style="width:85px">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item,i)=>`
      <tr>
        <td>${i+1}</td>
        <td><div class="item-name">${item.product_name}</div><div class="item-sub">${item.description||''}</div></td>
        <td class="center">${item.quantity}<br><span style="font-size:10px;color:#888">Piece</span></td>
        <td class="right">${parseFloat(item.price).toFixed(2)}</td>
        <td class="right">${parseFloat(item.amount).toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="bottom-wrap">
    <div class="totals-box">
      <div class="t-row"><span>Sub Total</span><span>${INR(inv.subtotal||0)}</span></div>
      <div class="t-row tax"><span>Tax Rate</span><span>${gstRate}%</span></div>
      <div class="t-row total-row"><span>Total</span><span>${INR(inv.total_amount||0)}</span></div>
      <div class="t-row balance-row"><span>Balance Due</span><span>${INR(balance)}</span></div>
    </div>
  </div>

  <div class="footer-section">
    <div class="thanks">${inv.notes||'Thanks for your business.'}</div>
    <div class="terms-label">Terms &amp; Conditions</div>
    <div class="terms-text">${inv.terms_conditions||'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.'}</div>
  </div>
</div>

<script>
async function downloadPDF() {
  const btn = document.querySelector('.dl-btn');
  btn.textContent = '⏳ Generating...';
  btn.disabled = true;
  try {
    const el = document.getElementById('invoice-content');
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    const pageH = pdf.internal.pageSize.getHeight();
    let yOffset = 0;
    while (yOffset < pdfH) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, pdfH);
      yOffset += pageH;
    }
    pdf.save('Invoice_${inv.invoice_number}_Corporate.pdf');
    btn.textContent = '✓ Downloaded!';
    setTimeout(()=>{ btn.textContent='⬇ Download PDF'; btn.disabled=false; }, 2000);
  } catch(e) { btn.textContent='✗ Error - Retry'; btn.disabled=false; }
}
<\/script>
</body></html>`;
}

/* ── TEMPLATE 3: Black & White Pro (Image 3)
   White bg, black Z circle top-left, INVOICE top-right bold,
   invoice# + balance due top-right, meta grid right-aligned,
   Bill To left, black table header with Discount column, bottom: notes + payment + terms ── */
function buildTemplate3(inv) {
  const paidAmt = calcPaid(inv);
  const balance = (parseFloat(inv.total_amount)||0) - paidAmt;
  const items = inv.items || [];
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Invoice ${inv.invoice_number}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;background:#fff;padding:36px 44px;}
.top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
.logo-z{width:46px;height:46px;background:#111;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;}
.right-header{text-align:right;}
.right-header h1{font-size:34px;font-weight:900;letter-spacing:0.04em;color:#111;}
.right-header .inv-num{font-size:13px;color:#555;margin-top:2px;}
.right-header .balance-label{font-size:11px;color:#555;margin-top:8px;}
.right-header .balance-amount{font-size:20px;font-weight:700;color:#111;}
.meta-billing-row{display:flex;justify-content:space-between;margin-bottom:22px;margin-top:18px;}
.bill-to-block .label{font-size:11px;color:#555;margin-bottom:4px;}
.bill-to-block .name{font-size:13px;font-weight:700;color:#111;margin-bottom:3px;}
.bill-to-block .addr{font-size:11px;color:#555;line-height:1.7;}
.meta-right{text-align:right;}
.meta-right table{margin-left:auto;}
.meta-right table td{padding:3px 4px;font-size:11px;}
.meta-right table td:first-child{color:#555;padding-right:12px;}
.meta-right table td:last-child{font-weight:500;color:#111;}
.place-supply{font-size:11px;color:#555;margin-bottom:16px;}
.items-table{width:100%;border-collapse:collapse;margin-bottom:24px;}
.items-table thead tr{background:#111;}
.items-table th{color:#fff;padding:9px 10px;font-size:11px;font-weight:700;text-align:left;}
.items-table th.center{text-align:center;}
.items-table th.right{text-align:right;}
.items-table tbody tr{border-bottom:1px solid #eee;}
.items-table td{padding:9px 10px;font-size:11px;vertical-align:top;}
.items-table td.center{text-align:center;}
.items-table td.right{text-align:right;}
.item-name{font-weight:700;color:#111;margin-bottom:2px;}
.item-sub{font-size:10px;color:#999;}
.totals-right{display:flex;justify-content:flex-end;margin-bottom:24px;}
.totals-box{min-width:260px;text-align:right;}
.t-row{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;color:#555;}
.t-row.sub{font-weight:500;color:#333;}
.t-row.total{font-weight:700;font-size:13px;color:#111;border-top:1px solid #ddd;padding-top:6px;margin-top:4px;}
.t-row.balance{background:#111;color:#fff;font-weight:700;font-size:13px;padding:8px 10px;margin-top:4px;}
.bottom-row{display:grid;grid-template-columns:1fr 1fr;gap:24px;border-top:1px solid #ddd;padding-top:16px;}
.bottom-label{font-size:12px;font-weight:700;color:#111;margin-bottom:5px;}
.bottom-text{font-size:11px;color:#555;line-height:1.6;}
.payment-method{display:flex;gap:8px;margin-top:6px;align-items:center;}
.pay-chip{border:1px solid #ddd;border-radius:3px;padding:3px 10px;font-size:10px;background:#f7f7f7;color:#555;}
.terms-section{margin-top:16px;border-top:1px solid #ddd;padding-top:12px;}
.dl-btn{position:fixed;top:16px;right:16px;background:#111;color:#fff;border:none;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.3);}
@media print{.dl-btn{display:none;}}
</style></head>
<body>
<button class="dl-btn" onclick="downloadPDF()">⬇ Download PDF</button>
<div id="invoice-content">
<div class="top-row">
  <div>
    <div class="logo-z">Z</div>
    <div style="margin-top:6px;font-size:14px;font-weight:700;color:#111;">${inv.company_name||'Zylker'}</div>
    <div style="font-size:11px;color:#777;line-height:1.5;margin-top:2px;">${inv.company_address||'3317 Buddy Shoals, Lake Colt,<br>Oklahoma 2505'}</div>
  </div>
  <div class="right-header">
    <h1>INVOICE</h1>
    <div class="inv-num">Invoice# ${inv.invoice_number}</div>
    <div class="balance-label">Balance Due</div>
    <div class="balance-amount">${INR(balance)}</div>
  </div>
</div>

<div class="meta-billing-row">
  <div class="bill-to-block">
    <div class="label">Bill To</div>
    <div class="name">${inv.customer?.name||'—'}</div>
    <div class="addr">${inv.customer?.address||''}<br>${inv.customer?.mobile||''}<br>${inv.customer?.email||''}</div>
  </div>
  <div class="meta-right">
    <table>
      <tr><td>Invoice Date :</td><td>${fmt(inv.invoice_date)}</td></tr>
      <tr><td>Terms :</td><td>${inv.terms||'Due On Receipt'}</td></tr>
      <tr><td>Due Date :</td><td>${fmt(inv.due_date)}</td></tr>
      <tr><td>P.O.# :</td><td>${inv.po_number||'321014'}</td></tr>
      <tr><td>Project Name :</td><td>${inv.project_name||'Design project'}</td></tr>
    </table>
  </div>
</div>

<div class="place-supply">Place Of Supply: ${inv.place_of_supply||'New Jersey'}</div>

<table class="items-table">
  <thead>
    <tr>
      <th style="width:28px">#</th>
      <th>Item &amp; Description</th>
      <th class="center" style="width:60px">Qty</th>
      <th class="right" style="width:75px">Rate</th>
      <th class="right" style="width:75px">Discount</th>
      <th class="right" style="width:85px">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${items.map((item,i)=>`
    <tr>
      <td>${i+1}</td>
      <td><div class="item-name">${item.product_name}</div><div class="item-sub">${item.description||''}</div></td>
      <td class="center">${parseFloat(item.quantity).toFixed(2)}</td>
      <td class="right">${parseFloat(item.price).toFixed(2)}</td>
      <td class="right">${parseFloat(item.discount||0).toFixed(2)}</td>
      <td class="right">${parseFloat(item.amount).toFixed(2)}</td>
    </tr>`).join('')}
  </tbody>
</table>

<div class="totals-right">
  <div class="totals-box">
    <div class="t-row sub"><span>Sub Total</span><span>${parseFloat(inv.subtotal||0).toFixed(2)}</span></div>
    ${parseFloat(inv.discount_amount||0)>0?`<div class="t-row"><span>Discount</span><span>-${parseFloat(inv.discount_amount).toFixed(2)}</span></div>`:''}
    <div class="t-row total"><span>Total</span><span>${parseFloat(inv.total_amount||0).toFixed(2)}</span></div>
    ${paidAmt>0?`<div class="t-row sub"><span>Payment Made</span><span>-${paidAmt.toFixed(2)}</span></div>`:''}
    <div class="t-row balance"><span>Balance Due</span><span>${INR(balance)}</span></div>
  </div>
</div>

<div class="bottom-row">
  <div>
    <div class="bottom-label">Notes</div>
    <div class="bottom-text">${inv.notes||'Thanks for your business.'}</div>
  </div>
  <div>
    <div class="bottom-label">Payment Options</div>
    <div class="payment-method">
      <span class="pay-chip">PayPal</span>
      <span class="pay-chip">Bank Transfer</span>
      <span class="pay-chip">UPI</span>
    </div>
  </div>
</div>

<div class="terms-section">
  <div class="bottom-label">Terms &amp; Conditions</div>
  <div class="bottom-text">${inv.terms_conditions||"Your company's Terms and Conditions will be displayed here. You can add it in the Invoice Preferences page under Settings."}</div>
</div>
</div>

<script>
async function downloadPDF() {
  const btn = document.querySelector('.dl-btn');
  btn.textContent = '⏳ Generating...'; btn.disabled = true;
  try {
    const el = document.getElementById('invoice-content');
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    const pageH = pdf.internal.pageSize.getHeight();
    let yOffset = 0;
    while (yOffset < pdfH) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, pdfH);
      yOffset += pageH;
    }
    pdf.save('Invoice_${inv.invoice_number}_BW.pdf');
    btn.textContent = '✓ Downloaded!';
    setTimeout(()=>{ btn.textContent='⬇ Download PDF'; btn.disabled=false; }, 2000);
  } catch(e) { btn.textContent='✗ Error - Retry'; btn.disabled=false; }
}
<\/script>
</body></html>`;
}

/* ── TEMPLATE 4: Teal Wave (Image 4)
   Teal curved wave header, INVOICE title + brand logo top-right,
   Invoice To section, teal table header, payment info bottom-left,
   subtotal/discount/tax/total bottom-right, signature + get in touch footer ── */
function buildTemplate4(inv) {
  const paidAmt = calcPaid(inv);
  const balance = (parseFloat(inv.total_amount)||0) - paidAmt;
  const items = inv.items || [];
  const gstAmt = parseFloat(inv.gst_amount||0);
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Invoice ${inv.invoice_number}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;background:#f5f5f5;padding:24px;}
.page{background:#fff;max-width:680px;margin:0 auto;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.12);}
/* ── Wave Header ── */
.wave-header{position:relative;height:130px;background:#fff;overflow:hidden;}
.wave-bg{position:absolute;top:0;left:0;right:0;bottom:0;}
.wave-teal{position:absolute;top:0;left:0;width:62%;height:100%;background:#1aada8;clip-path:polygon(0 0, 100% 0, 85% 100%, 0% 100%);}
.wave-teal-2{position:absolute;top:0;left:0;width:58%;height:100%;background:#17a099;clip-path:polygon(0 0, 100% 0, 80% 100%, 0% 100%);opacity:0.5;}
.wave-bottom-teal{position:absolute;bottom:0;right:0;width:50%;height:35%;background:#1aada8;clip-path:polygon(20% 100%, 100% 0%, 100% 100%);}
.wave-bottom-gold{position:absolute;bottom:0;right:0;width:50%;height:35%;background:linear-gradient(90deg,#c9a84c,#e8c96b);clip-path:polygon(18% 100%, 100% 0%, 100% 100%);opacity:0.7;}
.header-content{position:relative;z-index:10;display:flex;justify-content:space-between;align-items:center;height:100%;padding:0 32px;}
.inv-title-block .inv-word{font-size:36px;font-weight:900;color:#fff;letter-spacing:0.06em;line-height:1;}
/* The circle 'O' in INVOICE */
.inv-word span.circle-o{display:inline-block;position:relative;}
.inv-word span.circle-o::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:22px;height:22px;border:2px solid rgba(255,255,255,0.7);border-radius:50%;}
.brand-block{text-align:right;}
.brand-hexagon{display:flex;justify-content:flex-end;margin-bottom:6px;}
.hex-icon{width:28px;height:28px;background:rgba(255,255,255,0.2);clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);border:2px solid rgba(255,255,255,0.5);}
.brand-name{font-size:15px;font-weight:700;color:#fff;text-align:right;}
.brand-tag{font-size:10px;color:rgba(255,255,255,0.75);text-align:right;letter-spacing:0.08em;}
/* ── Body ── */
.body-content{padding:24px 32px 0;}
.invoice-to-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
.invoice-to-block .it-label{font-size:12px;font-weight:700;color:#333;margin-bottom:6px;}
.invoice-to-block .name{font-size:14px;font-weight:700;color:#111;margin-bottom:3px;}
.invoice-to-block .detail{font-size:11px;color:#555;line-height:1.7;}
.meta-inv-block{text-align:right;}
.meta-inv-block table{margin-left:auto;}
.meta-inv-block td{padding:3px 4px;font-size:11px;}
.meta-inv-block td:first-child{color:#555;padding-right:10px;text-align:right;}
.meta-inv-block td:last-child{font-weight:600;color:#111;}
/* ── Items Table ── */
.items-table{width:100%;border-collapse:collapse;margin-bottom:0;}
.items-table thead tr{background:#1aada8;}
.items-table th{color:#fff;padding:9px 10px;font-size:11px;font-weight:700;text-align:left;}
.items-table th.center{text-align:center;}
.items-table th.right{text-align:right;}
.items-table tbody tr{border-bottom:1px solid #f0f0f0;}
.items-table td{padding:9px 10px;font-size:11px;}
.items-table td.center{text-align:center;}
.items-table td.right{text-align:right;}
/* ── Bottom Section ── */
.bottom-section{display:flex;justify-content:space-between;padding:18px 32px;border-top:1px solid #eee;gap:24px;}
.payment-info-col{flex:1;}
.pay-label{font-size:11px;font-weight:700;color:#111;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;}
.pay-row{display:flex;gap:8px;font-size:11px;color:#555;margin-bottom:4px;}
.pay-row span:first-child{min-width:80px;color:#777;}
.totals-col{min-width:220px;text-align:right;}
.t-row{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;color:#555;}
.t-row.total-row{background:#1aada8;color:#fff;font-weight:700;padding:7px 10px;margin-top:4px;font-size:13px;}
/* ── Footer ── */
.footer-bar{display:flex;justify-content:space-between;align-items:flex-end;padding:16px 32px 20px;position:relative;}
.footer-wave-left{position:absolute;bottom:0;left:0;width:40%;height:60%;background:#1aada8;clip-path:polygon(0 100%, 100% 100%, 85% 0%, 0 40%);opacity:0.15;z-index:0;}
.footer-wave-right{position:absolute;bottom:0;right:0;width:45%;height:70%;background:#1aada8;clip-path:polygon(15% 100%, 100% 100%, 100% 0%, 0 60%);opacity:0.15;z-index:0;}
.footer-wave-gold{position:absolute;bottom:0;right:0;width:44%;height:68%;background:linear-gradient(135deg,#c9a84c,#e8c96b);clip-path:polygon(16% 100%, 100% 100%, 100% 0%, 0 62%);opacity:0.12;z-index:0;}
.sig-block{position:relative;z-index:1;}
.sig-name{font-size:13px;font-style:italic;color:#555;font-weight:600;margin-bottom:2px;}
.sig-line{border-bottom:1px solid #333;width:100px;margin-bottom:2px;}
.sig-label{font-size:10px;color:#777;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}
.contact-block{position:relative;z-index:1;text-align:right;}
.contact-title{font-size:11px;font-weight:700;color:#333;margin-bottom:6px;text-align:right;}
.contact-row{font-size:11px;color:#555;text-align:right;margin-bottom:3px;}
.terms-block{padding:0 32px 20px;}
.terms-label{font-size:11px;font-weight:700;color:#333;margin-bottom:4px;}
.terms-text{font-size:10px;color:#777;line-height:1.5;}
.dl-btn{position:fixed;top:16px;right:16px;background:#1aada8;color:#fff;border:none;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;z-index:9999;box-shadow:0 2px 8px rgba(26,173,168,0.4);}
@media print{.dl-btn{display:none;}}
</style></head>
<body>
<button class="dl-btn" onclick="downloadPDF()">⬇ Download PDF</button>
<div class="page" id="invoice-content">

  <!-- WAVE HEADER -->
  <div class="wave-header">
    <div class="wave-bg">
      <div class="wave-teal-2"></div>
      <div class="wave-teal"></div>
      <div class="wave-bottom-teal"></div>
      <div class="wave-bottom-gold"></div>
    </div>
    <div class="header-content">
      <div class="inv-title-block">
        <div class="inv-word">INV<span class="circle-o">O</span>ICE</div>
      </div>
      <div class="brand-block">
        <div class="brand-hexagon">
          <div class="hex-icon" style="margin-right:4px"></div>
          <div class="hex-icon"></div>
        </div>
        <div class="brand-name">${inv.company_name||'BRAND NAME'}</div>
        <div class="brand-tag">TAGLINE HERE</div>
      </div>
    </div>
  </div>

  <!-- BODY -->
  <div class="body-content">
    <div class="invoice-to-row">
      <div class="invoice-to-block">
        <div class="it-label">Invoice To:</div>
        <div class="name">${inv.customer?.name||'—'}</div>
        <div class="detail">
          P : ${inv.customer?.mobile||'000 000 000 00'}<br>
          E : ${inv.customer?.email||'Your mail goes here'}<br>
          A : ${inv.customer?.address||'Your address goes here'}
        </div>
      </div>
      <div class="meta-inv-block">
        <table>
          <tr><td>Invoice No:</td><td>${inv.invoice_number}</td></tr>
          <tr><td>Date :</td><td>${fmt(inv.invoice_date)}</td></tr>
          <tr><td>Due Date :</td><td>${fmt(inv.due_date)}</td></tr>
        </table>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:32px">SL</th>
          <th>Item Description</th>
          <th class="right" style="width:75px">Price</th>
          <th class="center" style="width:55px">Qty.</th>
          <th class="right" style="width:85px">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item,i)=>`
        <tr>
          <td style="color:#aaa;font-size:11px">${String(i+1).padStart(2,'0')}</td>
          <td>${item.product_name}</td>
          <td class="right">₹${parseFloat(item.price).toFixed(2)}</td>
          <td class="center">${item.quantity}</td>
          <td class="right">₹${parseFloat(item.amount).toFixed(2)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- BOTTOM SECTION -->
  <div class="bottom-section">
    <div class="payment-info-col">
      <div class="pay-label">Payment Info</div>
      <div class="pay-row"><span>Account No :</span><span>${inv.bank_account||'—'}</span></div>
      <div class="pay-row"><span>A/C Name :</span><span>${inv.company_name||'Your Company'}</span></div>
      <div class="pay-row"><span>Branch Name :</span><span>${inv.bank_branch||'—'}</span></div>
    </div>
    <div class="totals-col">
      <div class="t-row"><span>Sub Total :</span><span>₹${parseFloat(inv.subtotal||0).toFixed(2)}</span></div>
      <div class="t-row"><span>Discount :</span><span>₹${parseFloat(inv.discount_amount||0).toFixed(2)}</span></div>
      <div class="t-row"><span>Tax - ${inv.gst_rate||0}% :</span><span>₹${gstAmt.toFixed(2)}</span></div>
      <div class="t-row total-row"><span>Total :</span><span>${INR(inv.total_amount||0)}</span></div>
    </div>
  </div>

  <!-- TERMS -->
  <div class="terms-block">
    <div class="terms-label">Terms &amp; Conditions:</div>
    <div class="terms-text">${inv.terms_conditions||'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy'}</div>
  </div>

  <!-- FOOTER WAVE -->
  <div class="footer-bar">
    <div class="footer-wave-left"></div>
    <div class="footer-wave-right"></div>
    <div class="footer-wave-gold"></div>
    <div class="sig-block">
      <div class="sig-name">${inv.authorised_by||'Authorised Signatory'}</div>
      <div class="sig-line"></div>
      <div class="sig-label">Signature</div>
    </div>
    <div class="contact-block">
      <div class="contact-title">Get in Touch</div>
      <div class="contact-row">${inv.company_phone||'000 000 000'} 📞</div>
      <div class="contact-row">${inv.company_email||'Your mail goes here'} 📍</div>
    </div>
  </div>

</div>

<script>
async function downloadPDF() {
  const btn = document.querySelector('.dl-btn');
  btn.textContent = '⏳ Generating...'; btn.disabled = true;
  try {
    const el = document.getElementById('invoice-content');
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    const pageH = pdf.internal.pageSize.getHeight();
    let yOffset = 0;
    while (yOffset < pdfH) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, pdfH);
      yOffset += pageH;
    }
    pdf.save('Invoice_${inv.invoice_number}_TealWave.pdf');
    btn.textContent = '✓ Downloaded!';
    setTimeout(()=>{ btn.textContent='⬇ Download PDF'; btn.disabled=false; }, 2000);
  } catch(e) { btn.textContent='✗ Error - Retry'; btn.disabled=false; }
}
<\/script>
</body></html>`;
}

/* ─────────────────────────────────────────────
   Download dispatcher — opens new window with HTML, auto-triggers PDF
───────────────────────────────────────────── */
function downloadInvoicePDF(invoice, templateId) {
  const builders = {
    'classic': buildTemplate1,
    'corporate': buildTemplate2,
    'bw-pro': buildTemplate3,
    'teal-wave': buildTemplate4,
  };
  const builder = builders[templateId] || buildTemplate1;
  const html = builder(invoice);
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups for this site to download invoices.'); return; }
  win.document.write(html);
  win.document.close();
}

/* ─────────────────────────────────────────────
   StatusBadge
───────────────────────────────────────────── */
const STATUS_CFG = {
  draft:   { color: '#6b7280', bg: '#f3f4f6', Icon: Clock },
  sent:    { color: '#f59e0b', bg: '#fef3c7', Icon: Send },
  paid:    { color: '#059669', bg: '#d1fae5', Icon: CheckCircle },
  overdue: { color: '#dc2626', bg: '#fee2e2', Icon: AlertCircle },
};
function StatusBadge({ status, onClick }) {
  const c = STATUS_CFG[status] || STATUS_CFG.draft;
  return (
    <button onClick={onClick} style={{
      display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',
      borderRadius:20,fontSize:11,fontWeight:600,background:c.bg,color:c.color,border:'none',cursor:onClick?'pointer':'default'
    }}><c.Icon size={11}/>{status}</button>
  );
}

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
function StatCard({ label, value, sub, color, icon: Icon, accent }) {
  return (
    <div style={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px',borderLeft:`4px solid ${accent||color||'var(--brand)'}`,display:'flex',flexDirection:'column',gap:4,minWidth:0}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:11,color:'var(--muted)',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{label}</div>
          <div style={{fontWeight:800,fontSize:20,color:color||'var(--text)',lineHeight:1}}>{value}</div>
          {sub&&<div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{sub}</div>}
        </div>
        {Icon&&<div style={{width:36,height:36,borderRadius:10,background:accent?`${accent}18`:'var(--brand-bg)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon size={16} color={accent||'var(--brand)'}/></div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Report Summary Bar
───────────────────────────────────────────── */
function ReportSummary({ stats, periodLabel }) {
  const collectRate = stats.totalAmt>0?((stats.totalPaid/stats.totalAmt)*100).toFixed(1):'0.0';
  return (
    <div style={{background:'linear-gradient(135deg,#1a0a2e 0%,#2d1155 50%,#8f195c 100%)',borderRadius:16,padding:'20px 24px',marginBottom:20,color:'#fff',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,position:'relative'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><BarChart2 size={16} color="rgba(255,255,255,0.7)"/><span style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:500}}>Invoice Report — {periodLabel}</span></div>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:'-0.02em'}}>{INR(stats.totalAmt)}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.65)',marginTop:2}}>Total Invoice Value · {stats.total} invoices</div>
        </div>
        <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
          {[{v:INR(stats.totalPaid),l:'Collected',c:'#4ade80'},{v:INR(stats.totalBalance),l:'Balance Due',c:stats.totalBalance>0?'#f87171':'#4ade80'},{v:`${collectRate}%`,l:'Collection Rate',c:'#fbbf24'},{v:stats.overdueCount,l:'Overdue',c:'#f87171'}].map((s,i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.6)'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      {stats.totalAmt>0&&<div style={{marginTop:14}}><div style={{height:6,background:'rgba(255,255,255,0.15)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',borderRadius:4,width:`${Math.min(100,(stats.totalPaid/stats.totalAmt)*100)}%`,background:'linear-gradient(90deg,#4ade80,#22c55e)',transition:'width 0.6s ease'}}/></div><div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginTop:4}}>Collection progress: {collectRate}%</div></div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Filter Bar
───────────────────────────────────────────── */
function FilterBar({ filters, setFilters, creators, prefixes }) {
  return (
    <div style={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px',marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}><Filter size={13} color="var(--brand)"/><span style={{fontSize:12,fontWeight:700,color:'var(--text)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Filters</span></div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
        <div style={{flex:'1 1 220px',minWidth:0}}>
          <label style={{fontSize:10,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:5}}>Search</label>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 10px'}}>
            <Search size={13} color="var(--muted)" style={{flexShrink:0}}/>
            <input placeholder="Invoice # or customer..." value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))} style={{background:'transparent',border:'none',outline:'none',fontSize:12,color:'var(--text)',width:'100%'}}/>
            {filters.search&&<button onClick={()=>setFilters(f=>({...f,search:''}))} style={{background:'none',border:'none',cursor:'pointer',padding:0}}><X size={12} color="var(--muted)"/></button>}
          </div>
        </div>
        {['all','today','week','month','year'].map(p=>(
          <button key={p} onClick={()=>setFilters(f=>({...f,period:p}))} style={{padding:'6px 12px',borderRadius:8,fontSize:11,fontWeight:600,border:'none',cursor:'pointer',background:filters.period===p?'var(--brand)':'var(--bg)',color:filters.period===p?'#fff':'var(--text)',border:filters.period===p?'1px solid var(--brand)':'1px solid var(--border)',transition:'all 0.15s',marginTop:18}}>
            {{all:'All',today:'Today',week:'Week',month:'Month',year:'Year'}[p]}
          </button>
        ))}
        {['all','draft','sent','paid','overdue'].map(s=>(
          <button key={s} onClick={()=>setFilters(f=>({...f,status:s}))} style={{padding:'6px 12px',borderRadius:8,fontSize:11,fontWeight:600,border:'none',cursor:'pointer',textTransform:'capitalize',background:filters.status===s?'var(--brand)':'var(--bg)',color:filters.status===s?'#fff':'var(--text)',border:filters.status===s?'1px solid var(--brand)':'1px solid var(--border)',transition:'all 0.15s',marginTop:18}}>
            {s==='all'?'All Status':s}
          </button>
        ))}
        <button onClick={()=>setFilters({search:'',period:'all',status:'all',prefix:'all',creator:'all'})} style={{padding:'7px 14px',borderRadius:8,fontSize:11,fontWeight:600,background:'var(--bg)',color:'var(--muted)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',gap:5,marginTop:18}}><X size={11}/>Clear</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Status Update Modal
───────────────────────────────────────────── */
function StatusUpdateModal({ open, onClose, invoice, onUpdate, toast }) {
  const [status, setStatus] = useState(invoice?.status||'draft');
  const [loading, setLoading] = useState(false);
  useEffect(()=>{ if(invoice) setStatus(invoice.status); },[invoice]);
  if(!open) return null;
  const handleUpdate = async()=>{
    setLoading(true);
    const token=localStorage.getItem('zetsap_token');
    try{
      const res=await fetch(`${API_BASE}/admin/invoices/${invoice.id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json','Accept':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({status})});
      const data=await res.json();
      if(!res.ok){toast(data.message||'Failed','error');return;}
      toast(`Status updated to ${status}`,'success');onUpdate();onClose();
    }catch{toast('Network error','error');}finally{setLoading(false);}
  };
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-sm">
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3 style={{fontWeight:700,fontSize:16}}>Update Status</h3><button className="btn-icon" onClick={onClose}><X size={18}/></button></div>
        <div style={{padding:20}}>
          <p style={{fontSize:13,marginBottom:14,color:'var(--muted)'}}>Invoice: <strong>{invoice?.invoice_number}</strong></p>
          {[{value:'draft',color:'#6b7280',bg:'#f3f4f6'},{value:'sent',color:'#f59e0b',bg:'#fef3c7'},{value:'paid',color:'#059669',bg:'#d1fae5'},{value:'overdue',color:'#dc2626',bg:'#fee2e2'}].map(opt=>(
            <label key={opt.value} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',border:status===opt.value?`2px solid ${opt.color}`:'1px solid var(--border)',borderRadius:8,cursor:'pointer',background:status===opt.value?opt.bg:'var(--card-bg)',marginBottom:8}}>
              <input type="radio" name="status" value={opt.value} checked={status===opt.value} onChange={()=>setStatus(opt.value)} style={{accentColor:opt.color}}/>
              <span style={{fontWeight:500,flex:1,textTransform:'capitalize'}}>{opt.value}</span>
            </label>
          ))}
        </div>
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-brand btn-sm" onClick={handleUpdate} disabled={loading}>{loading?'Updating...':'Update'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────────── */
function DeleteConfirmModal({ open, onClose, invoice, onDeleted, toast }) {
  const [loading, setLoading] = useState(false);
  if(!open||!invoice) return null;
  const handleDelete=async()=>{
    setLoading(true);
    const token=localStorage.getItem('zetsap_token');
    try{
      const res=await fetch(`${API_BASE}/admin/invoices/${invoice.id}`,{method:'DELETE',headers:{'Accept':'application/json','Authorization':`Bearer ${token}`}});
      const data=await res.json();
      if(!res.ok){toast(data.message||'Failed','error');return;}
      toast(data.message||'Invoice deleted','success');onDeleted();onClose();
    }catch{toast('Network error','error');}finally{setLoading(false);}
  };
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box modal-sm">
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3 style={{fontWeight:700,fontSize:16,color:'#dc2626'}}>Delete Invoice</h3><button className="btn-icon" onClick={onClose}><X size={18}/></button></div>
        <div style={{padding:20}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}><div style={{width:56,height:56,borderRadius:'50%',background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center'}}><Trash2 size={24} color="#dc2626"/></div></div>
          <p style={{fontSize:14,textAlign:'center',marginBottom:6}}>Are you sure you want to delete</p>
          <p style={{fontSize:15,fontWeight:700,textAlign:'center',color:'var(--brand)',marginBottom:12}}>{invoice.invoice_number}?</p>
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#dc2626'}}><strong>Warning:</strong> This cannot be undone. Stock will be restored to inventory.</div>
          {invoice.status!=='draft'&&<div style={{background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#92400e',marginTop:10}}><strong>Note:</strong> Only draft invoices can be deleted.</div>}
        </div>
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button onClick={handleDelete} disabled={loading||invoice.status!=='draft'} style={{background:invoice.status==='draft'?'#dc2626':'#9ca3af',color:'#fff',border:'none',padding:'6px 14px',borderRadius:8,cursor:invoice.status==='draft'?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600}}>
            {loading?'Deleting...':<><Trash2 size={13}/>Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Invoice Detail Modal
───────────────────────────────────────────── */
function InvoiceDetailModal({ open, onClose, invoice }) {
  if(!open||!invoice) return null;
  const paidAmount=calcPaid(invoice), balanceDue=(parseFloat(invoice.total_amount)||0)-paidAmount;
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:600,maxHeight:'85vh',overflowY:'auto'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'var(--card-bg)',zIndex:10}}>
          <div><h3 style={{fontWeight:700,fontSize:16}}>Invoice Details</h3><p style={{fontSize:12,color:'var(--muted)'}}>{invoice.invoice_number}</p></div>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{padding:20}}>
          <div style={{marginBottom:20,padding:'12px',background:'var(--brand-bg)',borderRadius:10}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><User size={14} color="var(--brand)"/><span style={{fontWeight:600}}>Customer</span></div>
            <div><strong>{invoice.customer?.name}</strong></div>
            <div style={{fontSize:12,color:'var(--muted)'}}>{invoice.customer?.mobile}</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>{invoice.customer?.email}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            <div><div style={{fontSize:11,color:'var(--muted)'}}>Invoice Date</div><div style={{fontWeight:500}}>{fmt(invoice.invoice_date)}</div></div>
            <div><div style={{fontSize:11,color:'var(--muted)'}}>Due Date</div><div style={{fontWeight:500}}>{fmt(invoice.due_date)}</div></div>
            <div><div style={{fontSize:11,color:'var(--muted)'}}>Created By</div><div style={{fontWeight:500}}>{invoice.creator?.name||'—'}</div></div>
            <div><div style={{fontSize:11,color:'var(--muted)'}}>Status</div><StatusBadge status={invoice.status}/></div>
          </div>
          <table style={{width:'100%',fontSize:12,borderCollapse:'collapse',marginBottom:16}}>
            <thead><tr style={{borderBottom:'1px solid var(--border)'}}><th style={{textAlign:'left',padding:'8px 4px'}}>Product</th><th style={{textAlign:'center',padding:'8px 4px'}}>Qty</th><th style={{textAlign:'right',padding:'8px 4px'}}>Price</th><th style={{textAlign:'right',padding:'8px 4px'}}>Amount</th></tr></thead>
            <tbody>{(invoice.items||[]).map(item=><tr key={item.id} style={{borderBottom:'1px solid var(--border)'}}><td style={{padding:'8px 4px'}}>{item.product_name}</td><td style={{textAlign:'center',padding:'8px 4px'}}>{item.quantity}</td><td style={{textAlign:'right',padding:'8px 4px'}}>₹{parseFloat(item.price).toFixed(2)}</td><td style={{textAlign:'right',padding:'8px 4px'}}>₹{parseFloat(item.amount).toFixed(2)}</td></tr>)}</tbody>
          </table>
          <div style={{background:'var(--bg)',padding:12,borderRadius:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,color:'var(--muted)'}}>Subtotal</span><span>₹{parseFloat(invoice.subtotal||0).toFixed(2)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,color:'var(--muted)'}}>GST</span><span>₹{parseFloat(invoice.gst_amount||0).toFixed(2)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:6,borderTop:'1px solid var(--border)',fontWeight:600}}><span>Total</span><span style={{color:'var(--brand)'}}>₹{parseFloat(invoice.total_amount||0).toFixed(2)}</span></div>
            {paidAmount>0&&<div style={{display:'flex',justifyContent:'space-between',marginTop:4,color:'#059669',fontWeight:600}}><span>Balance Due</span><span>₹{balanceDue.toFixed(2)}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ══════════════════════════════════════════
   TEMPLATE SELECT MODAL — 4 DESIGNS WITH VISUAL PREVIEWS
   ══════════════════════════════════════════
───────────────────────────────────────────── */
const TEMPLATE_DEFS = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Red logo · gray meta table · notes + payment bottom',
    accentColor: '#e53e3e',
    labelBg: '#e53e3e',
    preview: ({ selected }) => (
      <div style={{width:'100%',height:'100%',background:'#fff',padding:'8px 10px',fontFamily:'Arial,sans-serif'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:'#e53e3e',flexShrink:0}}/>
            <div><div style={{width:28,height:5,background:'#111',borderRadius:1,marginBottom:2}}/><div style={{width:38,height:3,background:'#aaa',borderRadius:1}}/></div>
          </div>
          <div style={{width:44,height:10,background:'#111',borderRadius:1}}/>
        </div>
        <div style={{border:'1px solid #ddd',borderRadius:1,marginBottom:5}}>
          {[1,2,3].map(r=><div key={r} style={{display:'flex',borderBottom:r<3?'1px solid #eee':'none'}}>
            <div style={{flex:1,height:7,background:'#f7f7f7',borderRight:'1px solid #eee',margin:0}}/>
            <div style={{flex:2,height:7}}/>
          </div>)}
        </div>
        <div style={{background:'#f0f0f0',height:6,marginBottom:3,borderRadius:1}}/>
        <div style={{border:'1px solid #ddd',padding:4,marginBottom:5,borderRadius:1}}>
          <div style={{width:36,height:5,background:'#111',borderRadius:1,marginBottom:2}}/>
          <div style={{width:52,height:3,background:'#aaa',borderRadius:1}}/>
        </div>
        <div style={{border:'1px solid #ddd',borderRadius:1,overflow:'hidden',marginBottom:0}}>
          <div style={{background:'#f0f0f0',height:9,display:'flex',alignItems:'center',gap:4,padding:'0 4px'}}>
            {['#','Item','Qty','Rate','Amt'].map(h=><div key={h} style={{flex:h==='Item'?3:1,height:4,background:'#999',borderRadius:1}}/>)}
          </div>
          {[1,2,3].map(r=><div key={r} style={{height:10,borderBottom:'1px solid #f0f0f0',display:'flex',alignItems:'center',gap:4,padding:'0 4px'}}>
            {[1,2,3,4,5].map(c=><div key={c} style={{flex:c===2?3:1,height:3,background:'#ddd',borderRadius:1}}/>)}
          </div>)}
        </div>
        <div style={{display:'flex',marginTop:0,border:'1px solid #ddd',borderTop:'none'}}>
          <div style={{flex:1,height:22,background:'#fff',borderRight:'1px solid #ddd'}}/>
          <div style={{width:65,background:'#fff',padding:'3px 4px'}}>
            {[1,2,3].map(r=><div key={r} style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><div style={{width:20,height:3,background:'#ddd',borderRadius:1}}/><div style={{width:16,height:3,background:'#ddd',borderRadius:1}}/></div>)}
            <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #ddd',paddingTop:2}}><div style={{width:22,height:4,background:'#e53e3e',borderRadius:1}}/><div style={{width:16,height:4,background:'#e53e3e',borderRadius:1}}/></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'Navy header · Bill To + Ship To · blue balance row',
    accentColor: '#1a3a5c',
    labelBg: '#1a3a5c',
    preview: ({ selected }) => (
      <div style={{width:'100%',height:'100%',background:'#f0f0f0',padding:6,fontFamily:'Arial,sans-serif'}}>
        <div style={{background:'#fff',height:'100%',padding:'7px 8px',boxShadow:'0 1px 4px rgba(0,0,0,0.15)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
            <div><div style={{width:46,height:6,background:'#111',borderRadius:1,marginBottom:2}}/><div style={{width:34,height:3,background:'#aaa',borderRadius:1}}/></div>
            <div style={{textAlign:'right'}}>
              <div style={{display:'flex',justifyContent:'flex-end',gap:2,marginBottom:3}}>
                <div style={{width:10,height:10,background:'#4a90d9',clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'}}/>
                <div style={{width:10,height:10,background:'#e07b54',clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)',marginTop:4}}/>
              </div>
              <div style={{width:36,height:9,background:'#2c6fad',borderRadius:1}}/>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2,marginBottom:5,border:'1px solid #ddd'}}>
            <div style={{padding:'4px 5px',borderRight:'1px solid #ddd'}}>
              <div style={{width:22,height:3,background:'#333',borderRadius:1,marginBottom:3}}/><div style={{width:32,height:5,background:'#111',borderRadius:1,marginBottom:2}}/><div style={{width:40,height:3,background:'#aaa',borderRadius:1}}/>
            </div>
            <div style={{padding:'4px 5px'}}><div style={{width:22,height:3,background:'#333',borderRadius:1,marginBottom:3}}/><div style={{width:40,height:3,background:'#aaa',borderRadius:1}}/></div>
          </div>
          <div style={{border:'1px solid #ddd',borderRadius:1,overflow:'hidden'}}>
            <div style={{background:'#1a3a5c',height:9,display:'flex',alignItems:'center',gap:3,padding:'0 4px'}}>
              {[1,2,3,4,5].map(c=><div key={c} style={{flex:c===2?3:1,height:4,background:'rgba(255,255,255,0.5)',borderRadius:1}}/>)}
            </div>
            {[1,2,3].map(r=><div key={r} style={{height:9,borderBottom:'1px solid #eee',display:'flex',alignItems:'center',gap:3,padding:'0 4px'}}>
              {[1,2,3,4,5].map(c=><div key={c} style={{flex:c===2?3:1,height:3,background:'#ddd',borderRadius:1}}/>)}
            </div>)}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:3}}>
            <div style={{width:65}}>
              <div style={{display:'flex',justifyContent:'space-between',padding:'1px 3px'}}><div style={{width:20,height:3,background:'#ddd'}}/><div style={{width:16,height:3,background:'#ddd'}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'2px 3px',background:'#1a3a5c',marginTop:2}}><div style={{width:20,height:4,background:'rgba(255,255,255,0.5)'}}/><div style={{width:16,height:4,background:'rgba(255,255,255,0.5)'}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'2px 3px',background:'#2c6fad'}}><div style={{width:24,height:4,background:'rgba(255,255,255,0.5)'}}/><div style={{width:16,height:4,background:'rgba(255,255,255,0.5)'}}/></div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'bw-pro',
    name: 'B&W Pro',
    description: 'Black circle logo · discount column · balance box',
    accentColor: '#111111',
    labelBg: '#111111',
    preview: ({ selected }) => (
      <div style={{width:'100%',height:'100%',background:'#fff',padding:'8px 10px',fontFamily:'Arial,sans-serif'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:5}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:'#111',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:6,height:8,background:'#fff',borderRadius:1}}/></div>
            <div style={{marginTop:2}}><div style={{width:28,height:5,background:'#111',borderRadius:1,marginBottom:2}}/><div style={{width:38,height:3,background:'#aaa',borderRadius:1}}/></div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{width:44,height:10,background:'#111',borderRadius:1,marginBottom:2}}/>
            <div style={{width:34,height:3,background:'#aaa',borderRadius:1,marginLeft:'auto',marginBottom:2}}/>
            <div style={{width:28,height:7,background:'#333',borderRadius:1,marginLeft:'auto'}}/>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
          <div><div style={{width:22,height:3,background:'#aaa',borderRadius:1,marginBottom:3}}/><div style={{width:40,height:5,background:'#111',borderRadius:1,marginBottom:2}}/><div style={{width:52,height:3,background:'#ccc',borderRadius:1}}/></div>
          <div style={{textAlign:'right'}}>{[1,2,3,4,5].map(r=><div key={r} style={{display:'flex',justifyContent:'flex-end',gap:4,marginBottom:2}}><div style={{width:26,height:3,background:'#ccc',borderRadius:1}}/><div style={{width:20,height:3,background:'#555',borderRadius:1}}/></div>)}</div>
        </div>
        <div style={{border:'1px solid #eee',borderRadius:1,overflow:'hidden',marginBottom:4}}>
          <div style={{background:'#111',height:8,display:'flex',alignItems:'center',gap:2,padding:'0 3px'}}>
            {[1,2,3,4,5,6].map(c=><div key={c} style={{flex:c===2?3:1,height:3,background:'rgba(255,255,255,0.4)',borderRadius:1}}/>)}
          </div>
          {[1,2,3].map(r=><div key={r} style={{height:9,borderBottom:'1px solid #f0f0f0',display:'flex',alignItems:'center',gap:2,padding:'0 3px'}}>
            {[1,2,3,4,5,6].map(c=><div key={c} style={{flex:c===2?3:1,height:3,background:'#ddd',borderRadius:1}}/>)}
          </div>)}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <div style={{width:70}}>
            {[1,2].map(r=><div key={r} style={{display:'flex',justifyContent:'space-between',marginBottom:2,padding:'0 2px'}}><div style={{width:22,height:3,background:'#ddd'}}/><div style={{width:16,height:3,background:'#ddd'}}/></div>)}
            <div style={{display:'flex',justifyContent:'space-between',padding:'3px 4px',background:'#111',marginTop:2}}><div style={{width:26,height:4,background:'rgba(255,255,255,0.5)'}}/><div style={{width:18,height:4,background:'rgba(255,255,255,0.5)'}}/></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'teal-wave',
    name: 'Teal Wave',
    description: 'Curved teal header · wave footer · signature block',
    accentColor: '#1aada8',
    labelBg: '#1aada8',
    preview: ({ selected }) => (
      <div style={{width:'100%',height:'100%',background:'#f5f5f5',padding:5,fontFamily:'Arial,sans-serif'}}>
        <div style={{background:'#fff',height:'100%',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'}}>
          {/* Wave header */}
          <div style={{position:'relative',height:36,overflow:'hidden',background:'#fff',marginBottom:0}}>
            <div style={{position:'absolute',top:0,left:0,width:'62%',height:'100%',background:'#1aada8',clipPath:'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'}}/>
            <div style={{position:'absolute',bottom:0,right:0,width:'50%',height:'40%',background:'#1aada8',clipPath:'polygon(20% 100%, 100% 0%, 100% 100%)'}}/>
            <div style={{position:'absolute',bottom:0,right:0,width:'48%',height:'38%',background:'#c9a84c',clipPath:'polygon(22% 100%, 100% 0%, 100% 100%)',opacity:0.7}}/>
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 10px',zIndex:10}}>
              <div style={{width:32,height:7,background:'rgba(255,255,255,0.9)',borderRadius:1}}/>
              <div style={{textAlign:'right'}}><div style={{display:'flex',justifyContent:'flex-end',gap:2,marginBottom:2}}><div style={{width:8,height:8,background:'rgba(255,255,255,0.4)',clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'}}/><div style={{width:8,height:8,background:'rgba(255,255,255,0.3)',clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'}}/></div><div style={{width:22,height:4,background:'rgba(255,255,255,0.7)',borderRadius:1}}/></div>
            </div>
          </div>
          {/* Body */}
          <div style={{padding:'5px 8px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div><div style={{width:36,height:4,background:'#555',borderRadius:1,marginBottom:2}}/><div style={{width:28,height:5,background:'#111',borderRadius:1,marginBottom:2}}/><div style={{width:44,height:3,background:'#aaa',borderRadius:1}}/></div>
              <div>{[1,2,3].map(r=><div key={r} style={{display:'flex',justifyContent:'flex-end',gap:3,marginBottom:2}}><div style={{width:22,height:3,background:'#ccc',borderRadius:1}}/><div style={{width:18,height:3,background:'#555',borderRadius:1}}/></div>)}</div>
            </div>
            <div style={{border:'1px solid #eee',borderRadius:1,overflow:'hidden',marginBottom:4}}>
              <div style={{background:'#1aada8',height:8,display:'flex',alignItems:'center',gap:2,padding:'0 3px'}}>
                {[1,2,3,4,5].map(c=><div key={c} style={{flex:c===2?3:1,height:3,background:'rgba(255,255,255,0.5)',borderRadius:1}}/>)}
              </div>
              {[1,2,3].map(r=><div key={r} style={{height:8,borderBottom:'1px solid #f0f0f0',display:'flex',alignItems:'center',gap:2,padding:'0 3px'}}>
                {[1,2,3,4,5].map(c=><div key={c} style={{flex:c===2?3:1,height:3,background:'#ddd',borderRadius:1}}/>)}
              </div>)}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #eee',paddingTop:4}}>
              <div><div style={{width:28,height:3,background:'#555',borderRadius:1,marginBottom:3}}/>{[1,2,3].map(r=><div key={r} style={{display:'flex',gap:3,marginBottom:2}}><div style={{width:22,height:2,background:'#ddd'}}/><div style={{width:18,height:2,background:'#bbb'}}/></div>)}</div>
              <div style={{width:58}}>
                {[1,2,3].map(r=><div key={r} style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><div style={{width:16,height:2,background:'#ddd'}}/><div style={{width:14,height:2,background:'#ddd'}}/></div>)}
                <div style={{display:'flex',justifyContent:'space-between',padding:'2px 3px',background:'#1aada8',marginTop:2}}><div style={{width:16,height:3,background:'rgba(255,255,255,0.5)'}}/><div style={{width:14,height:3,background:'rgba(255,255,255,0.5)'}}/></div>
              </div>
            </div>
          </div>
          {/* Footer wave */}
          <div style={{position:'relative',height:18,marginTop:2,overflow:'hidden'}}>
            <div style={{position:'absolute',bottom:0,left:0,width:'40%',height:'100%',background:'#1aada8',opacity:0.2,clipPath:'polygon(0 100%, 100% 100%, 85% 0%, 0 40%)'}}/>
            <div style={{position:'absolute',bottom:0,right:0,width:'45%',height:'100%',background:'#1aada8',opacity:0.2,clipPath:'polygon(15% 100%, 100% 100%, 100% 0%, 0 60%)'}}/>
            <div style={{position:'absolute',bottom:0,right:0,width:'44%',height:'100%',background:'#c9a84c',opacity:0.15,clipPath:'polygon(16% 100%, 100% 100%, 100% 0%, 0 62%)'}}/>
          </div>
        </div>
      </div>
    )
  },
];

function TemplateCard({ tmpl, selected, onClick }) {
  const PreviewComp = tmpl.preview;
  return (
    <div onClick={onClick} style={{cursor:'pointer',borderRadius:12,border:selected?`2.5px solid ${tmpl.accentColor}`:'2px solid var(--border)',overflow:'hidden',transition:'all 0.2s',boxShadow:selected?`0 0 0 3px ${tmpl.accentColor}22, 0 6px 20px ${tmpl.accentColor}18`:'0 1px 4px rgba(0,0,0,0.07)',transform:selected?'translateY(-3px) scale(1.01)':'none',position:'relative'}}>
      {/* Preview area */}
      <div style={{height:130,background:'var(--bg)',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',inset:0}}>
          <PreviewComp selected={selected}/>
        </div>
      </div>
      {/* Label */}
      <div style={{padding:'9px 12px',background:selected?tmpl.labelBg:'var(--card-bg)',borderTop:`1px solid ${selected?tmpl.accentColor:'var(--border)'}`}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:selected?'#fff':'var(--text)'}}>{tmpl.name}</div>
            <div style={{fontSize:10,color:selected?'rgba(255,255,255,0.72)':'var(--muted)',marginTop:1}}>{tmpl.description}</div>
          </div>
          {selected&&<div style={{width:18,height:18,borderRadius:'50%',background:'rgba(255,255,255,0.25)',border:'2px solid rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><CheckCircle size={11} color="#fff"/></div>}
        </div>
      </div>
    </div>
  );
}

function TemplateSelectModal({ open, onClose, invoice, toast }) {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [downloading, setDownloading] = useState(false);
  if(!open||!invoice) return null;

  const selected = TEMPLATE_DEFS.find(t=>t.id===selectedTemplate);

  const handleDownload = () => {
    setDownloading(true);
    try {
      downloadInvoicePDF(invoice, selectedTemplate);
      setTimeout(()=>{
        setDownloading(false);
        toast?.(`Invoice opened — click "Download PDF" in the new tab`,'success');
        onClose();
      }, 500);
    } catch {
      setDownloading(false);
      toast?.('Failed to open invoice. Please allow popups.','error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()} style={{zIndex:1000}}>
      <div className="modal-box" style={{maxWidth:700,width:'96vw',maxHeight:'92vh',overflowY:'auto'}}>
        {/* Header */}
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'sticky',top:0,background:'var(--card-bg)',zIndex:10}}>
          <div>
            <h3 style={{fontWeight:800,fontSize:17}}>Download Invoice</h3>
            <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>
              <strong style={{color:'var(--brand)'}}>{invoice.invoice_number}</strong> · {invoice.customer?.name} · {INR(invoice.total_amount)}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        {/* Grid */}
        <div style={{padding:'18px 22px'}}>
          <div style={{fontSize:11,color:'var(--muted)',marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em'}}>Choose a template — 4 designs</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
            {TEMPLATE_DEFS.map(tmpl=>(
              <TemplateCard key={tmpl.id} tmpl={tmpl} selected={selectedTemplate===tmpl.id} onClick={()=>setSelectedTemplate(tmpl.id)}/>
            ))}
          </div>

          {/* Selected badge */}
          {selected&&(
            <div style={{marginTop:14,padding:'10px 14px',borderRadius:9,background:`${selected.accentColor}10`,border:`1px solid ${selected.accentColor}30`,display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:selected.accentColor,flexShrink:0}}/>
              <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{selected.name}</span>
              <span style={{fontSize:12,color:'var(--muted)'}}>{selected.description}</span>
              <span style={{marginLeft:'auto',fontSize:11,color:'var(--muted)'}}>Selected ✓</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'12px 22px',borderTop:'1px solid var(--border)',display:'flex',gap:10,justifyContent:'flex-end',alignItems:'center',position:'sticky',bottom:0,background:'var(--card-bg)'}}>
          <span style={{fontSize:11,color:'var(--muted)',marginRight:'auto'}}>Opens in new tab · click Download PDF button inside</span>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{display:'flex',alignItems:'center',gap:7,padding:'8px 20px',borderRadius:8,fontSize:13,fontWeight:700,border:'none',background:downloading?'#9ca3af':selected?.accentColor||'var(--brand)',color:'#fff',cursor:downloading?'not-allowed':'pointer',transition:'all 0.2s',boxShadow:downloading?'none':`0 2px 8px ${selected?.accentColor||'var(--brand)'}44`}}
          >
            {downloading
              ? <><RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>Preparing...</>
              : <><Download size={14}/>Download PDF</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function SalesPage() {
  const router = useRouter();
  const { state, toast } = useApp();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({search:'',period:'all',status:'all',prefix:'all',creator:'all'});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showStatusModal, setShowStatusModal]     = useState(false);
  const [showDetailModal, setShowDetailModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [selectedInvoice, setSelectedInvoice]     = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    const token = localStorage.getItem('zetsap_token');
    try {
      const res = await fetch(`${API_BASE}/admin/invoices`,{headers:{'Accept':'application/json','Authorization':`Bearer ${token}`}});
      const data = await res.json();
      if(res.ok){ const list=data.invoices||data.data||data; setInvoices(Array.isArray(list)?list:[]); }
      else { toast(data.message||'Failed to fetch','error'); setInvoices(state.invoices||[]); }
    } catch { setInvoices(state.invoices||[]); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchInvoices(); },[]);

  const creators = useMemo(()=>{ const map=new Map(); invoices.forEach(inv=>{ if(inv.creator?.id) map.set(inv.creator.id,inv.creator); }); return Array.from(map.values()); },[invoices]);
  const prefixes = useMemo(()=>{ const set=new Set(); invoices.forEach(inv=>{ if(inv.invoice_number){ const m=inv.invoice_number.match(/^([A-Za-z\-]+)/); if(m) set.add(m[1]); } }); return Array.from(set); },[invoices]);
  const periodLabel = useMemo(()=>({all:'All Time',today:'Today',week:'This Week',month:'This Month',year:'This Year'}[filters.period]||'All Time'),[filters.period]);

  const filteredInvoices = useMemo(()=>{
    let list = invoices;
    const range = getDateRange(filters.period);
    if(range) list=list.filter(inv=>{ if(!inv.invoice_date) return false; const d=new Date(inv.invoice_date); return d>=range.start&&d<=range.end; });
    if(filters.status!=='all'){ if(filters.status==='overdue') list=list.filter(isOverdue); else list=list.filter(inv=>inv.status===filters.status); }
    if(filters.prefix!=='all') list=list.filter(inv=>inv.invoice_number?.startsWith(filters.prefix));
    if(filters.creator!=='all') list=list.filter(inv=>String(inv.creator?.id)===String(filters.creator));
    if(filters.search){ const q=filters.search.toLowerCase(); list=list.filter(inv=>inv.invoice_number?.toLowerCase().includes(q)||inv.customer?.name?.toLowerCase().includes(q)); }
    return list;
  },[invoices,filters]);

  const stats = useMemo(()=>buildStats(filteredInvoices),[filteredInvoices]);

  const handleView      = inv=>{ setSelectedInvoice(inv); setShowDetailModal(true); };
  const handleStatusUpd = inv=>{ setSelectedInvoice(inv); setShowStatusModal(true); };
  const openDownload    = inv=>{ setSelectedInvoice(inv); setShowTemplateModal(true); };
  const handleEdit      = inv=>router.push(`/dashboard/create/invoice?id=${inv.id}`);
  const handleDelete    = inv=>{ setSelectedInvoice(inv); setShowDeleteModal(true); };

  if(loading) return (
    <div className="page-content">
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:400}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:40,height:40,border:'3px solid #f3f4f6',borderTopColor:'#8f195c',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
          <p style={{color:'var(--muted)'}}>Loading invoices...</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:22,color:'var(--text)'}}>Invoices</h1>
          <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Manage and track all your invoices</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline btn-sm" onClick={fetchInvoices} style={{display:'flex',alignItems:'center',gap:5}}><RefreshCw size={13}/>Refresh</button>
          <Link href="/dashboard/create/invoice" className="btn btn-brand btn-sm" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:5}}><Plus size={14}/>Create Invoice</Link>
        </div>
      </div>

      {/* Report Summary */}
      <ReportSummary stats={stats} periodLabel={periodLabel}/>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        <StatCard label="Total Invoices" value={stats.total}             icon={Receipt}       accent="#8f195c"/>
        <StatCard label="Total Amount"   value={INR(stats.totalAmt)}    icon={IndianRupee}   accent="#f59e0b" color="#f59e0b"/>
        <StatCard label="Amount Paid"    value={INR(stats.totalPaid)}   icon={CheckCircle}   accent="#059669" color="#059669"/>
        <StatCard label="Balance Due"    value={INR(stats.totalBalance)} icon={AlertTriangle} accent={stats.totalBalance>0?'#dc2626':'#059669'} color={stats.totalBalance>0?'#dc2626':'#059669'}/>
        <StatCard label="Overdue"        value={stats.overdueCount}     icon={AlertCircle}   accent="#dc2626" color="#dc2626" sub={`${stats.paidCount} paid · ${stats.sentCount} sent`}/>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} setFilters={setFilters} creators={creators} prefixes={prefixes}/>

      {/* Table */}
      <div className="card">
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
          <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{filteredInvoices.length} invoice{filteredInvoices.length!==1?'s':''}{filters.period!=='all'&&<span style={{fontSize:11,fontWeight:400,color:'var(--muted)',marginLeft:6}}>· {periodLabel}</span>}</span>
        </div>

        {filteredInvoices.length===0 ? (
          <div style={{padding:'50px 32px',textAlign:'center'}}>
            <FileText size={48} color="var(--muted)" style={{margin:'0 auto 16px'}}/>
            <h2 style={{fontWeight:700,fontSize:18,marginBottom:8}}>No Invoices Found</h2>
            <p style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>{filters.search?'Try a different search term':'Adjust the filters or create a new invoice'}</p>
            {!filters.search&&<Link href="/dashboard/create/invoice" className="btn btn-brand btn-sm" style={{textDecoration:'none'}}><Plus size={14}/>Create Invoice</Link>}
          </div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table className="tbl">
              <thead>
                <tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Created By</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv=>{
                  const totalAmt=parseFloat(inv.total_amount)||0, paidAmt=calcPaid(inv), balance=totalAmt-paidAmt, overdue=isOverdue(inv), isDraft=inv.status==='draft';
                  return (
                    <tr key={inv.id} style={{background:overdue?'#fef2f2':'transparent'}}>
                      <td style={{fontWeight:600,color:'var(--brand)'}}>{inv.invoice_number}</td>
                      <td><div style={{fontWeight:500}}>{inv.customer?.name||'—'}</div><div style={{fontSize:10,color:'var(--muted)'}}>{inv.customer?.mobile}</div></td>
                      <td style={{fontSize:12,color:'var(--muted)'}}>{fmt(inv.invoice_date)}</td>
                      <td style={{fontSize:12,color:overdue?'#dc2626':'var(--muted)',fontWeight:overdue?600:400}}>{fmt(inv.due_date)}{overdue&&<span style={{fontSize:10,marginLeft:4}}>(Overdue)</span>}</td>
                      <td style={{fontWeight:600}}>{INR(totalAmt)}</td>
                      <td style={{fontWeight:600,color:'#059669'}}>{INR(paidAmt)}</td>
                      <td style={{fontWeight:600,color:balance>0?'#dc2626':'#059669'}}>{INR(balance)}</td>
                      <td><StatusBadge status={inv.status} onClick={()=>handleStatusUpd(inv)}/></td>
                      <td style={{fontSize:11,color:'var(--muted)'}}><div style={{display:'flex',alignItems:'center',gap:4}}><User size={10}/>{inv.creator?.name||'—'}</div></td>
                      <td>
                        <div style={{display:'flex',gap:4,alignItems:'center'}}>
                          <button className="btn-icon" onClick={()=>handleView(inv)} title="View Details"><Eye size={14}/></button>
                          {/* Download button — opens template chooser */}
                          <button className="btn-icon" onClick={()=>openDownload(inv)} title="Download PDF" style={{color:'var(--brand)'}}><Download size={14}/></button>
                          <button className="btn-icon" onClick={()=>handleEdit(inv)} title={isDraft?'Edit Invoice':'Only draft invoices can be edited'} disabled={!isDraft} style={{color:isDraft?'var(--brand)':'var(--muted)',opacity:isDraft?1:0.4,cursor:isDraft?'pointer':'not-allowed'}}><Pencil size={14}/></button>
                          <button className="btn-icon" onClick={()=>handleDelete(inv)} title={isDraft?'Delete Invoice':'Only draft invoices can be deleted'} disabled={!isDraft} style={{color:isDraft?'#dc2626':'var(--muted)',opacity:isDraft?1:0.4,cursor:isDraft?'pointer':'not-allowed'}}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{background:'var(--bg)',fontWeight:700,borderTop:'2px solid var(--border)'}}>
                  <td colSpan={4} style={{padding:'10px 12px',fontSize:12,color:'var(--muted)'}}>Totals — {filteredInvoices.length} invoices</td>
                  <td style={{padding:'10px 4px',color:'#f59e0b'}}>{INR(stats.totalAmt)}</td>
                  <td style={{padding:'10px 4px',color:'#059669'}}>{INR(stats.totalPaid)}</td>
                  <td style={{padding:'10px 4px',color:stats.totalBalance>0?'#dc2626':'#059669'}}>{INR(stats.totalBalance)}</td>
                  <td colSpan={3}/>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TemplateSelectModal open={showTemplateModal} onClose={()=>{ setShowTemplateModal(false); setSelectedInvoice(null); }} invoice={selectedInvoice} toast={toast}/>
      <StatusUpdateModal open={showStatusModal} onClose={()=>{ setShowStatusModal(false); setSelectedInvoice(null); }} invoice={selectedInvoice} onUpdate={fetchInvoices} toast={toast}/>
      <InvoiceDetailModal open={showDetailModal} onClose={()=>{ setShowDetailModal(false); setSelectedInvoice(null); }} invoice={selectedInvoice}/>
      <DeleteConfirmModal open={showDeleteModal} onClose={()=>{ setShowDeleteModal(false); setSelectedInvoice(null); }} invoice={selectedInvoice} onDeleted={fetchInvoices} toast={toast}/>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}