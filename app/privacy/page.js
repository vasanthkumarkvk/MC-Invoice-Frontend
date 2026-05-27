'use client';
import { Lock, Ban, Upload, Trash2 } from 'lucide-react';
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
function InfoBox({ icon: Icon, title, desc }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fdf0f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} color="#8f195c"/></div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #8f195c, #b52577)', padding: '60px 24px 48px', textAlign: 'center' }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: 24, textDecoration: 'none' }}>
          <img src="https://mindcarve.in/wp-content/uploads/2023/07/1.5X1-1.png" alt="Mindcarve" style={{ height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} onError={() => {}}/>
        </a>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>Last updated: April 28, 2026 · We respect your privacy completely</p>
      </div>

      {/* Quick summary */}
      <div style={{ background: '#fff', padding: '32px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1018, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>Privacy at a Glance</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <InfoBox icon={Lock} title="Data Encrypted" desc="All data encrypted with TLS 1.3 at rest and in transit"/>
            <InfoBox icon={Ban} title="Never Sold" desc="Your business data is never sold to advertisers or third parties"/>
            <InfoBox icon={Upload} title="Full Export" desc="Export all your data anytime in CSV or PDF format"/>
            <InfoBox icon={Trash2} title="Right to Delete" desc="Request complete account and data deletion at any time"/>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>

        <Section title="1. Information We Collect">
          <P>We collect information you provide directly and information generated through your use of the Service:</P>
          <P><strong>Account Information:</strong></P>
          <Ul>
            <Li>Name, email address, mobile number, and password</Li>
            <Li>Business name, GSTIN, PAN, and business address</Li>
            <Li>Profile photo and company logo (optional)</Li>
          </Ul>
          <P><strong>Business Data (You Own This):</strong></P>
          <Ul>
            <Li>Invoice, quotation, purchase, and expense records you create</Li>
            <Li>Customer and vendor contact details you add</Li>
            <Li>Product catalog, pricing, and inventory data</Li>
            <Li>Payment records and financial reports</Li>
          </Ul>
          <P><strong>Usage & Technical Data:</strong></P>
          <Ul>
            <Li>Log data including IP address, browser type, pages visited, and timestamps</Li>
            <Li>Device information and operating system</Li>
            <Li>Feature usage patterns (to improve the service)</Li>
          </Ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <P>We use the information we collect to:</P>
          <Ul>
            <Li><strong>Provide the Service</strong> — Process invoices, generate reports, and deliver all platform features.</Li>
            <Li><strong>Authentication</strong> — Verify your identity and secure your account via OTP and password.</Li>
            <Li><strong>Communications</strong> — Send OTPs, invoice notifications, payment reminders, and important service updates.</Li>
            <Li><strong>Support</strong> — Respond to your questions, troubleshoot issues, and provide technical assistance.</Li>
            <Li><strong>Compliance</strong> — Fulfill legal obligations including GST regulations and government reporting requirements.</Li>
            <Li><strong>Improvement</strong> — Analyze usage patterns to improve platform performance and add new features.</Li>
            <Li><strong>Security</strong> — Detect, prevent, and respond to fraud, abuse, and security threats.</Li>
          </Ul>
          <P>We will never use your data to serve you third-party advertisements.</P>
        </Section>

        <Section title="3. Data Sharing & Third Parties">
          <P>We share your information only in the following limited circumstances:</P>
          <Ul>
            <Li><strong>Government Portals</strong> — When you generate e-invoices, your invoice data is sent to the GST IRP portal as required by law.</Li>
            <Li><strong>Payment Processors</strong> — If you use payment gateway features, transaction data is shared with your chosen payment provider (Razorpay, PayU).</Li>
            <Li><strong>Cloud Infrastructure</strong> — We use AWS/GCP for secure data hosting. These providers process data on our behalf under strict data protection agreements.</Li>
            <Li><strong>Legal Requirements</strong> — We may disclose data when required by valid legal process, court orders, or government authorities.</Li>
          </Ul>
          <div style={{ background: '#fdf0f7', border: '1.5px solid rgba(143,25,92,0.15)', borderRadius: 10, padding: '14px 18px', marginTop: 12 }}>
            <strong style={{ color: BRAND }}>We never sell your data.</strong> We do not share, sell, or rent your personal or business data to advertisers, data brokers, or any third party for commercial purposes.
          </div>
        </Section>

        <Section title="4. Data Security">
          <P>We implement industry-standard security measures to protect your data:</P>
          <Ul>
            <Li><strong>Encryption</strong> — All data is encrypted in transit using TLS 1.3 and at rest using AES-256.</Li>
            <Li><strong>Access Controls</strong> — Strict role-based access controls limit who can access your data internally.</Li>
            <Li><strong>Backups</strong> — Automated daily backups retained for 30 days with point-in-time recovery.</Li>
            <Li><strong>OTP Authentication</strong> — Email OTP for login prevents unauthorized account access.</Li>
            <Li><strong>Audit Logs</strong> — All data access and modifications are logged for security auditing.</Li>
          </Ul>
          <P>Despite our best efforts, no system is 100% secure. We encourage you to use a strong password and enable all available security features.</P>
        </Section>

        <Section title="5. Cookies & Tracking">
          <P>We use cookies and similar technologies to:</P>
          <Ul>
            <Li><strong>Session Cookies</strong> — Keep you logged in during your session (deleted when browser closes).</Li>
            <Li><strong>Preference Cookies</strong> — Remember your settings like dark mode and currency preferences.</Li>
            <Li><strong>Analytics</strong> — Understand how features are used to improve the platform (no personal data shared).</Li>
          </Ul>
          <P>You can control cookies through your browser settings. Disabling session cookies may prevent you from logging in.</P>
        </Section>

        <Section title="6. Your Rights & Controls">
          <P>You have the following rights regarding your personal data:</P>
          <Ul>
            <Li><strong>Access</strong> — Request a copy of all data we hold about you.</Li>
            <Li><strong>Correction</strong> — Update or correct inaccurate personal information anytime in Settings.</Li>
            <Li><strong>Deletion</strong> — Request deletion of your account and all associated data. We will process within 30 days.</Li>
            <Li><strong>Export</strong> — Download all your business data in CSV or PDF format from the Reports page.</Li>
            <Li><strong>Restriction</strong> — Request that we stop processing your data in certain circumstances.</Li>
            <Li><strong>Portability</strong> — Receive your data in a structured, machine-readable format.</Li>
          </Ul>
          <P>To exercise any of these rights, contact us at <strong>privacy@mindcarve.in</strong>. We will respond within 30 days.</P>
        </Section>

        <Section title="7. Data Retention">
          <P>We retain your data as follows:</P>
          <Ul>
            <Li><strong>Active Account</strong> — All data retained while your account is active.</Li>
            <Li><strong>After Cancellation</strong> — Data retained for 30 days after subscription cancellation for export.</Li>
            <Li><strong>After Deletion Request</strong> — Permanently deleted within 30 days of verified deletion request.</Li>
            <Li><strong>Legal Requirements</strong> — Some financial records may be retained for up to 7 years as required by Indian tax laws (GST Act).</Li>
            <Li><strong>Backups</strong> — Deleted data may persist in encrypted backups for up to 30 additional days.</Li>
          </Ul>
        </Section>

        <Section title="8. Children's Privacy">
          <P>Mindcarve is a business software platform intended for adults operating legitimate businesses. We do not knowingly collect personal information from individuals under 18 years of age.</P>
          <P>If you believe we have inadvertently collected data from a minor, please contact us immediately at <strong>privacy@mindcarve.in</strong> and we will delete it promptly.</P>
        </Section>

        <Section title="9. Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. When we make significant changes:</P>
          <Ul>
            <Li>We will update the "Last Updated" date at the top of this page.</Li>
            <Li>We will send registered users an email notification of material changes.</Li>
            <Li>Continued use of the Service after 30 days of notification constitutes acceptance of changes.</Li>
          </Ul>
        </Section>

        <Section title="10. Contact & Grievance Officer">
          <P>For privacy-related concerns, questions, or to exercise your rights:</P>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 14 }}>Data Protection Contact</div>
            {[
              ['Grievance Officer', 'Mindcarve Legal Team'],
              ['Email', 'privacy@mindcarve.in'],
              ['Response Time', 'Within 30 days'],
              ['Phone', '+91 812 133 5436'],
              ['Address', 'Mindcarve Communication, Chennai, Tamil Nadu - 600001, India'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 14, alignItems: 'flex-start' }}>
                <span style={{ color: '#6b7280', minWidth: 130, flexShrink: 0 }}>{l}:</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{v}</span>
              </div>
            ))}
          </div>
          <P style={{ marginTop: 14 }}>This Privacy Policy is governed by the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.</P>
        </Section>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 32, borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: 13 }}>
          <p>This Privacy Policy is effective as of April 1, 2026.</p>
          <p style={{ marginTop: 8 }}>© 2026 Mindcarve Communication. All rights reserved.</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/terms" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>Terms of Service</a>
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
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
