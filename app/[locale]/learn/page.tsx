"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ArrowRight, Award } from "lucide-react";

const COURSES = [
  { id: "halal-fundamentals", title: "Halal Certification Fundamentals", level: "Beginner", duration: "3h 20m", enrolled: "1,240", category: "Foundation", desc: "Understand what halal means in a global business context, the standards involved, and how certification works." },
  { id: "ingredient-compliance", title: "Ingredient Compliance & Labeling", level: "Intermediate", duration: "5h 10m", enrolled: "980", category: "Compliance", desc: "Deep dive into E-numbers, additives, enzymes, and how to audit ingredient lists for halal compliance." },
  { id: "export-markets", title: "Accessing GCC Export Markets", level: "Advanced", duration: "4h 45m", enrolled: "765", category: "Business", desc: "Navigate UAE, Saudi, and Qatar import requirements for halal-certified Nigerian exports." },
  { id: "halal-audit", title: "Halal Audit & HACCP Integration", level: "Advanced", duration: "6h 30m", enrolled: "542", category: "Operations", desc: "Learn how to integrate halal requirements into your existing HACCP and ISO 22000 quality systems." },
  { id: "cosmetics-halal", title: "Halal Cosmetics Standards", level: "Intermediate", duration: "2h 55m", enrolled: "1,100", category: "Cosmetics", desc: "MS 2200, OIC/SMIIC 4 standards for halal personal care products and what ingredients to avoid." },
  { id: "logistics-chain", title: "Halal Supply Chain Management", level: "Intermediate", duration: "3h 40m", enrolled: "640", category: "Logistics", desc: "Maintain halal integrity from farm/factory to retail shelf, including cold chain and warehousing." },
];

const levelColor = (level: string) => {
  if (level === "Beginner") return { bg: "rgba(34,197,94,0.1)", text: "#22C55E", border: "rgba(34,197,94,0.2)" };
  if (level === "Intermediate") return { bg: "rgba(201,162,39,0.1)", text: "var(--gold-400)", border: "rgba(201,162,39,0.2)" };
  return { bg: "rgba(75,45,127,0.2)", text: "#9B73E8", border: "rgba(75,45,127,0.3)" };
};

const fin = (delay: number) => ({ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } });

export default function LearnPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  return (
    <>
      <Navbar />
      <main>
        <section className="section-hero-light dot-pattern" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 420, height: 420, bottom: -80, right: -80, opacity: 0.14 }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 20 }}>Knowledge Hub</motion.p>
            <motion.h1 {...fin(0.15)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,68px)", fontWeight: 300, color: "#4C1D95", marginBottom: 20, lineHeight: 1.1 }}>
              Master <span className="text-gold-shimmer">Halal Compliance</span>
            </motion.h1>
            <motion.p {...fin(0.3)} style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(10,21,53,0.6)", maxWidth: 520, lineHeight: 1.75 }}>
              Professional courses for business owners, compliance officers, and quality managers. Learn at your own pace.
            </motion.p>
          </div>
        </section>

        <section style={{ padding: "80px 0", background: "var(--bg-light)" }}>
          <div className="section-container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {COURSES.map((course, i) => {
                const lc = levelColor(course.level);
                return (
                  <motion.div key={course.id} {...fin(i * 0.07)} style={{ background: "var(--bg-surface)", border: "1px solid rgba(27,42,123,0.08)", borderRadius: 16, overflow: "hidden", transition: "all 0.3s", cursor: "pointer" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(201,162,39,0.25)"; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 40px rgba(201,162,39,0.08)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(27,42,123,0.08)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: 140, background: "linear-gradient(135deg, var(--bg-dark), var(--purple-600))", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={40} color="rgba(201,162,39,0.4)" />
                      <div style={{ position: "absolute", top: 12, left: 12, padding: "4px 10px", background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 10, color: "var(--gold-300)", fontWeight: 600, letterSpacing: "0.05em" }}>{course.category}</div>
                    </div>
                    <div style={{ padding: "20px 20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ padding: "3px 10px", background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 11, color: lc.text, fontWeight: 600 }}>{course.level}</span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>{course.title}</h3>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>{course.desc}</p>
                      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}><Clock size={12} />{course.duration}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}><Users size={12} />{course.enrolled} enrolled</span>
                      </div>
                      <Link href={`/${locale}/learn/${course.id}`} className="btn-primary" style={{ display: "flex", justifyContent: "center", fontSize: 13, padding: "10px 20px" }}>
                        Enroll Free <ArrowRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
