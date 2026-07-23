"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";

const fin = (delay: number) => ({ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } });

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(201,162,39,0.2)",
  borderRadius: 8,
  fontFamily: "var(--font-body)", fontSize: 14, color: "white",
  outline: "none", transition: "border-color 0.2s",
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, inquiry: inquiry || undefined, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="section-hero-light dot-pattern" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 420, height: 420, top: -120, right: -120, opacity: 0.14 }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 16 }}>Get In Touch</motion.p>
            <motion.h1 {...fin(0.15)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, color: "#4C1D95", marginBottom: 16, lineHeight: 1.1 }}>
              Start Your <span className="text-gold-shimmer">Certification Journey</span>
            </motion.h1>
            <motion.p {...fin(0.3)} style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(10,21,53,0.72)", maxWidth: 520, lineHeight: 1.75 }}>
              Our certification team is ready to assess your business and guide you through the process.
            </motion.p>
          </div>
        </section>

        <section style={{ padding: "80px 0", background: "var(--bg-light)" }}>
          <div className="section-container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 48 }}>
              {/* Info */}
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, color: "var(--text-primary)", marginBottom: 32 }}>Office Information</h2>
                {[
                  { icon: MapPin, label: "Address", value: "14 Oguda Close, Maitama, Abuja, Nigeria" },
                  { icon: Phone, label: "Phone", value: "+234 806 333 4296" },
                  { icon: Mail, label: "Email", value: "info@daralhalalcertification.com" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri: 8am-5pm WAT" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                    <div className="icon-badge" style={{ width: 44, height: 44, flexShrink: 0 }}>
                      <Icon size={18} color="var(--gold-300)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div style={{ padding: "40px", background: "var(--bg-dark)", borderRadius: 20, border: "1px solid rgba(201,162,39,0.15)", boxShadow: "0 16px 48px rgba(13,27,71,0.2)" }}>
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "40px 0" }}>
                    <div className="icon-badge-lg" style={{ margin: "0 auto 20px" }}><CheckCircle size={28} color="var(--gold-300)" /></div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "white", marginBottom: 10 }}>Message Sent!</h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>We will respond within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "white", marginBottom: 28 }}>Send Us a Message</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <input required value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your Name" onFocus={e => (e.target.style.borderColor = "var(--gold-400)")} onBlur={e => (e.target.style.borderColor = "rgba(201,162,39,0.2)")} />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="Email Address" onFocus={e => (e.target.style.borderColor = "var(--gold-400)")} onBlur={e => (e.target.style.borderColor = "rgba(201,162,39,0.2)")} />
                    </div>
                    <select value={inquiry} onChange={e => setInquiry(e.target.value)} style={{ ...inputStyle, marginBottom: 16, cursor: "pointer" }} onFocus={e => (e.target.style.borderColor = "var(--gold-400)")} onBlur={e => (e.target.style.borderColor = "rgba(201,162,39,0.2)")}>
                      <option value="">Inquiry Type</option>
                      <option>New Certification</option>
                      <option>Certificate Renewal</option>
                      <option>General Question</option>
                      <option>Partnership</option>
                    </select>
                    <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)} style={{ ...inputStyle, marginBottom: 20, resize: "vertical" }} placeholder="Your message..." onFocus={e => (e.target.style.borderColor = "var(--gold-400)")} onBlur={e => (e.target.style.borderColor = "rgba(201,162,39,0.2)")} />
                    {error && <p style={{ color: "#f87171", fontSize: 13, fontFamily: "var(--font-body)", marginBottom: 16 }}>{error}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", justifyContent: "center", border: "1.5px solid var(--gold-500)", opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
                      <Send size={15} /> {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
