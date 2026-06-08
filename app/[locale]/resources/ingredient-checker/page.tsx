
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, AlertCircle, ChevronDown } from "lucide-react";

type HalalStatus = "halal" | "haram" | "mashbooh";

interface Ingredient {
  name: string;
  aliases: string[];
  eNumber?: string;
  status: HalalStatus;
  source: string;
  notes: string;
  alternatives?: string[];
}

const INGREDIENTS_DB: Ingredient[] = [
  { name: "Gelatin (Porcine)", aliases: ["E441", "Pork Gelatin", "Animal Gelatin"], eNumber: "E441", status: "haram", source: "Pig", notes: "Derived from pork collagen. Strictly forbidden. Use plant-based or halal beef gelatin.", alternatives: ["Agar Agar", "Carrageenan", "Halal Beef Gelatin"] },
  { name: "Carmine", aliases: ["E120", "Cochineal", "Natural Red 4", "CI 75470"], eNumber: "E120", status: "haram", source: "Insects (Dactylopius coccus)", notes: "Derived from cochineal insects. Not permissible under most scholarly opinions.", alternatives: ["Beet Red (E162)", "Annatto (E160b)", "Paprika Extract"] },
  { name: "Ascorbic Acid", aliases: ["E300", "Vitamin C"], eNumber: "E300", status: "halal", source: "Synthetic or Plant-based", notes: "Widely accepted as halal. Used as antioxidant and preservative.", alternatives: [] },
  { name: "Lecithin", aliases: ["E322", "Soy Lecithin"], eNumber: "E322", status: "mashbooh", source: "Soy or Animal", notes: "Plant-derived (soy) is halal. Animal-derived may be haram. Source must be verified.", alternatives: ["Verified Soy Lecithin", "Sunflower Lecithin"] },
  { name: "Vanilla Extract", aliases: ["Natural Vanilla", "Vanilla Flavoring"], status: "mashbooh", source: "Vanilla beans in alcohol base", notes: "Pure vanilla extract contains alcohol as solvent. Some scholars permit as traces; others forbid. Use vanilla powder or synthetic vanillin instead.", alternatives: ["Vanilla Powder", "Vanillin (E160a)"] },
  { name: "Citric Acid", aliases: ["E330", "Lemon Acid"], eNumber: "E330", status: "halal", source: "Fermentation of sugars", notes: "Universally accepted as halal. Produced through fermentation.", alternatives: [] },
  { name: "Sodium Benzoate", aliases: ["E211", "Benzoate of Soda"], eNumber: "E211", status: "halal", source: "Synthetic", notes: "Synthetic preservative. Halal by default.", alternatives: [] },
  { name: "Lard", aliases: ["Pig Fat", "Pork Lard", "Animal Shortening"], status: "haram", source: "Pig fat", notes: "Strictly forbidden. Pig-derived fat. Check all baked goods and fried foods.", alternatives: ["Vegetable Shortening", "Halal Beef Tallow", "Coconut Oil"] },
  { name: "Wine / Alcohol", aliases: ["Ethanol", "Fermented Alcohol", "E1510"], status: "haram", source: "Fermented grapes/grains", notes: "Forbidden as beverage. Trace amounts in flavors debated.", alternatives: ["Fruit Juices", "Grape Juice", "Non-Alcoholic Alternatives"] },
  { name: "Beta-Carotene", aliases: ["E160a", "Provitamin A"], eNumber: "E160a", status: "halal", source: "Plants or Synthetic", notes: "Plant-derived or synthetic. Widely accepted as halal.", alternatives: [] },
];

const STATUS_CONFIG: Record<HalalStatus, { color: string; bg: string; border: string; icon: typeof CheckCircle; label: string }> = {
  halal: { color: "#16a34a", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.2)", icon: CheckCircle, label: "Halal ✓" },
  haram: { color: "#dc2626", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)", icon: XCircle, label: "Haram ✗" },
  mashbooh: { color: "#d97706", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", icon: AlertCircle, label: "Mashbooh — Verify" },
};

export default function IngredientCheckerPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ingredient[]>([]);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const search = () => {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const found = INGREDIENTS_DB.filter(
      i => i.name.toLowerCase().includes(q) ||
           i.aliases.some(a => a.toLowerCase().includes(q)) ||
           (i.eNumber && i.eNumber.toLowerCase().includes(q))
    );
    setResults(found);
    setSearched(true);
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--bg-surface)" }}>
        <section style={{ padding: "80px 0 100px", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-gold" style={{ width: 500, height: 500, top: -100, right: -100 }} />
          <div className="pattern-overlay" />

          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
                Halal Intelligence
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,54px)", fontWeight: 300, marginBottom: 16 }}>
                Global Ingredient Verification Engine
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto" }}>
                Search any food, cosmetic, or pharmaceutical ingredient to verify its halal status, E-number, source, and halal-compliant alternatives.
              </motion.p>
            </div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ maxWidth: 680, margin: "0 auto 48px" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, background: "white", border: "2px solid var(--color-border)", borderRadius: 14, padding: "16px 20px", transition: "border-color 0.3s", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--color-gold-300)")}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                >
                  <Search size={20} color="var(--color-text-muted)" />
                  <input
                    type="text"
                    placeholder="Search ingredient, E-number, or alias (e.g. Gelatin, E120, Carmine)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && search()}
                    style={{ border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-primary)", background: "transparent", flex: 1 }}
                  />
                </div>
                <button onClick={search} style={{ padding: "16px 28px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, boxShadow: "0 4px 16px rgba(219,168,32,0.3)" }}>
                  Search
                </button>
              </div>
            </motion.div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20 }}>
                  <cfg.icon size={16} color={cfg.color} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {searched && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {results.length === 0 ? (
                    <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-muted)" }}>
                        No results found for &ldquo;{query}&rdquo;. Try a different name or E-number.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {results.map((ingredient, i) => {
                        const cfg = STATUS_CONFIG[ingredient.status];
                        const isExpanded = expanded === ingredient.name;
                        return (
                          <motion.div
                            key={ingredient.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card"
                            style={{ overflow: "hidden", border: `1px solid ${cfg.border}` }}
                          >
                            <div
                              style={{ padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: cfg.bg }}
                              onClick={() => setExpanded(isExpanded ? null : ingredient.name)}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <cfg.icon size={24} color={cfg.color} />
                                <div>
                                  <h3 style={{ fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{ingredient.name}</h3>
                                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {ingredient.eNumber && <span style={{ padding: "2px 10px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: cfg.color }}>{ingredient.eNumber}</span>}
                                    <span style={{ padding: "2px 10px", background: "rgba(0,0,0,0.04)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-muted)" }}>Source: {ingredient.source}</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ padding: "6px 16px", background: cfg.color + "20", borderRadius: 20, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                                <ChevronDown size={18} color="var(--color-text-muted)" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }} />
                              </div>
                            </div>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} style={{ padding: "24px 28px", borderTop: `1px solid ${cfg.border}` }}>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>{ingredient.notes}</p>
                                <div style={{ marginBottom: 16 }}>
                                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Also known as:</p>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {ingredient.aliases.map(a => <span key={a} style={{ padding: "4px 12px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-secondary)" }}>{a}</span>)}
                                  </div>
                                </div>
                                {ingredient.alternatives && ingredient.alternatives.length > 0 && (
                                  <div>
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Halal Alternatives:</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                      {ingredient.alternatives.map(a => <span key={a} style={{ padding: "4px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 16, fontFamily: "var(--font-body)", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ {a}</span>)}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {!searched && (
                <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, textAlign: "center", marginBottom: 28 }}>Browse Common Ingredients</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {INGREDIENTS_DB.slice(0, 6).map((ingredient) => {
                      const cfg = STATUS_CONFIG[ingredient.status];
                      return (
                        <div key={ingredient.name} className="glass-card" style={{ padding: "20px 24px", cursor: "pointer", border: `1px solid ${cfg.border}`, transition: "transform 0.2s" }}
                          onClick={() => { setQuery(ingredient.name); setResults([ingredient]); setSearched(true); }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <cfg.icon size={20} color={cfg.color} />
                            <div>
                              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700 }}>{ingredient.name}</p>
                              {ingredient.eNumber && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>{ingredient.eNumber}</p>}
                            </div>
                            <span style={{ marginLeft: "auto", padding: "4px 12px", background: cfg.color + "15", borderRadius: 20, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
