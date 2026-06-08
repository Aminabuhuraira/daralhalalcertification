"""
Script to write all project files for Dar Al Halal Certification platform.
Run: python3 write_files.py
"""
import os, json

BASE = os.path.dirname(os.path.abspath(__file__))

def w(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  wrote: {path}")

# ─── EN.JSON ──────────────────────────────────────────────────────────────────
w("lib/messages/en.json", json.dumps({
  "nav": {
    "home": "Home", "about": "About", "certify": "Certify",
    "verify": "Verify", "learn": "Learn", "resources": "Resources",
    "contact": "Contact", "getCertified": "Get Certified"
  },
  "hero": {
    "supertitle": "NIGERIA'S PREMIER HALAL AUTHORITY",
    "headline1": "Where Business Meets",
    "headline2": "Divine Assurance",
    "subheadline": "Dar Al Halal Certification is Nigeria's gateway to the $3 trillion global halal economy. Our copyright certification mark opens doors across Africa, the Middle East, and Muslim markets worldwide.",
    "ctaPrimary": "Get Certified Today",
    "ctaSecondary": "Verify a Product",
    "stat1": "54 African Markets",
    "stat2": "12 Certified Sectors",
    "stat3": "2,400+ Certified Products"
  },
  "footer": {
    "tagline": "Nigeria's Halal Authority",
    "newsletter": "Stay ahead of the halal market",
    "subscribe": "Subscribe",
    "noSpam": "No spam. Halal insights only.",
    "copyright": "© 2025 Dar Al Halal Certification. All rights reserved.",
    "proudly": "Proudly Nigerian. Globally Recognized."
  }
}, indent=2, ensure_ascii=False))

# ─── NAVBAR ───────────────────────────────────────────────────────────────────
w("components/layout/Navbar.tsx", '''
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Menu, X, ChevronDown, ArrowRight } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Certify", href: "/certification" },
  { label: "Verify", href: "/verify" },
  { label: "Learn", href: "/learn" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Halal Market Data", href: "/resources/halal-market-data" },
      { label: "Ingredient Checker", href: "/resources/ingredient-checker" },
      { label: "Inheritance Calculator", href: "/resources/inheritance-calculator" },
      { label: "Standards Library", href: "/resources/standards-library" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "yo", name: "Yorùbá", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", flag: "🇳🇬" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "so", name: "Soomaali", flag: "🇸🇴" },
  { code: "wo", name: "Wolof", flag: "🇸🇳" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const localeHref = (href: string) => `/${locale}${href}`;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "0 24px",
          transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
          background: scrolled
            ? "rgba(253,252,250,0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(232,227,219,0.6)" : "none",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          {/* Logo */}
          <Link href={localeHref("/")} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F5C842,#B8890A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              ☽
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "0.05em", lineHeight: 1.2 }}>
                DAR AL HALAL
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--color-text-gold)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                CERTIFICATION
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} style={{ position: "relative" }}>
                {item.children ? (
                  <button
                    onClick={() => setResourcesOpen(!resourcesOpen)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", borderRadius: 8, transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                  >
                    {item.label} <ChevronDown size={14} />
                  </button>
                ) : (
                  <Link
                    href={localeHref(item.href)}
                    style={{ display: "block", padding: "8px 14px", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none", borderRadius: 8, transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                  >
                    {item.label}
                  </Link>
                )}
                {item.children && resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, minWidth: 220, background: "rgba(253,252,250,0.98)", backdropFilter: "blur(16px)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.1)", padding: 8, zIndex: 100 }}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={localeHref(child.href)}
                        onClick={() => setResourcesOpen(false)}
                        style={{ display: "block", padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", borderRadius: 8, transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-gold-50)"; e.currentTarget.style.color = "var(--color-text-gold)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Lang + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Language Switcher */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "none", border: "1px solid var(--color-border)", borderRadius: 20, cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}
              >
                <Globe size={14} />
                {locale.toUpperCase()}
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 200, maxHeight: 320, overflowY: "auto", background: "rgba(253,252,250,0.98)", backdropFilter: "blur(16px)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.1)", padding: 8, zIndex: 100 }}
                  >
                    {LANGUAGES.map((lang) => (
                      <Link
                        key={lang.code}
                        href={`/${lang.code}`}
                        onClick={() => setLangOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", fontFamily: "var(--font-body)", fontSize: 13, color: lang.code === locale ? "var(--color-text-gold)" : "var(--color-text-secondary)", textDecoration: "none", borderRadius: 8, background: lang.code === locale ? "var(--color-gold-50)" : "transparent", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { if (lang.code !== locale) e.currentTarget.style.background = "var(--color-silver-50)"; }}
                        onMouseLeave={(e) => { if (lang.code !== locale) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA Button */}
            <Link
              href={localeHref("/certification")}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 16px rgba(219,168,32,0.3)", transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(219,168,32,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(219,168,32,0.3)"; }}
            >
              Get Certified <ArrowRight size={14} />
            </Link>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: "none", padding: 8, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-primary)" }} className="mobile-toggle">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(253,252,250,0.98)", backdropFilter: "blur(20px)", padding: "100px 32px 32px", display: "flex", flexDirection: "column", gap: 8 }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link
                  href={localeHref(item.href)}
                  onClick={() => setMobileOpen(false)}
                  style={{ display: "block", padding: "16px 0", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--color-text-primary)", textDecoration: "none", borderBottom: "1px solid var(--color-border)" }}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: NAV_ITEMS.length * 0.07 + 0.1 }} style={{ marginTop: 24 }}>
              <Link href={localeHref("/certification")} onClick={() => setMobileOpen(false)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600 }}>
                Get Certified Today <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
''')

# ─── FOOTER ───────────────────────────────────────────────────────────────────
w("components/layout/Footer.tsx", '''
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Instagram, Twitter, Linkedin, Youtube, Mail } from "lucide-react";

export default function Footer() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const lh = (href: string) => `/${locale}${href}`;

  return (
    <footer style={{ background: "#F0EDE6", borderTop: "2px solid var(--color-gold-300)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48 }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#F5C842,#B8890A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>☽</div>
              <div>
                <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "0.08em" }}>DAR AL HALAL</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--color-text-gold)", letterSpacing: "0.2em" }}>CERTIFICATION</div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 24, maxWidth: 280 }}>
              Nigeria&apos;s Halal Authority. Issuing copyright-protected halal certification marks to businesses across Africa and the world.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
              {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--glass-bg)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-gold-300)"; e.currentTarget.style.color = "var(--color-text-gold)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            {/* Newsletter */}
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 12 }}>Stay ahead of the halal market</p>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "white", border: "1px solid var(--color-border)", borderRadius: 24, padding: "10px 16px" }}>
                  <Mail size={14} color="var(--color-text-muted)" />
                  <input type="email" placeholder="your@email.com" style={{ border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-primary)", background: "transparent", flex: 1 }} />
                </div>
                <button type="submit" style={{ padding: "10px 20px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 24, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                  Subscribe
                </button>
              </form>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 8 }}>No spam. Halal insights only.</p>
            </div>
          </div>

          {/* Certify */}
          <FooterCol title="Certify" links={[
            { label: "Apply Now", href: "/certification" },
            { label: "The Process", href: "/certification#process" },
            { label: "12 Sectors", href: "/certification#sectors" },
            { label: "Verify a Product", href: "/verify" },
          ]} lh={lh} />

          {/* Learn */}
          <FooterCol title="Learn" links={[
            { label: "All Courses", href: "/learn" },
            { label: "Resources Hub", href: "/resources" },
            { label: "Standards Library", href: "/resources/standards-library" },
            { label: "Ingredient Checker", href: "/resources/ingredient-checker" },
          ]} lh={lh} />

          {/* Company */}
          <FooterCol title="Company" links={[
            { label: "About Us", href: "/about" },
            { label: "Our Team", href: "/about#team" },
            { label: "Partners", href: "/about#partners" },
            { label: "Contact", href: "/contact" },
          ]} lh={lh} />

          {/* Legal */}
          <FooterCol title="Legal" links={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Cookie Policy", href: "/cookies" },
            { label: "Sitemap", href: "/sitemap.xml" },
          ]} lh={lh} />
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)" }}>
            © 2025 Dar Al Halal Certification. All rights reserved.
          </p>
          <p style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, color: "var(--color-text-gold)", letterSpacing: "0.1em" }}>
            Proudly Nigerian. Globally Recognized.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links, lh }: { title: string; links: { label: string; href: string }[]; lh: (href: string) => string }) {
  return (
    <div>
      <h4 style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
        {title}
      </h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={lh(link.href)} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
''')

# ─── HERO SECTION ─────────────────────────────────────────────────────────────
w("components/sections/Hero.tsx", '''
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Award, Package } from "lucide-react";

const STATS = [
  { icon: MapPin, label: "54 African Markets" },
  { icon: Award, label: "12 Certified Sectors" },
  { icon: Package, label: "2,400+ Certified Products" },
];

export default function Hero() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const sealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    let angle = 0;
    const animate = () => {
      angle += 0.2;
      if (sealRef.current) {
        sealRef.current.style.transform = `rotateY(${angle}deg) rotateZ(${angle * 0.3}deg)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section style={{ minHeight: "100vh", background: "var(--gradient-hero)", position: "relative", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Glow Orbs */}
      <div className="glow-orb glow-orb-gold" style={{ width: 600, height: 600, bottom: -100, left: -200 }} />
      <div className="glow-orb glow-orb-purple" style={{ width: 500, height: 500, top: -100, right: -100 }} />

      {/* Pattern */}
      <div className="pattern-overlay" />

      <div className="section-container" style={{ width: "100%", position: "relative", zIndex: 1, paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="hero-grid">

          {/* Left Content */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ fontFamily: "var(--font-accent)", fontSize: 12, letterSpacing: "0.3em", color: "var(--color-text-gold)", marginBottom: 24, textTransform: "uppercase" }}
            >
              Nigeria&apos;s Premier Halal Authority
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(42px,6vw,80px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 24, color: "var(--color-text-primary)" }}
            >
              Where Business Meets<br />
              <span className="text-gold-shimmer">Divine Assurance</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "var(--color-text-muted)", lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}
            >
              Dar Al Halal Certification is Nigeria&apos;s gateway to the $3 trillion global halal economy. Our copyright certification mark opens doors across Africa, the Middle East, and Muslim markets worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
            >
              <Link
                href={`/${locale}/certification`}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, boxShadow: "0 6px 24px rgba(219,168,32,0.35)", transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(219,168,32,0.45)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(219,168,32,0.35)"; }}
              >
                Get Certified Today <ArrowRight size={16} />
              </Link>
              <Link
                href={`/${locale}/verify`}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1.5px solid var(--color-gold-300)", color: "var(--color-text-gold)", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-gold-50)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass-bg)"; }}
              >
                Verify a Product
              </Link>
            </motion.div>
          </div>

          {/* Right — Certification Seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateY: -45 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 2, duration: 1, type: "spring", stiffness: 80 }}
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <div style={{ perspective: 1000 }}>
              <div ref={sealRef} className="animate-float" style={{ width: 280, height: 280, position: "relative", transformStyle: "preserve-3d", transition: "transform 0.1s linear" }}>
                {/* Outer ring */}
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(245,200,66,0.2), rgba(184,137,10,0.3))", border: "2px solid var(--color-gold-300)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* Inner seal */}
                  <div style={{ width: 200, height: 200, borderRadius: "50%", background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", border: "3px solid var(--color-gold-400)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(219,168,32,0.3), inset 0 2px 8px rgba(255,255,255,0.8)" }}>
                    <div style={{ fontSize: 36, marginBottom: 4 }}>☽</div>
                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, fontWeight: 700, color: "var(--color-text-gold)", letterSpacing: "0.15em", textAlign: "center", lineHeight: 1.4 }}>
                      DAR AL HALAL<br />CERTIFICATION
                    </div>
                    <div style={{ marginTop: 6, padding: "3px 10px", background: "var(--gradient-gold)", borderRadius: 10, fontFamily: "var(--font-accent)", fontSize: 8, color: "white", letterSpacing: "0.2em" }}>
                      NIGERIA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.6 }}
          style={{ display: "flex", gap: 16, marginTop: 64, flexWrap: "wrap" }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 + i * 0.15 }}
              className="glass-card"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 24px" }}
            >
              <stat.icon size={18} color="var(--color-text-gold)" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)" }}>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-grid > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}
''')

# ─── PARTNERS SLIDER ──────────────────────────────────────────────────────────
w("components/sections/PartnersSlider.tsx", '''
"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const PARTNERS = [
  "AlFarouq Foods", "NatureBest Cosmetics", "MedHalal Pharma",
  "Kano Farms Ltd", "Lagos Spice Co", "Abuja Dairy", "Niger Mills",
  "HalalMart Nigeria", "Green Pastures Foods", "AbuTayba Cosmetics",
  "AlFarouq Foods", "NatureBest Cosmetics", "MedHalal Pharma",
  "Kano Farms Ltd", "Lagos Spice Co", "Abuja Dairy", "Niger Mills",
  "HalalMart Nigeria", "Green Pastures Foods", "AbuTayba Cosmetics",
];

const REVIEWS = [
  { quote: "Obtaining Dar Al Halal certification transformed our export prospects to Saudi Arabia overnight.", business: "AlFarouq Foods", city: "Kano" },
  { quote: "The certification process was thorough, professional, and our customers now trust our products completely.", business: "NatureBest Cosmetics", city: "Lagos" },
  { quote: "With Dar Al Halal certification, we accessed three new African markets within six months.", business: "Kano Farms Ltd", city: "Kano" },
];

export default function PartnersSlider() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-gold-300)", borderBottom: "1px solid var(--color-border)", padding: "48px 0" }}>
      <div className="section-container">
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "center", marginBottom: 40 }} className="partners-layout">
          <div>
            <p style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.2em", color: "var(--color-text-gold)", marginBottom: 6, textTransform: "uppercase" }}>
              Trusted By
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
              Nigeria&apos;s Leading Businesses
            </h3>
          </div>
          <div className="marquee-wrapper">
            <div className="marquee-track" style={{ gap: 40 }}>
              {PARTNERS.map((p, i) => (
                <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--color-silver-400)", whiteSpace: "nowrap", padding: "8px 24px", border: "1px solid var(--color-border)", borderRadius: 8, transition: "all 0.3s", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-gold)"; e.currentTarget.style.borderColor = "var(--color-gold-300)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-silver-400)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                >{p}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 40 }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4,5].map((i) => (
              <motion.span
                key={i}
                initial={{ color: "#CED4DA" }}
                animate={inView ? { color: "#DBA820" } : {}}
                transition={{ delay: i * 0.2, duration: 0.4 }}
                style={{ fontSize: 28 }}
              >★</motion.span>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-accent)", fontSize: 13, letterSpacing: "0.1em", color: "var(--color-text-secondary)" }}>
            Rated Excellence — Nigeria&apos;s Most Trusted Halal Authority
          </p>
        </motion.div>

        {/* Reviews */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="reviews-grid">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass-card"
              style={{ padding: "28px 24px" }}
            >
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {[1,2,3,4,5].map((s) => <span key={s} style={{ color: "var(--color-gold-400)", fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
                &ldquo;{review.quote}&rdquo;
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-text-gold)" }}>
                {review.business} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>— {review.city}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .partners-layout { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
''')

# ─── MARKET OPPORTUNITY ───────────────────────────────────────────────────────
w("components/sections/MarketOpportunity.tsx", '''
"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

const STATS = [
  { value: 3, suffix: "T", prefix: "$", label: "Global Halal Economy" },
  { value: 95, suffix: "M", prefix: "", label: "Nigerian Muslims" },
  { value: 400, suffix: "M+", prefix: "", label: "African Muslim Consumers" },
  { value: 57, suffix: "", prefix: "", label: "OIC Member Countries" },
  { value: 30, suffix: "%", prefix: "", label: "Premium Price Uplift" },
];

export default function MarketOpportunity() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} style={{ padding: "120px 0", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
      <div className="glow-orb glow-orb-gold" style={{ width: 400, height: 400, top: "50%", right: -100, transform: "translateY(-50%)", opacity: 0.5 }} />
      <div className="pattern-overlay" />

      <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="market-grid">

          {/* Left: Copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}
            >
              The Opportunity
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, color: "var(--color-text-primary)", marginBottom: 32, lineHeight: 1.1 }}
            >
              Nigeria. The Hub.<br />The Opportunity.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: 20 }}>
                Nigeria is home to over <strong>95 million Muslims</strong> — Africa&apos;s largest Muslim population. As Africa&apos;s most connected trade economy, Nigeria is the natural gateway for halal products reaching 400+ million Muslim consumers across the continent.
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: 32 }}>
                Businesses certified by Dar Al Halal don&apos;t just sell locally — they gain access to a <strong>$2.8 trillion global halal economy</strong> spanning food, cosmetics, pharmaceuticals, finance, and logistics.
              </p>
              <div style={{ background: "var(--color-purple-50)", borderLeft: "4px solid var(--color-gold-400)", borderRadius: "0 12px 12px 0", padding: "20px 24px" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>
                  &ldquo;Certified businesses in Nigeria report 30–45% increase in export revenue within 12 months of halal certification. Your certification is your competitive moat.&rdquo;
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="glass-card"
                style={{ padding: "28px 20px", textAlign: "center", gridColumn: i === 4 ? "span 2" : "auto" }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 600, color: "var(--color-text-gold)", lineHeight: 1 }}>
                  {inView ? (
                    <>{stat.prefix}<CountUp end={stat.value} duration={2.5} />{stat.suffix}</>
                  ) : (
                    <>{stat.prefix}0{stat.suffix}</>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)", marginTop: 8 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .market-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
''')

# ─── CERTIFICATION TRUST ───────────────────────────────────────────────────────
w("components/sections/CertificationTrust.tsx", '''
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Shield, Globe, BookOpen, CheckCircle } from "lucide-react";

const FEATURES = [
  { icon: Shield, title: "Copyright Protected Mark", desc: "Our certification mark is legally copyrighted under Nigerian and international IP law. Unauthorized use is a legal offense." },
  { icon: Globe, title: "Global Recognition", desc: "Recognized across 54 African markets, GCC countries, Malaysia, Indonesia, and major Muslim consumer markets worldwide." },
  { icon: BookOpen, title: "Shariah Compliance", desc: "Certified by a panel of qualified Islamic scholars. Every certification decision is grounded in authentic Shariah principles." },
];

const PROCESS_STEPS = [
  { num: "01", title: "Application", desc: "Submit your business details and product list" },
  { num: "02", title: "Screening", desc: "Initial review of application and eligibility" },
  { num: "03", title: "Document Review", desc: "Thorough review of ingredients and processes" },
  { num: "04", title: "On-Site Audit", desc: "Physical inspection of facilities and operations" },
  { num: "05", title: "Shariah Verification", desc: "Scholar panel review and Fatwa issuance" },
  { num: "06", title: "Decision", desc: "Certification committee decision" },
  { num: "07", title: "Certificate Issued", desc: "Your halal certificate and mark are issued" },
];

export default function CertificationTrust() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <section ref={ref} style={{ padding: "120px 0", background: "var(--color-surface)" }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <p style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 16, textTransform: "uppercase" }}>The Certification</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,54px)", fontWeight: 300 }}>
            The Mark That Opens Markets
          </h2>
        </motion.div>

        {/* Three Columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 64 }} className="trust-cols">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="glass-card"
              style={{ padding: 36, textAlign: "center" }}
            >
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--color-gold-50)", border: "1px solid var(--color-gold-200)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <feat.icon size={24} color="var(--color-text-gold)" />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginBottom: 12 }}>{feat.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>{feat.desc}</p>
              <div style={{ width: 40, height: 2, background: "var(--gradient-gold)", margin: "20px auto 0", borderRadius: 1 }} />
            </motion.div>
          ))}
        </div>

        {/* Copyright callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          style={{ background: "var(--color-purple-50)", border: "1px solid var(--color-purple-200)", borderRadius: 20, padding: "40px 48px", marginBottom: 64 }}
        >
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, marginBottom: 20, color: "var(--color-text-primary)" }}>
            Why Copyright Certification Matters
          </h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: 16 }}>
            Dar Al Halal&apos;s certification mark is legally copyrighted under Nigerian and international intellectual property law. Displaying our mark without certification is a legal offense — ensuring our certified partners&apos; competitive advantage is protected by law, not just reputation.
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: 32 }}>
            For businesses, this means one thing: <strong>our mark is irreplaceable.</strong> It cannot be duplicated, mimicked, or circumvented. When consumers see our mark, they know.
          </p>
          <Link
            href={`/${locale}/certification`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", background: "var(--gradient-gold)", color: "white", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}
          >
            <CheckCircle size={16} /> Start Your Application
          </Link>
        </motion.div>

        {/* Process Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, textAlign: "center", marginBottom: 40 }}>
            The Certification Process
          </h3>
          <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 16 }}>
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.num} style={{ flex: "0 0 160px", position: "relative", paddingTop: 16 }}>
                {/* Connecting line */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div style={{ position: "absolute", top: 36, left: "calc(50% + 20px)", width: "calc(100% - 20px)", height: 2, background: "var(--gradient-gold)", zIndex: 0 }} />
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F5C842,#B8890A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-accent)", fontSize: 12, color: "white", fontWeight: 700, boxShadow: "0 4px 12px rgba(219,168,32,0.3)" }}>
                    {step.num}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{step.title}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5, padding: "0 8px" }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .trust-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
''')

print("Core components done.")

# ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
w("app/[locale]/page.tsx", '''
import Hero from "@/components/sections/Hero";
import PartnersSlider from "@/components/sections/PartnersSlider";
import MarketOpportunity from "@/components/sections/MarketOpportunity";
import CertificationTrust from "@/components/sections/CertificationTrust";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PartnersSlider />
        <MarketOpportunity />
        <CertificationTrust />
      </main>
      <Footer />
    </>
  );
}
''')

# ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
w("app/[locale]/about/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useParams } from "next/navigation";

const TEAM = [
  { name: "Sheikh Dr. Ibrahim Al-Hassan", title: "Chairman & Grand Mufti", bio: "PhD Islamic Law, Al-Azhar University. 30+ years in halal certification." },
  { name: "Alhaji Muhammad Sani", title: "Director General", bio: "Pioneer of halal economy development in West Africa." },
  { name: "Dr. Fatima Abubakar", title: "Head of Certification", bio: "Expert in food science and Islamic dietary laws." },
  { name: "Barrister Yusuf Olawale", title: "Legal Counsel", bio: "Specialist in intellectual property and certification law." },
];

const TIMELINE = [
  { year: "2018", event: "Founded in Abuja, Nigeria" },
  { year: "2019", event: "First batch of halal certifications issued" },
  { year: "2020", event: "Copyright mark registered nationally and internationally" },
  { year: "2021", event: "Expanded to 12 certification sectors" },
  { year: "2022", event: "Recognized by OIC and ESMA international bodies" },
  { year: "2023", event: "Launched digital verification platform" },
  { year: "2024", event: "Pan-African expansion: 54 markets" },
  { year: "2025", event: "Nigeria Halal Economy Hub designation" },
];

export default function AboutPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section style={{ padding: "100px 0 80px", background: "var(--gradient-certification)", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 500, height: 500, top: -100, right: -100 }} />
          <div className="glow-orb glow-orb-gold" style={{ width: 400, height: 400, bottom: -50, left: -100 }} />
          <div className="pattern-overlay" />
          <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
              Our Story
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, marginBottom: 24, maxWidth: 700, margin: "0 auto 24px" }}>
              Building the World&apos;s Most Trusted Halal Authority
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "var(--color-text-muted)", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
              From Abuja, Nigeria, to the world — one halal certification at a time.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section style={{ padding: "100px 0", background: "var(--color-surface)" }}>
          <div className="section-container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="about-grid">
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, marginBottom: 24 }}>Our Mission</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.85, marginBottom: 20 }}>
                  Founded in Abuja, Nigeria, Dar Al Halal Certification was established with one mission: to make halal compliance accessible, credible, and commercially powerful for every business in Nigeria and beyond.
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.85, marginBottom: 20 }}>
                  We are not just a certification body. We are Nigeria&apos;s gateway to the global halal economy — a $3 trillion market that rewards those who meet its standards with premium market access and consumer trust.
                </p>
                <div style={{ background: "var(--color-gold-50)", borderLeft: "4px solid var(--color-gold-400)", borderRadius: "0 12px 12px 0", padding: "20px 24px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--color-text-gold)", fontStyle: "italic" }}>
                    &ldquo;The halal mark is not a cost. It is a revenue multiplier.&rdquo;
                  </p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[["$3T", "Global Halal Economy"], ["95M", "Nigerian Muslims"], ["54", "African Markets"], ["12", "Certified Sectors"]].map(([val, label]) => (
                  <div key={label} className="glass-card" style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: "var(--color-text-gold)" }}>{val}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)", marginTop: 6 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section ref={ref} style={{ padding: "100px 0", background: "var(--color-primary)" }}>
          <div className="section-container">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300 }}>Our Leadership</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="team-grid">
              {TEAM.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.12 }}
                  className="glass-card"
                  style={{ padding: "32px 24px", textAlign: "center" }}
                >
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-gold-100), var(--color-gold-300))", border: "3px solid var(--color-gold-300)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    👤
                  </div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{member.name}</h4>
                  <p style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.1em", color: "var(--color-text-gold)", marginBottom: 12, textTransform: "uppercase" }}>{member.title}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ padding: "100px 0", background: "var(--color-surface)" }}>
          <div className="section-container">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, textAlign: "center", marginBottom: 64 }}>Our Journey</h2>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "var(--gradient-gold)", transform: "translateX(-50%)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {TIMELINE.map((item, i) => (
                  <div key={item.year} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-start" : "flex-end", paddingLeft: i % 2 === 0 ? 0 : "50%", paddingRight: i % 2 === 0 ? "50%" : 0 }}>
                    <div className="glass-card" style={{ padding: "20px 28px", maxWidth: 320, marginLeft: i % 2 === 0 ? 0 : 40, marginRight: i % 2 === 0 ? 40 : 0 }}>
                      <div style={{ fontFamily: "var(--font-accent)", fontSize: 13, color: "var(--color-text-gold)", fontWeight: 600, marginBottom: 6 }}>{item.year}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)" }}>{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .about-grid, .team-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .team-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
''')

print("About page done.")

# ─── CERTIFICATION PAGE ───────────────────────────────────────────────────────
w("app/[locale]/certification/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle } from "lucide-react";

const SECTORS = [
  { icon: "🍔", title: "Food & Beverage", desc: "Packaged foods, beverages, restaurants, snacks" },
  { icon: "💄", title: "Cosmetics & Beauty", desc: "Skincare, makeup, haircare, personal care" },
  { icon: "💊", title: "Pharmaceuticals", desc: "Medicines, supplements, vitamins, nutraceuticals" },
  { icon: "🏨", title: "Hospitality", desc: "Hotels, restaurants, catering services" },
  { icon: "🚚", title: "Logistics & Supply Chain", desc: "Cold chain, warehousing, transportation" },
  { icon: "🏭", title: "Manufacturing", desc: "Industrial processes, packaging, equipment" },
  { icon: "👗", title: "Fashion & Textiles", desc: "Clothing, fabrics, leather goods" },
  { icon: "💰", title: "Finance & Banking", desc: "Islamic finance products, insurance" },
  { icon: "🐄", title: "Animal Feed", desc: "Livestock feed, veterinary products" },
  { icon: "🌿", title: "Agriculture", desc: "Farms, organic produce, horticulture" },
  { icon: "🎓", title: "Education", desc: "Islamic education, halal curricula" },
  { icon: "⚕️", title: "Healthcare", desc: "Hospitals, clinics, medical devices" },
];

export default function CertificationPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        {/* Hero */}
        <section style={{ padding: "100px 0 80px", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-gold" style={{ width: 500, height: 500, top: -100, right: -100 }} />
          <div className="pattern-overlay" />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 680 }}>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
                Halal Certification
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, marginBottom: 24 }}>
                Your Passport to the<br /><span className="text-gold-shimmer">Global Halal Economy</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 40 }}>
                A Dar Al Halal certificate is not paperwork. It is your passport to premium markets. Certified businesses access GCC, Malaysian, and Indonesian import markets that demand halal certification before a single shipment crosses their borders.
              </motion.p>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                <Link href={`/${locale}/auth/register`} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 40px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600, boxShadow: "0 6px 24px rgba(219,168,32,0.35)" }}>
                  Apply for Certification <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 12 Sectors */}
        <section ref={ref} style={{ padding: "100px 0", background: "var(--color-surface)" }}>
          <div className="section-container">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, marginBottom: 16 }}>12 Certified Sectors</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto" }}>
                Dar Al Halal certifies businesses across every major sector of the modern economy.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="sectors-grid">
              {SECTORS.map((sector, i) => (
                <motion.div
                  key={sector.title}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card"
                  style={{ padding: "28px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glass-shadow)"; }}
                >
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{sector.icon}</div>
                  <h3 style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>{sector.title}</h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{sector.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "80px 0", background: "var(--gradient-certification)" }}>
          <div className="section-container" style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 300, marginBottom: 20 }}>Ready to Get Certified?</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Join thousands of businesses that have unlocked the global halal market with Dar Al Halal Certification.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={`/${locale}/auth/register`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600 }}>
                <CheckCircle size={16} /> Apply Now
              </Link>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", background: "var(--glass-bg)", border: "1.5px solid var(--color-gold-300)", color: "var(--color-text-gold)", borderRadius: 50, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600 }}>
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .sectors-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .sectors-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
''')

print("Certification page done.")

# ─── VERIFY PAGE ──────────────────────────────────────────────────────────────
w("app/[locale]/verify/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type VerifyResult = {
  status: "verified" | "not-found" | "expired";
  product?: string;
  company?: string;
  sector?: string;
  issued?: string;
  expires?: string;
  certNumber?: string;
};

// Demo function — in production this hits the database
function mockVerify(id: string): VerifyResult {
  if (id.startsWith("DAH") && id.length >= 8) {
    return {
      status: "verified",
      product: "AlFarouq Premium Spice Mix",
      company: "AlFarouq Foods Nigeria Ltd",
      sector: "Food & Beverage",
      issued: "2024-01-15",
      expires: "2025-01-14",
      certNumber: id.toUpperCase(),
    };
  }
  return { status: "not-found" };
}

export default function VerifyPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(mockVerify(query.trim()));
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--gradient-hero)" }}>
        <section style={{ padding: "100px 0", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-gold" style={{ width: 500, height: 500, top: -100, right: -100 }} />
          <div className="pattern-overlay" />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
                Product Verification
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 300, marginBottom: 20 }}>
                Verify Halal Certification
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 48 }}>
                Enter the certificate number or scan the QR code on the product packaging to verify authenticity.
              </motion.p>

              {/* Search */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: "32px 36px" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, background: "white", border: "2px solid var(--color-border)", borderRadius: 12, padding: "14px 20px", transition: "border-color 0.3s" }}
                    onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--color-gold-300)")}
                    onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                  >
                    <Search size={18} color="var(--color-text-muted)" />
                    <input
                      type="text"
                      placeholder="Enter certificate number (e.g. DAH-2024-0001)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                      style={{ border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-primary)", background: "transparent", flex: 1 }}
                    />
                  </div>
                  <button
                    onClick={handleVerify}
                    disabled={loading}
                    style={{ padding: "14px 28px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1, transition: "all 0.3s" }}
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)", marginTop: 12, textAlign: "center" }}>
                  Certificate numbers start with &ldquo;DAH&rdquo; followed by year and sequence number
                </p>
              </motion.div>

              {/* Result */}
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    key={result.status}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card"
                    style={{ marginTop: 24, padding: "32px 36px", textAlign: "left", border: result.status === "verified" ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)" }}
                  >
                    {result.status === "verified" ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                          <CheckCircle size={28} color="#22c55e" />
                          <div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 700, color: "#16a34a" }}>Certified Halal ✓</div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)" }}>This product is verified by Dar Al Halal Certification</div>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          {[
                            ["Product", result.product],
                            ["Company", result.company],
                            ["Sector", result.sector],
                            ["Certificate No.", result.certNumber],
                            ["Issued", result.issued],
                            ["Expires", result.expires],
                          ].map(([label, value]) => (
                            <div key={label} style={{ padding: "12px 16px", background: "rgba(34,197,94,0.05)", borderRadius: 8 }}>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)", fontWeight: 600 }}>{value}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <XCircle size={28} color="#ef4444" />
                        <div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 700, color: "#ef4444" }}>Certificate Not Found</div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginTop: 4 }}>
                            No valid halal certificate found for &ldquo;{query}&rdquo;. Please check the certificate number and try again.
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: 48, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                {[
                  { icon: CheckCircle, color: "#22c55e", label: "Certified Halal", desc: "Product is actively certified" },
                  { icon: AlertCircle, color: "#f59e0b", label: "Expired Certificate", desc: "Certification has lapsed" },
                  { icon: XCircle, color: "#ef4444", label: "Not Found", desc: "No certificate exists" },
                ].map((item) => (
                  <div key={item.label} className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flex: "1 1 200px" }}>
                    <item.icon size={20} color={item.color} />
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
''')

print("Verify page done.")

# ─── LEARN PAGE ───────────────────────────────────────────────────────────────
w("app/[locale]/learn/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Clock, BookOpen, Award } from "lucide-react";

const COURSES = [
  { id: "intro-halal", title: "Introduction to Halal Certification", category: "Certification", categoryColor: "var(--color-gold-400)", lessons: 8, duration: "3h 20m", level: "Beginner", price: "Free", emoji: "🌟" },
  { id: "food-standards", title: "Halal Food Manufacturing Standards", category: "Standards", categoryColor: "var(--color-purple-500)", lessons: 15, duration: "6h 45m", level: "Intermediate", price: "Certificate Track", emoji: "🏭" },
  { id: "supply-chain", title: "Building a Halal Supply Chain", category: "Business", categoryColor: "var(--color-silver-500)", lessons: 12, duration: "5h 10m", level: "Intermediate", price: "Business Track", emoji: "🚚" },
  { id: "shariah-principles", title: "Shariah Principles in Business", category: "Foundation", categoryColor: "var(--color-gold-500)", lessons: 10, duration: "4h 00m", level: "Beginner", price: "Free", emoji: "📖" },
  { id: "export-compliance", title: "Halal Export Compliance for Nigeria", category: "Advanced", categoryColor: "var(--color-purple-600)", lessons: 18, duration: "8h 30m", level: "Advanced", price: "Certificate Track", emoji: "🌍" },
  { id: "e-numbers", title: "Understanding E-Numbers & Food Additives", category: "Practical", categoryColor: "var(--color-gold-400)", lessons: 6, duration: "2h 15m", level: "Practical", price: "Free", emoji: "🔬" },
];

export default function LearnPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "80px 0 60px", background: "var(--gradient-hero)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 500, height: 500, top: -100, left: "50%", transform: "translateX(-50%)" }} />
          <div className="pattern-overlay" />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
              Halal Education
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 300, marginBottom: 20 }}>
              Learn Halal Standards
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.7 }}>
              Professional courses on halal compliance, certification, and building a globally-competitive halal business.
            </motion.p>
          </div>
        </section>

        <section ref={ref} style={{ padding: "80px 0 100px", background: "var(--color-surface)" }}>
          <div className="section-container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }} className="courses-grid">
              {COURSES.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card"
                  style={{ overflow: "hidden", cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-8px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 48px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glass-shadow)"; }}
                >
                  {/* Thumbnail */}
                  <div style={{ height: 160, background: `linear-gradient(135deg, var(--color-gold-50), var(--color-purple-50))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>
                    {course.emoji}
                  </div>
                  <div style={{ padding: "24px" }}>
                    <span style={{ display: "inline-block", padding: "4px 12px", background: course.categoryColor + "20", color: course.categoryColor, borderRadius: 20, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 12 }}>
                      {course.category}
                    </span>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, marginBottom: 16, lineHeight: 1.3 }}>{course.title}</h3>
                    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>
                        <BookOpen size={14} /> {course.lessons} lessons
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>
                        <Clock size={14} /> {course.duration}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: course.price === "Free" ? "#22c55e" : "var(--color-text-gold)" }}>
                        {course.price}
                      </span>
                      <Link
                        href={`/${locale}/learn/${course.id}`}
                        style={{ padding: "8px 20px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", borderRadius: 20, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}
                      >
                        Enroll
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .courses-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .courses-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
''')

print("Learn page done.")

print("\nAll core files written successfully!")
