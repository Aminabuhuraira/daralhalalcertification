"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Mail, ArrowRight, Share2, MessageCircle, Globe, Video } from "lucide-react";

export default function Footer() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const lh = (href: string) => `/${locale}${href}`;

  return (
    <footer style={{
      background: "#FAFAFA",
      borderTop: "1px solid rgba(10,21,53,0.08)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle dot pattern */}
      <div className="dot-pattern" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 24px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "var(--navy-700)", border: "1.5px solid var(--gold-500)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 12px var(--gold-glow)",
              }}>
                <span style={{ color: "#F5C842", fontSize: 18 }}>☽</span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-accent)", fontSize: 13, fontWeight: 700, color: "#0A1535", letterSpacing: "0.1em" }}>DAR AL HALAL</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, color: "var(--gold-500)", letterSpacing: "0.22em" }}>CERTIFICATION</div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)", lineHeight: 1.75, marginBottom: 24, maxWidth: 270 }}>
              Nigeria's Halal Authority — issuing copyright-protected certification marks to businesses across Africa and the world.
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              {[Share2, MessageCircle, Globe, Video].map((Icon, i) => (
                <a key={i} href="#" style={{ textDecoration: "none" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "white", border: "1px solid rgba(10,21,53,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(10,21,53,0.06)",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-500)"; (e.currentTarget as HTMLElement).style.background = "var(--navy-700)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(10,21,53,0.12)"; (e.currentTarget as HTMLElement).style.background = "white"; }}
                  >
                    <Icon size={14} color="#0A1535" />
                  </div>
                </a>
              ))}
            </div>
            <div style={{
              display: "flex", gap: 0,
              background: "white",
              border: "1px solid rgba(10,21,53,0.12)",
              borderRadius: 7, overflow: "hidden", maxWidth: 270,
              boxShadow: "0 2px 8px rgba(10,21,53,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}><Mail size={13} color="rgba(10,21,53,0.3)" /></div>
              <input
                placeholder="your@email.com"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  padding: "10px 4px",
                  fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535",
                }}
              />
              <button style={{
                padding: "10px 14px",
                background: "var(--navy-700)", border: "none",
                borderLeft: "1px solid rgba(10,21,53,0.08)",
                cursor: "pointer", color: "#F5C842",
                fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
              }}>
                Go <ArrowRight size={10} style={{ display: "inline", verticalAlign: "middle" }} />
              </button>
            </div>
          </div>

          {[
            { title: "Certify", links: [["Apply", "/certification"], ["The Process", "/certification#process"], ["12 Sectors", "/certification#sectors"], ["Verify", "/verify"]] },
            { title: "Learn", links: [["All Courses", "/learn"], ["Resources", "/resources"], ["Standards", "/resources/standards-library"], ["Ingredient Checker", "/resources/ingredient-checker"]] },
            { title: "Company", links: [["About Us", "/about"], ["Contact", "/contact"]] },
            { title: "Tools", links: [["Ingredient Checker", "/resources/ingredient-checker"], ["Market Data", "/resources/halal-market-data"], ["Standards Library", "/resources/standards-library"]] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "var(--font-accent)", fontSize: 10.5, fontWeight: 700, color: "var(--navy-700)", letterSpacing: "0.22em", marginBottom: 18 }}>{col.title}</h4>
              <ul style={{ listStyle: "none" }}>
                {col.links.map(([label, href]) => (
                  <li key={href} style={{ marginBottom: 9 }}>
                    <Link
                      href={lh(href)}
                      style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0A1535"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(10,21,53,0.5)"; }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "rgba(10,21,53,0.08)", marginBottom: 24 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.35)" }}>© 2025 Dar Al Halal Certification. All rights reserved.</p>
          <p style={{ fontFamily: "var(--font-accent)", fontSize: 9.5, color: "var(--navy-600)", letterSpacing: "0.18em" }}>PROUDLY NIGERIAN &mdash; GLOBALLY RECOGNIZED</p>
        </div>
      </div>
    </footer>
  );
}
