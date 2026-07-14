"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Menu, X, ChevronDown, Shield, LogIn } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Certify", href: "/certification" },
  { label: "Verify", href: "/verify" },
  { label: "Learn", href: "/learn" },
  { label: "Resources", href: "/resources", children: [
    { label: "Halal Market Data", href: "/resources/halal-market-data" },
    { label: "Ingredient Checker", href: "/resources/ingredient-checker" },
    { label: "Inheritance Calculator", href: "/resources/inheritance-calculator" },
    { label: "Standards Library", href: "/resources/standards-library" },
  ]},
  { label: "Contact", href: "/contact" },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "yo", name: "Yorùbá", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", flag: "🇳🇬" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "id", name: "Bahasa", flag: "🇮🇩" },
  { code: "ms", name: "Melayu", flag: "🇲🇾" },
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
  const pathname = usePathname();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const lh = (href: string) => `/${locale}${href}`;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{
          position: "fixed", top: scrolled ? 12 : 0, left: scrolled ? 16 : 0, right: scrolled ? 16 : 0,
          zIndex: 1000,
          background: scrolled ? "rgba(10,21,53,0.92)" : "rgba(255,255,255,0.9)",
          backdropFilter: scrolled ? "blur(24px)" : "blur(8px)",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "blur(8px)",
          border: scrolled ? "1px solid rgba(201,162,39,0.12)" : "1px solid rgba(10,21,53,0.07)",
          borderRadius: scrolled ? 14 : 0,
          padding: scrolled ? "0 20px" : "0 24px",
          boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.35)" : "0 1px 12px rgba(10,21,53,0.06)",
          transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? 64 : 72 }}>

          {/* Logo */}
          <Link href={lh("/")} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div className="icon-badge-circle" style={{ width: 38, height: 38 }}>
              <span style={{ color: "#F5C842", fontSize: 16 }}>☽</span>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: 13, fontWeight: 700, color: scrolled ? "white" : "#0A1535", letterSpacing: "0.1em", lineHeight: 1.2 }}>DAR AL HALAL</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, color: "var(--gold-500)", letterSpacing: "0.22em", textTransform: "uppercase" }}>CERTIFICATION</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav-items" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {NAV_ITEMS.map((item) => (
              <div key={item.label} style={{ position: "relative" }}>
                {item.children ? (
                  <button
                    onMouseEnter={() => setResourcesOpen(true)}
                    onMouseLeave={() => setResourcesOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "8px 12px",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                    color: scrolled ? "rgba(255,255,255,0.8)" : "rgba(10,21,53,0.7)", letterSpacing: "0.01em",
                    }}
                  >
                    {item.label} <ChevronDown size={11} opacity={0.6} />
                  </button>
                ) : (
                  <Link
                    href={lh(item.href)}
                    style={{
                      display: "block", padding: "8px 12px",
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                      color: pathname === lh(item.href) ? "#C9A227" : (scrolled ? "rgba(255,255,255,0.8)" : "rgba(10,21,53,0.7)"),
                      textDecoration: "none", letterSpacing: "0.01em",
                    }}
                  >
                    {item.label}
                  </Link>
                )}

                {item.children && (
                  <AnimatePresence>
                    {resourcesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        onMouseEnter={() => setResourcesOpen(true)}
                        onMouseLeave={() => setResourcesOpen(false)}
                        style={{
                          position: "absolute", top: "calc(100% + 8px)", left: "50%",
                          transform: "translateX(-50%)",
                          background: "rgba(10,21,53,0.97)", backdropFilter: "blur(20px)",
                          border: "1px solid rgba(201,162,39,0.15)", borderRadius: 12,
                          padding: 6, minWidth: 210,
                          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        }}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={lh(child.href)}
                            style={{
                              display: "block", padding: "9px 14px",
                              fontFamily: "var(--font-body)", fontSize: 13,
                              color: "rgba(255,255,255,0.8)", textDecoration: "none",
                              borderRadius: 7, transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(201,162,39,0.08)";
                              (e.currentTarget as HTMLElement).style.color = "#F5C842";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                            }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Language */}
            <div className="desktop-right-items" style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setLangOpen(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 11px",
                  background: scrolled ? "rgba(255,255,255,0.06)" : "rgba(10,21,53,0.05)", border: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(10,21,53,0.12)",
                  borderRadius: 7, cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: 12, color: scrolled ? "rgba(255,255,255,0.75)" : "rgba(10,21,53,0.65)",
                  fontWeight: 600, letterSpacing: "0.05em",
                }}
              >
                <Globe size={12} /> {locale.toUpperCase()} <ChevronDown size={9} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    style={{
                      position: "absolute", top: "calc(100% + 6px)", right: 0,
                      background: "rgba(10,21,53,0.98)", backdropFilter: "blur(20px)",
                      border: "1px solid rgba(201,162,39,0.15)", borderRadius: 12,
                      padding: 5, width: 176, maxHeight: 320, overflowY: "auto",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 10,
                    }}
                  >
                    {LANGUAGES.map((lang) => (
                      <Link
                        key={lang.code}
                        href={`/${lang.code}${pathname.replace(`/${locale}`, "") || "/"}`}
                        onClick={() => setLangOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 9, padding: "8px 11px",
                          fontFamily: "var(--font-body)", fontSize: 13,
                          color: lang.code === locale ? "#F5C842" : "rgba(255,255,255,0.75)",
                          textDecoration: "none", borderRadius: 7,
                          background: lang.code === locale ? "rgba(201,162,39,0.08)" : "transparent",
                        }}
                      >
                        <span>{lang.flag}</span><span>{lang.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA */}
            <Link
              href={lh("/certification")}
              className="desktop-right-items"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 18px",
                background: "var(--navy-700)", border: "1.5px solid var(--gold-500)",
                color: "#F5C842", borderRadius: 8,
                textDecoration: "none", fontFamily: "var(--font-body)",
                fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
                transition: "all 0.3s", boxShadow: "0 0 16px var(--gold-glow)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(201,162,39,0.1)"; el.style.boxShadow = "0 0 24px rgba(201,162,39,0.3)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--navy-700)"; el.style.boxShadow = "0 0 16px var(--gold-glow)"; }}
            >
              <Shield size={12} /> Get Certified
            </Link>

            {/* Login button */}
            <Link
              href={lh("/auth/login")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px",
                background: "transparent",
                border: scrolled ? "1.5px solid rgba(255,255,255,0.22)" : "1.5px solid rgba(10,21,53,0.18)",
                color: scrolled ? "rgba(255,255,255,0.88)" : "#0A1535",
                borderRadius: 8,
                textDecoration: "none", fontFamily: "var(--font-body)",
                fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = scrolled ? "rgba(255,255,255,0.08)" : "rgba(10,21,53,0.06)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; }}
            >
              <LogIn size={13} /> Login
            </Link>

            {/* Mobile hamburger — always visible, use CSS to control on desktop */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="mobile-menu-btn"
              style={{
                background: scrolled ? "rgba(255,255,255,0.06)" : "rgba(10,21,53,0.05)", border: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(10,21,53,0.12)",
              borderRadius: 7, padding: 8, cursor: "pointer", color: scrolled ? "white" : "#0A1535",
                display: "flex", alignItems: "center",
              }}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 999,
              background: "rgba(10,21,53,0.98)", backdropFilter: "blur(20px)",
              padding: "90px 32px 32px",
              display: "flex", flexDirection: "column",
            }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <Link
                  href={lh(item.href)}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "block", padding: "16px 0",
                    fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300,
                    color: "rgba(255,255,255,0.9)", textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: NAV_ITEMS.length * 0.06 }} style={{ marginTop: 32 }}>
              <Link
                href={lh("/auth/login")}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 28px", borderRadius: 10,
                  background: "rgba(201,162,39,0.12)", border: "1.5px solid rgba(201,162,39,0.4)",
                  color: "#F5C842", textDecoration: "none",
                  fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600,
                }}
              >
                <LogIn size={16} /> Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
