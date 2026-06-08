
"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FileText, Download, Lock, ExternalLink } from "lucide-react";

const STANDARDS = [
  { id: "ms1500", name: "MS 1500:2019", body: "JAKIM Malaysia", year: 2019, desc: "Halal Food — Production, Preparation, Handling and Storage — General Guidelines", category: "Food", free: true },
  { id: "uae2055", name: "UAE.S 2055-1:2015", body: "ESMA UAE", year: 2015, desc: "Halal Products — Part 1: General Requirements for Halal Food", category: "Food", free: false },
  { id: "ois24", name: "OIC/SMIIC 1:2019", body: "SMIIC / OIC", year: 2019, desc: "General Guidelines of Halal Food", category: "Food", free: false },
  { id: "soncap", name: "NIS 808:2012", body: "NAFDAC Nigeria", year: 2012, desc: "Halal Food Requirements — Nigerian Industrial Standard", category: "Food", free: true },
  { id: "hpc", name: "OIC/SMIIC 4:2016", body: "SMIIC / OIC", year: 2016, desc: "Halal Cosmetics Requirements", category: "Cosmetics", free: false },
  { id: "pharma", name: "OIC/SMIIC 7:2022", body: "SMIIC / OIC", year: 2022, desc: "Halal Pharmaceuticals — General Guidelines", category: "Pharmaceuticals", free: false },
  { id: "logistics", name: "JAKIM-LOG:2020", body: "JAKIM Malaysia", year: 2020, desc: "Halal Logistics — Supply Chain Requirements", category: "Logistics", free: false },
  { id: "slaughter", name: "GSO 993:1998", body: "GCC Standardization Organization", year: 1998, desc: "Animal Slaughtering Requirements According to Islamic Law", category: "Food", free: true },
];

const CATEGORIES = ["All", "Food", "Cosmetics", "Pharmaceuticals", "Logistics"];

export default function StandardsLibraryPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = STANDARDS.filter(s =>
    (activeCategory === "All" || s.category === activeCategory) &&
    (s.name.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--bg-surface)" }}>
        <section style={{ padding: "80px 0 100px", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 450, height: 450, top: -100, right: -100, opacity: 0.14 }} />
          <div className="pattern-overlay" />

          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
                Reference Library
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, marginBottom: 16, color: "#4C1D95" }}>
                Halal Standards Library
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 540, margin: "0 auto" }}>
                Official halal standards from JAKIM, ESMA, SMIIC, NAFDAC, and international certification bodies.
              </motion.p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 20px", borderRadius: 24, border: "1.5px solid", borderColor: activeCategory === cat ? "var(--color-gold-400)" : "var(--color-border)", background: activeCategory === cat ? "var(--color-gold-50)" : "white", color: activeCategory === cat ? "var(--color-text-gold)" : "var(--color-text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ maxWidth: 500, margin: "0 auto 48px" }}>
              <input
                type="text"
                placeholder="Search standards..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width: "100%", padding: "14px 20px", border: "1.5px solid var(--color-border)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)", background: "white", outline: "none" }}
                onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>

            {/* Standards list */}
            <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map((standard, i) => (
                <motion.div
                  key={standard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card"
                  style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 20 }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--color-gold-50)", border: "1px solid var(--color-gold-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={22} color="var(--color-text-gold)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>{standard.name}</h3>
                      <span style={{ padding: "2px 10px", background: "var(--color-purple-50)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-purple)", fontWeight: 600 }}>{standard.category}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>{standard.body} &middot; {standard.year}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{standard.desc}</p>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: standard.free ? "linear-gradient(135deg,#F5C842,#B8890A)" : "white", border: standard.free ? "none" : "1.5px solid var(--color-border)", borderRadius: 20, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: standard.free ? "white" : "var(--color-text-secondary)", flexShrink: 0, transition: "all 0.2s" }}>
                    {standard.free ? <Download size={14} /> : <Lock size={14} />}
                    {standard.free ? "Download" : "Sign in"}
                  </button>
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
