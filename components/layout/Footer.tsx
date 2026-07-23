"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Mail, ArrowRight, Share2, MessageCircle, Globe, Video, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const lh = (href: string) => `/${locale}${href}`;
  const [newsEmail, setNewsEmail] = useState("");
  const [newsDone, setNewsDone] = useState(false);

  async function subscribeNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsEmail) return;
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newsEmail }),
    });
    setNewsDone(true);
    setNewsEmail("");
  }

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
                <div style={{ fontFamily: "var(--font-accent)", fontSize: 14.5, fontWeight: 700, color: "#0A1535", letterSpacing: "0.1em" }}>DAR AL HALAL</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 9.5, color: "var(--gold-500)", letterSpacing: "0.22em" }}>CERTIFICATION</div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "rgba(10,21,53,0.68)", lineHeight: 1.75, marginBottom: 24, maxWidth: 270 }}>
              Global halal certification, made accessible — issuing copyright-protected certification marks to businesses across Africa and the world.
            </p>

            {/* Social icons */}
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
            {newsDone ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#16a34a", padding: "10px 0" }}>
                ✓ You're subscribed — thank you!
              </p>
            ) : (
              <form onSubmit={subscribeNewsletter} style={{ display: "flex", background: "white", border: "1px solid rgba(10,21,53,0.12)", borderRadius: 7, overflow: "hidden", width: "100%", maxWidth: 320, boxShadow: "0 2px 8px rgba(10,21,53,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "0 10px", flexShrink: 0 }}><Mail size={13} color="rgba(10,21,53,0.3)" /></div>
                <input
                  type="email"
                  required
                  value={newsEmail}
                  onChange={e => setNewsEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", padding: "11px 4px", fontFamily: "var(--font-body)", fontSize: 13.5, color: "#0A1535" }}
                />
                <button type="submit" style={{ flexShrink: 0, padding: "11px 16px", background: "var(--navy-700)", border: "none", borderLeft: "1px solid rgba(10,21,53,0.08)", cursor: "pointer", color: "#F5C842", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                  Subscribe <ArrowRight size={11} />
                </button>
              </form>
            )}
          </div>

          {[
            { title: "Certify", links: [["Apply", "/certification"], ["The Process", "/certification#process"], ["12 Sectors", "/certification#sectors"], ["Verify", "/verify"]] },
            { title: "Learn", links: [["All Courses", "/learn"], ["Resources", "/resources"], ["Standards", "/resources/standards-library"], ["Ingredient Checker", "/resources/ingredient-checker"]] },
            { title: "Company", links: [["About Us", "/about"], ["Contact", "/contact"]] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "var(--font-accent)", fontSize: 12, fontWeight: 700, color: "var(--navy-700)", letterSpacing: "0.22em", marginBottom: 18 }}>{col.title}</h4>
              <ul style={{ listStyle: "none" }}>
                {col.links.map(([label, href]) => (
                  <li key={href} style={{ marginBottom: 10 }}>
                    <Link
                      href={lh(href)}
                      style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "rgba(10,21,53,0.68)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0A1535"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(10,21,53,0.5)"; }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              {col.title === "Company" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
                  {[
                    [MapPin, "14 Oguda Close, Maitama, Abuja, Nigeria"],
                    [Phone, "+234 806 333 4296"],
                    [Mail, "info@daralhalalcertification.com"],
                  ].map(([Icon, text], i) => {
                    const IconComp = Icon as React.ElementType;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <IconComp size={13} color="var(--gold-500)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.68)", lineHeight: 1.5 }}>{text as string}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Tools + App Download column — rightmost */}
          <div>
            <h4 style={{ fontFamily: "var(--font-accent)", fontSize: 12, fontWeight: 700, color: "var(--navy-700)", letterSpacing: "0.22em", marginBottom: 18 }}>TOOLS</h4>
            <ul style={{ listStyle: "none", marginBottom: 28 }}>
              {([["Ingredient Checker", "/resources/ingredient-checker"], ["Market Data", "/resources/halal-market-data"], ["Standards Library", "/resources/standards-library"]] as [string,string][]).map(([label, href]) => (
                <li key={href} style={{ marginBottom: 10 }}>
                  <Link
                    href={lh(href)}
                    style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "rgba(10,21,53,0.68)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0A1535"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(10,21,53,0.5)"; }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* App Store Badges — silver style, stacked */}
            <h4 style={{ fontFamily: "var(--font-accent)", fontSize: 10, fontWeight: 700, color: "rgba(10,21,53,0.62)", letterSpacing: "0.2em", marginBottom: 12 }}>GET THE APP</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>

              {/* Apple App Store — silver */}
              <a
                href="#"
                aria-label="Download on the App Store"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "#F5F5F7",
                  borderRadius: 10, padding: "8px 14px",
                  textDecoration: "none",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
                  border: "1px solid rgba(10,21,53,0.13)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#EAEAEC"; t.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#F5F5F7"; t.style.transform = "translateY(0)"; }}
              >
                <svg width="19" height="23" viewBox="0 0 170 170" fill="#0D1B2A" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="m150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zm-31.26-123.01c0 8.1-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-.119-.972-.188-1.995-.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.241z"/>
                </svg>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 9, color: "rgba(10,21,53,0.66)", letterSpacing: "0.01em" }}>Download on the</div>
                  <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 15, fontWeight: 700, color: "#0D1B2A", letterSpacing: "-0.01em" }}>App Store</div>
                </div>
              </a>

              {/* Google Play — silver */}
              <a
                href="#"
                aria-label="Get it on Google Play"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "#F5F5F7",
                  borderRadius: 10, padding: "8px 14px",
                  textDecoration: "none",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
                  border: "1px solid rgba(10,21,53,0.13)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#EAEAEC"; t.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#F5F5F7"; t.style.transform = "translateY(0)"; }}
              >
                {/* Google Play 4-colour play triangle — gap-free quads */}
                <svg width="20" height="23" viewBox="0 0 20 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <polygon points="0,0 0,11 10,11 10,5.5"   fill="#29B6F6" />
                  <polygon points="0,11 0,22 10,16.5 10,11" fill="#4CAF50" />
                  <polygon points="10,5.5 10,11 20,11"       fill="#F44336" />
                  <polygon points="10,11 10,16.5 20,11"      fill="#FFC107" />
                </svg>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 9, color: "rgba(10,21,53,0.66)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Get it on</div>
                  <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 15, fontWeight: 700, color: "#0D1B2A", letterSpacing: "-0.01em" }}>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(10,21,53,0.08)", marginBottom: 24 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "rgba(10,21,53,0.62)" }}>© 2026 Dar Al Halal Certification. All rights reserved.</p>
            <Link href={lh("/terms")} style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.62)", textDecoration: "none" }}>Terms</Link>
            <Link href={lh("/privacy")} style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.62)", textDecoration: "none" }}>Privacy</Link>
          </div>
          <p style={{ fontFamily: "var(--font-accent)", fontSize: 10.5, color: "var(--navy-600)", letterSpacing: "0.18em" }}>PROUDLY NIGERIAN &mdash; GLOBALLY RECOGNIZED</p>
        </div>
      </div>
    </footer>
  );
}
