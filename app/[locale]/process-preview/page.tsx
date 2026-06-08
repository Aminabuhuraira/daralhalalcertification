"use client";
import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";

/* ─── shared data ──────────────────────────────────────── */
const STEPS = [
  { num: "01", title: "Application",          desc: "Submit your business details, product list, and initial documentation." },
  { num: "02", title: "Screening",            desc: "Initial review of your application and business eligibility criteria." },
  { num: "03", title: "Document Review",      desc: "Thorough analysis of all ingredients, formulations, and production processes." },
  { num: "04", title: "On-Site Audit",        desc: "Physical inspection of your facilities, hygiene standards, and supply chain." },
  { num: "05", title: "Shariah Verification", desc: "Scholar panel review of compliance and official Fatwa issuance." },
  { num: "06", title: "Decision",             desc: "Certification committee reviews all findings and makes the final approval decision." },
  { num: "07", title: "Certificate Issued",   desc: "Your halal certificate and legally copyright-protected mark are issued." },
];
const N = STEPS.length;

/* ═══════════════════════════════════════════════════════════
   OPTION 1 — GOLD CIRCUIT SERPENTINE
   Same scroll-driven path, completely redesigned in gold.
   Diamond nodes. Warm orb. Scan-line label reveal.
   ═══════════════════════════════════════════════════════════ */
const VB_W = 680, ROW_H = 82, PAD = 16;
const SVG_L = PAD, SVG_R = VB_W - PAD, TAIL = 66, VB_H = N * ROW_H + TAIL;

function buildPath(): string {
  const cy = ROW_H / 2;
  const s: string[] = [`M ${SVG_L} ${cy}`, `L ${SVG_R} ${cy}`];
  for (let i = 1; i < N; i++) {
    const px = (i - 1) % 2 === 0 ? SVG_R : SVG_L;
    const cx = i % 2 === 0 ? SVG_R : SVG_L;
    const cy2 = i * ROW_H + cy;
    s.push(`L ${px} ${cy2}`, `L ${cx} ${cy2}`);
  }
  const lx = (N - 1) % 2 === 0 ? SVG_R : SVG_L;
  const ty = N * ROW_H + TAIL / 2;
  s.push(`L ${lx} ${ty}`);
  if (lx !== SVG_L) s.push(`L ${SVG_L} ${ty}`);
  return s.join(" ");
}
const SERP_PATH = buildPath();
const H_RUN = SVG_R - SVG_L, V_DROP = ROW_H;
const SERP_TOTAL = N * (H_RUN + V_DROP) + TAIL / 2 + H_RUN;
const stepFrac = (i: number) => (i * (H_RUN + V_DROP)) / SERP_TOTAL;

function V1GoldCircuit() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef    = useRef<SVGPathElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  const smooth  = useSpring(scrollYProgress, { stiffness: 180, damping: 22 });
  const ballX   = useMotionValue(SVG_L);
  const ballY   = useMotionValue(ROW_H / 2);
  const ballOp  = useTransform(smooth, [0.97, 1], [1, 0]);
  const drawn   = useTransform(smooth, [0, 0.98], [0, 1]);
  const [active, setActive] = useState(-1);
  const lastRef = useRef(-1);

  useMotionValueEvent(smooth, "change", (p) => {
    if (!pathRef.current) return;
    const tl = pathRef.current.getTotalLength();
    const d  = p * tl;
    const pt = pathRef.current.getPointAtLength(Math.min(d, tl));
    ballX.set(pt.x); ballY.set(pt.y);
    let s = -1;
    for (let i = 0; i < N; i++) if (d >= stepFrac(i) * tl) s = i;
    if (s !== lastRef.current) { lastRef.current = s; setActive(s); }
  });

  const vis = Array.from({ length: N }, (_, i) => i <= active);

  return (
    <div ref={wrapperRef} style={{ height: "300vh", position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg,#06080F 0%,#0C1120 100%)",
      }}>
        {/* Circuit grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(245,200,66,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(245,200,66,0.028) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }} />
        {/* Corner accent glows */}
        <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,200,66,0.06) 0%,transparent 70%)", top: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,200,66,0.04) 0%,transparent 70%)", bottom: -60, left: -40, pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 740, padding: "0 24px", position: "relative" }}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", display: "block", overflow: "visible" }} aria-hidden>
            <defs>
              <linearGradient id="g1Gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE87A" />
                <stop offset="50%" stopColor="#F5C842" />
                <stop offset="100%" stopColor="#C9920A" />
              </linearGradient>
              <radialGradient id="g1Ball" cx="32%" cy="32%">
                <stop offset="0%" stopColor="#FFF4C2" />
                <stop offset="55%" stopColor="#F5C842" />
                <stop offset="100%" stopColor="#A87200" />
              </radialGradient>
              <filter id="f1Ball" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="8" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="f1Track" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Ghost dashed path */}
            <path
              ref={pathRef}
              d={SERP_PATH}
              stroke="rgba(245,200,66,0.09)"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 10"
            />

            {/* Live gold progress path */}
            <motion.path
              d={SERP_PATH}
              stroke="url(#g1Gold)"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#f1Track)"
              style={{ pathLength: drawn, strokeDasharray: "1", strokeDashoffset: "0" }}
              initial={{ pathLength: 0 }}
            />

            {/* Diamond nodes */}
            {STEPS.map((step, i) => {
              const cx = i % 2 === 0 ? SVG_L : SVG_R;
              const cy = i * ROW_H + ROW_H / 2;
              const hs = 13; // half-size
              const on = vis[i];
              return (
                <g key={i}>
                  {on && (
                    <circle cx={cx} cy={cy} r={hs + 6} fill="none" stroke="rgba(245,200,66,0.18)" strokeWidth={1}>
                      <animate attributeName="r" values={`${hs + 4};${hs + 18};${hs + 4}`} dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <polygon
                    points={`${cx},${cy - hs} ${cx + hs},${cy} ${cx},${cy + hs} ${cx - hs},${cy}`}
                    fill={on ? "rgba(245,200,66,0.14)" : "rgba(6,8,15,0.92)"}
                    stroke={on ? "#F5C842" : "rgba(245,200,66,0.18)"}
                    strokeWidth={1.5}
                    style={{
                      filter: on ? "drop-shadow(0 0 7px rgba(245,200,66,0.55))" : "none",
                      transition: "all 0.45s ease",
                    }}
                  />
                  <text
                    x={cx} y={cy + 4}
                    textAnchor="middle"
                    fill={on ? "#F5C842" : "rgba(245,200,66,0.22)"}
                    fontSize={9}
                    fontWeight={700}
                    fontFamily="monospace"
                    style={{ transition: "fill 0.3s" }}
                  >{step.num}</text>
                </g>
              );
            })}

            {/* Rolling golden orb */}
            <motion.circle cx={ballX} cy={ballY} r={11} fill="url(#g1Ball)" filter="url(#f1Ball)" style={{ opacity: ballOp }} />
          </svg>

          {/* Step labels overlay */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {STEPS.map((step, i) => {
              const isLTR = i % 2 === 0;
              const yPct  = ((i * ROW_H + ROW_H / 2) / VB_H) * 100;
              const pad   = (34 / VB_W) * 100 + 1;
              const on    = vis[i];
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: `${yPct}%`,
                    transform: `translateY(-50%) translateX(${on ? 0 : (isLTR ? -14 : 14)}px)`,
                    ...(isLTR
                      ? { left: `${pad + 1}%`, right: "4%" }
                      : { right: `${pad + 1}%`, left: "4%", textAlign: "right" as const }),
                    opacity: on ? 1 : 0,
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
                    color: "#F5C842", marginBottom: 4, letterSpacing: "0.07em",
                    textTransform: "uppercase" as const,
                  }}>{step.title}</div>
                  <div style={{
                    width: on ? "100%" : 0, height: 1,
                    background: isLTR
                      ? "linear-gradient(90deg,#F5C842,transparent)"
                      : "linear-gradient(90deg,transparent,#F5C842)",
                    marginBottom: 5,
                    transition: "width 0.5s ease 0.15s",
                    marginLeft: isLTR ? 0 : "auto",
                  }} />
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: 12,
                    color: "rgba(255,255,255,0.42)", lineHeight: 1.55, maxWidth: 230,
                    ...(isLTR ? {} : { marginLeft: "auto" }),
                  }}>{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OPTION 2 — HOLOGRAPHIC VERTICAL TIMELINE
   Gold spine fills as you scroll. Glassmorphism cards with
   giant ambient step numbers float in on alternating sides.
   ═══════════════════════════════════════════════════════════ */
function V2HoloTimeline() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  const smooth  = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });
  const [active, setActive] = useState(-1);
  const lastRef = useRef(-1);

  useMotionValueEvent(smooth, "change", (p) => {
    let s = -1;
    for (let i = 0; i < N; i++) if (p >= i / N) s = i;
    if (s !== lastRef.current) { lastRef.current = s; setActive(s); }
  });

  const vis      = Array.from({ length: N }, (_, i) => i <= active);
  const spineH   = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const dotY     = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const stepPos  = STEPS.map((_, i) => `${(i / N) * 90 + 5}%`);

  return (
    <div ref={wrapperRef} style={{ height: "400vh", position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        background: "#070B13",
      }}>
        {/* Ambient center glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(245,200,66,0.03) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860, margin: "0 auto", padding: "0 32px", height: "100%" }}>
          <div style={{ position: "relative", width: "100%", height: "100vh" }}>

            {/* Vertical spine track */}
            <div style={{
              position: "absolute", left: "50%", top: "5%", bottom: "5%",
              width: 2, transform: "translateX(-50%)",
              background: "rgba(245,200,66,0.06)",
            }}>
              {/* Fill */}
              <motion.div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: spineH,
                background: "linear-gradient(to bottom,#FFE87A,#F5C842,#B8890A)",
                boxShadow: "0 0 14px rgba(245,200,66,0.55)",
              }} />

              {/* Travelling orb */}
              <motion.div style={{
                position: "absolute",
                top: dotY,
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 16, height: 16, borderRadius: "50%",
                background: "radial-gradient(circle,#FFF8D0 0%,#F5C842 55%,#A87200 100%)",
                boxShadow: "0 0 22px rgba(245,200,66,0.9), 0 0 48px rgba(245,200,66,0.4)",
                zIndex: 20,
              }} />
            </div>

            {/* Spine node dots */}
            {STEPS.map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                left: "50%", top: stepPos[i],
                transform: "translate(-50%,-50%)",
                width: vis[i] ? 14 : 7,
                height: vis[i] ? 14 : 7,
                borderRadius: "50%",
                background: vis[i] ? "#F5C842" : "rgba(245,200,66,0.12)",
                border: vis[i] ? "2px solid rgba(245,200,66,0.5)" : "1px solid rgba(245,200,66,0.08)",
                boxShadow: vis[i] ? "0 0 16px rgba(245,200,66,0.75)" : "none",
                transition: "all 0.4s ease",
                zIndex: 10,
              }} />
            ))}

            {/* Step cards */}
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0;
              const on = vis[i];
              return (
                <div key={i} style={{
                  position: "absolute",
                  top: stepPos[i],
                  transform: `translateY(-50%) translateX(${on ? 0 : (isLeft ? -24 : 24)}px)`,
                  ...(isLeft
                    ? { right: "calc(50% + 30px)", maxWidth: 310, textAlign: "right" as const }
                    : { left: "calc(50% + 30px)", maxWidth: 310 }),
                  opacity: on ? 1 : 0,
                  transition: "opacity 0.55s ease, transform 0.55s ease",
                }}>
                  {/* Card */}
                  <div style={{
                    padding: "16px 20px",
                    background: "rgba(255,255,255,0.025)",
                    backdropFilter: "blur(14px)",
                    borderRadius: 12,
                    border: "1px solid rgba(245,200,66,0.1)",
                    ...(isLeft
                      ? { borderRight: `3px solid ${on ? "#F5C842" : "transparent"}` }
                      : { borderLeft: `3px solid ${on ? "#F5C842" : "transparent"}` }),
                    position: "relative", overflow: "hidden",
                    transition: "border-color 0.45s",
                  }}>
                    {/* Ambient giant number */}
                    <div style={{
                      position: "absolute",
                      top: -12,
                      ...(isLeft ? { left: -6 } : { right: -6 }),
                      fontSize: 80, fontWeight: 900,
                      color: "rgba(245,200,66,0.045)",
                      fontFamily: "var(--font-display)",
                      lineHeight: 1, userSelect: "none" as const,
                    }}>{step.num}</div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{
                        fontSize: 9, fontWeight: 700,
                        color: "rgba(245,200,66,0.65)",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase" as const,
                        fontFamily: "var(--font-body)", marginBottom: 6,
                      }}>STEP {step.num}</div>
                      <div style={{
                        fontSize: 16, fontWeight: 700, color: "white",
                        fontFamily: "var(--font-display)", marginBottom: 7, lineHeight: 1.2,
                      }}>{step.title}</div>
                      <div style={{
                        fontSize: 12.5, color: "rgba(255,255,255,0.42)",
                        lineHeight: 1.65, fontFamily: "var(--font-body)",
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
  );
}

/* ═══════════════════════════════════════════════════════════
   OPTION 3 — STAR CONSTELLATION MAP
   Seven steps as constellation nodes. Gold lines connect
   them in sequence against a deep-space backdrop.
   ═══════════════════════════════════════════════════════════ */
const CONST_NODES = [
  { x: 130, y: 72  },  // 01
  { x: 520, y: 62  },  // 02
  { x: 75,  y: 210 },  // 03
  { x: 330, y: 200 },  // 04
  { x: 590, y: 205 },  // 05
  { x: 195, y: 355 },  // 06
  { x: 480, y: 362 },  // 07
];

// Deterministic star field (no Math.random to avoid SSR mismatch)
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 83.215 + 17) % 100,
  r: i % 8 === 0 ? 1.5 : i % 4 === 0 ? 1 : 0.5,
  op: 0.06 + (i % 6) * 0.055,
  blink: i % 5 === 0,
}));

function V3Constellation() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  const smooth  = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });
  const [active, setActive] = useState(-1);
  const lastRef = useRef(-1);

  useMotionValueEvent(smooth, "change", (p) => {
    let s = -1;
    for (let i = 0; i < N; i++) if (p >= i / (N + 0.5)) s = i;
    if (s !== lastRef.current) { lastRef.current = s; setActive(s); }
  });

  const vis = Array.from({ length: N }, (_, i) => i <= active);

  return (
    <div ref={wrapperRef} style={{ height: "360vh", position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse 80% 70% at 50% 45%, #050A16 0%, #010306 100%)",
      }}>
        {/* Star field */}
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.r * 2, height: s.r * 2,
              borderRadius: "50%",
              background: "white",
              opacity: s.op,
              animation: s.blink ? `starBlink ${2 + (i % 4)}s ease-in-out infinite` : "none",
            }}
          />
        ))}

        <div style={{ width: "100%", maxWidth: 740, padding: "0 24px", position: "relative" }}>
          <svg viewBox="0 0 660 440" style={{ width: "100%", display: "block", overflow: "visible" }} aria-hidden>
            <defs>
              <radialGradient id="g3Node" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#FFF0B0" />
                <stop offset="100%" stopColor="#A87200" />
              </radialGradient>
              <filter id="f3Glow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="f3Line" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Ghost connection lines */}
            {CONST_NODES.slice(0, -1).map((n, i) => (
              <line
                key={i}
                x1={n.x} y1={n.y}
                x2={CONST_NODES[i + 1].x} y2={CONST_NODES[i + 1].y}
                stroke="rgba(245,200,66,0.06)"
                strokeWidth={1}
                strokeDasharray="4 8"
              />
            ))}

            {/* Active connections */}
            {CONST_NODES.slice(0, -1).map((n, i) =>
              vis[i + 1] && (
                <motion.path
                  key={i}
                  d={`M ${n.x} ${n.y} L ${CONST_NODES[i + 1].x} ${CONST_NODES[i + 1].y}`}
                  stroke="rgba(245,200,66,0.65)"
                  strokeWidth={1.5}
                  fill="none"
                  filter="url(#f3Line)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              )
            )}

            {/* Nodes */}
            {CONST_NODES.map((node, i) => {
              const on = vis[i];
              return (
                <g key={i}>
                  {on && (
                    <>
                      <circle cx={node.x} cy={node.y} r={22} fill="none" stroke="rgba(245,200,66,0.1)" strokeWidth={1}>
                        <animate attributeName="r" values="16;32;16" dur="2.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.8s" repeatCount="indefinite" />
                      </circle>
                      <circle
                        cx={node.x} cy={node.y} r={16}
                        fill="rgba(245,200,66,0.07)"
                        stroke="rgba(245,200,66,0.25)"
                        strokeWidth={1}
                        filter="url(#f3Glow)"
                      />
                    </>
                  )}
                  <circle
                    cx={node.x} cy={node.y}
                    r={on ? 8 : 4}
                    fill={on ? "url(#g3Node)" : "rgba(245,200,66,0.18)"}
                    style={{
                      filter: on ? "drop-shadow(0 0 9px rgba(245,200,66,0.8))" : "none",
                      transition: "all 0.5s ease",
                    }}
                  />
                  <text
                    x={node.x} y={node.y + 4}
                    textAnchor="middle"
                    fill={on ? "rgba(245,200,66,0.9)" : "rgba(245,200,66,0.15)"}
                    fontSize={7} fontWeight={700} fontFamily="monospace"
                    style={{ transition: "fill 0.4s" }}
                  >{STEPS[i].num}</text>
                </g>
              );
            })}
          </svg>

          {/* Labels near nodes */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {CONST_NODES.map((node, i) => {
              const on = vis[i];
              const toRight = node.x <= 330; // put label right of left-half nodes
              const xPct = (node.x / 660) * 100;
              const yPct = (node.y / 440) * 100;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: `${yPct}%`,
                    transform: `translateY(-50%) translateX(${on ? 0 : (toRight ? -8 : 8)}px)`,
                    ...(toRight
                      ? { left: `${xPct + 4}%` }
                      : { right: `${100 - xPct + 4}%`, textAlign: "right" as const }),
                    opacity: on ? 1 : 0,
                    transition: "opacity 0.45s, transform 0.45s",
                    maxWidth: 175,
                  }}
                >
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: "#F5C842",
                    fontFamily: "var(--font-body)", marginBottom: 3, letterSpacing: "0.04em",
                  }}>{STEPS[i].title}</div>
                  <div style={{
                    fontSize: 10.5, color: "rgba(255,255,255,0.38)",
                    lineHeight: 1.55, fontFamily: "var(--font-body)",
                  }}>{STEPS[i].desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes starBlink {
          0%,100% { opacity: inherit; }
          50% { opacity: 0.02; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OPTION 4 — CINEMATIC STEP REVEAL
   One step fills the entire viewport. Scroll to advance.
   Monumental typography. Pure atmosphere.
   ═══════════════════════════════════════════════════════════ */
const GLYPHS = ["◈", "◎", "⊞", "⊗", "✦", "◉", "✧"];

function V4CinematicReveal() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  const smooth  = useSpring(scrollYProgress, { stiffness: 55, damping: 14 });
  const [active, setActive] = useState(0);
  const lastRef = useRef(0);

  useMotionValueEvent(smooth, "change", (p) => {
    const s = Math.max(0, Math.min(N - 1, Math.floor(p * N)));
    if (s !== lastRef.current) { lastRef.current = s; setActive(s); }
  });

  const step = STEPS[active];

  return (
    <div ref={wrapperRef} style={{ height: "700vh", position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#030508",
      }}>
        {/* Ambient orb */}
        <div style={{
          position: "absolute",
          width: 560, height: 560, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,200,66,0.07) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />

        {/* Giant ambient step number (behind everything) */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`n${active}`}
              initial={{ opacity: 0, scale: 1.18 }}
              animate={{ opacity: 0.042, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: "clamp(180px,26vw,280px)",
                fontWeight: 900,
                color: "#F5C842",
                fontFamily: "var(--font-display)",
                lineHeight: 1,
                userSelect: "none" as const,
                letterSpacing: "-0.05em",
                whiteSpace: "nowrap",
              }}
            >{step.num}</motion.div>
          </AnimatePresence>
        </div>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 680, padding: "0 40px", width: "100%" }}>

          {/* Glyph */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`g${active}`}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.32 }}
              style={{
                fontSize: 30, color: "#F5C842", marginBottom: 22,
                filter: "drop-shadow(0 0 16px rgba(245,200,66,0.75))",
                fontFamily: "monospace",
              }}
            >{GLYPHS[active]}</motion.div>
          </AnimatePresence>

          {/* Step counter */}
          <div style={{
            fontSize: 10, letterSpacing: "0.24em",
            color: "rgba(245,200,66,0.55)",
            fontFamily: "var(--font-body)",
            textTransform: "uppercase" as const,
            marginBottom: 16,
          }}>
            STEP {step.num} &nbsp;/&nbsp; {N.toString().padStart(2, "0")}
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={`t${active}`}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -26 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 6vw, 72px)",
                fontWeight: 300,
                color: "white",
                marginBottom: 20,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >{step.title}</motion.h2>
          </AnimatePresence>

          {/* Gold rule */}
          <motion.div
            key={`r${active}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            style={{
              width: 60, height: 1,
              background: "linear-gradient(90deg,transparent,#F5C842,transparent)",
              margin: "0 auto 22px",
            }}
          />

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`d${active}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38, delay: 0.1 }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 16,
                color: "rgba(255,255,255,0.42)",
                lineHeight: 1.9,
                maxWidth: 500,
                margin: "0 auto",
              }}
            >{step.desc}</motion.p>
          </AnimatePresence>

          {/* Progress indicator */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 50 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === active ? 32 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: i <= active ? "#F5C842" : "rgba(245,200,66,0.1)",
                  boxShadow: i === active ? "0 0 12px rgba(245,200,66,0.7)" : "none",
                  transition: "all 0.45s ease",
                }}
              />
            ))}
          </div>

          {/* Scroll nudge */}
          {active < N - 1 && (
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.7 }}
              style={{
                marginTop: 30,
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.15)",
                fontFamily: "var(--font-body)",
                textTransform: "uppercase" as const,
              }}
            >scroll to advance ↓</motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */
export default function ProcessPreviewPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <>
      <Navbar />
      <main>

        {/* ── Page header ── */}
        <section style={{
          background: "#050810",
          paddingTop: 130, paddingBottom: 72,
          textAlign: "center",
          borderBottom: "1px solid rgba(245,200,66,0.07)",
        }}>
          <div className="section-container">
            <p className="text-overline" style={{ marginBottom: 16 }}>Design Preview — Choose a Variation</p>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px,5vw,56px)",
              fontWeight: 300, color: "white",
              marginBottom: 16, lineHeight: 1.1,
            }}>
              From Application to{" "}
              <span className="text-gold-shimmer">Certificate</span>
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 15,
              color: "rgba(255,255,255,0.42)", maxWidth: 480,
              margin: "0 auto 40px", lineHeight: 1.8,
            }}>
              Four animated variations — scroll into each section to experience it in action, then choose your favourite.
            </p>

            {/* Jump links */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { href: "#v1", label: "01 — Gold Circuit" },
                { href: "#v2", label: "02 — Holo Timeline" },
                { href: "#v3", label: "03 — Constellation" },
                { href: "#v4", label: "04 — Cinematic" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "9px 20px", borderRadius: 24,
                    border: "1px solid rgba(245,200,66,0.22)",
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "var(--font-body)", fontSize: 12,
                    textDecoration: "none",
                    background: "rgba(245,200,66,0.04)",
                    letterSpacing: "0.04em",
                  }}
                >{l.label}</a>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            OPTION 1
            ══════════════════════════════════════════ */}
        <section id="v1" style={{ background: "var(--bg-surface)", padding: "64px 0 28px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="section-container" style={{ textAlign: "center" }}>
            <span className="text-overline">Option 01</span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px,3.5vw,40px)",
              fontWeight: 300, color: "var(--text-primary)",
              margin: "10px 0 10px",
            }}>Gold Circuit Serpentine</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 14,
              color: "var(--text-muted)", maxWidth: 500,
              margin: "0 auto 10px", lineHeight: 1.75,
            }}>
              Same scroll-driven serpentine structure — redesigned with a gold circuit aesthetic. Diamond nodes pulse on activation. A warm golden orb rolls along precision circuit traces.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(201,162,39,0.7)", letterSpacing: "0.06em" }}>↓ Scroll through the dark section below to activate ↓</p>
          </div>
        </section>
        <V1GoldCircuit />

        {/* ══════════════════════════════════════════
            OPTION 2
            ══════════════════════════════════════════ */}
        <section id="v2" style={{ background: "var(--bg-surface)", padding: "64px 0 28px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="section-container" style={{ textAlign: "center" }}>
            <span className="text-overline">Option 02</span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px,3.5vw,40px)",
              fontWeight: 300, color: "var(--text-primary)",
              margin: "10px 0 10px",
            }}>Holographic Vertical Timeline</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 14,
              color: "var(--text-muted)", maxWidth: 500,
              margin: "0 auto 10px", lineHeight: 1.75,
            }}>
              A gold spine fills as you scroll. Glassmorphism step cards materialise on alternating sides — each with a giant ambient step number and a sharp gold accent edge.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(201,162,39,0.7)", letterSpacing: "0.06em" }}>↓ Scroll through the dark section below to activate ↓</p>
          </div>
        </section>
        <V2HoloTimeline />

        {/* ══════════════════════════════════════════
            OPTION 3
            ══════════════════════════════════════════ */}
        <section id="v3" style={{ background: "var(--bg-surface)", padding: "64px 0 28px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="section-container" style={{ textAlign: "center" }}>
            <span className="text-overline">Option 03</span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px,3.5vw,40px)",
              fontWeight: 300, color: "var(--text-primary)",
              margin: "10px 0 10px",
            }}>Star Constellation Map</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 14,
              color: "var(--text-muted)", maxWidth: 500,
              margin: "0 auto 10px", lineHeight: 1.75,
            }}>
              Certification stages mapped as constellation stars in deep space. Gold lines connect them in sequence as you scroll. Each node pulses with a radiating glow on activation.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(201,162,39,0.7)", letterSpacing: "0.06em" }}>↓ Scroll through the dark section below to activate ↓</p>
          </div>
        </section>
        <V3Constellation />

        {/* ══════════════════════════════════════════
            OPTION 4
            ══════════════════════════════════════════ */}
        <section id="v4" style={{ background: "var(--bg-surface)", padding: "64px 0 28px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="section-container" style={{ textAlign: "center" }}>
            <span className="text-overline">Option 04</span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px,3.5vw,40px)",
              fontWeight: 300, color: "var(--text-primary)",
              margin: "10px 0 10px",
            }}>Cinematic Step Reveal</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 14,
              color: "var(--text-muted)", maxWidth: 500,
              margin: "0 auto 10px", lineHeight: 1.75,
            }}>
              One stage occupies the full viewport at a time. Scroll to advance through the journey. Monumental typography, a glowing progress bar, and a faint ambient step number create a cinematic atmosphere.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(201,162,39,0.7)", letterSpacing: "0.06em" }}>↓ Scroll through the dark section below to activate ↓</p>
          </div>
        </section>
        <V4CinematicReveal />

        {/* ── Bottom CTA ── */}
        <section style={{
          background: "#050810",
          padding: "80px 0",
          textAlign: "center",
          borderTop: "1px solid rgba(245,200,66,0.07)",
        }}>
          <div className="section-container">
            <p className="text-overline" style={{ marginBottom: 14, color: "rgba(245,200,66,0.7)" }}>Your Pick</p>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px,3.5vw,36px)",
              fontWeight: 300, color: "white", marginBottom: 12,
            }}>Which variation speaks to you?</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 15,
              color: "rgba(255,255,255,0.38)", marginBottom: 36,
              lineHeight: 1.75,
            }}>
              Tell us Option 01, 02, 03, or 04 — or mix elements from multiple — and it will be built into the live site.
            </p>
            <Link
              href={`/${locale}`}
              style={{
                fontFamily: "var(--font-body)", fontSize: 13,
                color: "rgba(245,200,66,0.6)", textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >← Back to Homepage</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
