
"use client";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff, Building2, BookOpen, Search, Users } from "lucide-react";

const STEPS = ["Account Type", "Business Info", "Profile", "Confirm"];

const ACCOUNT_TYPES = [
  { id: "business", icon: Building2, title: "Business", desc: "Certify my products/services", color: "var(--color-gold-400)" },
  { id: "student", icon: BookOpen, title: "Student", desc: "Learn halal standards", color: "var(--color-purple-500)" },
  { id: "consumer", icon: Search, title: "Consumer", desc: "Verify halal products", color: "var(--color-silver-500)" },
  { id: "partner", icon: Users, title: "Partner", desc: "Certification body or trade org", color: "var(--color-gold-600)" },
];

const SECTORS = ["Food & Beverage", "Cosmetics & Beauty", "Pharmaceuticals", "Hospitality", "Logistics", "Manufacturing", "Fashion & Textiles", "Finance", "Agriculture", "Healthcare", "Education", "Other"];

export default function RegisterPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ accountType: "", businessName: "", sector: "", state: "", phone: "", fullName: "", email: "", password: "", confirmPassword: "", newsletter: false, updates: true });

  const inputStyle = { width: "100%", padding: "12px 16px", border: "1.5px solid var(--color-border)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)", background: "white", outline: "none", transition: "border-color 0.3s" };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = "var(--color-gold-300)");
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = "var(--color-border)");

  const canNext = () => {
    if (step === 0) return !!form.accountType;
    if (step === 1) return !!(form.businessName && form.sector);
    if (step === 2) return !!(form.fullName && form.email && form.password && form.password === form.confirmPassword);
    return true;
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--gradient-hero)" }}>
        <div className="glow-orb glow-orb-purple" style={{ width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)" }} />
        <div className="pattern-overlay" style={{ position: "fixed" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, padding: "60px 24px 100px" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 48 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: i <= step ? "linear-gradient(135deg,#F5C842,#B8890A)" : "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                  {i < step ? <Check size={14} color="white" /> : <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: i <= step ? "white" : "var(--color-text-muted)" }}>{i + 1}</span>}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: i === step ? "var(--color-text-gold)" : "var(--color-text-muted)", fontWeight: i === step ? 700 : 400, display: i === 3 ? "inline" : "none" }}>{s}</span>
                {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? "var(--gradient-gold)" : "var(--color-border)", borderRadius: 1 }} />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card"
            style={{ maxWidth: 560, margin: "0 auto", padding: "44px 40px" }}
          >
            {step === 0 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Choose Account Type</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Select how you plan to use the platform</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {ACCOUNT_TYPES.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setForm(p => ({...p, accountType: type.id}))}
                      style={{ padding: "20px 16px", border: `2px solid ${form.accountType === type.id ? type.color : "var(--color-border)"}`, borderRadius: 14, cursor: "pointer", textAlign: "center", transition: "all 0.2s", background: form.accountType === type.id ? type.color + "12" : "white" }}
                    >
                      <type.icon size={24} color={form.accountType === type.id ? type.color : "var(--color-text-muted)"} style={{ margin: "0 auto 10px" }} />
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{type.title}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-muted)" }}>{type.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Business Information</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Tell us about your business</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[["Business Name", "businessName", "text", "Your registered business name"], ["Phone Number", "phone", "tel", "+234 xxx xxx xxxx"]].map(([label, key, type, placeholder]) => (
                    <div key={key}>
                      <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>{label}</label>
                      <input type={type} style={inputStyle} value={(form as unknown as Record<string, string>)[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} onFocus={focus} onBlur={blur} placeholder={placeholder} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Business Sector</label>
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.sector} onChange={e => setForm(p => ({...p, sector: e.target.value}))} onFocus={focus} onBlur={blur}>
                      <option value="">Select sector</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Personal Profile</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Create your login credentials</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Full Name</label>
                    <input style={inputStyle} value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} onFocus={focus} onBlur={blur} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Email Address</label>
                    <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} onFocus={focus} onBlur={blur} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} style={{ ...inputStyle, paddingRight: 46 }} value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} onFocus={focus} onBlur={blur} placeholder="Create a strong password" />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Confirm Password</label>
                    <input type="password" style={{ ...inputStyle, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "#ef4444" : "var(--color-border)" }} value={form.confirmPassword} onChange={e => setForm(p => ({...p, confirmPassword: e.target.value}))} onFocus={focus} placeholder="Confirm your password" />
                    {form.confirmPassword && form.password !== form.confirmPassword && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-body)" }}>Passwords do not match</p>}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Review & Confirm</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Confirm your details before creating your account</p>
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "24px", marginBottom: 24 }}>
                  {[["Account Type", form.accountType], ["Business", form.businessName || "N/A"], ["Sector", form.sector || "N/A"], ["Name", form.fullName], ["Email", form.email]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)" }}>{l}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", textTransform: "capitalize" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input type="checkbox" id="terms" required style={{ marginTop: 2, accentColor: "var(--color-gold-400)" }} />
                  <label htmlFor="terms" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    I agree to the <Link href="#" style={{ color: "var(--color-text-gold)" }}>Terms of Service</Link> and <Link href="#" style={{ color: "var(--color-text-gold)" }}>Privacy Policy</Link>
                  </label>
                </div>
              </>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "13px", background: "none", border: "1.5px solid var(--color-border)", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <button
                onClick={() => step < 3 ? setStep(s => s + 1) : undefined}
                disabled={!canNext()}
                style={{ flex: 2, padding: "13px", background: canNext() ? "linear-gradient(135deg,#F5C842,#B8890A)" : "var(--color-border)", color: "white", border: "none", borderRadius: 12, cursor: canNext() ? "pointer" : "not-allowed", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: canNext() ? "0 4px 16px rgba(219,168,32,0.3)" : "none" }}
              >
                {step === 3 ? "Create My Account" : "Continue"} <ArrowRight size={16} />
              </button>
            </div>

            {step === 0 && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)", textAlign: "center", marginTop: 20 }}>
                Already have an account? <Link href={`/${locale}/auth/login`} style={{ color: "var(--color-text-gold)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
