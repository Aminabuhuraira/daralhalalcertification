"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Target, Eye, Award, Users, MapPin, CheckCircle } from "lucide-react";

const TEAM = [
  { name: "Malam Ibrahim Al-Amin", role: "Director General", initials: "IA", bg: "#1B2A7B" },
  { name: "Dr. Fatima Nura", role: "Head of Certification", initials: "FN", bg: "#4B2D7F" },
  { name: "Engr. Suleiman Bello", role: "Chief Audit Officer", initials: "SB", bg: "#0D1B47" },
  { name: "Hajiya Khadija Musa", role: "Director, Standards", initials: "KM", bg: "#1B2A7B" },
];

const TIMELINE = [
  { year: "2018", title: "Foundation", desc: "Dar Al Halal Certification established in Abuja by a coalition of halal scholars and food scientists." },
  { year: "2019", title: "First Certifications", desc: "Issued first 50 halal certificates to Nigerian food manufacturers. Joined SMIIC observer membership." },
  { year: "2020", title: "National Recognition", desc: "Recognized by NAFDAC as an approved halal certification body. Expanded to 6 states." },
  { year: "2022", title: "African Expansion", desc: "Established partnerships with certification bodies in Ghana, Kenya, and Egypt. 500+ certified products." },
  { year: "2024", title: "Digital Platform", desc: "Launched DARI AI platform and blockchain-based certificate verification. 2,400+ active certifications." },
];

const fin = (delay: number) => ({ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } });

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="section-dark cyber-grid" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 600, height: 600, top: -200, right: -200, opacity: 0.4 }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 20 }}>Our Story</motion.p>
            <motion.h1 {...fin(0.15)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,68px)", fontWeight: 300, color: "white", marginBottom: 20, maxWidth: 700, lineHeight: 1.1 }}>
              Building the World's Most<br /><span className="text-gold-shimmer">Trusted Halal Authority</span>
            </motion.h1>
            <motion.p {...fin(0.3)} style={{ fontFamily: "var(--font-body)", fontSize: 17, color: "rgba(255,255,255,0.6)", maxWidth: 580, lineHeight: 1.75 }}>
              From Abuja, Nigeria, to the world — one halal certification at a time. We verify quality standards that connect Nigerian businesses to global markets.
            </motion.p>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom, transparent, var(--bg-light))", zIndex: 2, pointerEvents: "none" }} />
        </section>

        {/* Mission + Vision */}
        <section style={{ padding: "100px 0", background: "var(--bg-light)" }}>
          <div className="section-container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              {[
                { icon: Target, title: "Our Mission", text: "To be Nigeria's foremost halal certification authority, providing rigorous, credible, and globally recognized halal certification services that empower businesses to access international markets while upholding the highest standards of quality and compliance." },
                { icon: Eye, title: "Our Vision", text: "A world where every consumer has transparent access to certified halal products, and every business — regardless of faith background — can access the $3 trillion halal economy through trusted quality certification." },
              ].map(({ icon: Icon, title, text }, i) => (
                <motion.div key={title} {...fin(i * 0.15)} style={{ padding: 40, background: "var(--bg-dark)", borderRadius: 20, border: "1px solid rgba(201,162,39,0.15)", position: "relative", overflow: "hidden" }}>
                  <div className="glow-orb glow-orb-navy" style={{ width: 200, height: 200, top: -80, right: -80, opacity: 0.5 }} />
                  <div className="icon-badge-lg" style={{ marginBottom: 24 }}>
                    <Icon size={26} color="var(--gold-300)" />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "white", marginBottom: 14 }}>{title}</h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>{text}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 32 }}>
              {[["2,400+","Certified Products"],["54","African Markets"],["12","Industry Sectors"],["2018","Established"]].map(([val, label], i) => (
                <motion.div key={label} {...fin(0.1 * i)} style={{ padding: "28px 24px", background: "var(--bg-surface)", border: "1px solid rgba(27,42,123,0.1)", borderRadius: 14, textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: 32, fontWeight: 700, color: "var(--navy-700)", marginBottom: 6 }}>{val}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ padding: "80px 0", background: "var(--bg-surface)" }}>
          <div className="section-container">
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 12, textAlign: "center" }}>Leadership</motion.p>
            <motion.h2 {...fin(0.1)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 300, textAlign: "center", marginBottom: 56, color: "var(--text-primary)" }}>Our Leadership Team</motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {TEAM.map((m, i) => (
                <motion.div key={m.name} {...fin(i * 0.1)} style={{ padding: 28, background: "var(--bg-light)", border: "1px solid rgba(27,42,123,0.08)", borderRadius: 16, textAlign: "center", transition: "all 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,162,39,0.3)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(201,162,39,0.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,42,123,0.08)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: m.bg, border: "2px solid var(--gold-500)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 16px var(--gold-glow)" }}>
                    <span style={{ fontFamily: "var(--font-accent)", fontSize: 18, color: "var(--gold-300)", fontWeight: 700 }}>{m.initials}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{m.role}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ padding: "80px 0", background: "var(--bg-dark)" }}>
          <div className="section-container">
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 12, textAlign: "center" }}>Our Journey</motion.p>
            <motion.h2 {...fin(0.1)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 300, color: "white", textAlign: "center", marginBottom: 64 }}>A Decade of Halal Excellence</motion.h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 680, margin: "0 auto" }}>
              {TIMELINE.map((item, i) => (
                <motion.div key={item.year} {...fin(i * 0.1)} style={{ display: "flex", gap: 24, paddingBottom: 40, position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div className="icon-badge-circle" style={{ width: 48, height: 48, flexShrink: 0 }}>
                      <span style={{ fontFamily: "var(--font-accent)", fontSize: 11, color: "var(--gold-300)", fontWeight: 700 }}>{item.year}</span>
                    </div>
                    {i < TIMELINE.length - 1 && <div style={{ width: 1, flex: 1, background: "linear-gradient(to bottom, rgba(201,162,39,0.3), transparent)", marginTop: 8 }} />}
                  </div>
                  <div style={{ paddingTop: 12 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "white", marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
