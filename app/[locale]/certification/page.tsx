"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, FileText, Search, ClipboardCheck, Award, RotateCcw, ShieldCheck } from "lucide-react";

const SECTORS = [
  { emoji: "🍔", name: "Food & Beverage", desc: "Restaurants, food manufacturers, bakeries, catering" },
  { emoji: "💄", name: "Cosmetics & Beauty", desc: "Personal care, skincare, fragrances, hair products" },
  { emoji: "💊", name: "Pharmaceuticals", desc: "Medicines, capsules, nutraceuticals, supplements" },
  { emoji: "🏨", name: "Hospitality", desc: "Hotels, resorts, event catering, food service" },
  { emoji: "🚚", name: "Logistics", desc: "Cold chain, warehousing, transport, supply chain" },
  { emoji: "🏭", name: "Manufacturing", desc: "Process manufacturing, OEM, contract production" },
  { emoji: "👗", name: "Fashion & Textiles", desc: "Clothing, fabrics, leather goods, accessories" },
  { emoji: "💰", name: "Finance & Banking", desc: "Halal finance, investment, insurance (Takaful)" },
  { emoji: "🌿", name: "Agriculture", desc: "Farming, horticulture, organic produce, feed" },
  { emoji: "🐄", name: "Animal Feed", desc: "Livestock feed, poultry feed, aquaculture" },
  { emoji: "⚕️", name: "Healthcare", desc: "Medical devices, hospital supplies, therapeutics" },
  { emoji: "🎓", name: "Education", desc: "Halal training, awareness programs, certification courses" },
];

const STEPS = [
  { icon: FileText, step: "01", title: "Application", desc: "Submit your application with product, process, and ingredient details." },
  { icon: Search, step: "02", title: "Screening", desc: "Initial eligibility review. Service agreement and fee quotation issued." },
  { icon: ClipboardCheck, step: "03", title: "Document Review", desc: "Full audit of formulations, SOPs, supply chain, and ingredient sourcing." },
  { icon: ShieldCheck, step: "04", title: "On-Site Audit", desc: "Our trained auditors visit your facility to verify compliance." },
  { icon: CheckCircle, step: "05", title: "Compliance Verification", desc: "Scholar panel and technical team review audit findings." },
  { icon: Award, step: "06", title: "Certification", desc: "Certificate issued. Your copyright-protected halal mark is granted." },
  { icon: RotateCcw, step: "07", title: "Annual Renewal", desc: "Annual surveillance audit maintains certificate validity." },
];

const fin = (delay: number) => ({ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } });

export default function CertificationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="section-hero-light dot-pattern" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 450, height: 450, bottom: -120, right: -80, opacity: 0.14 }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 20 }}>Halal Certification</motion.p>
            <motion.h1 {...fin(0.15)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,68px)", fontWeight: 300, color: "#4C1D95", marginBottom: 20, maxWidth: 680, lineHeight: 1.1 }}>
              Certification Built for<br /><span className="text-gold-shimmer">Global Markets</span>
            </motion.h1>
            <motion.p {...fin(0.3)} style={{ fontFamily: "var(--font-body)", fontSize: 17, color: "rgba(10,21,53,0.6)", maxWidth: 560, lineHeight: 1.75, marginBottom: 36 }}>
              Our copyright-protected certification mark is recognized in 57+ countries. Get certified and access Africa, the Middle East, Southeast Asia, and beyond.
            </motion.p>
            <motion.div {...fin(0.45)} style={{ display: "flex", gap: 12 }}>
              <Link href={`/${locale}/contact`} className="btn-primary"><ArrowRight size={15} /> Apply Now</Link>
              <Link href={`/${locale}/verify`} className="btn-ghost">Verify a Certificate</Link>
            </motion.div>
          </div>
        </section>

        {/* 12 Sectors */}
        <section id="sectors" style={{ padding: "100px 0", background: "var(--bg-light)" }}>
          <div className="section-container">
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 12, textAlign: "center" }}>12 Sectors</motion.p>
            <motion.h2 {...fin(0.1)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,52px)", fontWeight: 300, textAlign: "center", marginBottom: 16, color: "var(--text-primary)" }}>We Certify Every Industry</motion.h2>
            <motion.p {...fin(0.2)} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-muted)", textAlign: "center", marginBottom: 56, maxWidth: 520, margin: "0 auto 56px" }}>
              Halal certification is not limited to food. From pharmaceuticals to logistics, we certify your entire operation.
            </motion.p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {SECTORS.map((s, i) => (
                <motion.div key={s.name} {...fin(i * 0.05)} style={{ padding: "24px 20px", background: "var(--bg-surface)", border: "1px solid rgba(27,42,123,0.08)", borderRadius: 14, transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,162,39,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(201,162,39,0.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,42,123,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{s.emoji}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" style={{ padding: "100px 0", background: "var(--bg-dark)" }}>
          <div className="section-container">
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 12, textAlign: "center" }}>7-Step Process</motion.p>
            <motion.h2 {...fin(0.1)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,52px)", fontWeight: 300, color: "white", textAlign: "center", marginBottom: 60 }}>How Certification Works</motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 16 }}>
              {STEPS.map((step, i) => (
                <motion.div key={step.step} {...fin(i * 0.07)} style={{ textAlign: "center" }}>
                  <div className="icon-badge-lg" style={{ margin: "0 auto 16px" }}>
                    <step.icon size={22} color="var(--gold-300)" />
                  </div>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: 10, color: "var(--gold-500)", letterSpacing: "0.15em", marginBottom: 8 }}>{step.step}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "white", marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{step.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "100px 0", background: "var(--bg-light)", textAlign: "center" }}>
          <div className="section-container">
            <motion.div {...fin(0)} style={{ padding: "60px 40px", background: "var(--bg-dark)", borderRadius: 24, border: "1px solid rgba(201,162,39,0.2)", maxWidth: 680, margin: "0 auto", boxShadow: "0 20px 60px rgba(13,27,71,0.3)", position: "relative", overflow: "hidden" }}>
              <div className="glow-orb glow-orb-purple" style={{ width: 300, height: 300, top: -100, right: -100, opacity: 0.4 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="icon-badge-lg" style={{ margin: "0 auto 24px" }}><Award size={28} color="var(--gold-300)" /></div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, color: "white", marginBottom: 14 }}>Ready to Get Certified?</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.7 }}>Join 500+ businesses that have accessed global markets through Dar Al Halal certification.</p>
                <Link href={`/${locale}/contact`} className="btn-primary" style={{ display: "inline-flex" }}>Start Your Application <ArrowRight size={15} /></Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
