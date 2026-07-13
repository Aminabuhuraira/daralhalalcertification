
"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const PARTNERS = [
  "AlFarouq Foods", "NatureBest Cosmetics", "MedHalal Pharma",
  "Kano Farms Ltd", "Lagos Spice Co", "Abuja Dairy", "Niger Mills",
  "HalalMart Nigeria", "Green Pastures Foods", "AbuTayba Cosmetics",
  "AlFarouq Foods", "NatureBest Cosmetics", "MedHalal Pharma",
  "Kano Farms Ltd", "Lagos Spice Co", "Abuja Dairy", "Niger Mills",
  "HalalMart Nigeria", "Green Pastures Foods", "AbuTayba Cosmetics",
];

const REVIEWS = [
  { quote: "Obtaining Dar Al Halal certification transformed our export prospects to Saudi Arabia overnight.", business: "AlFarouq Foods", city: "Kano" },
  { quote: "The certification process was thorough, professional, and our customers now trust our products completely.", business: "NatureBest Cosmetics", city: "Lagos" },
  { quote: "With Dar Al Halal certification, we accessed three new African markets within six months.", business: "Kano Farms Ltd", city: "Kano" },
];

export default function PartnersSlider() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-gold-300)", borderBottom: "1px solid var(--color-border)", padding: "48px 0" }}>
      <div className="section-container">
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "center", marginBottom: 40 }} className="partners-layout">
          <div>
            <p style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.2em", color: "var(--color-text-gold)", marginBottom: 6, textTransform: "uppercase" }}>
              Trusted By
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
              Nigeria&apos;s Leading Businesses
            </h3>
          </div>
          <div className="marquee-wrapper">
            <div className="marquee-track" style={{ gap: 40 }}>
              {PARTNERS.map((p, i) => (
                <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--color-silver-400)", whiteSpace: "nowrap", padding: "8px 24px", border: "1px solid var(--color-border)", borderRadius: 8, transition: "all 0.3s", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-gold)"; e.currentTarget.style.borderColor = "var(--color-gold-300)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-silver-400)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                >{p}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 40 }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4,5].map((i) => (
              <motion.span
                key={i}
                initial={{ color: "#CED4DA" }}
                animate={inView ? { color: "#DBA820" } : {}}
                transition={{ delay: i * 0.2, duration: 0.4 }}
                style={{ fontSize: 28 }}
              >★</motion.span>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-accent)", fontSize: 13, letterSpacing: "0.1em", color: "var(--color-text-secondary)" }}>
            Rated Excellence — Global Halal Certification, Made Accessible
          </p>
        </motion.div>

        {/* Reviews */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="reviews-grid">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass-card"
              style={{ padding: "28px 24px" }}
            >
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {[1,2,3,4,5].map((s) => <span key={s} style={{ color: "var(--color-gold-400)", fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: 16, fontStyle: "italic", textAlign: "justify" }}>
                &ldquo;{review.quote}&rdquo;
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-text-gold)" }}>
                {review.business} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>— {review.city}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .partners-layout { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
