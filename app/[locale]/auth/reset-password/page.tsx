"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

function ResetForm() {
  const params = useSearchParams();
  const token  = params.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;
  const weak     = password.length > 0 && password.length < 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm || password.length < 8) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setDone(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  if (!token) return (
    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#EF4444" }}>
      Invalid reset link. Please request a new one.
    </p>
  );

  if (done) return (
    <div>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <CheckCircle2 size={24} color="#22C55E" />
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#0A1535", marginBottom: 10 }}>Password updated</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.7)", marginBottom: 28 }}>
        Your password has been reset successfully. You can now sign in with your new password.
      </p>
      <Link href="/en/auth/login" className="btn-primary" style={{ fontSize: 14, padding: "12px 24px", display: "inline-block" }}>
        Sign In
      </Link>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "#0A1535", marginBottom: 8 }}>Set new password</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)", marginBottom: 28 }}>
        Choose a strong password with at least 8 characters.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { label: "New Password", value: password, setter: setPassword },
          { label: "Confirm Password", value: confirm, setter: setConfirm },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#0A1535", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={value}
                onChange={e => setter(e.target.value)}
                required
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 42px 11px 14px", borderRadius: 8, border: "1.5px solid rgba(10,21,53,0.15)", fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", background: "#fafafa", outline: "none" }}
              />
              {label === "New Password" && (
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {showPw ? <EyeOff size={16} color="rgba(10,21,53,0.4)" /> : <Eye size={16} color="rgba(10,21,53,0.4)" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {weak && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#F59E0B", margin: 0 }}>Password must be at least 8 characters.</p>}
        {mismatch && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#EF4444", margin: 0 }}>Passwords do not match.</p>}
        {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#EF4444", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading || mismatch || weak || !password} className="btn-primary" style={{ fontSize: 14, padding: "12px", width: "100%", marginTop: 4, opacity: (mismatch || weak || !password) ? 0.5 : 1 }}>
          {loading ? "Updating…" : "Set New Password"}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link href="/en/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.66)", textDecoration: "none" }}>
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#ffffff", borderRadius: 20, border: "1px solid rgba(10,21,53,0.08)", boxShadow: "0 8px 40px rgba(10,21,53,0.08)", padding: "44px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div className="icon-badge-sm"><ShieldCheck size={18} color="#0A1535" /></div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "#0A1535" }}>Dar Al Halal</span>
        </div>
        <Suspense fallback={<p style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
