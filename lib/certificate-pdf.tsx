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

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  return renderToBuffer(<CertDoc {...data} />);
}
