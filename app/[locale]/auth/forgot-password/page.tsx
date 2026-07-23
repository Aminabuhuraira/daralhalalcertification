"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#ffffff", borderRadius: 20, border: "1px solid rgba(10,21,53,0.08)", boxShadow: "0 8px 40px rgba(10,21,53,0.08)", padding: "44px 40px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div className="icon-badge-sm"><ShieldCheck size={18} color="#0A1535" /></div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "#0A1535" }}>Dar Al Halal</span>
        </div>

        {submitted ? (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Mail size={22} color="#C9A227" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#0A1535", marginBottom: 10 }}>Check your inbox</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.7)", lineHeight: 1.7, marginBottom: 28 }}>
              If an account exists for <strong>{email}</strong>, our support team will send password reset instructions within 24 hours.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.66)", marginBottom: 24 }}>
              Alternatively, email us directly at{" "}
              <a href="mailto:support@daralhalalcertification.com" style={{ color: "#C9A227" }}>
                support@daralhalalcertification.com
              </a>
            </p>
            <Link href="/en/auth/login" style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.68)", textDecoration: "none" }}>
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "#0A1535", marginBottom: 8 }}>Reset password</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)", lineHeight: 1.65, marginBottom: 28 }}>
              Enter your account email and we'll send you reset instructions.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#0A1535", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "11px 14px", borderRadius: 8,
                    border: "1.5px solid rgba(10,21,53,0.15)",
                    fontFamily: "var(--font-body)", fontSize: 14,
                    color: "#0A1535", background: "#fafafa", outline: "none",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C9A227")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(10,21,53,0.15)")}
                />
              </div>

              {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#EF4444", margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: 14, padding: "12px", width: "100%", marginTop: 4, opacity: loading ? 0.6 : 1 }}>
                {loading ? "Sending…" : "Send Reset Instructions"}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Link href="/en/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.66)", textDecoration: "none" }}>
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
