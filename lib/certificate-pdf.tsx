import React from "react";
import {
  Document, Page, View, Text, Image,
  Svg, Circle, Ellipse, Rect, Path, Line,
  renderToBuffer,
} from "@react-pdf/renderer";

// ── colour palette matching the sample ─────────────────────────────────────
const PURPLE      = "#3D2B7A";
const PURPLE_DARK = "#2D1B62";
const GOLD        = "#B8962A";
const GOLD_LIGHT  = "#D4AF37";
const GOLD_BRIGHT = "#F0C84A";
const CREAM       = "#F5F2EC";
const BODY_TEXT   = "#3A2A7A";
const GRAY_TEXT   = "#5A5080";

// A4 landscape dimensions (pts)
const PW = 841.89;
const PH = 595.28;

// Layout constants
const OP  = 30;   // outer padding (where corner panels sit)
const CS  = 100;  // corner panel size
const GAP = 10;   // gap between corner and inner border

// ── helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Generate SVG path data for a diamond lattice tiling a rectangle
function diamondLattice(w: number, h: number): string {
  const sp = 16;   // spacing
  const r  = 4;    // half-diagonal
  let d = "";
  for (let row = -1; row * sp * 0.75 < h + sp; row++) {
    for (let col = -1; col * sp < w + sp; col++) {
      const cx = col * sp + (row % 2 !== 0 ? sp / 2 : 0);
      const cy = row * sp * 0.75;
      d += `M${cx.toFixed(1)},${(cy - r).toFixed(1)} L${(cx + r).toFixed(1)},${cy.toFixed(1)} L${cx.toFixed(1)},${(cy + r).toFixed(1)} L${(cx - r).toFixed(1)},${cy.toFixed(1)} Z `;
    }
  }
  return d;
}

// Small diamond ornament SVG (gold)
function Diamond({ size = 12 }: { size?: number }) {
  const h = size, w = size * 0.65;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Path d={`M${w / 2},0 L${w},${h / 2} L${w / 2},${h} L0,${h / 2} Z`} fill={GOLD_BRIGHT} />
    </Svg>
  );
}

// Globe icon SVG
function GlobeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={8.5} fill="none" stroke={PURPLE} strokeWidth={1.2} />
      <Ellipse cx={10} cy={10} rx={4} ry={8.5} fill="none" stroke={PURPLE} strokeWidth={0.8} />
      <Line x1={1.5} y1={10} x2={18.5} y2={10} stroke={PURPLE} strokeWidth={0.8} />
      <Line x1={3}   y1={5.5} x2={17}  y2={5.5} stroke={PURPLE} strokeWidth={0.6} />
      <Line x1={3}   y1={14.5} x2={17} y2={14.5} stroke={PURPLE} strokeWidth={0.6} />
    </Svg>
  );
}

// Calendar icon SVG
function CalendarIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Rect x={1} y={2.5} width={14} height={12} rx={1.5} fill="none" stroke={PURPLE} strokeWidth={1.1} />
      <Line x1={1} y1={6.5} x2={15} y2={6.5} stroke={PURPLE} strokeWidth={0.9} />
      <Line x1={5} y1={1}   x2={5}  y2={4}   stroke={PURPLE} strokeWidth={1.2} />
      <Line x1={11} y1={1}  x2={11} y2={4}   stroke={PURPLE} strokeWidth={1.2} />
    </Svg>
  );
}

// Hourglass icon SVG
function HourglassIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path d="M2,1 L14,1 L14,3 L9.5,8 L14,13 L14,15 L2,15 L2,13 L6.5,8 L2,3 Z" fill="none" stroke={PURPLE} strokeWidth={1.1} />
      <Path d="M2,13 L6.5,10 L9.5,10 L14,13 Z" fill={PURPLE} opacity="0.3" />
    </Svg>
  );
}

// Ring icon (concentric circles) — used for Reference Standards / Scope
function RingIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15">
      <Circle cx={7.5} cy={7.5} r={6.5} fill="none" stroke={PURPLE} strokeWidth={1} />
      <Circle cx={7.5} cy={7.5} r={3.2} fill="none" stroke={PURPLE} strokeWidth={0.8} />
      <Circle cx={7.5} cy={7.5} r={0.9} fill={PURPLE} />
    </Svg>
  );
}

// Document icon — used for Product Description
function DocIcon() {
  return (
    <Svg width={13} height={15} viewBox="0 0 13 15">
      <Rect x={1} y={0.75} width={11} height={13.5} rx={1} fill="none" stroke={PURPLE} strokeWidth={1} />
      <Line x1={3.2} y1={4.5} x2={9.8} y2={4.5} stroke={PURPLE} strokeWidth={0.8} />
      <Line x1={3.2} y1={7.25} x2={9.8} y2={7.25} stroke={PURPLE} strokeWidth={0.8} />
      <Line x1={3.2} y1={10} x2={7.5} y2={10} stroke={PURPLE} strokeWidth={0.8} />
    </Svg>
  );
}

// Cube / package icon — used for Product
function CubeIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15">
      <Path d="M7.5,1 L13.5,4.2 L13.5,10.8 L7.5,14 L1.5,10.8 L1.5,4.2 Z" fill="none" stroke={PURPLE} strokeWidth={1} />
      <Line x1={7.5} y1={7.4} x2={7.5} y2={14} stroke={PURPLE} strokeWidth={0.8} />
      <Line x1={7.5} y1={7.4} x2={1.5} y2={4.2} stroke={PURPLE} strokeWidth={0.8} />
      <Line x1={7.5} y1={7.4} x2={13.5} y2={4.2} stroke={PURPLE} strokeWidth={0.8} />
    </Svg>
  );
}

// 2×2 grid icon — used for Product Category
function GridIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Rect x={0.5} y={0.5} width={5.5} height={5.5} rx={1} fill={PURPLE} />
      <Rect x={8} y={0.5} width={5.5} height={5.5} rx={1} fill={PURPLE} opacity={0.55} />
      <Rect x={0.5} y={8} width={5.5} height={5.5} rx={1} fill={PURPLE} opacity={0.55} />
      <Rect x={8} y={8} width={5.5} height={5.5} rx={1} fill={PURPLE} />
    </Svg>
  );
}

// Diamond lattice restricted to one half of a square (for triangular corner panels)
function diamondLatticeTriangle(size: number, corner: "tl" | "br"): string {
  const sp = 14, r = 3.2;
  let d = "";
  for (let row = -1; row * sp * 0.75 < size + sp; row++) {
    for (let col = -1; col * sp < size + sp; col++) {
      const cx = col * sp + (row % 2 !== 0 ? sp / 2 : 0);
      const cy = row * sp * 0.75;
      if (cx < 2 || cy < 2 || cx > size - 2 || cy > size - 2) continue;
      const inside = corner === "tl" ? (cx + cy <= size - 8) : (cx + cy >= size + 8);
      if (!inside) continue;
      d += `M${cx.toFixed(1)},${(cy - r).toFixed(1)} L${(cx + r).toFixed(1)},${cy.toFixed(1)} L${cx.toFixed(1)},${(cy + r).toFixed(1)} L${(cx - r).toFixed(1)},${cy.toFixed(1)} Z `;
    }
  }
  return d;
}

// Triangular Islamic-motif corner panel (top-left / bottom-right), matching the DAHC template
function TriangleCorner({ size, corner }: { size: number; corner: "tl" | "br" }) {
  const trianglePath = corner === "tl"
    ? `M0,0 L${size},0 L0,${size} Z`
    : `M${size},${size} L0,${size} L${size},0 Z`;
  const hyp = corner === "tl"
    ? { x1: size, y1: 0, x2: 0, y2: size }
    : { x1: 0, y1: size, x2: size, y2: 0 };
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={trianglePath} fill={PURPLE} />
      <Path d={diamondLatticeTriangle(size, corner)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.6} />
      <Line x1={hyp.x1} y1={hyp.y1} x2={hyp.x2} y2={hyp.y2} stroke={GOLD_BRIGHT} strokeWidth={2} />
    </Svg>
  );
}

// A labelled info row with a small icon, caption, value, and an underline (the "blank line" motif)
function InfoRow({ icon, label, value, align = "left" }: { icon: React.ReactNode; label: string; value: string; align?: "left" | "right" }) {
  return (
    <View style={{ marginBottom: 11, alignItems: align === "right" ? "flex-end" : "flex-start" }}>
      <View style={{ flexDirection: align === "right" ? "row-reverse" : "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
        {icon}
        <Text style={{
          fontFamily: "Helvetica-Bold", fontSize: 7.5, color: PURPLE,
          letterSpacing: 0.8, textTransform: "uppercase",
        }}>
          {label}
        </Text>
      </View>
      <Text style={{
        fontFamily: "Times-Roman", fontSize: 9.5, color: BODY_TEXT,
        textAlign: align, maxWidth: 195,
      }}>
        {value}
      </Text>
      <View style={{ width: 190, height: 0.6, backgroundColor: "rgba(61,43,122,0.28)", marginTop: 3 }} />
    </View>
  );
}

// Corner panel — purple background with diamond lattice
function CornerPanel({ w, h }: { w: number; h: number }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={0} y={0} width={w} height={h} fill={PURPLE} />
      <Path d={diamondLattice(w, h)} fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth={0.7} />
      {/* subtle inner highlight line */}
      <Line x1={w} y1={0} x2={w} y2={h} stroke={GOLD} strokeWidth={1.5} />
      <Line x1={0} y1={h} x2={w} y2={h} stroke={GOLD} strokeWidth={1.5} />
    </Svg>
  );
}

// ── exported types ──────────────────────────────────────────────────────────

export type CertificateData = {
  serial: string;
  tier: "COMPLETION" | "DISTINCTION" | "BUSINESS";
  issuedAt: Date;
  expiresAt?: Date | null;
  holderName: string;
  courseTitle?: string | null;
  sector?: string | null;
  qrDataUrl?: string | null;
  // BUSINESS tier only — fields for the official Halal Certificate layout
  referenceStandards?: string;
  scopeOfCertification?: string;
  productDescription?: string;
  product?: string;
  productCategory?: string;
  chairmanName?: string;
};

// ── certificate document ────────────────────────────────────────────────────

function CertDoc({
  serial, tier, issuedAt, expiresAt,
  holderName, courseTitle, sector, qrDataUrl,
}: CertificateData) {
  const isBusiness = tier === "BUSINESS";

  const subtitleMap = {
    BUSINESS:    "OF HALAL CERTIFICATION",
    DISTINCTION: "OF DISTINCTION",
    COMPLETION:  "OF COMPLETION",
  };

  const scope = isBusiness
    ? (sector ?? "General Halal Compliance")
    : (courseTitle ?? "Halal Training Programme");

  const expiryLabel = expiresAt
    ? fmtDate(expiresAt)
    : "1 year from date of issue";

  // Inner content area bounds
  const CX = OP + CS + GAP;           // content left X
  const CY = OP + CS + GAP;           // content top Y
  const CW = PW - 2 * CX;            // content width
  const CH = PH - 2 * CY;            // content height

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ backgroundColor: CREAM }}>

        {/* ═══ CORNER PANELS ═══════════════════════════════════════════════ */}
        {/* Top-left */}
        <View style={{ position: "absolute", top: OP, left: OP, width: CS, height: CS }}>
          <CornerPanel w={CS} h={CS} />
        </View>
        {/* Top-right */}
        <View style={{ position: "absolute", top: OP, right: OP, width: CS, height: CS }}>
          <Svg width={CS} height={CS} viewBox={`0 0 ${CS} ${CS}`}>
            <Rect x={0} y={0} width={CS} height={CS} fill={PURPLE} />
            <Path d={diamondLattice(CS, CS)} fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth={0.7} />
            <Line x1={0} y1={0} x2={0} y2={CS} stroke={GOLD} strokeWidth={1.5} />
            <Line x1={0} y1={CS} x2={CS} y2={CS} stroke={GOLD} strokeWidth={1.5} />
          </Svg>
        </View>
        {/* Bottom-left */}
        <View style={{ position: "absolute", bottom: OP, left: OP, width: CS, height: CS }}>
          <Svg width={CS} height={CS} viewBox={`0 0 ${CS} ${CS}`}>
            <Rect x={0} y={0} width={CS} height={CS} fill={PURPLE} />
            <Path d={diamondLattice(CS, CS)} fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth={0.7} />
            <Line x1={CS} y1={0} x2={CS} y2={CS} stroke={GOLD} strokeWidth={1.5} />
            <Line x1={0}  y1={0} x2={CS} y2={0}  stroke={GOLD} strokeWidth={1.5} />
          </Svg>
        </View>
        {/* Bottom-right */}
        <View style={{ position: "absolute", bottom: OP, right: OP, width: CS, height: CS }}>
          <Svg width={CS} height={CS} viewBox={`0 0 ${CS} ${CS}`}>
            <Rect x={0} y={0} width={CS} height={CS} fill={PURPLE} />
            <Path d={diamondLattice(CS, CS)} fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth={0.7} />
            <Line x1={0} y1={0}  x2={0} y2={CS}  stroke={GOLD} strokeWidth={1.5} />
            <Line x1={0} y1={0}  x2={CS} y2={0}  stroke={GOLD} strokeWidth={1.5} />
          </Svg>
        </View>

        {/* ═══ GOLD BORDER LINES (connecting corners) ══════════════════════ */}
        {/* Top */}
        <View style={{ position: "absolute", top: OP, left: OP + CS, right: OP + CS, height: 2, backgroundColor: GOLD }} />
        {/* Bottom */}
        <View style={{ position: "absolute", bottom: OP, left: OP + CS, right: OP + CS, height: 2, backgroundColor: GOLD }} />
        {/* Left */}
        <View style={{ position: "absolute", left: OP, top: OP + CS, bottom: OP + CS, width: 2, backgroundColor: GOLD }} />
        {/* Right */}
        <View style={{ position: "absolute", right: OP, top: OP + CS, bottom: OP + CS, width: 2, backgroundColor: GOLD }} />

        {/* ═══ INNER THIN GOLD BORDER ══════════════════════════════════════ */}
        <View style={{
          position: "absolute",
          top:    OP + 8,  left:  OP + 8,
          right:  OP + 8,  bottom: OP + 8,
          borderWidth: 0.6,
          borderColor: GOLD,
        }} />

        {/* ═══ DIAMOND ORNAMENTS at midpoints of each gold border side ═══ */}
        {/* Top */}
        <View style={{ position: "absolute", top: OP - 6, left: 0, right: 0, alignItems: "center" }}>
          <Diamond size={14} />
        </View>
        {/* Bottom */}
        <View style={{ position: "absolute", bottom: OP - 6, left: 0, right: 0, alignItems: "center" }}>
          <Diamond size={14} />
        </View>
        {/* Left */}
        <View style={{ position: "absolute", left: OP - 5, top: PH / 2 - 7 }}>
          <Diamond size={14} />
        </View>
        {/* Right */}
        <View style={{ position: "absolute", right: OP - 5, top: PH / 2 - 7 }}>
          <Diamond size={14} />
        </View>

        {/* ═══ CERTIFICATE ID + QR (top-right corner area) ════════════════ */}
        <View style={{
          position: "absolute",
          top:   OP + 10,
          right: OP + 10,
          width: CS - 14,
          alignItems: "center",
        }}>
          <Text style={{
            fontFamily: "Helvetica-Bold", fontSize: 6.5, color: "#FFFFFF",
            letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2,
          }}>
            Certificate ID
          </Text>
          <View style={{ width: 70, height: 0.5, backgroundColor: GOLD_BRIGHT, marginBottom: 3 }} />
          <Text style={{
            fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#FFFFFF", marginBottom: 6,
          }}>
            {serial}
          </Text>
          {qrDataUrl && (
            <View style={{
              padding: 3, backgroundColor: "#FFFFFF",
              borderRadius: 3, borderWidth: 1.5, borderColor: GOLD_LIGHT,
            }}>
              <Image src={qrDataUrl} style={{ width: 68, height: 68 }} />
            </View>
          )}
        </View>

        {/* ═══ MAIN CONTENT (between corner panels) ════════════════════════ */}
        <View style={{
          position: "absolute",
          top:   CY,
          left:  CX,
          width: CW,
          height: CH,
          flexDirection: "column",
        }}>

          {/* ── HEADER: title + subtitle ── */}
          <View style={{ alignItems: "center", marginBottom: 5 }}>
            <Text style={{
              fontFamily: "Times-Bold", fontSize: 40,
              color: PURPLE_DARK, letterSpacing: 10,
              textAlign: "center", marginBottom: 2,
            }}>
              CERTIFICATE
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Diamond size={9} />
              <Text style={{
                fontFamily: "Helvetica", fontSize: 10,
                color: GOLD, letterSpacing: 2.5,
              }}>
                {subtitleMap[tier]}
              </Text>
              <Diamond size={9} />
            </View>
          </View>

          {/* ── DIVIDER ── */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 4 }}>
            <View style={{ flex: 1, height: 0.75, backgroundColor: GOLD }} />
            <Diamond size={10} />
            <View style={{ flex: 1, height: 0.75, backgroundColor: GOLD }} />
          </View>

          {/* ── MIDDLE: company name (left) + QR placeholder right ── */}
          <View style={{ flexDirection: "row", flex: 1, gap: 12 }}>

            {/* Left: text body */}
            <View style={{ flex: 1, alignItems: "center" }}>

              <Text style={{
                fontFamily: "Helvetica", fontSize: 8.5,
                color: PURPLE, letterSpacing: 2,
                textAlign: "center", marginBottom: 5,
              }}>
                • THIS IS TO CERTIFY THAT •
              </Text>

              <Text style={{
                fontFamily: "Times-BoldItalic", fontSize: 26,
                color: PURPLE_DARK, textAlign: "center", marginBottom: 4,
              }}>
                {holderName}
              </Text>

              {/* Thin divider under name */}
              <View style={{ flexDirection: "row", alignItems: "center", width: "75%", marginBottom: 7, gap: 4 }}>
                <View style={{ flex: 1, height: 0.5, backgroundColor: PURPLE, opacity: 0.3 }} />
                <Diamond size={8} />
                <View style={{ flex: 1, height: 0.5, backgroundColor: PURPLE, opacity: 0.3 }} />
              </View>

              {/* Body paragraph */}
              <Text style={{
                fontFamily: "Times-Roman", fontSize: 10,
                color: GRAY_TEXT, textAlign: "center",
                lineHeight: 1.7, maxWidth: 400,
              }}>
                {isBusiness
                  ? `has been assessed and certified as Halal in accordance with the\nstandards and procedures of Dar Al Halal Certification.\nThis certificate is valid for the scope of certification listed below.`
                  : `has successfully completed all requirements for this certification\nin accordance with the standards of Dar Al Halal Certification.`}
              </Text>
            </View>

            {/* Right: spacer (QR is in the corner panel above) */}
            <View style={{ width: CS - 14 }} />
          </View>

          {/* ── BOTTOM ROW: scope | halal seal | dates ── */}
          <View style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: 6,
          }}>

            {/* Left: Scope + CEO signature */}
            <View style={{ width: 175 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 7, marginBottom: 10 }}>
                <GlobeIcon />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: "Helvetica-Bold", fontSize: 7, color: PURPLE,
                    letterSpacing: 0.6, marginBottom: 3,
                  }}>
                    CERTIFICATION SCOPE
                  </Text>
                  <Text style={{ fontFamily: "Times-Roman", fontSize: 9.5, color: BODY_TEXT, lineHeight: 1.5 }}>
                    {scope}
                  </Text>
                </View>
              </View>
              <View style={{ width: 150, height: 0.5, backgroundColor: PURPLE_DARK, marginBottom: 4 }} />
              <Text style={{
                fontFamily: "Helvetica", fontSize: 7, color: PURPLE_DARK,
                letterSpacing: 0.5,
              }}>
                CHIEF EXECUTIVE OFFICER
              </Text>
            </View>

            {/* Center: Halal seal */}
            <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
              <Svg width={82} height={82} viewBox="0 0 82 82">
                {/* Outer glow ring */}
                <Circle cx={41} cy={41} r={40} fill={PURPLE} stroke={GOLD_BRIGHT} strokeWidth={1.5} />
                {/* Inner gold ring */}
                <Circle cx={41} cy={41} r={34} fill="none" stroke={GOLD} strokeWidth={0.75} />
                {/* Sparkle dots at compass points */}
                <Circle cx={41}  cy={5}  r={2.5} fill={GOLD_BRIGHT} />
                <Circle cx={41}  cy={77} r={2.5} fill={GOLD_BRIGHT} />
                <Circle cx={5}   cy={41} r={2.5} fill={GOLD_BRIGHT} />
                <Circle cx={77}  cy={41} r={2.5} fill={GOLD_BRIGHT} />
                {/* Inner star-like decoration dots */}
                <Circle cx={16}  cy={16} r={1.5} fill={GOLD_LIGHT} opacity="0.6" />
                <Circle cx={66}  cy={16} r={1.5} fill={GOLD_LIGHT} opacity="0.6" />
                <Circle cx={16}  cy={66} r={1.5} fill={GOLD_LIGHT} opacity="0.6" />
                <Circle cx={66}  cy={66} r={1.5} fill={GOLD_LIGHT} opacity="0.6" />
              </Svg>
              {/* HALAL text overlaid — use a separate Text beneath */}
              <View style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                alignItems: "center", justifyContent: "center", gap: 1,
              }}>
                <Text style={{
                  fontFamily: "Times-BoldItalic", fontSize: 15,
                  color: GOLD_BRIGHT, letterSpacing: 1,
                }}>HALAL</Text>
                <Text style={{
                  fontFamily: "Helvetica", fontSize: 5.5,
                  color: GOLD, letterSpacing: 2.5,
                }}>CERTIFIED</Text>
              </View>
            </View>

            {/* Right: Dates + Chairman signature */}
            <View style={{ width: 175, alignItems: "flex-end" }}>
              {/* Issue date */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <CalendarIcon />
                <View>
                  <Text style={{
                    fontFamily: "Helvetica-Bold", fontSize: 7, color: PURPLE,
                    letterSpacing: 0.6, marginBottom: 2,
                  }}>
                    ISSUE DATE
                  </Text>
                  <Text style={{ fontFamily: "Times-Roman", fontSize: 9.5, color: BODY_TEXT }}>
                    {fmtDate(issuedAt)}
                  </Text>
                </View>
              </View>
              {/* Expiry date */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <HourglassIcon />
                <View>
                  <Text style={{
                    fontFamily: "Helvetica-Bold", fontSize: 7, color: PURPLE,
                    letterSpacing: 0.6, marginBottom: 2,
                  }}>
                    EXPIRY DATE
                  </Text>
                  <Text style={{ fontFamily: "Times-Roman", fontSize: 9.5, color: BODY_TEXT }}>
                    {expiryLabel}
                  </Text>
                </View>
              </View>
              <View style={{ width: 150, height: 0.5, backgroundColor: PURPLE_DARK, marginBottom: 4 }} />
              <Text style={{
                fontFamily: "Helvetica", fontSize: 7, color: PURPLE_DARK,
                letterSpacing: 0.5,
              }}>
                CHAIRMAN SHARIAH BOARD
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ WEBSITE PILL at bottom center ═══════════════════════════════ */}
        <View style={{
          position: "absolute",
          bottom: OP + CS - 2,
          left: 0, right: 0,
          alignItems: "center",
        }}>
          <View style={{
            backgroundColor: PURPLE,
            borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 5,
            flexDirection: "row", alignItems: "center", gap: 5,
          }}>
            <Svg width={10} height={10} viewBox="0 0 10 10">
              <Circle cx={5} cy={5} r={4.2} fill="none" stroke="#FFFFFF" strokeWidth={0.8} />
              <Ellipse cx={5} cy={5} rx={2} ry={4.2} fill="none" stroke="#FFFFFF" strokeWidth={0.6} />
              <Line x1={0.8} y1={5} x2={9.2} y2={5} stroke="#FFFFFF" strokeWidth={0.6} />
            </Svg>
            <Text style={{
              fontFamily: "Helvetica", fontSize: 9,
              color: "#FFFFFF", letterSpacing: 0.3,
            }}>
              daralhalalcertification.com
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}

// ── official Halal Certificate (BUSINESS tier) ──────────────────────────────
// Matches the DAHC certificate template: two triangular Islamic-motif corners,
// a left column of certification details, a centre Halal roundel + chairman
// signature, and a right column of dates + a QR/stamp frame.

function BusinessCertDoc({
  serial, issuedAt, expiresAt, holderName,
  referenceStandards, scopeOfCertification, productDescription, product, productCategory,
  chairmanName, qrDataUrl,
}: CertificateData) {
  const CN = 150; // corner triangle size

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ backgroundColor: CREAM }}>

        {/* ═══ CORNER PANELS (top-left / bottom-right only) ═══ */}
        <View style={{ position: "absolute", top: 0, left: 0, width: CN, height: CN }}>
          <TriangleCorner size={CN} corner="tl" />
        </View>
        <View style={{ position: "absolute", bottom: 0, right: 0, width: CN, height: CN }}>
          <TriangleCorner size={CN} corner="br" />
        </View>

        {/* ═══ OUTER THIN BORDER + edge diamond ornaments ═══ */}
        <View style={{
          position: "absolute", top: OP, left: OP, right: OP, bottom: OP,
          borderWidth: 0.75, borderColor: PURPLE,
        }} />
        <View style={{ position: "absolute", top: OP - 6, left: 0, right: 0, alignItems: "center" }}><Diamond size={13} /></View>
        <View style={{ position: "absolute", bottom: OP - 6, left: 0, right: 0, alignItems: "center" }}><Diamond size={13} /></View>
        <View style={{ position: "absolute", left: OP - 6, top: PH / 2 - 6 }}><Diamond size={13} /></View>
        <View style={{ position: "absolute", right: OP - 6, top: PH / 2 - 6 }}><Diamond size={13} /></View>

        {/* ═══ CERTIFICATE ID (top-right) ═══ */}
        <View style={{ position: "absolute", top: OP + 6, right: OP + 14, alignItems: "flex-end" }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8, color: PURPLE, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 }}>
            Certificate ID
          </Text>
          <View style={{ width: 130, height: 0.75, backgroundColor: GOLD, marginBottom: 4 }} />
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10, color: PURPLE_DARK }}>{serial}</Text>
        </View>

        {/* ═══ MAIN CONTENT ═══ */}
        <View style={{ position: "absolute", top: OP + 20, left: OP + 44, right: OP + 44, bottom: OP + 20 }}>

          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontFamily: "Times-Bold", fontSize: 30, color: PURPLE_DARK, letterSpacing: 3 }}>DAR AL HALAL</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
              <View style={{ width: 40, height: 0.75, backgroundColor: GOLD }} />
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10, color: GOLD, letterSpacing: 2.5 }}>HALAL CERTIFICATE</Text>
              <View style={{ width: 40, height: 0.75, backgroundColor: GOLD }} />
            </View>
          </View>

          {/* Big title */}
          <Text style={{ fontFamily: "Times-Bold", fontSize: 36, color: PURPLE, letterSpacing: 4, textAlign: "center", marginBottom: 8 }}>
            HALAL CERTIFICATE
          </Text>

          {/* Certify-that divider */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <View style={{ width: 90, height: 0.75, backgroundColor: GOLD }} />
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5, color: PURPLE, letterSpacing: 2 }}>• THIS IS TO CERTIFY THAT •</Text>
            <View style={{ width: 90, height: 0.75, backgroundColor: GOLD }} />
          </View>

          {/* Business name (the filled-in "blank") */}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontFamily: "Times-BoldItalic", fontSize: 24, color: PURPLE_DARK, textAlign: "center" }}>
              {holderName}
            </Text>
            <View style={{ width: 320, height: 0.75, backgroundColor: PURPLE, opacity: 0.4, marginTop: 4 }} />
          </View>

          {/* Paragraph */}
          <Text style={{
            fontFamily: "Times-Roman", fontSize: 10, color: GRAY_TEXT,
            textAlign: "center", lineHeight: 1.6, marginBottom: 16,
          }}>
            has been assessed and certified as Halal in accordance with the standards and procedures of{"\n"}
            Dar Al Halal Certification. This certificate is valid for the scope of certification listed below.
          </Text>

          {/* Three-column body: details | seal | dates */}
          <View style={{ flexDirection: "row", flex: 1, justifyContent: "space-between" }}>

            {/* Left column */}
            <View style={{ width: 210 }}>
              <InfoRow icon={<RingIcon />}  label="Reference Standards"    value={referenceStandards || "MS 1500:2019 · OIC/SMIIC 1:2019"} />
              <InfoRow icon={<RingIcon />}  label="Scope of Certification" value={scopeOfCertification || "General Halal Compliance"} />
              <InfoRow icon={<DocIcon />}   label="Product Description"    value={productDescription || "—"} />
              <InfoRow icon={<CubeIcon />}  label="Product"                value={product || "—"} />
              <InfoRow icon={<GridIcon />}  label="Product Category"       value={productCategory || "—"} />
            </View>

            {/* Centre column: seal + signature */}
            <View style={{ width: 170, alignItems: "center" }}>
              <Svg width={92} height={92} viewBox="0 0 92 92" style={{ marginBottom: 8 }}>
                <Circle cx={46} cy={46} r={45} fill={PURPLE} stroke={GOLD_BRIGHT} strokeWidth={1.5} />
                <Circle cx={46} cy={46} r={38} fill="none" stroke={GOLD} strokeWidth={0.75} />
                <Circle cx={46} cy={6}  r={2.6} fill={GOLD_BRIGHT} />
                <Circle cx={46} cy={86} r={2.6} fill={GOLD_BRIGHT} />
                <Circle cx={6}  cy={46} r={2.6} fill={GOLD_BRIGHT} />
                <Circle cx={86} cy={46} r={2.6} fill={GOLD_BRIGHT} />
              </Svg>
              <View style={{ position: "absolute", top: 8, alignItems: "center", justifyContent: "center", width: 92, height: 92, gap: 2 }}>
                <Text style={{ fontFamily: "Times-BoldItalic", fontSize: 17, color: GOLD_BRIGHT, letterSpacing: 1 }}>HALAL</Text>
                <Text style={{ fontFamily: "Helvetica", fontSize: 6, color: GOLD, letterSpacing: 2.5 }}>CERTIFIED</Text>
              </View>

              <Text style={{ fontFamily: "Times-BoldItalic", fontSize: 15, color: PURPLE_DARK, marginTop: 6 }}>
                {(chairmanName || "Dr. Asheikh A. Maidugu, mni").split(",")[0]}
              </Text>
              <View style={{ width: 150, height: 0.6, backgroundColor: PURPLE_DARK, marginTop: 4, marginBottom: 4 }} />
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: PURPLE_DARK, letterSpacing: 1, textAlign: "center" }}>
                {chairmanName?.includes(",") ? chairmanName.split(",")[1].trim().toUpperCase() : "MNI"}
              </Text>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: PURPLE_DARK, letterSpacing: 1 }}>
                EXECUTIVE CHAIRMAN
              </Text>
            </View>

            {/* Right column: QR/stamp frame + dates */}
            <View style={{ width: 210, alignItems: "flex-end" }}>
              <View style={{
                width: 110, height: 110, marginBottom: 12,
                borderWidth: 1, borderColor: PURPLE, padding: 6,
                alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF",
              }}>
                {qrDataUrl
                  ? <Image src={qrDataUrl} style={{ width: 96, height: 96 }} />
                  : <Text style={{ fontFamily: "Helvetica", fontSize: 7, color: GRAY_TEXT, textAlign: "center" }}>Verification QR</Text>}
              </View>
              <InfoRow icon={<CalendarIcon />} label="Date of Issue"       value={fmtDate(issuedAt)} align="right" />
              <InfoRow icon={<HourglassIcon />} label="Date of Expiry"    value={expiresAt ? fmtDate(expiresAt) : "1 year from issue"} align="right" />
              <InfoRow icon={<RingIcon />}      label="Certificate Number" value={serial} align="right" />
            </View>
          </View>
        </View>

        {/* ═══ Ownership notice (bottom-right) ═══ */}
        <View style={{ position: "absolute", bottom: OP + 10, right: OP + 60, width: 230 }}>
          <Text style={{ fontFamily: "Times-Italic", fontSize: 7.5, color: GRAY_TEXT, textAlign: "right", lineHeight: 1.5 }}>
            This Halal Certificate is the sole property of the Halal-approved company and is not to be shared with unauthorized parties.
          </Text>
        </View>

      </Page>
    </Document>
  );
}

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  const Doc = data.tier === "BUSINESS" ? BusinessCertDoc : CertDoc;
  return renderToBuffer(<Doc {...data} />);
}
