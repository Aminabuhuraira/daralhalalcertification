"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── 7 Certification Process Steps ─────────────────── */
const STEPS = [
  { num: "01", sym: "⬡", title: "Application",      desc: "Submit business details, product list & initial documents." },
  { num: "02", sym: "⊙", title: "Screening",         desc: "Initial eligibility review & preliminary compliance check." },
  { num: "03", sym: "≡",  title: "Document Review",  desc: "Thorough ingredient, formulation & process analysis." },
  { num: "04", sym: "⊞", title: "On-Site Audit",     desc: "Physical inspection of facilities & hygiene standards." },
  { num: "05", sym: "✦", title: "Shariah Review",    desc: "Halal scholar panel review & official certification opinion." },
  { num: "06", sym: "◈", title: "Decision",          desc: "Certification committee makes the final approval." },
  { num: "07", sym: "★", title: "Certificate",       desc: "Your halal certificate & legally protected mark issued." },
];

const N  = STEPS.length;
const W  = 460;
const H  = 460;
const CX = 230;
const CY = 230;
const R  = 170; // orbital radius
const STEP_DEG = 360 / N;
const TRAVEL_DURATION = 1.85; // seconds — how long the glow takes to travel between nodes

/* ─── Helpers ────────────────────────────────────────── */
function posAtAngleDeg(deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
}
function nodePos(i: number) {
  return posAtAngleDeg(i * STEP_DEG - 90);
}

/* ─── Component ──────────────────────────────────────── */
export default function OrbitalCertification() {
  // `active` = the node the traveling glow is currently heading toward (updates immediately)
  // `lit`    = the node that visually "lights up" once the glow arrives (delayed by travel time)
  const [active, setActive] = useState(0);
  const [lit, setLit] = useState(0);
  // cumulative clockwise rotation applied to the traveling glow group — always increases,
  // so the glow only ever sweeps forward (clockwise), never snaps backward
  const [markerDeg, setMarkerDeg] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActive((p) => {
        const next = (p + 1) % N;
        setMarkerDeg((d) => d + STEP_DEG);
        setTimeout(() => setLit(next), TRAVEL_DURATION * 1000);
        return next;
      });
    }, 3800);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick = (i: number) => {
    if (i === active) return;
    const stepsForward = (i - active + N) % N;
    setActive(i);
    setMarkerDeg((d) => d + stepsForward * STEP_DEG);
    setTimeout(() => setLit(i), TRAVEL_DURATION * 1000);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startInterval();
  };

  // Comet trail behind the traveling glow — local angles before group rotation is applied
  const trailDots = [
    { offset: 0,   r: 5,   opacity: 1 },
    { offset: -7,  r: 3.6, opacity: 0.55 },
    { offset: -14, r: 2.6, opacity: 0.3 },
    { offset: -21, r: 1.7, opacity: 0.14 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.0, duration: 1.1, type: "spring", stiffness: 55 }}
      style={{ position: "relative", width: W, height: H, flexShrink: 0 }}
    >
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          {/* Center sphere gradient */}
          <radialGradient id="oc-sphere" cx="40%" cy="35%" r="70%">
            <stop offset="0%"   stopColor="#1B2A7B" />
            <stop offset="100%" stopColor="#070E28" />
          </radialGradient>

          {/* Active node glow filter */}
          <filter id="oc-nglow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sparkle glow filter */}
          <filter id="oc-sglow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Traveling glow marker filter */}
          <filter id="oc-mglow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Wide ambient glow around sphere */}
          <radialGradient id="oc-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(27,42,123,0.35)" />
            <stop offset="100%" stopColor="rgba(27,42,123,0)" />
          </radialGradient>
        </defs>

        {/* ── Ambient glow behind sphere ─────────── */}
        <circle cx={CX} cy={CY} r={90} fill="url(#oc-ambient)" />

        {/* ── Outer orbital ring — static ──────────── */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(201,162,39,0.14)"
          strokeWidth={1}
          strokeDasharray="3 9"
        />
        {/* Inner ring (decorative) */}
        <circle
          cx={CX} cy={CY} r={R * 0.56}
          fill="none"
          stroke="rgba(201,162,39,0.06)"
          strokeWidth={0.8}
        />

        {/* ── Spokes (fixed — do not rotate) + sparkle particles ── */}
        {STEPS.map((_, i) => {
          const p = nodePos(i);
          const isLit = i === lit;
          const dPath = `M ${CX} ${CY} L ${p.x} ${p.y}`;
          return (
            <g key={`line-${i}`}>
              <line
                x1={CX} y1={CY} x2={p.x} y2={p.y}
                stroke={`rgba(201,162,39,${isLit ? 0.32 : 0.08})`}
                strokeWidth={isLit ? 1.4 : 0.7}
                strokeDasharray={isLit ? "none" : "3 7"}
              />
              <circle r={2.4} fill="#F5C842" filter="url(#oc-sglow)">
                <animateMotion path={dPath} dur="2.5s" repeatCount="indefinite" begin={`${-(i * 0.35)}s`} />
              </circle>
              <circle r={1.4} fill="#DBA820" opacity={0.65}>
                <animateMotion path={dPath} dur="2.5s" repeatCount="indefinite" begin={`${-(i * 0.35 + 1.25)}s`} />
              </circle>
            </g>
          );
        })}

        {/* ── Nodes — fixed positions, light up when the glow reaches them ── */}
        {STEPS.map((step, i) => {
          const p = nodePos(i);
          const isLit = i === lit;
          return (
            <g key={`node-${i}`} onClick={() => handleNodeClick(i)} style={{ cursor: "pointer" }}>
              {isLit && (
                <circle cx={p.x} cy={p.y} r={42} fill="none" stroke="rgba(201,162,39,0.22)" strokeWidth={1}>
                  <animate attributeName="r"       values="38;48;38" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}

              <circle
                cx={p.x} cy={p.y}
                r={isLit ? 30 : 23}
                fill={isLit ? "rgba(27,42,123,0.95)" : "rgba(7,14,40,0.88)"}
                stroke={`rgba(201,162,39,${isLit ? 0.72 : 0.2})`}
                strokeWidth={isLit ? 1.8 : 1}
                filter={isLit ? "url(#oc-nglow)" : undefined}
                style={{ transition: "all 0.4s ease" }}
              />

              <text
                x={p.x} y={p.y - 7}
                textAnchor="middle"
                fill={`rgba(201,162,39,${isLit ? 0.85 : 0.42})`}
                fontSize={isLit ? 8.5 : 7}
                fontFamily="'Courier New', monospace"
                fontWeight="700"
                letterSpacing="0.1em"
              >
                {step.num}
              </text>

              <text
                x={p.x} y={p.y + 8}
                textAnchor="middle"
                fill={isLit ? "#F5C842" : "rgba(201,162,39,0.52)"}
                fontSize={isLit ? 13 : 11}
                fontFamily="serif"
              >
                {step.sym}
              </text>
            </g>
          );
        })}

        {/* ── Traveling glow — the only thing that moves; sweeps clockwise ── */}
        <motion.g
          animate={{ rotate: markerDeg }}
          transition={{ duration: TRAVEL_DURATION, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {trailDots.map((dot, idx) => {
            const tp = posAtAngleDeg(-90 + dot.offset);
            return (
              <circle
                key={idx}
                cx={tp.x} cy={tp.y}
                r={dot.r}
                fill="#F5C842"
                opacity={dot.opacity}
                filter={idx === 0 ? "url(#oc-mglow)" : undefined}
              />
            );
          })}
        </motion.g>

        {/* ── Center sphere (rendered above everything else) ── */}
        <circle cx={CX} cy={CY} r={72} fill="url(#oc-sphere)" stroke="rgba(201,162,39,0.42)" strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={62} fill="none" stroke="rgba(201,162,39,0.08)" strokeWidth={0.7} strokeDasharray="2 5" />

        {/* Sphere light reflection */}
        <ellipse
          cx={CX - 20} cy={CY - 22}
          rx={17} ry={10}
          fill="rgba(255,255,255,0.055)"
          transform={`rotate(-28, ${CX - 20}, ${CY - 22})`}
        />

        {/* Halal crescent inside sphere */}
        <text
          x={CX} y={CY + 8}
          textAnchor="middle"
          fill="rgba(201,162,39,0.22)"
          fontSize={38}
          fontFamily="serif"
        >
          ☽
        </text>
      </svg>

      {/* ── Center info overlay (HTML above SVG) ─────────── */}
      <div
        style={{
          position: "absolute",
          top:  `${(CY / H) * 100}%`,
          left: `${(CX / W) * 100}%`,
          transform: "translate(-50%, -52%)",
          width: 122,
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={lit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 8,
                color: "rgba(201,162,39,0.72)",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              STEP {STEPS[lit].num}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: 500,
                color: "white",
                lineHeight: 1.25,
                marginBottom: 5,
              }}
            >
              {STEPS[lit].title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 9,
                color: "rgba(255,255,255,0.44)",
                lineHeight: 1.55,
              }}
            >
              {STEPS[lit].desc}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
