"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, FileText, Search, ClipboardCheck, Award, RotateCcw, ShieldCheck, Check, BookOpen, Gavel, Eye } from "lucide-react";

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
  { icon: FileText,      step: "01", title: "Application",           desc: "Applicants submit an application form providing essential information about their products, processes, facilities, and ingredients." },
  { icon: Search,        step: "02", title: "Screening",             desc: "Initial eligibility review of product details. Service agreement and fee quotation issued." },
  { icon: ClipboardCheck,step: "03", title: "Document Review",       desc: "Rigorous review of technical documents, formulations, SOPs, and ingredient sourcing to guarantee full compliance." },
  { icon: Eye,           step: "04", title: "Onsite Audit",          desc: "An on-site inspection evaluates physical operations. Technical experts review audit reports to ensure compliance and prevent contamination." },
  { icon: BookOpen,      step: "05", title: "Sharia Verification",   desc: "Audit findings and documentation are evaluated by the Shariah Panel to ensure full compliance with Islamic principles." },
  { icon: Gavel,         step: "06", title: "Certification Decision",desc: "The Halal Certification Committee reviews all evidence and issues a final decision." },
  { icon: Award,         step: "07", title: "Certification Issuance",desc: "Upon approval, the official Halal Certificate is issued with your copyright-protected halal mark." },
  { icon: ShieldCheck,   step: "08", title: "Surveillance",          desc: "Periodic surveillance audits are conducted to ensure ongoing compliance with halal standards." },
  { icon: RotateCcw,     step: "09", title: "Renewal",               desc: "Certification is renewed annually to maintain uninterrupted Halal status and global market access." },
];

const fin = (delay: number) => ({ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } });

type MyApplication = { status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"; certificateIssued: boolean; businessName: string };

// Maps the 4 backend application statuses onto the 9-step marketing journey.
function currentStepIndexFor(app: MyApplication): number {
  if (app.certificateIssued) return 8; // Renewal
  switch (app.status) {
    case "PENDING": return 1;      // Screening
    case "UNDER_REVIEW": return 3; // Onsite Audit
    case "APPROVED": return 6;     // Certification Issuance
    default: return 0;
  }
}

export default function CertificationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { data: session } = useSession();
  const [myApp, setMyApp] = useState<MyApplication | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/me/certification-status")
      .then((res) => res.json())
      .then((data) => setMyApp(data.application))
      .catch(() => {});
  }, [session?.user]);

  const currentStepIdx = myApp && myApp.status !== "REJECTED" ? currentStepIndexFor(myApp) : -1;

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
              <Link href={`/${locale}/dashboard/certification`} className="btn-primary"><ArrowRight size={15} /> Apply Now</Link>
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
            <motion.p {...fin(0)} className="text-overline" style={{ marginBottom: 12, textAlign: "center" }}>9-Step Process</motion.p>
            <motion.h2 {...fin(0.1)} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,52px)", fontWeight: 300, color: "white", textAlign: "center", marginBottom: myApp ? 20 : 60 }}>How Certification Works</motion.h2>

            {myApp && myApp.status === "REJECTED" && (
              <motion.div {...fin(0.15)} style={{ maxWidth: 560, margin: "0 auto 40px", padding: "14px 20px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "#FCA5A5" }}>
                  Your application for {myApp.businessName} was not approved. <Link href={`/${locale}/dashboard/certification`} style={{ color: "#F5C842" }}>View details and re-apply →</Link>
                </p>
              </motion.div>
            )}
            {myApp && myApp.status !== "REJECTED" && currentStepIdx >= 0 && (
              <motion.div {...fin(0.15)} style={{ maxWidth: 560, margin: "0 auto 40px", padding: "14px 20px", borderRadius: 10, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--gold-300)" }}>
                  {myApp.businessName} is currently on step {String(currentStepIdx + 1).padStart(2, "0")}: <strong>{STEPS[currentStepIdx].title}</strong>.{" "}
                  <Link href={`/${locale}/dashboard/certification`} style={{ color: "white", textDecoration: "underline" }}>Track your application →</Link>
                </p>
              </motion.div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {STEPS.map((step, i) => {
                const isDone = currentStepIdx >= 0 && i < currentStepIdx;
                const isCurrent = currentStepIdx >= 0 && i === currentStepIdx;
                const isPersonalized = currentStepIdx >= 0;
                return (
                  <motion.div
                    key={step.step}
                    {...fin(i * 0.06)}
                    style={{
                      display: "flex", gap: 16, padding: "20px 22px",
                      background: isCurrent ? "rgba(201,162,39,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isCurrent ? "rgba(201,162,39,0.35)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 14,
                      opacity: isPersonalized && !isDone && !isCurrent ? 0.4 : 1,
                      transition: "opacity 0.3s",
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      <div
                        className="icon-badge-sm"
                        style={{
                          position: "relative",
                          boxShadow: isCurrent ? "0 0 0 3px rgba(201,162,39,0.4), 0 6px 20px rgba(201,162,39,0.25)" : undefined,
                        }}
                      >
                        {isDone ? <Check size={16} color="#0A1535" /> : <step.icon size={16} color="#0A1535" />}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-accent)", fontSize: 9.5, color: "var(--gold-500)", letterSpacing: "0.15em", marginBottom: 5 }}>{step.step}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 700, color: "white", marginBottom: 5 }}>{step.title}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{step.desc}</div>
                      {isCurrent && (
                        <div style={{ marginTop: 8, display: "inline-flex", padding: "2px 8px", background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.35)", borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "var(--gold-300)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          You are here
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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
                <Link href={`/${locale}/dashboard/certification`} className="btn-primary" style={{ display: "inline-flex" }}>Start Your Application <ArrowRight size={15} /></Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
