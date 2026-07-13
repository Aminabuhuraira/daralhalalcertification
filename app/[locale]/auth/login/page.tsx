"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const HIGHLIGHTS = [
  "Internationally recognised halal certification",
  "Step-by-step guided application process",
  "Expert auditors with fast turnaround",
];

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }
    const callbackUrl = searchParams?.get("callbackUrl");
    router.push(callbackUrl || `/${locale}/dashboard`);
  };

  return (
    <>
      <style>{`
        .login-root { display: flex; min-height: 100vh; background: #ffffff; font-family: var(--font-body); }
        .login-info  { flex: 0 0 52%; display: flex; flex-direction: column; justify-content: center; padding: 72px 64px; background: #f8f7f4; border-right: 1px solid #ede9e0; }
        .login-form-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 72px 48px; background: #fff; }
        @media (max-width: 768px) {
          .login-info { display: none; }
          .login-form-col { padding: 48px 28px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── LEFT: information panel ── */}
        <div className="login-info">
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
            <Shield size={20} color="#C9A227" />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: "#1a1a1a" }}>
              DAR AL-HALAL
            </span>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 300, color: "#111", lineHeight: 1.25, marginBottom: 18 }}>
              Your trusted<br />
              <span style={{ color: "#C9A227" }}>halal certification</span><br />
              partner.
            </h1>
            <p style={{ fontSize: 15, color: "#777", lineHeight: 1.75, maxWidth: 360 }}>
              Access your portal to track applications, complete training, and manage every step of your halal certification journey.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {HIGHLIGHTS.map(text => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 size={16} color="#C9A227" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Bottom gold accent */}
          <div style={{ marginTop: "auto", paddingTop: 56 }}>
            <div style={{ width: 36, height: 2, background: "#C9A227", borderRadius: 2 }} />
          </div>
        </div>

        {/* ── RIGHT: login form ── */}
        <div className="login-form-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ width: "100%", maxWidth: 380 }}
          >
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "#111", marginBottom: 6 }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 14, color: "#999" }}>Sign in to your account to continue.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FocusField icon={<Mail size={15} color="#bbb" />}>
                <input
                  type="email" required placeholder="Email address"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </FocusField>

              <FocusField icon={<Lock size={15} color="#bbb" />}>
                <input
                  type={show ? "text" : "password"} required placeholder="Password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button" onClick={() => setShow(s => !s)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", display: "flex", alignItems: "center", padding: 0 }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </FocusField>

              <div style={{ textAlign: "right", marginTop: -2 }}>
                <Link href="forgot-password" style={{ fontSize: 12, color: "#C9A227", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "#dc2626", textAlign: "center", margin: "0" }}>{error}</p>
              )}

              <button
                type="submit" disabled={submitting}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 6, padding: "13px 24px",
                  background: "#C9A227", color: "#fff",
                  border: "none", borderRadius: 8,
                  fontSize: 14, fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1, transition: "opacity 0.2s, transform 0.15s",
                }}
                onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                {submitting
                  ? <Loader2 size={15} style={{ animation: "rotateSeal 1s linear infinite" }} />
                  : <>Sign In <ArrowRight size={14} /></>}
              </button>
            </form>

            <div style={{ margin: "28px 0", height: 1, background: "#f0f0f0" }} />

            <p style={{ fontSize: 13, color: "#aaa", textAlign: "center" }}>
              New to Dar Al Halal?{" "}
              <Link href={`/${locale}/auth/register`} style={{ color: "#C9A227", fontWeight: 600, textDecoration: "none" }}>
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, border: "none", outline: "none",
  fontSize: 14, color: "#111", background: "transparent",
  padding: "12px 0", fontFamily: "var(--font-body)",
};

function FocusField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        border: `1px solid ${focused ? "#C9A227" : "#e5e5e5"}`,
        borderRadius: 8, padding: "0 14px",
        background: "#fafafa", transition: "border-color 0.2s",
      }}
    >
      {icon}
      {children}
    </div>
  );
}
