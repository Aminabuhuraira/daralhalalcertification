"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart2, Search, Calculator, BookOpen, ArrowRight, TrendingUp } from "lucide-react";

const TOOLS = [
  { icon: BarChart2, href: "/resources/halal-market-data", title: "Halal Market Intelligence", desc: "Nigeria and Africa market data, sector breakdowns, and growth projections for the global halal economy.", badge: "Data" },
  { icon: Search, href: "/resources/ingredient-checker", title: "Ingredient Checker", desc: "Instantly check any ingredient or E-number for halal compliance status with our comprehensive database.", badge: "Tool" },
  { icon: Calculator, href: "/resources/inheritance-calculator", title: "Fara'id Inheritance Calculator", desc: "Calculate Fara'id inheritance shares with visual heir charts and Quran references.", badge: "Calculator" },
  { icon: BookOpen, href: "/resources/standards-library", title: "Halal Standards Library", desc: "Access JAKIM, ESMA, SMIIC, NAFDAC and international halal standards documents.", badge: "Library" },
  { icon: TrendingUp, href: "/learn", title: "Training Academy", desc: "Professional courses on halal compliance, audit preparation, ingredient labeling, and export markets.", badge: "Courses" },
];

const fin = (delay: number) => ({ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } });

export default function ResourcesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  return (
    <>
      <Navbar />
      <main>
        <section className="section-hero-light dot-pattern" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 480, height: 480, top: -160, right: -160, opacity: 0.14 }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 20 }}>Resources Hub</motion.p>
            <motion.h1 {...fin(0.15)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, color: "#4C1D95", marginBottom: 20, lineHeight: 1.1 }}>
              Tools for Halal<br /><span className="text-gold-shimmer">Market Intelligence</span>
            </motion.h1>
            <motion.p {...fin(0.3)} style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(10,21,53,0.72)", maxWidth: 500, lineHeight: 1.75 }}>
              Free tools and data resources for businesses navigating halal certification and global market access.
            </motion.p>
          </div>
        </section>
        <section style={{ padding: "80px 0", background: "var(--bg-light)" }}>
          <div className="section-container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {TOOLS.map((tool, i) => (
                <motion.div key={tool.href} {...fin(i * 0.08)}>
                  <Link href={`/${locale}${tool.href}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                    <div style={{ padding: "32px 28px", background: "var(--bg-surface)", border: "1px solid rgba(27,42,123,0.08)", borderRadius: 18, height: "100%", transition: "all 0.3s", cursor: "pointer" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(201,162,39,0.3)"; el.style.transform = "translateY(-6px)"; el.style.boxShadow = "0 16px 48px rgba(201,162,39,0.1)"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(27,42,123,0.08)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div className="icon-badge-lg"><tool.icon size={24} color="var(--gold-300)" /></div>
                        <span style={{ padding: "4px 10px", background: "var(--navy-50)", border: "1px solid var(--navy-100)", borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--navy-600)", fontWeight: 600 }}>{tool.badge}</span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-body)", fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{tool.title}</h3>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>{tool.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold-600)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>
                        Explore <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
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
