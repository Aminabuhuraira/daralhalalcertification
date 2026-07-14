"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  motion,
  useScroll, useTransform, useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef, useState } from "react";
import { Shield, Globe, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";
import LampHeader from "@/components/ui/LampHeader";

/* ── data ──────────────────────────────────────────────── */
const FEATURES = [
  { icon: Shield, title: "Copyright Protected Mark", desc: "Our certification mark is legally copyrighted under Nigerian and international IP law. Unauthorized use is a legal offense." },
  { icon: Globe, title: "57-Country Recognition", desc: "Recognized across Africa, GCC countries, Malaysia, Indonesia, and the world's major halal consumer markets." },
  { icon: BookOpen, title: "Shariah-Grounded Standards", desc: "Certified by a panel of qualified halal scholars. Every decision is grounded in authentic Shariah principles and modern quality science." },
];

const PROCESS_STEPS = [
  { num: "01", title: "Application",            desc: "Applicants submit an application form providing essential information about their products, processes, facilities, and ingredients to initiate the Halal certification process." },
  { num: "02", title: "Screening",              desc: "Initial eligibility review of the application — ensuring the business, product category, and submitted details meet Dar Al Halal's entry criteria." },
  { num: "03", title: "Document Review",        desc: "A rigorous review of technical documents — ingredients, formulations, production processes, and supply chain records — to guarantee full regulatory and Shariah compliance." },
  { num: "04", title: "Onsite Audit",           desc: "An on-site inspection evaluates physical operations, hygiene standards, and supply chain integrity, while technical experts review audit reports to ensure compliance and prevent contamination." },
  { num: "05", title: "Shariah Verification",   desc: "Audit findings and all documentation are evaluated by the Shariah Panel to ensure full compliance with authentic Islamic principles and halal standards." },
  { num: "06", title: "Certification Decision", desc: "The Halal Certification Committee reviews all gathered evidence, audit reports, and Shariah findings, then issues a final approval or rejection decision." },
  { num: "07", title: "Certificate Issuance",   desc: "Upon approval, the official Halal Certificate and legally copyright-protected mark are issued to the business." },
  { num: "08", title: "Surveillance",           desc: "Periodic surveillance audits are conducted to verify that certified businesses maintain ongoing compliance with halal standards between certification cycles." },
  { num: "09", title: "Renewal",                desc: "Certification is renewed annually to maintain uninterrupted Halal status, ensuring continuous compliance and consumer confidence." },
];

const N = PROCESS_STEPS.length; // 9

/* ── component ─────────────────────────────────────────── */
export default function CertificationTrust() {
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const params     = useParams();
  const locale     = (params?.locale as string) || "en";

  /* scroll progress for the timeline wrapper */
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  /* spine fill height + travelling dot Y position */
  const spineH = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const dotY   = useTransform(smooth, [0, 1], ["0%", "100%"]);

  /* active step + callout */
  const [activeStep,     setActiveStep]     = useState(-1);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const lastStepRef = useRef(-1);

  /* Use raw scrollYProgress for instant step activation (no spring lag) */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    let step = -1;
    for (let i = 0; i < N; i++) if (p >= i / N) step = i;
    if (step !== lastStepRef.current) {
      lastStepRef.current = step;
      setActiveStep(step);
    }
    if (p >= 0.9 && !calloutVisible) setCalloutVisible(true);
  });

  const stepVisible = Array.from({ length: N }, (_, i) => i <= activeStep);
  /* vertical position of step i within the sticky 100vh container (5%–95% of height) */
  const stepPos = PROCESS_STEPS.map((_, i) => `${(i / N) * 90 + 5}%`);

  return (
    <section ref={sectionRef} style={{ background: "var(--bg-surface)", position: "relative" }}>
      <div className="dot-pattern" style={{ position: "absolute", inset: 0 }} />

      <div className="section-container" style={{ position: "relative", zIndex: 1, paddingTop: 100, paddingBottom: 0 }}>

        {/* ── Feature cards ── */}
        <LampHeader eyebrow="Why Choose Us" light>
          Certification Built on <span className="text-gold-shimmer">Trust &amp; Science</span>
        </LampHeader>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, marginBottom: 88 }}>
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <GlowingCard style={{ padding: 36, background: "white", border: "1px solid rgba(27,42,123,0.08)", height: "100%" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "var(--navy-700)", border: "1.5px solid var(--gold-500)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 0 22px", boxShadow: "0 0 14px var(--gold-glow)",
                }}>
                  <feat.icon size={22} color="#F5C842" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 500, marginBottom: 11, color: "var(--text-primary)" }}>{feat.title}</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, textAlign: "justify" }}>{feat.desc}</p>
                <div style={{ width: 40, height: 2, background: "var(--grad-gold)", margin: "18px 0 0", borderRadius: 1 }} />
              </GlowingCard>
            </motion.div>
          ))}
        </div>

        {/* ── Process header (outside sticky) ── */}
        <LampHeader eyebrow="9-Step Process" light>
          From Application to Certificate
        </LampHeader>
      </div>

      {/* ══════════════════════════════════════════════════
           HOLOGRAPHIC VERTICAL TIMELINE  (400 vh)
           Gold spine fills on scroll. Cards float in.
         ══════════════════════════════════════════════════ */}
      <div ref={wrapperRef} className="cert-timeline-wrapper" style={{ height: "400vh", position: "relative" }}>
        <div className="cert-timeline-sticky" style={{
          position: "sticky", top: 72,
          height: "calc(100vh - 72px)", overflow: "hidden",
          background: "var(--bg-surface)",
        }}>
          {/* Soft radial accent */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 65% 70% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 100%)",
          }} />
          <div className="dot-pattern" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

          {/* Single positioned container — direct child of sticky div so height:100% resolves to 100vh */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", justifyContent: "center",
            zIndex: 1,
          }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 900, padding: "0 32px", height: "100%" }}>

              {/* ── Centre spine ── */}
              <div style={{
                position: "absolute",
                left: "50%", top: "5%", bottom: "5%",
                width: 2,
                transform: "translateX(-50%)",
                background: "rgba(13,27,71,0.08)",
                borderRadius: 1,
              }}>
                {/* Gold fill */}
                <motion.div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: spineH,
                  background: "linear-gradient(to bottom,#FFE279,#F5C842,#C9A227)",
                  boxShadow: "0 0 10px rgba(201,162,39,0.35)",
                  borderRadius: 1,
                }} />

                {/* Travelling gold orb */}
                <motion.div style={{
                  position: "absolute",
                  top: dotY,
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 16, height: 16, borderRadius: "50%",
                  background: "radial-gradient(circle,#FFF8D0 0%,#F5C842 55%,#C9A227 100%)",
                  boxShadow: "0 0 18px rgba(201,162,39,0.8), 0 0 36px rgba(201,162,39,0.3)",
                  zIndex: 20,
                }} />
              </div>

              {/* ── Spine marker dots at each step ── */}
              {PROCESS_STEPS.map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: "50%", top: stepPos[i],
                  transform: "translate(-50%,-50%)",
                  width: stepVisible[i] ? 14 : 8,
                  height: stepVisible[i] ? 14 : 8,
                  borderRadius: "50%",
                  background: stepVisible[i] ? "#F5C842" : "rgba(13,27,71,0.12)",
                  border: stepVisible[i] ? "2px solid rgba(201,162,39,0.4)" : "1px solid rgba(13,27,71,0.1)",
                  boxShadow: stepVisible[i] ? "0 0 14px rgba(201,162,39,0.6)" : "none",
                  transition: "all 0.4s ease",
                  zIndex: 10,
                }} />
              ))}

              {/* ── Step cards ── */}
              {PROCESS_STEPS.map((step, i) => {
                const isLeft = i % 2 === 0; // card goes on left side of spine
                const on = stepVisible[i];
                return (
                  <div
                    key={step.num}
                    style={{
                      position: "absolute",
                      top: stepPos[i],
                      transform: `translateY(-50%) translateX(${on ? 0 : (isLeft ? -24 : 24)}px)`,
                      ...(isLeft
                        ? { right: "calc(50% + 28px)", maxWidth: 320, textAlign: "right" as const }
                        : { left: "calc(50% + 28px)", maxWidth: 320 }),
                      opacity: on ? 1 : 0,
                      transition: "opacity 0.55s ease, transform 0.55s ease",
                    }}
                  >
                    <div style={{
                      padding: "16px 20px",
                      background: "white",
                      borderRadius: 12,
                      border: "1px solid rgba(13,27,71,0.07)",
                      ...(isLeft
                        ? { borderRight: `3px solid ${on ? "#F5C842" : "transparent"}` }
                        : { borderLeft: `3px solid ${on ? "#F5C842" : "transparent"}` }),
                      boxShadow: on ? "0 4px 24px rgba(13,27,71,0.08)" : "0 2px 8px rgba(13,27,71,0.04)",
                      position: "relative", overflow: "hidden",
                      transition: "box-shadow 0.4s, border-color 0.4s",
                    }}>
                      {/* Ambient step number */}
                      <div style={{
                        position: "absolute", top: -10,
                        ...(isLeft ? { left: -4 } : { right: -4 }),
                        fontSize: 80, fontWeight: 900,
                        color: "rgba(13,27,71,0.03)",
                        fontFamily: "var(--font-display)",
                        lineHeight: 1, userSelect: "none" as const,
                        pointerEvents: "none",
                      }}>{step.num}</div>

                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                          fontSize: 9, fontWeight: 700,
                          color: "#C9A227",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase" as const,
                          fontFamily: "var(--font-body)",
                          marginBottom: 5,
                        }}>STEP {step.num}</div>
                        <div style={{
                          fontSize: 16, fontWeight: 700,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-display)",
                          marginBottom: 6, lineHeight: 1.25,
                        }}>{step.title}</div>
                        <div style={{
                          fontSize: 12.5,
                          color: "var(--text-muted)",
                          lineHeight: 1.65,
                          fontFamily: "var(--font-body)",
                        }}>{step.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>
      {/* END TIMELINE SECTION */}

      {/* ── Copyright callout — revealed when ball merges ── */}
      <div className="section-container" style={{ position: "relative", zIndex: 1, paddingBottom: 100 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={calloutVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            borderRadius: 20, padding: "48px 56px", marginBottom: 64,
            background: "var(--grad-hero)",
            border: "1px solid rgba(201,162,39,0.15)",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Gold border drawing up as callout appears */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: 5, borderRadius: "20px 0 0 20px",
            height: calloutVisible ? "100%" : "0%",
            background: "linear-gradient(to bottom, #F5C842, rgba(201,162,39,0.35))",
            transition: "height 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
          }} />

          <div className="cyber-grid" style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="icon-badge-lg" style={{ marginBottom: 24 }}><Shield size={28} color="#F5C842" /></div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, marginBottom: 20, color: "white" }}>
              Why Copyright Certification Matters
            </h3>
            <div className="callout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, textAlign: "justify", margin: 0 }}>
                Dar Al Halal's certification mark is legally copyrighted under Nigerian and international IP law. Displaying our mark without certification is a legal offense — protecting certified partners' competitive advantage by law, not just reputation.
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, textAlign: "justify", margin: 0 }}>
                For businesses, this means one thing: <strong style={{ color: "white" }}>our mark is irreplaceable.</strong> It cannot be duplicated, mimicked, or circumvented. When consumers see our mark, they know.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={calloutVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ textAlign: "center" }}
        >
          <Link href={`/${locale}/certification`} className="btn-primary" style={{ display: "inline-flex" }}>
            <CheckCircle size={15} />
            Start Certification
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          /* On mobile, collapse the timeline into a simple list */
          [data-timeline-wrapper] { height: auto !important; }
          [data-timeline-sticky]  { position: relative !important; height: auto !important; padding: 40px 0; }
        }
      `}</style>
    </section>
  );
}

