
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

// Simplified Fara'id algorithm
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
          shareLabel = "1/2 of son's share";
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
                Halal Finance Tools
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, marginBottom: 16 }}>
                Fara'id Inheritance Calculator
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto" }}>
                Calculate Fara'id inheritance shares based on Quranic principles. Enter your estate value and surviving family members.
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
                    For legal matters, always consult a qualified halal scholar or legal practitioner.
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
                      Add family members and click &ldquo;Calculate Inheritance&rdquo; to see the Fara'id distribution with glow pipeline connections.
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
                                Fara'id Ruling — {RELATION_LABELS[selectedNode.relation]}
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
