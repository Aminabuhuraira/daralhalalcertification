"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Globe2, Package, TrendingUp, BadgeCheck } from "lucide-react";
import MovingBorderButton from "@/components/ui/MovingBorderButton";
import OrbitalCertification from "@/components/ui/OrbitalCertification";

const STATS = [
  { icon: Globe2, value: "#1", label: "Nigeria, Africa's Largest Halal Market" },
  { icon: BadgeCheck, value: "12", label: "Certified Sectors" },
  { icon: Package, value: "2,400+", label: "Certified Products" },
  { icon: TrendingUp, value: "$7T", label: "Global Halal Economy" },
];

const WORDS = ["Quality", "Trust", "Growth", "Integrity", "Access"];

export default function Hero() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [wordIdx, setWordIdx] = useState(0);

  // Rotating word
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      {/* Subtle dot pattern */}
      <div className="dot-pattern" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

      {/* Geometric accent shapes — sparse purple triangles (brand accent) */}
      <svg width={180} height={180} style={{ position: "absolute", top: 30, right: 30, opacity: 0.65, pointerEvents: "none", zIndex: 1 }}>
        <polygon points="88,0 108,38 68,38"    fill="#6D28D9" opacity={0.8} />
        <polygon points="118,28 134,58 102,58" fill="#6D28D9" opacity={0.5} />
        <polygon points="52,54 70,84 34,84"    fill="none"    stroke="#6D28D9" strokeWidth={1.8} opacity={0.5} />
      </svg>
      <svg width={68} height={68} style={{ position: "absolute", bottom: 130, left: 24, opacity: 0.28, pointerEvents: "none", zIndex: 1 }}>
        <polygon points="34,0 68,34 34,68 0,34" fill="none" stroke="#6D28D9" strokeWidth={1.8} />
      </svg>
      {/* Small accent triangle bottom-right */}
      <svg width={60} height={60} style={{ position: "absolute", bottom: 60, right: 80, opacity: 0.22, pointerEvents: "none", zIndex: 1 }}>
        <polygon points="30,0 60,52 0,52" fill="#6D28D9" />
      </svg>

      {/* Noise texture overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        opacity: 0.25,
      }} />

      {/* Content */}
      <div
        className="section-container hero-grid"
        style={{
          width: "100%", position: "relative", zIndex: 2,
          paddingTop: 130, paddingBottom: 100,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 80, alignItems: "center",
        }}
      >
        {/* LEFT */}
        <div>
          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
              padding: "6px 14px", background: "rgba(109,40,217,0.06)",
              border: "1px solid rgba(109,40,217,0.2)", borderRadius: 100 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E",
              boxShadow: "0 0 8px rgba(34,197,94,0.6)", animation: "goldPulse 2s infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-accent)", fontSize: 10.5, color: "#6D28D9",
              letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Global Halal Certification, Made Accessible
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            style={{ fontFamily: "var(--font-display)", fontWeight: 300,
              fontSize: "clamp(40px,5.5vw,72px)", lineHeight: 1.05,
              color: "#0A1535", marginBottom: 20 }}
          >
            Your Gateway to<br />
            Global{" "}
            <span style={{ display: "inline-block", position: "relative" }}>
              <motion.span
                key={wordIdx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="text-gold-shimmer"
              >
                {WORDS[wordIdx]}
              </motion.span>
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            style={{ fontFamily: "var(--font-body)", fontSize: 16.5, lineHeight: 1.85,
              color: "rgba(10,21,53,0.6)", maxWidth: 500, marginBottom: 36, textAlign: "justify" as const }}
          >
            Halal certification is a globally recognized standard of{" "}
            <strong style={{ color: "#0A1535", fontWeight: 500 }}>
              quality, hygiene and ethical production
            </strong>
            . Open your business to the $7.7 trillion global halal economy — regardless of your background.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52 }}
          >
            <MovingBorderButton href={`/${locale}/certification`}>
              <Shield size={14} />
              Get Certified
              <ArrowRight size={14} />
            </MovingBorderButton>
            <Link href={`/${locale}/verify`} style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "13px 30px",
              background: "transparent", border: "1px solid rgba(10,21,53,0.2)",
              color: "rgba(10,21,53,0.65)", borderRadius: 8,
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
              cursor: "pointer", textDecoration: "none", transition: "all 0.3s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#6D28D9"; (e.currentTarget as HTMLElement).style.color = "#6D28D9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(10,21,53,0.2)"; (e.currentTarget as HTMLElement).style.color = "rgba(10,21,53,0.65)"; }}
            >
              Verify a Product
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="stats-strip"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1,
              background: "rgba(10,21,53,0.06)", borderRadius: 10, overflow: "hidden",
              border: "1px solid rgba(10,21,53,0.08)" }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.08 }}
                style={{ padding: "14px 12px", background: "rgba(255,255,255,0.8)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  borderRight: i < 3 ? "1px solid rgba(10,21,53,0.06)" : "none" }}
              >
                <s.icon size={16} color="rgba(201,162,39,0.7)" />
                <div style={{ fontFamily: "var(--font-accent)", fontSize: 17, fontWeight: 700, color: "#0A1535" }}>{s.value}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 9.5, color: "rgba(10,21,53,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center" }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Orbital Certification Process */}
        <div className="hero-orbital" style={{ display: "flex", justifyContent: "center", alignItems: "center", animation: "floatY 8s ease-in-out infinite" }}>
          <div style={{ transform: "scale(var(--orbital-scale, 1))", transformOrigin: "center" }}>
            <OrbitalCertification />
          </div>
        </div>
      </div>

      {/* Fade to content */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: "linear-gradient(to bottom, transparent, #FFFFFF)",
        zIndex: 3, pointerEvents: "none",
      }} />

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { padding-top: 100px !important; padding-bottom: 60px !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}
