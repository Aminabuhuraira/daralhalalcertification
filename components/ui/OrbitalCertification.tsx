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

/* ─── Helpers ────────────────────────────────────────── */
function angleRad(i: number) {
  return ((i * STEP_DEG) - 90) * (Math.PI / 180);
}
function nodePos(i: number) {
  const a = angleRad(i);
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
}

/* ─── Component ──────────────────────────────────────── */
export default function OrbitalCertification() {
  const [active, setActive] = useState(0);
  const [rotDeg, setRotDeg] = useState(0);
  // delay center-panel update so text changes AFTER node arrives at top
  const [display, setDisplay] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActive(p => {
        const next = (p + 1) % N;
        setRotDeg(r => r - STEP_DEG);
        setTimeout(() => setDisplay(next), 900);
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
    const stepsForward = ((i - active + N) % N);
    setActive(i);
    setRotDeg(r => r - stepsForward * STEP_DEG);
    setTimeout(() => setDisplay(i), 900);
    // Reset timer
    if (intervalRef.current) clearInterval(intervalRef.current);
    startInterval();
  };

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

          {/* Wide ambient glow around sphere */}
          <radialGradient id="oc-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(27,42,123,0.35)" />
            <stop offset="100%" stopColor="rgba(27,42,123,0)" />
          </radialGradient>
        </defs>

        {/* ── Ambient glow behind sphere ─────────── */}
        <circle cx={CX} cy={CY} r={90} fill="url(#oc-ambient)" />

        {/* ── Outer orbital ring ──────────────────── */}
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

        {/* ── Spotlight indicator (fixed at 12 o'clock = top) ─ */}
        <circle
          cx={CX} cy={CY - R}
          r={38}
          fill="rgba(201,162,39,0.04)"
          stroke="rgba(201,162,39,0.3)"
          strokeWidth={1.5}
        />

        {/* ── Rotating group ──────────────────────── */}
        <motion.g
          animate={{ rotate: rotDeg }}
          transition={{ duration: 1.85, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {/* Connection lines + sparkle particles */}
          {STEPS.map((_, i) => {
            const p = nodePos(i);
            const isAct = i === active;
            // sparkle travels from center to node
            const dPath = `M ${CX} ${CY} L ${p.x} ${p.y}`;
            return (
              <g key={`line-${i}`}>
                {/* Dashed connection line */}
                <line
                  x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke={`rgba(201,162,39,${isAct ? 0.32 : 0.08})`}
                  strokeWidth={isAct ? 1.4 : 0.7}
                  strokeDasharray={isAct ? "none" : "3 7"}
                />
                {/* Sparkle particle 1 */}
                <circle r={2.4} fill="#F5C842" filter="url(#oc-sglow)">
                  <animateMotion
                    path={dPath}
                    dur="2.5s"
                    repeatCount="indefinite"
                    begin={`${-(i * 0.35)}s`}
                  />
                </circle>
                {/* Sparkle particle 2 — trailing, smaller */}
                <circle r={1.4} fill="#DBA820" opacity={0.65}>
                  <animateMotion
                    path={dPath}
                    dur="2.5s"
                    repeatCount="indefinite"
                    begin={`${-(i * 0.35 + 1.25)}s`}
                  />
                </circle>
              </g>
            );
          })}

          {/* Nodes */}
          {STEPS.map((step, i) => {
            const p   = nodePos(i);
            const isAct = i === active;
            return (
              <g key={`node-${i}`} onClick={() => handleNodeClick(i)} style={{ cursor: "pointer" }}>
                {/* Pulse ring for active node */}
                {isAct && (
                  <circle cx={p.x} cy={p.y} r={42} fill="none" stroke="rgba(201,162,39,0.22)" strokeWidth={1}>
                    <animate attributeName="r"       values="38;48;38" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node background circle */}
                <circle
                  cx={p.x} cy={p.y}
                  r={isAct ? 30 : 23}
                  fill={isAct ? "rgba(27,42,123,0.95)" : "rgba(7,14,40,0.88)"}
                  stroke={`rgba(201,162,39,${isAct ? 0.72 : 0.2})`}
                  strokeWidth={isAct ? 1.8 : 1}
                  filter={isAct ? "url(#oc-nglow)" : undefined}
                />

                {/* Step number — small label above symbol */}
                <text
                  x={p.x} y={p.y - 7}
                  textAnchor="middle"
                  fill={`rgba(201,162,39,${isAct ? 0.85 : 0.42})`}
                  fontSize={isAct ? 8.5 : 7}
                  fontFamily="'Courier New', monospace"
                  fontWeight="700"
                  letterSpacing="0.1em"
                >
                  {step.num}
                </text>

                {/* Step symbol */}
                <text
                  x={p.x} y={p.y + 8}
                  textAnchor="middle"
                  fill={isAct ? "#F5C842" : "rgba(201,162,39,0.52)"}
                  fontSize={isAct ? 13 : 11}
                  fontFamily="serif"
                >
                  {step.sym}
                </text>
              </g>
            );
          })}
        </motion.g>

        {/* ── Center sphere (rendered above rotating group) ── */}
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
            key={display}
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
              STEP {STEPS[display].num}
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
              {STEPS[display].title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 9,
                color: "rgba(255,255,255,0.44)",
                lineHeight: 1.55,
              }}
            >
              {STEPS[display].desc}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Step label below active node (at 12-o-clock) ─── */}
      <div
        style={{
          position: "absolute",
          top: `${((CY - R - 60) / H) * 100}%`,
          left: `${(CX / W) * 100}%`,
          transform: "translate(-50%, 0)",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={display}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
          >
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(245,200,66,0.85)",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              {STEPS[display].title}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
