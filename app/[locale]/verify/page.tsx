"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Shield, Calendar, Building } from "lucide-react";

type VerifyResult = {
  valid: boolean;
  serial?: string;
  tier?: "COMPLETION" | "DISTINCTION" | "BUSINESS";
  issuedAt?: string;
  courseTitle?: string | null;
  sector?: string | null;
  holderName?: string;
};

const TIER_LABEL: Record<string, string> = {
  DISTINCTION: "Certificate of Distinction",
  COMPLETION: "Certificate of Completion",
  BUSINESS: "Halal Certification",
};

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageInner />
    </Suspense>
  );
}

function VerifyPageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [cert, setCert] = useState<VerifyResult | null>(null);

  const verify = async (serial?: string) => {
    const id = (serial ?? query).trim().toUpperCase();
    if (!id) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(id)}`);
      const data: VerifyResult = await res.json();
      if (!res.ok || !data.valid) {
        setCert(null);
        setStatus("notfound");
        return;
      }
      setCert(data);
      setStatus("found");
    } catch {
      setCert(null);
      setStatus("notfound");
    }
  };

  useEffect(() => {
    const prefill = searchParams.get("serial");
    if (prefill) {
      setQuery(prefill);
      verify(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <section className="section-hero-light dot-pattern" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div className="glow-orb glow-orb-purple" style={{ width: 380, height: 380, bottom: -80, left: "50%", transform: "translateX(-50%)", opacity: 0.14 }} />
          <div className="section-container" style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-overline" style={{ marginBottom: 20 }}>Certificate Lookup</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, color: "#4C1D95", marginBottom: 20 }}>
              Verify <span className="text-gold-shimmer">Halal Certification</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(10,21,53,0.6)", marginBottom: 40, lineHeight: 1.7 }}>
              Enter the certificate serial number printed on the certificate to verify its authenticity.
            </motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }} style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0 16px" }}><Search size={18} color="rgba(255,255,255,0.4)" /></div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && verify()}
                placeholder="e.g. DHC-2026-000001"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 15, color: "white", padding: "16px 0", letterSpacing: "0.05em" }}
              />
              <button onClick={() => verify()} disabled={status === "loading"} className="btn-solid-gold" style={{ borderRadius: 6, margin: 6, padding: "10px 24px" }}>
                {status === "loading" ? "Checking..." : "Verify"}
              </button>
            </motion.div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.4)", marginTop: 12 }}>Certificate serials start with "DHC" — e.g. DHC-2026-000001</p>
          </div>
        </section>

        {(status === "found" || status === "notfound") && (
          <section style={{ padding: "80px 0", background: "var(--bg-light)" }}>
            <div className="section-container" style={{ maxWidth: 680, margin: "0 auto" }}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 40, background: status === "found" ? "var(--bg-dark)" : "rgba(40,10,10,0.9)", border: `1px solid ${status === "found" ? "rgba(201,162,39,0.3)" : "rgba(180,50,50,0.3)"}`, borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                {status === "found" && cert && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                      <div className="icon-badge-lg"><CheckCircle size={28} color="var(--gold-300)" /></div>
                      <div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--gold-500)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Verified Certificate</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, color: "white" }}>Certification Active</div>
                      </div>
                    </div>
                    {([
                      { Icon: Building, label: "Holder", value: cert.holderName },
                      { Icon: Shield, label: cert.courseTitle ? "Course" : "Sector", value: cert.courseTitle || cert.sector || "—" },
                      { Icon: Calendar, label: "Issued", value: cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "" },
                      { Icon: CheckCircle, label: "Type", value: TIER_LABEL[cert.tier || ""] || cert.tier },
                    ] as const).map(({ Icon, label, value }) => (
                      <div key={label} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                        <div className="icon-badge-sm"><Icon size={15} color="var(--gold-300)" /></div>
                        <div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "white" }}>{String(value)}</div></div>
                      </div>
                    ))}
                  </>
                )}
                {status === "notfound" && <div style={{ display: "flex", gap: 16, alignItems: "center" }}><XCircle size={32} color="#EF4444" /><div><div style={{ color: "#EF4444", fontWeight: 700, marginBottom: 4 }}>Certificate Not Found</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>No certificate found with that serial. Verify the number and try again.</div></div></div>}
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
