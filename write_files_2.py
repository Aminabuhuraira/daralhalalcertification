"""Write resources, auth, contact, chatbot, API route, SEO files, and remaining pages."""
import os

BASE = os.path.dirname(os.path.abspath(__file__))

def w(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  wrote: {path}")

# ─── INHERITANCE CALCULATOR ───────────────────────────────────────────────────
w("app/[locale]/resources/inheritance-calculator/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Info, AlertTriangle } from "lucide-react";

type Relation = "husband" | "wife" | "son" | "daughter" | "father" | "mother" | "brother" | "sister";

interface Heir {
  id: string;
  relation: Relation;
  count: number;
}

interface HeirResult extends Heir {
  share: string;
  shareDecimal: number;
  amount: number;
  isBlocked: boolean;
  rule: string;
}

const RELATION_LABELS: Record<Relation, string> = {
  husband: "Husband", wife: "Wife", son: "Son", daughter: "Daughter",
  father: "Father", mother: "Mother", brother: "Brother", sister: "Sister",
};

const RELATION_ICONS: Record<Relation, string> = {
  husband: "👨", wife: "👩", son: "👦", daughter: "👧",
  father: "👴", mother: "👵", brother: "🧑", sister: "👩",
};

// Simplified Fara\'id algorithm
function calculateInheritance(heirs: Heir[], estateValue: number): HeirResult[] {
  const results: HeirResult[] = [];
  const hasSon = heirs.some(h => h.relation === "son");
  const hasFather = heirs.some(h => h.relation === "father");

  for (const heir of heirs) {
    let share = 0;
    let shareLabel = "";
    let isBlocked = false;
    let rule = "";

    switch (heir.relation) {
      case "husband":
        share = hasSon ? 1/4 : 1/2;
        shareLabel = hasSon ? "1/4" : "1/2";
        rule = hasSon ? "Husband receives 1/4 when children exist (Quran 4:12)" : "Husband receives 1/2 when there are no children (Quran 4:12)";
        break;
      case "wife":
        share = hasSon ? 1/8 : 1/4;
        shareLabel = hasSon ? "1/8" : "1/4";
        share = share / Math.max(heir.count, 1);
        shareLabel = shareLabel + ` (shared by ${heir.count})`;
        rule = hasSon ? "Wife/wives receive 1/8 when children exist (Quran 4:12)" : "Wife/wives receive 1/4 when there are no children (Quran 4:12)";
        break;
      case "son":
        share = 0; // Residue — calculated after fixed shares
        shareLabel = "Residue (Asabah)";
        rule = "Sons are residuary heirs — they receive what remains after fixed shares (Quran 4:11)";
        break;
      case "daughter":
        if (hasSon) {
          share = 0;
          shareLabel = "1/2 of son\'s share";
          rule = "When sons exist, daughter receives half the share of each son (Quran 4:11)";
        } else if (heir.count === 1) {
          share = 1/2;
          shareLabel = "1/2";
          rule = "Single daughter receives 1/2 of estate (Quran 4:11)";
        } else {
          share = 2/3;
          shareLabel = "2/3 (shared)";
          share = share / heir.count;
          rule = "Two or more daughters share 2/3 of estate (Quran 4:11)";
        }
        break;
      case "father":
        share = 1/6;
        shareLabel = "1/6";
        rule = "Father receives 1/6 when there are children (Quran 4:11)";
        break;
      case "mother":
        share = hasSon || heirs.length > 3 ? 1/6 : 1/3;
        shareLabel = hasSon || heirs.length > 3 ? "1/6" : "1/3";
        rule = hasSon ? "Mother receives 1/6 when there are children (Quran 4:11)" : "Mother receives 1/3 when there are no children and no plurality of siblings (Quran 4:11)";
        break;
      case "brother":
      case "sister":
        isBlocked = hasSon || hasFather;
        share = isBlocked ? 0 : 1/6;
        shareLabel = isBlocked ? "BLOCKED" : "1/6";
        rule = isBlocked
          ? `${heir.relation === "brother" ? "Brothers" : "Sisters"} are blocked by sons or father (Hajb rule)`
          : `${heir.relation === "brother" ? "Brothers" : "Sisters"} receive 1/6 when not blocked`;
        break;
    }

    results.push({
      ...heir,
      share: shareLabel,
      shareDecimal: isBlocked ? 0 : share,
      amount: isBlocked ? 0 : Math.round(estateValue * share),
      isBlocked,
      rule,
    });
  }

  // Distribute residue to sons
  const fixedTotal = results.reduce((sum, h) => {
    if (h.relation !== "son" && !h.isBlocked) return sum + h.shareDecimal;
    return sum;
  }, 0);
  const residue = Math.max(0, 1 - fixedTotal);

  results.forEach(r => {
    if (r.relation === "son") {
      const perSon = residue / r.count;
      r.shareDecimal = perSon;
      r.amount = Math.round(estateValue * perSon);
      r.share = `Residue (${(perSon * 100).toFixed(1)}% each)`;
    }
  });

  // Also give daughters their share if sons exist
  results.forEach(r => {
    if (r.relation === "daughter" && hasSon) {
      const sonResult = results.find(s => s.relation === "son");
      if (sonResult) {
        const daughterShare = sonResult.shareDecimal / 2;
        r.shareDecimal = daughterShare;
        r.amount = Math.round(estateValue * daughterShare);
        r.share = `1/2 of son (${(daughterShare * 100).toFixed(1)}%)`;
      }
    }
  });

  return results;
}

export default function InheritanceCalculatorPage() {
  const [estateValue, setEstateValue] = useState(10000000);
  const [heirs, setHeirs] = useState<Heir[]>([
    { id: "1", relation: "wife", count: 1 },
    { id: "2", relation: "son", count: 2 },
    { id: "3", relation: "daughter", count: 1 },
  ]);
  const [results, setResults] = useState<HeirResult[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<HeirResult | null>(null);

  const addHeir = (relation: Relation) => {
    if (heirs.some(h => h.relation === relation)) return;
    setHeirs(prev => [...prev, { id: Date.now().toString(), relation, count: 1 }]);
  };

  const removeHeir = (id: string) => setHeirs(prev => prev.filter(h => h.id !== id));
  const updateCount = (id: string, delta: number) => setHeirs(prev => prev.map(h => h.id === id ? { ...h, count: Math.max(1, h.count + delta) } : h));

  const calculate = useCallback(() => {
    setResults(calculateInheritance(heirs, estateValue));
  }, [heirs, estateValue]);

  const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--gradient-hero)" }}>
        <section style={{ padding: "80px 0 100px", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-gold" style={{ width: 500, height: 500, top: -100, right: -100 }} />
          <div className="glow-orb glow-orb-purple" style={{ width: 400, height: 400, bottom: -100, left: -100 }} />
          <div className="pattern-overlay" />

          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
                Islamic Finance Tools
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, marginBottom: 16 }}>
                Islamic Inheritance Calculator
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto" }}>
                Calculate Fara\'id (Islamic inheritance shares) based on Quranic principles. Enter your estate value and surviving family members.
              </motion.p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 28, alignItems: "start" }} className="calc-grid">

              {/* Input Panel */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: "32px 28px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Estate Details</h2>

                {/* Estate Value */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 10 }}>
                    Total Estate Value (₦)
                  </label>
                  <input
                    type="number"
                    value={estateValue}
                    onChange={(e) => setEstateValue(Number(e.target.value))}
                    style={{ width: "100%", padding: "12px 16px", border: "1.5px solid var(--color-border)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-primary)", background: "white", outline: "none", transition: "border-color 0.3s" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-gold-300)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                  />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>{formatNGN(estateValue)}</p>
                </div>

                {/* Add Heirs */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 12 }}>
                    Add Family Members
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(Object.keys(RELATION_LABELS) as Relation[]).map((rel) => (
                      <button
                        key={rel}
                        onClick={() => addHeir(rel)}
                        disabled={heirs.some(h => h.relation === rel)}
                        style={{ padding: "6px 14px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, borderRadius: 20, border: "1.5px solid var(--color-border)", background: heirs.some(h => h.relation === rel) ? "var(--color-gold-50)" : "white", color: heirs.some(h => h.relation === rel) ? "var(--color-text-gold)" : "var(--color-text-secondary)", cursor: heirs.some(h => h.relation === rel) ? "default" : "pointer", transition: "all 0.2s" }}
                      >
                        {RELATION_ICONS[rel]} {RELATION_LABELS[rel]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Heirs */}
                {heirs.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 12 }}>
                      Surviving Family
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {heirs.map((heir) => (
                        <div key={heir.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-surface)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)" }}>
                            {RELATION_ICONS[heir.relation]} {RELATION_LABELS[heir.relation]}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button onClick={() => updateCount(heir.id, -1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--color-border)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{heir.count}</span>
                            <button onClick={() => updateCount(heir.id, 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--color-border)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                            <button onClick={() => removeHeir(heir.id)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#fef2f2", cursor: "pointer", color: "#ef4444", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={calculate}
                  style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 16px rgba(219,168,32,0.3)", transition: "all 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  Calculate Inheritance
                </button>

                <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--color-gold-50)", borderRadius: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <AlertTriangle size={16} color="var(--color-text-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                    For legal matters, always consult a qualified Islamic scholar or legal practitioner.
                  </p>
                </div>
              </motion.div>

              {/* Results Diagram */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                {!results ? (
                  <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>⚖️</div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, marginBottom: 12 }}>
                      Fara&apos;id Calculator
                    </h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                      Add family members and click &ldquo;Calculate Inheritance&rdquo; to see the Islamic inheritance distribution with glow pipeline connections.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {/* Estate header */}
                      <div className="glass-card" style={{ padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.15em", color: "var(--color-text-gold)", marginBottom: 4 }}>TOTAL ESTATE</p>
                          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--color-text-primary)" }}>{formatNGN(estateValue)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)" }}>Distributed among</p>
                          <p style={{ fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)" }}>{results.filter(r => !r.isBlocked).length} heirs</p>
                        </div>
                      </div>

                      {/* Visual Diagram */}
                      <div className="glass-card" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
                        {/* Deceased node */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40, position: "relative" }}>
                          <div style={{ padding: "16px 32px", background: "linear-gradient(135deg, var(--color-gold-100), var(--color-gold-200))", border: "2px solid var(--color-gold-400)", borderRadius: 16, textAlign: "center", boxShadow: "0 4px 20px var(--color-gold-glow)" }}>
                            <div style={{ fontSize: 24, marginBottom: 4 }}>🕌</div>
                            <div style={{ fontFamily: "var(--font-accent)", fontSize: 11, color: "var(--color-text-gold)", letterSpacing: "0.1em" }}>DECEASED ESTATE</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--color-text-gold)" }}>{formatNGN(estateValue)}</div>
                          </div>
                        </div>

                        {/* SVG connecting lines */}
                        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
                          <defs>
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#F5C842" />
                              <stop offset="100%" stopColor="#B8890A" />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Heir nodes */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, position: "relative", zIndex: 1 }}>
                          {results.map((heir, i) => (
                            <motion.div
                              key={heir.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              onClick={() => setSelectedNode(selectedNode?.id === heir.id ? null : heir)}
                              style={{
                                padding: "20px 16px",
                                borderRadius: 14,
                                border: heir.isBlocked ? "2px solid rgba(239,68,68,0.4)" : selectedNode?.id === heir.id ? "2px solid var(--color-gold-400)" : "2px solid var(--color-border)",
                                background: heir.isBlocked ? "rgba(239,68,68,0.05)" : selectedNode?.id === heir.id ? "var(--color-gold-50)" : "white",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 0.25s",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {!heir.isBlocked && (
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--gradient-gold)", borderRadius: "14px 14px 0 0" }} />
                              )}
                              <div style={{ fontSize: 28, marginBottom: 8 }}>{RELATION_ICONS[heir.relation]}</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                                {heir.count > 1 ? `${heir.count}x ` : ""}{RELATION_LABELS[heir.relation]}
                              </div>
                              {heir.isBlocked ? (
                                <div style={{ padding: "4px 10px", background: "rgba(239,68,68,0.1)", borderRadius: 20, display: "inline-block" }}>
                                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#ef4444" }}>BLOCKED</span>
                                </div>
                              ) : (
                                <>
                                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--color-text-gold)", marginBottom: 2 }}>
                                    {formatNGN(heir.amount)}
                                  </div>
                                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-muted)" }}>{heir.share}</div>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Selected node detail */}
                      <AnimatePresence>
                        {selectedNode && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card"
                            style={{ padding: "28px 32px", borderTop: "3px solid var(--color-gold-300)" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                              <Info size={20} color="var(--color-text-gold)" />
                              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500 }}>
                                Islamic Ruling — {RELATION_LABELS[selectedNode.relation]}
                              </h4>
                            </div>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                              {selectedNode.rule}
                            </p>
                            {!selectedNode.isBlocked && (
                              <div style={{ marginTop: 16, padding: "14px 18px", background: "var(--color-gold-50)", borderRadius: 10 }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontStyle: "italic", color: "var(--color-text-gold)" }}>
                                  &ldquo;Allah instructs you concerning your children: for the male, what is equal to the share of two females.&rdquo; — Quran 4:11
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
''')

# ─── INGREDIENT CHECKER ────────────────────────────────────────────────────────
w("app/[locale]/resources/ingredient-checker/page.tsx", '''
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
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--gradient-hero)" }}>
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
''')

print("Ingredient checker done.")

# ─── RESOURCES HUB ────────────────────────────────────────────────────────────
w("app/[locale]/resources/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BarChart2, FlaskConical, Calculator, BookOpen, Globe } from "lucide-react";

const RESOURCES = [
  { icon: BarChart2, title: "Halal Market Data", desc: "Global halal economy intelligence, sector data, Nigeria market deep-dive, and growth projections to 2030.", href: "/resources/halal-market-data", color: "var(--color-gold-400)" },
  { icon: FlaskConical, title: "Ingredient Checker", desc: "Search any ingredient by name or E-number. Instantly see halal status, source, and certified alternatives.", href: "/resources/ingredient-checker", color: "var(--color-purple-500)" },
  { icon: Calculator, title: "Inheritance Calculator", desc: "Interactive Fara\'id calculator with visual organogram. Calculates Islamic inheritance distribution per Quran.", href: "/resources/inheritance-calculator", color: "var(--color-gold-500)" },
  { icon: BookOpen, title: "Standards Library", desc: "Searchable library of halal standards from JAKIM, ESMA, SMIIC, NAFDAC, and other certification bodies.", href: "/resources/standards-library", color: "var(--color-purple-600)" },
  { icon: Globe, title: "Global Halal Map", desc: "Interactive map showing halal markets, certification bodies, and Dar Al Halal recognition status worldwide.", href: "/resources/global-halal-map", color: "var(--color-gold-400)" },
];

export default function ResourcesPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "80px 0 60px", background: "var(--gradient-hero)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)" }} />
          <div className="pattern-overlay" />
          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
              Intelligence Hub
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 300, marginBottom: 20 }}>
              Halal Resources & Tools
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              Market intelligence, verification tools, and Islamic reference calculators — all in one place.
            </motion.p>
          </div>
        </section>

        <section ref={ref} style={{ padding: "80px 0 100px", background: "var(--color-surface)" }}>
          <div className="section-container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }} className="resources-grid">
              {RESOURCES.map((resource, i) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/${locale}${resource.href}`} style={{ textDecoration: "none", display: "block" }}>
                    <div className="glass-card" style={{ padding: "36px 28px", height: "100%", transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-8px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 24px 64px rgba(0,0,0,0.12)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glass-shadow)"; }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: resource.color + "20", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                        <resource.icon size={26} color={resource.color} />
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, marginBottom: 12, color: "var(--color-text-primary)" }}>{resource.title}</h3>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>{resource.desc}</p>
                      <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: resource.color }}>
                        Explore → 
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .resources-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .resources-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
''')

# ─── HALAL MARKET DATA ────────────────────────────────────────────────────────
w("app/[locale]/resources/halal-market-data/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

const SECTORS = [
  { name: "Food & Beverage", size: "$1.4T", growth: "+6.3%", markets: 57, emoji: "🍔" },
  { name: "Modest Fashion", size: "$277B", growth: "+4.8%", markets: 35, emoji: "👗" },
  { name: "Pharmaceuticals", size: "$109B", growth: "+5.2%", markets: 42, emoji: "💊" },
  { name: "Cosmetics", size: "$82B", growth: "+7.1%", markets: 38, emoji: "💄" },
  { name: "Islamic Finance", size: "$3.6T", growth: "+9.4%", markets: 49, emoji: "💰" },
  { name: "Travel & Tourism", size: "$189B", growth: "+8.2%", markets: 30, emoji: "✈️" },
];

const NIGERIA_STATS = [
  { label: "Muslim Population", value: 95, suffix: "M", desc: "Africa\'s largest Muslim population" },
  { label: "Annual Halal Market", value: 22, suffix: "B+", prefix: "$", desc: "Estimated 2025 market value" },
  { label: "Untapped Opportunity", value: 78, suffix: "%", desc: "Products still uncertified" },
  { label: "Export Premium", value: 35, suffix: "%", desc: "Average price uplift for certified products" },
];

export default function HalalMarketDataPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "80px 0 60px", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-gold" style={{ width: 500, height: 500, top: -100, right: -100 }} />
          <div className="pattern-overlay" />
          <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
              Market Intelligence
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,54px)", fontWeight: 300, marginBottom: 20 }}>
              Halal Economy Intelligence Hub
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 540, margin: "0 auto" }}>
              Data-driven insights into the global halal economy, Nigeria\'s market opportunity, and sector-by-sector intelligence.
            </motion.p>
          </div>
        </section>

        {/* Nigeria Stats */}
        <section ref={ref} style={{ padding: "80px 0", background: "var(--color-surface)" }}>
          <div className="section-container">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, marginBottom: 48, textAlign: "center" }}>
              Nigeria: The Halal Opportunity
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 80 }} className="stats-grid">
              {NIGERIA_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card"
                  style={{ padding: "32px 24px", textAlign: "center" }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600, color: "var(--color-text-gold)", lineHeight: 1, marginBottom: 8 }}>
                    {inView ? (
                      <>{stat.prefix || ""}<CountUp end={stat.value} duration={2.5} />{stat.suffix}</>
                    ) : (
                      <>{stat.prefix || ""}0{stat.suffix}</>
                    )}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>{stat.desc}</div>
                </motion.div>
              ))}
            </div>

            {/* Sectors */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, marginBottom: 36, textAlign: "center" }}>
              Global Sector Intelligence
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="sectors-data-grid">
              {SECTORS.map((sector, i) => (
                <motion.div
                  key={sector.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass-card"
                  style={{ padding: "28px 24px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 32 }}>{sector.emoji}</span>
                    <h3 style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700 }}>{sector.name}</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[["Market Size", sector.size, "var(--color-text-gold)"], ["YoY Growth", sector.growth, "#16a34a"], ["Markets", `${sector.markets}`, "var(--color-text-purple)"]].map(([label, value, color]) => (
                      <div key={label} style={{ textAlign: "center", padding: "10px 6px", background: "var(--color-surface)", borderRadius: 8 }}>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700, color }}>{value}</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              style={{ marginTop: 80, background: "var(--gradient-certification)", borderRadius: 24, padding: "48px", textAlign: "center" }}
            >
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, marginBottom: 16 }}>
                Download Nigeria Halal Opportunity Report
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
                Full market analysis, export opportunities, revenue calculator, and step-by-step certification guide. Free with account registration.
              </p>
              <button style={{ padding: "14px 36px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 50, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, boxShadow: "0 4px 20px rgba(219,168,32,0.3)" }}>
                Download Free Report →
              </button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .stats-grid, .sectors-data-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .stats-grid, .sectors-data-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
''')

print("Resources pages done.")

# ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
w("app/[locale]/contact/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "", subject: "Certification Inquiry" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = { width: "100%", padding: "13px 16px", border: "1.5px solid var(--color-border)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)", background: "white", outline: "none", transition: "border-color 0.3s" };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <section style={{ padding: "80px 0 100px", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-gold" style={{ width: 400, height: 400, top: -100, right: -100 }} />
          <div className="pattern-overlay" />

          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
                Get in Touch
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,54px)", fontWeight: 300 }}>
                Contact Dar Al Halal
              </motion.h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48 }} className="contact-grid">

              {/* Info */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="glass-card" style={{ padding: "36px 32px", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 28 }}>Our Office</h2>
                  {[
                    { icon: MapPin, label: "Address", value: "14 Oguda Close, Maitama, Abuja, Nigeria" },
                    { icon: Phone, label: "Phone", value: "+234 806 333 4296" },
                    { icon: Mail, label: "Email", value: "info@daralhalalcertification.com" },
                    { icon: Clock, label: "Hours", value: "Mon–Fri, 9am–5pm WAT" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-gold-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <item.icon size={18} color="var(--color-text-gold)" />
                      </div>
                      <div>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "var(--color-text-gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{item.label}</p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)" }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "var(--color-purple-50)", border: "1px solid var(--color-purple-200)", borderRadius: 16, padding: "24px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--color-text-purple)", lineHeight: 1.6 }}>
                    &ldquo;A Dar Al Halal certificate is not paperwork. It is your passport to premium markets.&rdquo;
                  </p>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                {submitted ? (
                  <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center" }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, marginBottom: 16 }}>Message Sent!</h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                      Thank you for reaching out. Our team will respond within 1–2 business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "36px 32px" }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 28 }}>Send a Message</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Full Name *</label>
                        <input required style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                          onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
                          placeholder="Your name" />
                      </div>
                      <div>
                        <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Email *</label>
                        <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                          onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
                          placeholder="your@email.com" />
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Company</label>
                      <input style={inputStyle} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                        onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                        onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
                        placeholder="Your business name" />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Subject</label>
                      <select style={{ ...inputStyle, cursor: "pointer" }} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                        <option>Certification Inquiry</option>
                        <option>Verification Issue</option>
                        <option>Partnership</option>
                        <option>Media Inquiry</option>
                        <option>General Question</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 28 }}>
                      <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Message *</label>
                      <textarea required rows={5} style={{ ...inputStyle, resize: "vertical" }} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                        onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
                        placeholder="Tell us how we can help..." />
                    </div>
                    <button type="submit" style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(219,168,32,0.3)" }}>
                      <Send size={16} /> Send Message
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
''')

print("Contact page done.")

# ─── AUTH PAGES ───────────────────────────────────────────────────────────────
w("app/[locale]/auth/login/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const inputStyle = { width: "100%", padding: "14px 16px", border: "1.5px solid var(--color-border)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-primary)", background: "white", outline: "none", transition: "border-color 0.3s" };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--gradient-hero)", display: "flex", alignItems: "center" }}>
        <div className="glow-orb glow-orb-gold" style={{ width: 500, height: 500, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div className="pattern-overlay" style={{ position: "fixed" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
            style={{ maxWidth: 440, margin: "0 auto", padding: "48px 40px" }}
          >
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#F5C842,#B8890A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>☽</div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Welcome Back</h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)" }}>Sign in to your Dar Al Halal account</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Email Address</label>
                <input type="email" required style={inputStyle} value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                  onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
                  placeholder="your@email.com" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} required style={{ ...inputStyle, paddingRight: 46 }} value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
                    onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                    onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
                    placeholder="Your password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right", marginBottom: 28 }}>
                <Link href="#" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-gold)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <button type="submit" style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#F5C842,#B8890A)", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(219,168,32,0.3)" }}>
                Sign In <ArrowRight size={16} />
              </button>
            </form>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", textAlign: "center", marginTop: 24 }}>
              No account?{" "}
              <Link href={`/${locale}/auth/register`} style={{ color: "var(--color-text-gold)", fontWeight: 600, textDecoration: "none" }}>Create one free</Link>
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}
''')

w("app/[locale]/auth/register/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff, Building2, BookOpen, Search, Users } from "lucide-react";

const STEPS = ["Account Type", "Business Info", "Profile", "Confirm"];

const ACCOUNT_TYPES = [
  { id: "business", icon: Building2, title: "Business", desc: "Certify my products/services", color: "var(--color-gold-400)" },
  { id: "student", icon: BookOpen, title: "Student", desc: "Learn halal standards", color: "var(--color-purple-500)" },
  { id: "consumer", icon: Search, title: "Consumer", desc: "Verify halal products", color: "var(--color-silver-500)" },
  { id: "partner", icon: Users, title: "Partner", desc: "Certification body or trade org", color: "var(--color-gold-600)" },
];

const SECTORS = ["Food & Beverage", "Cosmetics & Beauty", "Pharmaceuticals", "Hospitality", "Logistics", "Manufacturing", "Fashion & Textiles", "Finance", "Agriculture", "Healthcare", "Education", "Other"];

export default function RegisterPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ accountType: "", businessName: "", sector: "", state: "", phone: "", fullName: "", email: "", password: "", confirmPassword: "", newsletter: false, updates: true });

  const inputStyle = { width: "100%", padding: "12px 16px", border: "1.5px solid var(--color-border)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)", background: "white", outline: "none", transition: "border-color 0.3s" };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = "var(--color-gold-300)");
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = "var(--color-border)");

  const canNext = () => {
    if (step === 0) return !!form.accountType;
    if (step === 1) return !!(form.businessName && form.sector);
    if (step === 2) return !!(form.fullName && form.email && form.password && form.password === form.confirmPassword);
    return true;
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--gradient-hero)" }}>
        <div className="glow-orb glow-orb-purple" style={{ width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)" }} />
        <div className="pattern-overlay" style={{ position: "fixed" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, padding: "60px 24px 100px" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 48 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: i <= step ? "linear-gradient(135deg,#F5C842,#B8890A)" : "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                  {i < step ? <Check size={14} color="white" /> : <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: i <= step ? "white" : "var(--color-text-muted)" }}>{i + 1}</span>}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: i === step ? "var(--color-text-gold)" : "var(--color-text-muted)", fontWeight: i === step ? 700 : 400, display: i === 3 ? "inline" : "none" }}>{s}</span>
                {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? "var(--gradient-gold)" : "var(--color-border)", borderRadius: 1 }} />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card"
            style={{ maxWidth: 560, margin: "0 auto", padding: "44px 40px" }}
          >
            {step === 0 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Choose Account Type</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Select how you plan to use the platform</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {ACCOUNT_TYPES.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setForm(p => ({...p, accountType: type.id}))}
                      style={{ padding: "20px 16px", border: `2px solid ${form.accountType === type.id ? type.color : "var(--color-border)"}`, borderRadius: 14, cursor: "pointer", textAlign: "center", transition: "all 0.2s", background: form.accountType === type.id ? type.color + "12" : "white" }}
                    >
                      <type.icon size={24} color={form.accountType === type.id ? type.color : "var(--color-text-muted)"} style={{ margin: "0 auto 10px" }} />
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{type.title}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-muted)" }}>{type.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Business Information</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Tell us about your business</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[["Business Name", "businessName", "text", "Your registered business name"], ["Phone Number", "phone", "tel", "+234 xxx xxx xxxx"]].map(([label, key, type, placeholder]) => (
                    <div key={key}>
                      <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>{label}</label>
                      <input type={type} style={inputStyle} value={(form as Record<string, string>)[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} onFocus={focus} onBlur={blur} placeholder={placeholder} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Business Sector</label>
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.sector} onChange={e => setForm(p => ({...p, sector: e.target.value}))} onFocus={focus} onBlur={blur}>
                      <option value="">Select sector</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Personal Profile</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Create your login credentials</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Full Name</label>
                    <input style={inputStyle} value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} onFocus={focus} onBlur={blur} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Email Address</label>
                    <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} onFocus={focus} onBlur={blur} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} style={{ ...inputStyle, paddingRight: 46 }} value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} onFocus={focus} onBlur={blur} placeholder="Create a strong password" />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Confirm Password</label>
                    <input type="password" style={{ ...inputStyle, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "#ef4444" : "var(--color-border)" }} value={form.confirmPassword} onChange={e => setForm(p => ({...p, confirmPassword: e.target.value}))} onFocus={focus} placeholder="Confirm your password" />
                    {form.confirmPassword && form.password !== form.confirmPassword && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-body)" }}>Passwords do not match</p>}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Review & Confirm</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>Confirm your details before creating your account</p>
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "24px", marginBottom: 24 }}>
                  {[["Account Type", form.accountType], ["Business", form.businessName || "N/A"], ["Sector", form.sector || "N/A"], ["Name", form.fullName], ["Email", form.email]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)" }}>{l}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", textTransform: "capitalize" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input type="checkbox" id="terms" required style={{ marginTop: 2, accentColor: "var(--color-gold-400)" }} />
                  <label htmlFor="terms" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    I agree to the <Link href="#" style={{ color: "var(--color-text-gold)" }}>Terms of Service</Link> and <Link href="#" style={{ color: "var(--color-text-gold)" }}>Privacy Policy</Link>
                  </label>
                </div>
              </>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "13px", background: "none", border: "1.5px solid var(--color-border)", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <button
                onClick={() => step < 3 ? setStep(s => s + 1) : undefined}
                disabled={!canNext()}
                style={{ flex: 2, padding: "13px", background: canNext() ? "linear-gradient(135deg,#F5C842,#B8890A)" : "var(--color-border)", color: "white", border: "none", borderRadius: 12, cursor: canNext() ? "pointer" : "not-allowed", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: canNext() ? "0 4px 16px rgba(219,168,32,0.3)" : "none" }}
              >
                {step === 3 ? "Create My Account" : "Continue"} <ArrowRight size={16} />
              </button>
            </div>

            {step === 0 && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)", textAlign: "center", marginTop: 20 }}>
                Already have an account? <Link href={`/${locale}/auth/login`} style={{ color: "var(--color-text-gold)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
''')

print("Auth pages done.")

# ─── AI CHATBOT ───────────────────────────────────────────────────────────────
w("components/features/HalalChatbot.tsx", '''
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How does certification increase my revenue?",
  "What sectors can be certified?",
  "How long does certification take?",
  "Is my product ingredient halal?",
];

const INITIAL_MSG: Message = {
  role: "assistant",
  content: "As-salamu alaykum! I am HalalBot, your official guide to Dar Al Halal Certification. How can I help you unlock the global halal market today?",
};

export default function HalalChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content || "I apologize, I could not process that request. Please try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I am having trouble connecting. Please try again in a moment. Ready to unlock the halal market? Apply for certification today." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1200 }}>
      {/* Chat bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="animate-gold-pulse"
            style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#F5C842,#B8890A)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(219,168,32,0.5)", fontSize: 24 }}
          >
            ☽
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ position: "absolute", bottom: 0, right: 0, width: 380, height: 520, borderRadius: 20, overflow: "hidden", background: "rgba(253,252,250,0.97)", backdropFilter: "blur(20px)", border: "1px solid var(--color-border)", boxShadow: "0 24px 80px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div style={{ padding: "16px 20px", background: "linear-gradient(135deg,#F5C842,#B8890A)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22 }}>☽</div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "white" }}>HalalBot</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.85)" }}>Your Halal Guide</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.15)")} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <div style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user" ? "linear-gradient(135deg,#F5C842,#B8890A)" : "white",
                    color: msg.role === "user" ? "white" : "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    lineHeight: 1.6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: msg.role === "assistant" ? "1px solid var(--color-border)" : "none",
                  }}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: "white", borderRadius: "18px 18px 18px 4px", width: "fit-content", border: "1px solid var(--color-border)" }}>
                  <span className="typing-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-text-muted)", display: "inline-block" }} />
                  <span className="typing-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-text-muted)", display: "inline-block" }} />
                  <span className="typing-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-text-muted)", display: "inline-block" }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div style={{ padding: "4px 12px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} style={{ padding: "5px 12px", background: "var(--color-gold-50)", border: "1px solid var(--color-gold-200)", borderRadius: 20, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-gold)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--color-gold-100)")} onMouseLeave={e => (e.currentTarget.style.background = "var(--color-gold-50)")}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "8px 12px 14px", borderTop: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", gap: 8, background: "white", border: "1.5px solid var(--color-border)", borderRadius: 12, padding: "8px 12px", transition: "border-color 0.3s" }} onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--color-gold-300)")} onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask about halal certification..."
                  style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-primary)", background: "transparent" }}
                />
                <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{ width: 32, height: 32, borderRadius: "50%", background: input.trim() ? "linear-gradient(135deg,#F5C842,#B8890A)" : "var(--color-border)", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Send size={14} color="white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
''')

print("Chatbot done.")

# ─── API ROUTE ────────────────────────────────────────────────────────────────
w("app/api/chat/route.ts", '''
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are HalalBot, the official AI assistant for Dar Al Halal Certification — Nigeria's premier halal certification authority. Your role is to educate, inform, and guide businesses toward obtaining halal certification.

You explain:
- The business value of halal certification (revenue, market access, export opportunities)
- The certification process (application → screening → audit → Shariah verification → certificate issuance)
- Market opportunities in Nigeria and Africa ($3T global halal economy, 95M Nigerian Muslims, 400M+ African Muslim consumers)
- Halal compliance, ingredient permissibility, and Islamic business ethics
- The 12 certified sectors: Food & Beverage, Cosmetics, Pharmaceuticals, Hospitality, Logistics, Manufacturing, Fashion, Finance, Agriculture, Healthcare, Education, Animal Feed

Key facts:
- Dar Al Halal is headquartered at 14 Oguda Close, Maitama, Abuja, Nigeria
- Phone: +234 806 333 4296 | Email: info@daralhalalcertification.com
- Certification mark is copyright-protected under Nigerian and international IP law
- Certified businesses report 30-45% increase in export revenue within 12 months

Always speak with authority, warmth, and Islamic courtesy (use "Alhamdulillah", "In sha Allah" where appropriate).
Always end responses with a call to action encouraging certification application.
Keep responses concise and helpful.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback response when no API key is configured
      return NextResponse.json({
        content: generateFallbackResponse(messages[messages.length - 1]?.content || ""),
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ content: data.content[0]?.text || "I apologize, please try again." });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ content: generateFallbackResponse("") }, { status: 200 });
  }
}

function generateFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("revenue") || msg.includes("money") || msg.includes("profit")) {
    return "Alhamdulillah! Dar Al Halal certified businesses report **30–45% increase in export revenue within 12 months**. Halal certification opens GCC, Malaysian, and Indonesian import markets — premium markets that reject uncertified products outright. Your certification is not a cost; it is a revenue multiplier. Ready to unlock the halal market? **Apply for certification today.**";
  }

  if (msg.includes("sector") || msg.includes("industry") || msg.includes("type")) {
    return "Dar Al Halal certifies businesses across **12 sectors**:\n\n🍔 Food & Beverage\n💄 Cosmetics & Beauty\n💊 Pharmaceuticals\n🏨 Hospitality\n🚚 Logistics & Supply Chain\n🏭 Manufacturing\n👗 Fashion & Textiles\n💰 Finance & Banking\n🌿 Agriculture\n🐄 Animal Feed\n⚕️ Healthcare\n🎓 Education\n\nIn sha Allah, whatever sector your business is in, we can certify it. **Apply today.**";
  }

  if (msg.includes("long") || msg.includes("time") || msg.includes("process") || msg.includes("how")) {
    return "The Dar Al Halal certification process typically takes **4–8 weeks** from application to certificate issuance:\n\n1. Application submission\n2. Initial screening (1 week)\n3. Document review (1–2 weeks)\n4. On-site audit (1 week)\n5. Shariah verification by our scholar panel\n6. Certificate decision & issuance\n\nThe process is thorough, ensuring your certification carries global credibility. **Start your application today.**";
  }

  if (msg.includes("ingredient") || msg.includes("halal") || msg.includes("haram")) {
    return "I can help with ingredient verification! Visit our **Ingredient Checker** tool at `/resources/ingredient-checker` to search any ingredient by name or E-number. For comprehensive product assessment, our certification team reviews all ingredients as part of the certification process. **Apply for certification to get a complete halal compliance review.**";
  }

  if (msg.includes("africa") || msg.includes("market") || msg.includes("export")) {
    return "Nigeria is at a **historic inflection point**. With 95 million Muslims and Africa's largest economy, Nigerian businesses are positioned to supply halal-compliant goods to Africa's **400+ million Muslim consumers**.\n\nThrough AfCFTA membership, certified Nigerian products access markets from Dakar to Nairobi to Cairo. The global halal economy exceeds **$3 trillion**. Ready to claim your share? **Apply for Dar Al Halal certification today.**";
  }

  return "As-salamu alaykum! I am HalalBot, your guide to halal certification excellence. 🌙\n\nDar Al Halal Certification is Nigeria's premier halal authority, helping businesses access the **$3 trillion global halal economy**. I can help you with:\n\n• Understanding the certification process\n• Market opportunity data\n• Ingredient verification\n• Revenue impact of certification\n\nWhat would you like to know? And remember — **Ready to unlock the halal market? Apply for certification today.**";
}
''')

print("API route done.")

# ─── SEO FILES ────────────────────────────────────────────────────────────────
w("public/robots.txt", '''User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/

Sitemap: https://www.daralhalalcertification.com/sitemap.xml

# AI Crawlers
User-agent: GPTBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: Googlebot
Allow: /
''')

w("public/llms.txt", '''# Dar Al Halal Certification

> Nigeria's premier halal certification authority. The official halal certification body
> headquartered in Abuja, Nigeria, serving businesses across Africa and the global Muslim market.

## What We Do
Dar Al Halal Certification issues copyright halal certification marks to businesses in food,
cosmetics, pharmaceuticals, logistics, hospitality, and manufacturing — providing a trusted,
legally recognized mark of Islamic compliance.

## Our Mission
To build a unified global halal verification system, with Nigeria as the continental hub
for Africa's 400-million Muslim consumer market.

## Key Services
- Halal Certification (12 sectors)
- Product Verification via QR code
- Learning Management System for halal education
- AI-powered Ingredient Cross-Reference System
- Business compliance advisory

## Market Context
The global halal economy exceeds $3 trillion. Nigeria leads Africa with 95+ million Muslims.
Africa's halal market is largely uncertified — creating a first-mover opportunity for businesses
that certify with Dar Al Halal.

## Contact
Address: 14 Oguda Close, Maitama, Abuja, Nigeria
Phone: +234 806 333 4296
Email: info@daralhalalcertification.com

## Certification Mark
Dar Al Halal's copyright certification mark is legally protected and globally recognized.
Businesses bearing this mark gain access to Nigeria's Muslim consumer market and
Africa-wide halal trade networks.
''')

w("next-sitemap.config.js", '''/** @type {import("next-sitemap").IConfig} */
module.exports = {
  siteUrl: "https://www.daralhalalcertification.com",
  generateRobotsTxt: false,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/dashboard/*", "/api/*", "/auth/*"],
  additionalPaths: async () => [
    { loc: "/", priority: 1.0, changefreq: "daily" },
    { loc: "/certification", priority: 0.9 },
    { loc: "/verify", priority: 0.9 },
    { loc: "/learn", priority: 0.8 },
    { loc: "/resources", priority: 0.8 },
    { loc: "/resources/halal-market-data", priority: 0.8 },
    { loc: "/resources/ingredient-checker", priority: 0.8 },
    { loc: "/resources/inheritance-calculator", priority: 0.7 },
    { loc: "/about", priority: 0.7 },
    { loc: "/contact", priority: 0.6 },
  ],
};
''')

print("SEO files done.")

# ─── REDIRECT ROOT → LOCALE ───────────────────────────────────────────────────
w("app/page.tsx", '''import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
''')

# ─── STANDARDS LIBRARY PAGE ───────────────────────────────────────────────────
w("app/[locale]/resources/standards-library/page.tsx", '''
"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FileText, Download, Lock, ExternalLink } from "lucide-react";

const STANDARDS = [
  { id: "ms1500", name: "MS 1500:2019", body: "JAKIM Malaysia", year: 2019, desc: "Halal Food — Production, Preparation, Handling and Storage — General Guidelines", category: "Food", free: true },
  { id: "uae2055", name: "UAE.S 2055-1:2015", body: "ESMA UAE", year: 2015, desc: "Halal Products — Part 1: General Requirements for Halal Food", category: "Food", free: false },
  { id: "ois24", name: "OIC/SMIIC 1:2019", body: "SMIIC / OIC", year: 2019, desc: "General Guidelines of Halal Food", category: "Food", free: false },
  { id: "soncap", name: "NIS 808:2012", body: "NAFDAC Nigeria", year: 2012, desc: "Halal Food Requirements — Nigerian Industrial Standard", category: "Food", free: true },
  { id: "hpc", name: "OIC/SMIIC 4:2016", body: "SMIIC / OIC", year: 2016, desc: "Halal Cosmetics Requirements", category: "Cosmetics", free: false },
  { id: "pharma", name: "OIC/SMIIC 7:2022", body: "SMIIC / OIC", year: 2022, desc: "Halal Pharmaceuticals — General Guidelines", category: "Pharmaceuticals", free: false },
  { id: "logistics", name: "JAKIM-LOG:2020", body: "JAKIM Malaysia", year: 2020, desc: "Halal Logistics — Supply Chain Requirements", category: "Logistics", free: false },
  { id: "slaughter", name: "GSO 993:1998", body: "GCC Standardization Organization", year: 1998, desc: "Animal Slaughtering Requirements According to Islamic Law", category: "Food", free: true },
];

const CATEGORIES = ["All", "Food", "Cosmetics", "Pharmaceuticals", "Logistics"];

export default function StandardsLibraryPage() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [activeCategory, setActiveCategory] = require("react").useState("All");
  const [query, setQuery] = require("react").useState("");

  const filtered = STANDARDS.filter(s =>
    (activeCategory === "All" || s.category === activeCategory) &&
    (s.name.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "var(--gradient-hero)" }}>
        <section style={{ padding: "80px 0 100px", position: "relative", overflow: "hidden" }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 500, height: 500, top: -100, right: -100 }} />
          <div className="pattern-overlay" />

          <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.25em", color: "var(--color-text-gold)", marginBottom: 20, textTransform: "uppercase" }}>
                Reference Library
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, marginBottom: 16 }}>
                Halal Standards Library
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 540, margin: "0 auto" }}>
                Official halal standards from JAKIM, ESMA, SMIIC, NAFDAC, and international certification bodies.
              </motion.p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 20px", borderRadius: 24, border: "1.5px solid", borderColor: activeCategory === cat ? "var(--color-gold-400)" : "var(--color-border)", background: activeCategory === cat ? "var(--color-gold-50)" : "white", color: activeCategory === cat ? "var(--color-text-gold)" : "var(--color-text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ maxWidth: 500, margin: "0 auto 48px" }}>
              <input
                type="text"
                placeholder="Search standards..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width: "100%", padding: "14px 20px", border: "1.5px solid var(--color-border)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)", background: "white", outline: "none" }}
                onFocus={e => (e.target.style.borderColor = "var(--color-gold-300)")}
                onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>

            {/* Standards list */}
            <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map((standard, i) => (
                <motion.div
                  key={standard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card"
                  style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 20 }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--color-gold-50)", border: "1px solid var(--color-gold-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={22} color="var(--color-text-gold)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>{standard.name}</h3>
                      <span style={{ padding: "2px 10px", background: "var(--color-purple-50)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-text-purple)", fontWeight: 600 }}>{standard.category}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)" }}>{standard.body} · {standard.year}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{standard.desc}</p>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: standard.free ? "linear-gradient(135deg,#F5C842,#B8890A)" : "white", border: standard.free ? "none" : "1.5px solid var(--color-border)", borderRadius: 20, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: standard.free ? "white" : "var(--color-text-secondary)", flexShrink: 0, transition: "all 0.2s" }}>
                    {standard.free ? <Download size={14} /> : <Lock size={14} />}
                    {standard.free ? "Download" : "Sign in"}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
''')

print("Standards library done.")

# ─── ENV EXAMPLE ─────────────────────────────────────────────────────────────
w(".env.example", '''# Dar Al Halal Certification - Environment Variables
# Copy this file to .env.local and fill in your values

ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SITE_URL=https://www.daralhalalcertification.com

# Authentication (NextAuth)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://www.daralhalalcertification.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/daralhalalcertification
''')

# ─── UPDATE ROOT layout.tsx to include chatbot ─────────────────────────────
w("app/[locale]/layout.tsx", '''import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import HalalChatbot from "@/components/features/HalalChatbot";

const locales = [
  "en","ar","ha","yo","ig","fr","sw","id",
  "ms","tr","ur","zh","es","pt","de","ru",
  "bn","fa","so","wo",
];

const rtlLocales = ["ar","ur","fa"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  let messages = {};
  try {
    messages = (await import(`../../lib/messages/${locale}.json`)).default;
  } catch {
    try {
      messages = (await import(`../../lib/messages/en.json`)).default;
    } catch {
      messages = {};
    }
  }

  const isRTL = rtlLocales.includes(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div dir={isRTL ? "rtl" : "ltr"} lang={locale}>
        {children}
        <HalalChatbot />
      </div>
    </NextIntlClientProvider>
  );
}
''')

print("\n=== ALL FILES WRITTEN SUCCESSFULLY ===")
