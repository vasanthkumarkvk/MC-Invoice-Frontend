'use client';
const BRAND = '#8f195c';

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #fdf0f7', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 4, height: 22, background: BRAND, borderRadius: 2, display: 'inline-block', flexShrink: 0 }}/>
        {title}
      </h2>
      <div style={{ color: '#374151', fontSize: 14.5, lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

function P({ children }) { return <p style={{ marginBottom: 12 }}>{children}</p>; }
function Li({ children }) { return <li style={{ marginBottom: 8, paddingLeft: 4 }}>{children}</li>; }
function Ul({ children }) { return <ul style={{ paddingLeft: 20, marginBottom: 12, listStyleType: 'disc' }}>{children}</ul>; }

export default function TermsPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #8f195c, #b52577)', padding: '60px 24px 48px', textAlign: 'center' }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: 24, textDecoration: 'none' }}>
          <img src="https://mindcarve.in/wp-content/uploads/2023/07/1.5X1-1.png" alt="Mindcarve" style={{ height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} onError={() => {}}/>
        </a>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>Terms of Service</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 0 }}>Last updated: April 28, 2026 · Effective from April 1, 2026</p>
      </div>

      {/* Quick nav pills */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Acceptance','Account','Services','Payments','Data','Prohibited','Termination','Liability','Contact'].map(t => (
          <a key={t} href={`#${t.toLowerCase()}`} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb', fontSize: 12.5, fontWeight: 600, color: '#374151', textDecoration: 'none', transition: 'all 0.15s', background: '#fff' }}
            onMouseOver={e => { e.target.style.borderColor = BRAND; e.target.style.color = BRAND; }}
            onMouseOut={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#374151'; }}>
            {t}
          </a>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Intro card */}
        <div style={{ background: '#fdf0f7', border: '1.5px solid rgba(143,25,92,0.15)', borderRadius: 14, padding: '20px 24px', marginBottom: 40, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: BRAND, marginBottom: 4 }}>Important Notice</div>
            <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
              Please read these Terms carefully before using Mindcarve. By accessing or using our invoice and billing software, you agree to be bound by these Terms. If you disagree, do not use the service.
            </p>
          </div>
        </div>

        <Section title="1. Acceptance of Terms">
          <P>By creating an account or using Mindcarve ("Service," "Platform," "we," "us," or "our"), you ("User," "you," or "your") acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.</P>
          <P>These Terms apply to all users, including businesses and individuals using the platform for invoicing, billing, accounting, and related business operations.</P>
          <P>We reserve the right to update these Terms at any time. We will notify registered users of material changes via email. Continued use of the Service after changes constitutes acceptance.</P>
        </Section>

        <Section title="2. Account Registration & Security">
          <P>To use Mindcarve, you must register for an account by providing accurate and complete information including your business name, GSTIN (if applicable), email address, and mobile number.</P>
          <Ul>
            <Li>You must be at least 18 years old to create an account.</Li>
            <Li>You are responsible for maintaining the confidentiality of your login credentials.</Li>
            <Li>You agree to immediately notify us of any unauthorized use of your account.</Li>
            <Li>Each account is for a single business entity. Multiple businesses require separate accounts.</Li>
            <Li>We reserve the right to terminate accounts that provide false information.</Li>
          </Ul>
          <P>You are solely responsible for all activity that occurs under your account, whether or not authorized by you.</P>
        </Section>

        <Section title="3. Services Provided">
          <P>Mindcarve provides a cloud-based invoice and business management platform including but not limited to:</P>
          <Ul>
            <Li><strong>Invoice Management</strong> — Create, send, and manage GST-compliant invoices, estimates, quotations, and credit notes.</Li>
            <Li><strong>Purchase Management</strong> — Track purchase orders, bills, and vendor payments.</Li>
            <Li><strong>Inventory Management</strong> — Monitor stock levels, warehouse management, and movement tracking.</Li>
            <Li><strong>Accounting & Reports</strong> — GST reports, P&L statements, ledgers, and tally integration.</Li>
            <Li><strong>E-Invoice Generation</strong> — Integration with government IRP portal for IRN and QR code generation.</Li>
            <Li><strong>Customer & Vendor Management</strong> — Maintain contact databases and outstanding balances.</Li>
          </Ul>
          <P>We may add, modify, or remove features at any time. We will provide reasonable notice of significant changes.</P>
        </Section>

        <Section title="4. Subscription & Payments">
          <P>Mindcarve offers both free and paid subscription plans. By subscribing to a paid plan, you agree to the following:</P>
          <Ul>
            <Li><strong>Billing Cycle</strong> — Subscriptions are billed monthly or annually as selected.</Li>
            <Li><strong>Auto-renewal</strong> — Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date.</Li>
            <Li><strong>Refund Policy</strong> — We offer a 7-day refund policy for new subscriptions. No refunds are issued after this period.</Li>
            <Li><strong>Price Changes</strong> — We reserve the right to modify pricing with 30 days notice. Existing subscribers retain current pricing until their renewal date.</Li>
            <Li><strong>Taxes</strong> — All prices are exclusive of applicable taxes including GST. You are responsible for any applicable taxes.</Li>
            <Li><strong>Failed Payments</strong> — If payment fails, we will attempt to retry. Service may be suspended after 3 failed attempts.</Li>
          </Ul>
          <P>Use promo code <strong style={{ color: BRAND }}>ZETSAP200</strong> for ₹200 off your first premium subscription.</P>
        </Section>

        <Section title="5. Data Ownership & Privacy">
          <P>You retain full ownership of all business data you input into Mindcarve, including invoice data, customer information, and financial records.</P>
          <Ul>
            <Li>We do not sell your data to third parties.</Li>
            <Li>Your invoice and financial data is encrypted at rest and in transit using industry-standard TLS 1.3 encryption.</Li>
            <Li>We maintain automated daily backups of your data for 30 days.</Li>
            <Li>You may export your data at any time in CSV or PDF format.</Li>
            <Li>Upon account deletion, we will delete your data within 30 days, except where required by law.</Li>
          </Ul>
          <P>By using Mindcarve, you grant us a limited license to process your data solely for the purpose of providing the Service.</P>
        </Section>

        <Section title="6. Prohibited Activities">
          <P>You agree NOT to use Mindcarve for:</P>
          <Ul>
            <Li>Creating fraudulent invoices, fake GST numbers, or false tax records.</Li>
            <Li>Money laundering, tax evasion, or any other illegal financial activities.</Li>
            <Li>Reverse engineering, copying, or distributing the platform's source code.</Li>
            <Li>Attempting to gain unauthorized access to other users' accounts or data.</Li>
            <Li>Uploading malicious code, viruses, or content that disrupts the service.</Li>
            <Li>Using automated bots or scrapers to access the platform without permission.</Li>
            <Li>Reselling or sublicensing access to the platform without written consent.</Li>
          </Ul>
          <P>Violation of these terms may result in immediate account suspension and legal action where applicable under Indian law.</P>
        </Section>

        <Section title="7. GST & Tax Compliance">
          <P>Mindcarve provides tools to help you create GST-compliant invoices, but we are not a tax advisor.</P>
          <Ul>
            <Li>You are solely responsible for ensuring the accuracy of GST calculations and GSTIN numbers.</Li>
            <Li>E-invoice generation is subject to government IRP portal availability and your GST registration status.</Li>
            <Li>We strongly recommend consulting a qualified Chartered Accountant for tax filing and compliance matters.</Li>
            <Li>Mindcarve is not liable for any penalties or legal consequences arising from incorrect tax information.</Li>
          </Ul>
        </Section>

        <Section title="8. Termination">
          <P>Either party may terminate this agreement at any time:</P>
          <Ul>
            <Li><strong>By You</strong> — Cancel your subscription anytime from account settings. Access continues until the end of the billing period.</Li>
            <Li><strong>By Us</strong> — We may suspend or terminate your account immediately for violation of these Terms, non-payment, or illegal activity.</Li>
            <Li>Upon termination, you may export your data within 30 days before deletion.</Li>
          </Ul>
        </Section>

        <Section title="9. Limitation of Liability">
          <P>To the maximum extent permitted by law, Mindcarve and its affiliates shall not be liable for:</P>
          <Ul>
            <Li>Indirect, incidental, special, or consequential damages arising from use of the Service.</Li>
            <Li>Loss of business, revenue, or data resulting from service interruption.</Li>
            <Li>Errors in GST calculations or tax filings made by users.</Li>
            <Li>Third-party service failures including payment gateways or government portals.</Li>
          </Ul>
          <P>Our maximum liability to you for any claim shall not exceed the amount you paid to us in the 3 months preceding the claim.</P>
        </Section>

        <Section title="10. Contact Us">
          <P>For questions about these Terms of Service, please contact us:</P>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>Mindcarve Communication</div>
            {[
              ['Email', 'legal@mindcarve.in'],
              ['Support', 'support@mindcarve.in'],
              ['Phone', '+91 812 133 5436'],
              ['Address', 'Chennai, Tamil Nadu, India'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: '#6b7280', minWidth: 70 }}>{l}:</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{v}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer note */}
        <div style={{ textAlign: 'center', paddingTop: 32, borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: 13 }}>
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
          <p style={{ marginTop: 8 }}>© 2026 Mindcarve Communication. All rights reserved.</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <a href="/privacy" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>Privacy Policy</a>
            <a href="/" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>← Back to App</a>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        @media (max-width: 600px) {
          h1 { font-size: 26px !important; }
          div[style*="padding: '60px"] { padding: 36px 16px 32px !important; }
          div[style*="maxWidth: 820"] { padding: 24px 16px 60px !important; }
        }
      `}</style>
    </div>
  );
}
