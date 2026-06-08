
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

const SECTORS = [
  { name: "Food & Beverage", size: "$1.4T", growth: "+6.3%", markets: 57, emoji: "🍔" },
  { name: "Modest Fashion", size: "$277B", growth: "+4.8%", markets: 35, emoji: "👗" },
  { name: "Pharmaceuticals", size: "$109B", growth: "+5.2%", markets: 42, emoji: "💊" },
  { name: "Cosmetics", size: "$82B", growth: "+7.1%", markets: 38, emoji: "💄" },
  { name: "Halal Finance", size: "$3.6T", growth: "+9.4%", markets: 49, emoji: "💰" },
  { name: "Travel & Tourism", size: "$189B", growth: "+8.2%", markets: 30, emoji: "✈️" },
];

const NIGERIA_STATS = [
  { label: "Halal Consumers", value: 95, suffix: "M", desc: "Africa's largest halal market" },
  { label: "Annual Halal Market", value: 22, suffix: "B+", prefix: "$", desc: "Estimated 2025 market value" },
  { label: "Untapped Opportunity", value: 78, suffix: "%", desc: "Products still uncertified" },
  { label: "Export Premium", value: 35, suffix: "%", desc: "Average price uplift for certified products" },
];

export default function HalalMarketDataPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "80px 0 60px", background: "var(--bg-surface)", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 450, height: 450, top: -100, right: -100, opacity: 0.14 }} />
          <div className="pattern-overlay" />
          <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
              Market Intelligence
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,54px)", fontWeight: 300, marginBottom: 20, color: "#4C1D95" }}>
              Halal Economy Intelligence Hub
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 540, margin: "0 auto" }}>
              Data-driven insights into the global halal economy, Nigeria's market opportunity, and sector-by-sector intelligence.
            </motion.p>
          </div>
        </section>

        {/* Nigeria Stats */}
        <section ref={ref} style={{ padding: "80px 0", background: "var(--color-surface)" }}>
          <div className="section-container">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, marginBottom: 48, textAlign: "center" }}>
              Nigeria: The Halal Opportunity
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 80 }} className="stats-grid">
              {NIGERIA_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card"
                  style={{ padding: "32px 24px", textAlign: "center" }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600, color: "var(--color-text-gold)", lineHeight: 1, marginBottom: 8 }}>
                    {inView ? (
                      <>{stat.prefix || ""}<CountUp end={stat.value} duration={2.5} />{stat.suffix}</>
                    ) : (
                      <>{stat.prefix || ""}0{stat.suffix}</>
                    )}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>{stat.desc}</div>
                </motion.div>
              ))}
            </div>

            {/* Sectors */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, marginBottom: 36, textAlign: "center" }}>
              Global Sector Intelligence
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="sectors-data-grid">
              {SECTORS.map((sector, i) => (
                <motion.div
                  key={sector.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass-card"
                  style={{ padding: "28px 24px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 32 }}>{sector.emoji}</span>
                    <h3 style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700 }}>{sector.name}</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[["Market Size", sector.size, "var(--color-text-gold)"], ["YoY Growth", sector.growth, "#16a34a"], ["Markets", `${sector.markets}`, "var(--color-text-purple)"]].map(([label, value, color]) => (
                      <div key={label} style={{ textAlign: "center", padding: "10px 6px", background: "var(--color-surface)", borderRadius: 8 }}>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700, color }}>{value}</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              style={{ marginTop: 80, background: "var(--gradient-certification)", borderRadius: 24, padding: "48px", textAlign: "center" }}
            >
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, marginBottom: 16 }}>
                Download Nigeria Halal Opportunity Report
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
                Full market analysis, export opportunities, revenue calculator, and step-by-step certification guide. Free with account registration.
              </p>
              <button style={{ padding: "14px 36px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 50, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, boxShadow: "0 4px 20px rgba(219,168,32,0.3)" }}>
                Download Free Report →
              </button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .stats-grid, .sectors-data-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .stats-grid, .sectors-data-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
