'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

const API_BASE = 'https://api.crazystory.in/api';
const LOGO = 'https://mindcarve.in/wp-content/uploads/2023/07/1.5X1-1.png';

export default function LoginExistingPage() {
  const router = useRouter();
  const { state, login } = useApp();
  const [mobile, setMobile] = useState('');
  const [pass, setPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, send to dashboard
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zetsap_token') : null;
    if (token || state.user) router.replace('/dashboard/home');
  }, []);

 const handleLogin = async () => {
  const cleanMobile = mobile.replace(/\D/g, '');
  if (!cleanMobile || cleanMobile.length < 8) {
    setErr('Enter a valid mobile number');
    return;
  }
  if (!pass.trim()) {
    setErr('Enter your password');
    return;
  }
  setErr('');
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ mobile: cleanMobile, password: pass }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErr(data.message || 'Invalid mobile number or password.');
      setLoading(false);
      return;
    }

    // ✅ FIX: Save role to localStorage as well
    localStorage.setItem('zetsap_token', data.access_token);
    localStorage.setItem('zetsap_user', JSON.stringify(data.user));
    localStorage.setItem('zetsap_company', JSON.stringify(data.company));
    localStorage.setItem('zetsap_role', JSON.stringify(data.role)); // ← ADD THIS LINE

    login({
      mobile: cleanMobile,
      username: data.user?.email || cleanMobile,
      name: data.user?.name,
      email: data.user?.email,
      role: data.role,
      token: data.access_token,
      user: data.user,
      company: data.company,
    });

    router.replace('/dashboard/home');
  } catch (e) {
    setErr('Network error. Please try again.');
    setLoading(false);
  }
};

  return (
    <div className="login-page-wrap">
      {/* Left — illustration */}
      <div className="login-left">
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <img
            src="/login-illustration.png"
            alt="Invoice Illustration"
            style={{ width: '100%', maxWidth: 420, objectFit: 'contain', borderRadius: 16, mixBlendMode: 'multiply' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 26, color: '#8f195c', marginBottom: 10 }}>
              Create Invoices in 10 Seconds
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.8, maxWidth: 360, margin: '0 auto' }}>
              Generate professional GST invoices, manage expenses, track customers — all in one place.
              Trusted by 20 Lakh+ businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="login-right">
        <div className="login-form-card">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src={LOGO} alt="Zetsap" className="login-logo"
              style={{ margin: '0 auto', display: 'block' }}
              onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>

          <h2 className="login-title">Welcome back!</h2>
          <p className="login-sub">Sign in with your mobile number and password</p>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Mobile Number</label>
            <input
              className="form-input"
              placeholder="10-digit mobile number"
              type="tel"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 15));
                setErr('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
              inputMode="numeric"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                style={{ paddingRight: 44 }}
                type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setErr(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                  display: 'flex', padding: 0,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 5, lineHeight: 1.4 }}>
                {err}
              </p>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', background: '#8f195c', border: 'none',
              borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter,sans-serif', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.75 : 1, transition: 'opacity 0.15s',
            }}
          >
            {loading ? (
              <span style={{
                width: 18, height: 18, border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : 'Sign In →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
            New here?{' '}
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'none', border: 'none', color: '#8f195c', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13,
                textDecoration: 'underline',
              }}
            >
              Register
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-page-wrap { min-height: 100vh; display: flex; background: #ffffff; }
        .login-left {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 48px 32px; background: #ffffff;
        }
        .login-right {
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px; flex: 0 0 440px; background: #fff5f9;
          box-shadow: -1px 0 0 #f9e8f1;
        }
        .login-form-card { width: 100%; max-width: 360px; }
        .login-logo { height: 44px; object-fit: contain; margin-bottom: 28px; display: block; }
        .login-title { font-weight: 800; font-size: 26px; color: #111827; margin-bottom: 6px; }
        .login-sub { color: #6b7280; font-size: 13.5px; margin-bottom: 28px; line-height: 1.5; }
        .form-label {
          font-size: 12px; font-weight: 600; color: #374151;
          display: block; margin-bottom: 6px;
        }
        .form-input {
          width: 100%; padding: 11px 12px; border: 1.5px solid #e5e7eb;
          border-radius: 8px; font-size: 14px; font-family: Inter,sans-serif;
          outline: none; background: #fff;
        }
        .form-input:focus { border-color: #8f195c; }

        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { flex: 1 !important; box-shadow: none !important; max-width: 100% !important; }
          .login-page-wrap { background: linear-gradient(135deg, #fdf0f7 0%, #eff6ff 100%); }
        }
        @media (max-width: 480px) {
          .login-right { padding: 32px 16px !important; }
          .login-title { font-size: 22px !important; }
        }
      `}</style>
    </div>
  );
}