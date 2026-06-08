"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [show, setShow] = useState(false);

  const inputStyle: React.CSSProperties = {
    flex: 1, background: "transparent", border: "none", outline: "none",
    fontFamily: "var(--font-body)", fontSize: 14, color: "white", padding: "12px 0",
  };
  const wrap: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: 8, padding: "0 14px", transition: "border-color 0.2s",
  };

  return (
    <div className="section-dark cyber-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="glow-orb glow-orb-purple" style={{ width: 500, height: 500, top: -150, left: -150, opacity: 0.4 }} />
      <div className="glow-orb glow-orb-gold" style={{ width: 300, height: 300, bottom: -100, right: -100, opacity: 0.2 }} />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        style={{ width: "100%", maxWidth: 440, background: "rgba(13,27,71,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 24, padding: "48px 40px", boxShadow: "0 32px 80px rgba(0,0,0,0.4)", position: "relative", zIndex: 1 }}
      >
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="icon-badge-lg" style={{ margin: "0 auto 20px" }}><Shield size={28} color="var(--gold-300)" /></div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, color: "white", marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Sign in to your certification portal</p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={wrap}
            onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--gold-400)")}
            onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.2)")}
          >
            <Mail size={16} color="rgba(255,255,255,0.3)" />
            <input type="email" placeholder="Email address" style={inputStyle} />
          </div>
          <div
            style={wrap}
            onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--gold-400)")}
            onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.2)")}
          >
            <Lock size={16} color="rgba(255,255,255,0.3)" />
            <input type={show ? "text" : "password"} placeholder="Password" style={inputStyle} />
            <button type="button" onClick={() => setShow(!show)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center" }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ textAlign: "right", marginTop: -4 }}>
            <Link href="#" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--gold-500)", textDecoration: "none" }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, border: "1.5px solid var(--gold-500)" }}>
            Sign In <ArrowRight size={15} />
          </button>
        </form>

        <div className="divider-gold" style={{ margin: "28px 0" }} />

        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
          New to Dar Al Halal?{" "}
          <Link href={`/${locale}/auth/register`} style={{ color: "var(--gold-300)", textDecoration: "none", fontWeight: 600 }}>Create account</Link>
        </p>
      </motion.div>
    </div>
  );
}
