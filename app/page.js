"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useApp } from "@/lib/AppContext";

const API_BASE = "https://api.crazystory.in/api";

/* ── All countries — no search bar ── */
const COUNTRIES = [
  { code: "+91", flag: "🇮🇳", name: "India", phoneLength: 10 },
  { code: "+1", flag: "🇺🇸", name: "USA", phoneLength: 10 },
  { code: "+44", flag: "🇬🇧", name: "UK", phoneLength: 10 },
  { code: "+61", flag: "🇦🇺", name: "Australia", phoneLength: 9 },
  { code: "+971", flag: "🇦🇪", name: "UAE", phoneLength: 9 },
  { code: "+65", flag: "🇸🇬", name: "Singapore", phoneLength: 8 },
  { code: "+60", flag: "🇲🇾", name: "Malaysia", phoneLength: 9 },
  { code: "+1", flag: "🇨🇦", name: "Canada", phoneLength: 10 },
  { code: "+49", flag: "🇩🇪", name: "Germany", phoneLength: 10 },
  { code: "+33", flag: "🇫🇷", name: "France", phoneLength: 9 },
  { code: "+81", flag: "🇯🇵", name: "Japan", phoneLength: 10 },
  { code: "+86", flag: "🇨🇳", name: "China", phoneLength: 11 },
  { code: "+55", flag: "🇧🇷", name: "Brazil", phoneLength: 11 },
  { code: "+27", flag: "🇿🇦", name: "South Africa", phoneLength: 9 },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", phoneLength: 9 },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh", phoneLength: 10 },
  { code: "+62", flag: "🇮🇩", name: "Indonesia", phoneLength: 10 },
  { code: "+92", flag: "🇵🇰", name: "Pakistan", phoneLength: 10 },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka", phoneLength: 9 },
  { code: "+977", flag: "🇳🇵", name: "Nepal", phoneLength: 10 },
  { code: "+975", flag: "🇧🇹", name: "Bhutan", phoneLength: 8 },
  { code: "+960", flag: "🇲🇻", name: "Maldives", phoneLength: 7 },
];

const FACES = [
  "https://i.pinimg.com/736x/24/16/f0/2416f065537cc43afdb9b0e8e0b48f4c.jpg",
  "https://i.pinimg.com/736x/15/91/11/159111051b40ba944379623d60de09ca.jpg",
  "https://i.pinimg.com/736x/cb/99/f3/cb99f3578401880e34be582a945afaac.jpg",
  "https://i.pinimg.com/736x/18/ec/db/18ecdbb54bc68213544767a5c2743ad4.jpg",
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AUD", "AED", "SGD", "CAD", "JPY"];

/* Spinner */
const Spinner = ({ size = 18 }) => (
  <span
    style={{
      width: size,
      height: size,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin 0.8s linear infinite",
    }}
  />
);

/* Loader */
function Loader({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 52,
          color: "#8f195c",
          letterSpacing: -2,
          fontFamily: "Inter,sans-serif",
        }}
      >
        Zetsap
      </div>
      <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading your workspace…</p>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#8f195c",
              animation: `bounce 0.9s ${i * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* Tick animation */
function SuccessTick({ onDone, message = "Verified!", sub = "Almost there…" }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "28px 0" }}>
      <svg viewBox="0 0 60 60" width="72" height="72" style={{ display: "block", margin: "0 auto 16px" }}>
        <circle cx="30" cy="30" r="28" fill="none" stroke="#10b981" strokeWidth="3"
          style={{ strokeDasharray: 176, strokeDashoffset: 176, animation: "drawCircle 0.55s ease forwards 0.1s" }} />
        <polyline points="16,30 25,40 44,20" fill="none" stroke="#10b981" strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: "drawTick 0.38s ease forwards 0.75s" }} />
      </svg>
      <p style={{ fontWeight: 700, fontSize: 17, color: "#065f46" }}>{message}</p>
      <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>{sub}</p>
    </div>
  );
}

/* Country picker */
function CountryPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0, zIndex: 99999 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "0 12px",
          background: "#f9fafb", border: "none", borderRight: "1px solid #e5e7eb",
          cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151",
          whiteSpace: "nowrap", height: 46, borderRadius: "8px 0 0 8px",
        }}
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "110%", left: 0, width: 280, maxHeight: 300,
          overflowY: "auto", background: "#fff", border: "1px solid #ddd",
          borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 99999,
        }}>
          {COUNTRIES.map((co, i) => (
            <div key={i} onClick={() => { onSelect(co); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                cursor: "pointer", borderBottom: "1px solid #f3f4f6",
              }}>
              <span>{co.flag}</span>
              <span style={{ fontWeight: 600 }}>{co.code}</span>
              <span>{co.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { state, login } = useApp();

  // steps: 'mobile' -> 'otp' -> 'verified' -> 'profile'
  const [step, setStep] = useState("mobile");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpErr, setOtpErr] = useState("");
  const [resend, setResend] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [apiErr, setApiErr] = useState("");

  // Profile step
  const [profile, setProfile] = useState({
    first_name: "", last_name: "", username: "", password: "", password_confirmation: "",
    domain: "", currency: "INR", business_address: "", city: "", state: "", pincode: "",
  });
  const [profileErr, setProfileErr] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const refs = useRef([]);

  useEffect(() => {
    if (state.user) router.replace("/dashboard/home");
  }, []);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  // ── API CALL 1: Request OTP ──
  const sendOtp = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const expectedLength = country.phoneLength || 10;
    if (cleanPhone.length !== expectedLength) {
      setPhoneErr(`Please enter a valid ${expectedLength}-digit phone number`);
      return;
    }
    setPhoneErr("");
    setApiErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ mobile: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiErr(data.message || "Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }
      setLoading(false);
      setStep("otp");
      setResend(120);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => refs.current[0]?.focus(), 80);
    } catch (e) {
      setApiErr("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  const handleOtp = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setOtpErr("");
    if (val && idx < 5) refs.current[idx + 1]?.focus();
    if (next.every((d) => d)) verifyOtp(next.join(""));
  };

  // ── API CALL 2: Register (verify OTP) ──
  const verifyOtp = async (code) => {
    setLoading(true);
    setOtpErr("");
    setApiErr("");
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ mobile: cleanPhone, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpErr(data.message || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        refs.current[0]?.focus();
        setLoading(false);
        return;
      }
      // Store temp token if API returns one for complete-profile
      if (data.access_token) {
        localStorage.setItem("zetsap_temp_token", data.access_token);
      }
      setStep("verified");
      setLoading(false);
    } catch (e) {
      setOtpErr("Network error. Please try again.");
      setLoading(false);
    }
  };

  const onTickDone = () => {
    setStep("profile");
  };

  const updateProfile = (field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setProfileErr((e) => ({ ...e, [field]: undefined }));
  };

  // ── API CALL 3: Complete Profile ──
  const completeProfile = async () => {
    const errs = {};
    if (!profile.first_name.trim()) errs.first_name = "First name is required";
    if (!profile.last_name.trim()) errs.last_name = "Last name is required";
    if (!profile.username.trim()) errs.username = "Username/Email is required";
    if (!profile.password) errs.password = "Password is required";
    if (profile.password.length < 6) errs.password = "Minimum 6 characters";
    if (profile.password !== profile.password_confirmation)
      errs.password_confirmation = "Passwords do not match";
    if (!profile.domain.trim()) errs.domain = "Business domain is required";
    if (!profile.business_address.trim()) errs.business_address = "Address is required";
    if (!profile.city.trim()) errs.city = "City is required";
    if (!profile.state.trim()) errs.state = "State is required";
    if (!profile.pincode.trim()) errs.pincode = "Pincode is required";
    if (Object.keys(errs).length) { setProfileErr(errs); return; }

    setLoading(true);
    setApiErr("");
    const tempToken = localStorage.getItem("zetsap_temp_token");
    try {
      const res = await fetch(`${API_BASE}/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(tempToken ? { Authorization: `Bearer ${tempToken}` } : {}),
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const mapped = {};
          Object.keys(data.errors).forEach(k => { mapped[k] = data.errors[k][0]; });
          setProfileErr(mapped);
        } else {
          setApiErr(data.message || "Failed to complete profile.");
        }
        setLoading(false);
        return;
      }

      // Profile complete → auto-login now to get the access token
      // PROFILE COMPLETE → auto-login now to get the access token
const cleanPhone = phoneNumber.replace(/\D/g, "");
const loginRes = await fetch(`${API_BASE}/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ mobile: cleanPhone, password: profile.password }),
});
const loginData = await loginRes.json();
if (loginRes.ok && loginData.access_token) {
  localStorage.setItem("zetsap_token", loginData.access_token);
  localStorage.setItem("zetsap_user", JSON.stringify(loginData.user));
  localStorage.setItem("zetsap_company", JSON.stringify(loginData.company));
  localStorage.setItem("zetsap_role", JSON.stringify(loginData.role)); // ✅ This is correct
  
  localStorage.removeItem("zetsap_temp_token");
  login({
    mobile: cleanPhone,
    username: profile.username,
    name: loginData.user.name,
    email: loginData.user.email,
    role: loginData.role, // ✅ role is top-level in response
    token: loginData.access_token,
    user: loginData.user,
    company: loginData.company,
  });
}
      setShowLoader(true);
    } catch (e) {
      setApiErr("Network error. Please try again.");
      setLoading(false);
    }
  };

  const onLoaderDone = () => router.replace("/dashboard/home?welcome=1");

  if (showLoader) return <Loader onDone={onLoaderDone} />;

  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 24px 64px rgba(143,25,92,0.12)",
    padding: "32px 28px",
    width: "100%",
    maxWidth: step === "profile" ? 560 : 420,
    border: "1px solid rgba(143,25,92,0.09)",
    animation: "fadeUp 0.3s ease",
    position: "relative",
  };

  const inputStyle = (hasErr) => ({
    width: "100%",
    padding: "11px 12px",
    border: `1.5px solid ${hasErr ? "#dc2626" : "#e5e7eb"}`,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "Inter,sans-serif",
    outline: "none",
    background: "#fff",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#fdf0f7 0%,#f8fafc 60%,#eff6ff 100%)",
      padding: "16px",
    }}>
      <div style={cardStyle}>
        {/* Login link top-right (only on mobile step) */}
        {step === "mobile" && (
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <a href="/login" style={{
              color: "#8f195c", fontSize: 13, fontWeight: 600,
              textDecoration: "none", fontFamily: "Inter,sans-serif",
            }}>
              Login →
            </a>
          </div>
        )}

        {/* Brand header (only on mobile + otp steps) */}
        {(step === "mobile" || step === "otp" || step === "verified") && (
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <img src="https://mindcarve.in/wp-content/uploads/2023/07/1.5X1-1.png" alt="Zetsap"
              style={{ height: 50, objectFit: "contain", display: "block", margin: "0 auto 14px" }}
              onError={(e) => (e.target.style.display = "none")} />
            <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 6 }}>
              {FACES.map((src, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: "50%", border: "2px solid #fff",
                  marginLeft: i > 0 ? -9 : 0, overflow: "hidden", flexShrink: 0,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.target.style.display = "none")} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>20 Lakh+ businesses love us</p>
            <h2 style={{ fontWeight: 700, fontSize: 20, color: "#111827" }}>Welcome!</h2>
          </div>
        )}

        {/* API error banner */}
        {apiErr && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c",
            padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14,
          }}>
            {apiErr}
          </div>
        )}

        {/* ── STEP 1: Phone number ── */}
        {step === "mobile" && (
          <div>
            <label style={{
              fontSize: 12, fontWeight: 700, color: "#374151", display: "block",
              marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              Phone Number
            </label>
            <div style={{
              display: "flex", alignItems: "center",
              border: `2px solid ${phoneErr ? "#dc2626" : "#e5e7eb"}`,
              borderRadius: 10, background: "#fff", marginBottom: 6,
            }}>
              <CountryPicker selected={country} onSelect={(c) => {
                setCountry(c); setPhoneErr(""); setPhoneNumber("");
              }} />
              <input
                style={{
                  flex: 1, border: "none", outline: "none", padding: "13px 12px",
                  fontSize: 14, fontFamily: "Inter,sans-serif", background: "transparent",
                }}
                type="tel"
                placeholder={`Enter ${country.phoneLength || 10}-digit phone number`}
                value={phoneNumber}
                autoFocus
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  const expectedLength = country.phoneLength || 10;
                  if (v.length <= expectedLength) {
                    setPhoneNumber(v);
                    setPhoneErr("");
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              />
            </div>
            {phoneErr && (
              <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 4 }}>{phoneErr}</p>
            )}
            {!phoneErr && (
              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                We'll send an OTP via WhatsApp to this number
              </p>
            )}
            <div style={{ height: 14 }} />
            <button
              style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg,#8f195c,#b52577)",
                border: "none", borderRadius: 10, color: "#fff", fontSize: 15,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Inter,sans-serif", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(143,25,92,0.35)",
                opacity: loading ? 0.75 : 1,
              }}
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? <Spinner /> : <>Send OTP via WhatsApp</>}
            </button>

            <p style={{
              fontSize: 11.5, color: "#9ca3af", textAlign: "center",
              marginTop: 14, lineHeight: 1.6,
            }}>
              By continuing you agree to our{" "}
              <a href="/terms" target="_blank" style={{ color: "#8f195c", textDecoration: "underline", fontWeight: 600 }}>Terms</a>{" "}
              &amp;{" "}
              <a href="/privacy" target="_blank" style={{ color: "#8f195c", textDecoration: "underline", fontWeight: 600 }}>Privacy Policy</a>
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === "otp" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <button onClick={() => { setStep("mobile"); setApiErr(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 22, padding: 0 }}>
                ←
              </button>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>Verify OTP</p>
                <p style={{ fontSize: 12.5, color: "#6b7280" }}>
                  Sent to {country.code}{phoneNumber} via WhatsApp
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  style={{
                    width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700,
                    border: `2px solid ${otpErr ? "#dc2626" : d ? "#8f195c" : "#e5e7eb"}`,
                    borderRadius: 10, outline: "none", fontFamily: "Inter,sans-serif", background: "#fff",
                  }}
                  value={d}
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(e) => handleOtp(e.target.value, i)}
                  onKeyDown={(e) =>
                    e.key === "Backspace" && !d && i > 0 && refs.current[i - 1]?.focus()
                  }
                />
              ))}
            </div>

            {otpErr && (
              <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 12, textAlign: "center" }}>
                {otpErr}
              </p>
            )}

            <button
              style={{
                width: "100%", padding: "12px", background: "#8f195c",
                border: "none", borderRadius: 10, color: "#fff", fontSize: 15,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Inter,sans-serif", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.75 : 1,
              }}
              onClick={() => verifyOtp(otp.join(""))}
              disabled={loading || otp.some((d) => !d)}
            >
              {loading ? <Spinner /> : "Verify & Continue"}
            </button>

            <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#6b7280" }}>
              {resend > 0 ? (
                <span>Resend in <strong style={{ color: "#8f195c" }}>{resend}s</strong></span>
              ) : (
                <button onClick={sendOtp}
                  style={{
                    background: "none", border: "none", color: "#8f195c",
                    fontWeight: 700, cursor: "pointer", fontSize: 13,
                    fontFamily: "Inter,sans-serif",
                  }}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Verified tick ── */}
        {step === "verified" && (
          <SuccessTick onDone={onTickDone} message="Phone Verified!" sub="Let's set up your profile…" />
        )}

        {/* ── STEP 4: Complete Profile ── */}
        {step === "profile" && (
          <div>
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: "#111827", marginBottom: 4 }}>
                Complete Your Profile
              </h2>
              <p style={{ color: "#6b7280", fontSize: 13 }}>
                Just a few details to set up your business
              </p>
            </div>

            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={inputStyle(profileErr.first_name)} value={profile.first_name}
                  onChange={(e) => updateProfile("first_name", e.target.value)} placeholder="Vasanth" />
                {profileErr.first_name && <p style={errMsgStyle}>{profileErr.first_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input style={inputStyle(profileErr.last_name)} value={profile.last_name}
                  onChange={(e) => updateProfile("last_name", e.target.value)} placeholder="Mindcarve" />
                {profileErr.last_name && <p style={errMsgStyle}>{profileErr.last_name}</p>}
              </div>
            </div>

            {/* Username / email */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Username (Email) *</label>
              <input style={inputStyle(profileErr.username)} value={profile.username}
                onChange={(e) => updateProfile("username", e.target.value)}
                placeholder="you@business.in" type="email" />
              {profileErr.username && <p style={errMsgStyle}>{profileErr.username}</p>}
            </div>

            {/* Password row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...inputStyle(profileErr.password), paddingRight: 38 }}
                    type={showPw ? "text" : "password"} value={profile.password}
                    onChange={(e) => updateProfile("password", e.target.value)} placeholder="••••••" />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    style={eyeBtnStyle}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {profileErr.password && <p style={errMsgStyle}>{profileErr.password}</p>}
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...inputStyle(profileErr.password_confirmation), paddingRight: 38 }}
                    type={showPw2 ? "text" : "password"} value={profile.password_confirmation}
                    onChange={(e) => updateProfile("password_confirmation", e.target.value)} placeholder="••••••" />
                  <button type="button" onClick={() => setShowPw2((p) => !p)}
                    style={eyeBtnStyle}>
                    {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {profileErr.password_confirmation && <p style={errMsgStyle}>{profileErr.password_confirmation}</p>}
              </div>
            </div>

            {/* Domain & currency */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Business Domain *</label>
                <input style={inputStyle(profileErr.domain)} value={profile.domain}
                  onChange={(e) => updateProfile("domain", e.target.value.toLowerCase().replace(/\s/g, ""))}
                  placeholder="yourbusiness" />
                {profileErr.domain && <p style={errMsgStyle}>{profileErr.domain}</p>}
              </div>
              <div>
                <label style={labelStyle}>Currency *</label>
                <select style={inputStyle(false)} value={profile.currency}
                  onChange={(e) => updateProfile("currency", e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Business Address *</label>
              <input style={inputStyle(profileErr.business_address)} value={profile.business_address}
                onChange={(e) => updateProfile("business_address", e.target.value)}
                placeholder="Street address, area..." />
              {profileErr.business_address && <p style={errMsgStyle}>{profileErr.business_address}</p>}
            </div>

            {/* City / State / Pincode */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input style={inputStyle(profileErr.city)} value={profile.city}
                  onChange={(e) => updateProfile("city", e.target.value)} placeholder="Chennai" />
                {profileErr.city && <p style={errMsgStyle}>{profileErr.city}</p>}
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <input style={inputStyle(profileErr.state)} value={profile.state}
                  onChange={(e) => updateProfile("state", e.target.value)} placeholder="Tamil Nadu" />
                {profileErr.state && <p style={errMsgStyle}>{profileErr.state}</p>}
              </div>
              <div>
                <label style={labelStyle}>Pincode *</label>
                <input style={inputStyle(profileErr.pincode)} value={profile.pincode}
                  onChange={(e) => updateProfile("pincode", e.target.value.replace(/\D/g, ""))}
                  placeholder="600001" maxLength={6} />
                {profileErr.pincode && <p style={errMsgStyle}>{profileErr.pincode}</p>}
              </div>
            </div>

            <button
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg,#8f195c,#b52577)",
                border: "none", borderRadius: 10, color: "#fff", fontSize: 15,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Inter,sans-serif", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(143,25,92,0.35)",
                opacity: loading ? 0.75 : 1,
              }}
              onClick={completeProfile}
              disabled={loading}
            >
              {loading ? <Spinner /> : "Complete Setup →"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:scale(0.5)}40%{transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes drawCircle{to{stroke-dashoffset:0}}
        @keyframes drawTick{to{stroke-dashoffset:0}}
        @media(max-width:600px){
          div[style*="maxWidth:560px"]{padding:20px 16px!important;}
          input,select{font-size:16px!important;}
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "#374151",
  display: "block", marginBottom: 5,
};
const errMsgStyle = { color: "#dc2626", fontSize: 11, marginTop: 3 };
const eyeBtnStyle = {
  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex",
};