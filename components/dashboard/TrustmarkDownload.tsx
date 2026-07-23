"use client";
import { Download, Shield } from "lucide-react";

type Props = {
  businessName:    string;
  referenceNumber: string | null;
  schemeCode:      string | null;
};

function generateTrustmarkSVG(businessName: string, refNum: string | null, schemeCode: string | null): string {
  const year = new Date().getFullYear();
  const ref  = refNum ?? "DAHC/CERTIFIED";
  const scheme = schemeCode ?? "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3D2B7A"/>
      <stop offset="100%" stop-color="#1E1245"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Outer ring -->
  <circle cx="150" cy="150" r="145" fill="url(#bg)" stroke="#B8962A" stroke-width="3"/>
  <!-- Inner gold ring -->
  <circle cx="150" cy="150" r="132" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="6 3"/>
  <!-- White inner -->
  <circle cx="150" cy="150" r="120" fill="white" fill-opacity="0.06"/>

  <!-- Shield icon -->
  <path d="M150 60 L185 75 L185 120 Q185 155 150 175 Q115 155 115 120 L115 75 Z"
        fill="none" stroke="#D4AF37" stroke-width="2.5" filter="url(#glow)"/>
  <path d="M138 118 L147 128 L165 108" stroke="#F0C84A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- HALAL text -->
  <text x="150" y="202" text-anchor="middle" font-family="Georgia, serif"
        font-size="22" font-weight="bold" fill="#D4AF37" letter-spacing="6">HALAL</text>

  <!-- CERTIFIED text -->
  <text x="150" y="222" text-anchor="middle" font-family="Georgia, serif"
        font-size="11" fill="#B8962A" letter-spacing="3">CERTIFIED</text>

  <!-- Divider -->
  <line x1="80" y1="232" x2="220" y2="232" stroke="#D4AF3760" stroke-width="1"/>

  <!-- DAR AL HALAL CERTIFICATION -->
  <text x="150" y="247" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="8.5" fill="#D4AF37" letter-spacing="1.5">DAR AL HALAL CERTIFICATION</text>

  <!-- Reference number -->
  <text x="150" y="262" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="7.5" fill="#B8962A" letter-spacing="0.5">${ref}${scheme ? " · " + scheme : ""}</text>

  <!-- Year -->
  <text x="150" y="276" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="7" fill="rgba(184,150,42,0.7)">${year} · www.daralhalalcertification.com</text>

  <!-- Compass point sparkles -->
  <circle cx="150" cy="8" r="3" fill="#F0C84A"/>
  <circle cx="292" cy="150" r="3" fill="#F0C84A"/>
  <circle cx="150" cy="292" r="3" fill="#F0C84A"/>
  <circle cx="8" cy="150" r="3" fill="#F0C84A"/>
</svg>`;
}

export default function TrustmarkDownload({ businessName, referenceNumber, schemeCode }: Props) {
  const download = () => {
    const svg  = generateTrustmarkSVG(businessName, referenceNumber, schemeCode);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `DAHC-Trustmark-${(referenceNumber ?? "certified").replace(/\//g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "14px 16px", borderRadius: 10, background: "rgba(184,150,42,0.05)", border: "1px solid rgba(184,150,42,0.2)", marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Shield size={18} color="#B8962A" />
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#92650A" }}>DAHC Trustmark</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)" }}>
            Download the authorised halal trustmark for your packaging and marketing materials.
          </div>
        </div>
      </div>
      <button
        onClick={download}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600,
          padding: "9px 16px", borderRadius: 8, cursor: "pointer",
          background: "rgba(184,150,42,0.1)", border: "1px solid rgba(184,150,42,0.3)",
          color: "#92650A", transition: "all 0.15s",
        }}
      >
        <Download size={13} /> Download Trustmark (SVG)
      </button>
    </div>
  );
}
