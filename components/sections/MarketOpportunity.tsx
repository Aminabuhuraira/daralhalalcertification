"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import LampHeader from "@/components/ui/LampHeader";
import AfricaMap from "@/components/ui/AfricaMap";

const STATS = [
  { value: 3, suffix: "T", prefix: "$", label: "Global Halal Economy" },
  { value: 95, suffix: "M", prefix: "", label: "Nigerian Halal Consumers" },
  { value: 400, suffix: "M+", prefix: "", label: "African Halal Consumers" },
  { value: 57, suffix: "", prefix: "", label: "Global Partner Countries" },
  { value: 30, suffix: "%", prefix: "+", label: "Export Revenue Uplift" },
];

export default function MarketOpportunity() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} style={{ padding: "120px 0", background: "#F5F7FA", position: "relative", overflow: "hidden" }} className="market-section">
      <div className="dot-pattern" style={{ position: "absolute", inset: 0 }} />
      {/* Purple accent shapes */}
      <svg width={120} height={120} style={{ position: "absolute", top: 40, right: 60, opacity: 0.18, pointerEvents: "none", zIndex: 0 }}>
        <polygon points="60,0 120,104 0,104" fill="#6D28D9" />
      </svg>
      <svg width={60} height={60} style={{ position: "absolute", bottom: 60, left: 40, opacity: 0.14, pointerEvents: "none", zIndex: 0 }}>
        <polygon points="30,0 60,52 0,52" fill="none" stroke="#6D28D9" strokeWidth={2} />
      </svg>

      <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
        <LampHeader eyebrow="Market Intelligence" light>
          Nigeria.{" "}The Hub.{" "}The <span className="text-gold-shimmer">Opportunity.</span>
        </LampHeader>

        {/* ── Main grid: text left, Africa map right ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center", marginTop: 20 }} className="market-grid">

          {/* Left — copy */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(10,21,53,0.65)", lineHeight: 1.85, marginBottom: 24, textAlign: "justify" as const }}
            >
              {"Nigeria commands "}<strong style={{ color: "#0A1535" }}>Africa's largest halal market</strong>{" \u2014 95 million halal consumers and the continent's most connected trade economy. Nigerian certification is the recognised gateway for halal products reaching 400+ million consumers across Africa."}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.45, duration: 0.7 }}
              style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(10,21,53,0.65)", lineHeight: 1.85, marginBottom: 32, textAlign: "justify" as const }}
            >
              {"Businesses certified by Dar Al Halal don't just sell locally \u2014 they gain access to a "}<strong style={{ color: "#0A1535" }}>$7.7 trillion global halal economy</strong>{" spanning food, cosmetics, pharmaceuticals, finance, and logistics."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{
                background: "rgba(109,40,217,0.04)",
                borderLeft: "3px solid #6D28D9",
                borderRadius: "0 10px 10px 0",
                padding: "18px 24px",
                border: "1px solid rgba(109,40,217,0.12)",
                borderLeftColor: "#6D28D9",
                borderLeftWidth: 3,
              }}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "rgba(10,21,53,0.55)", lineHeight: 1.75, fontStyle: "italic", textAlign: "justify" }}>
                "Certified businesses in Nigeria report 30-45% increase in export revenue within 12 months of halal certification."
              </p>
            </motion.div>
          </div>

          {/* Right — Africa Map */}
          <motion.div
            className="market-map"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <AfricaMap />
          </motion.div>
        </div>

        {/* ── Stat cards strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginTop: 56 }} className="stats-strip">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.5 }}
              style={{
                padding: "24px 16px", textAlign: "center",
                background: "#FFFFFF",
                border: "1px solid rgba(10,21,53,0.08)",
                borderRadius: 14,
                boxShadow: "0 2px 16px rgba(10,21,53,0.06)",
                transition: "all 0.3s",
              }}
              whileHover={{ borderColor: "rgba(109,40,217,0.3)", boxShadow: "0 4px 24px rgba(109,40,217,0.08)" }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: "#0A1535", lineHeight: 1 }}>
                {inView ? (
                  <>{stat.prefix}<CountUp end={stat.value} duration={2.5} />{stat.suffix}</>
                ) : (
                  <>{stat.prefix}0{stat.suffix}</>
                )}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.45)", marginTop: 8, letterSpacing: "0.04em" }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .market-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .stats-strip { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 600px) {
          .stats-strip { grid-template-columns: repeat(2,1fr) !important; }
          .market-section { padding: 72px 0 !important; }
        }
      `}</style>
    </section>
  );
}
