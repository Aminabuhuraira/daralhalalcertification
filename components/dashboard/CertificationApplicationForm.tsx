"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlowingCard from "@/components/ui/GlowingCard";
import { CERTIFICATION_SECTORS } from "@/lib/sectors";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px",
  background: "rgba(109,40,217,0.04)",
  border: "1px solid rgba(109,40,217,0.2)",
  borderRadius: 8,
  fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535",
  outline: "none", transition: "border-color 0.2s",
};

const SCALES = [
  { value: "LARGE",  label: "Large Scale",  desc: "High-volume industrial or national distribution" },
  { value: "MEDIUM", label: "Medium Scale", desc: "Regional distribution, mid-tier production" },
  { value: "SMALL",  label: "Small Scale",  desc: "Local or startup business, limited production" },
];

export default function CertificationApplicationForm() {
  const router = useRouter();
  const [businessName,    setBusinessName]    = useState("");
  const [sector,          setSector]          = useState("");
  const [productionScale, setProductionScale] = useState("");
  const [productList,     setProductList]     = useState("");
  const [notes,           setNotes]           = useState("");
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/certification-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, sector, productionScale, productList, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <GlowingCard style={{ padding: "28px 30px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 6 }}>
        Submit New Application
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)", marginBottom: 20 }}>
        Fill in your business details. Our team will review and quote your certification fee within 2 working days.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={inputStyle} placeholder="Business / Brand Name *" />

        <select required value={sector} onChange={(e) => setSector(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">Select Sector *</option>
          {CERTIFICATION_SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Production Scale */}
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "rgba(10,21,53,0.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Production Scale *
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {SCALES.map(s => {
              const selected = productionScale === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setProductionScale(s.value)}
                  style={{
                    padding: "14px 12px",
                    borderRadius: 10,
                    border: selected ? "2px solid #C9A227" : "2px solid rgba(109,40,217,0.2)",
                    background: selected ? "rgba(201,162,39,0.06)" : "rgba(109,40,217,0.02)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: selected ? "#C9A227" : "#0A1535", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.45)", lineHeight: 1.4 }}>
                    {s.desc}
                  </div>
                </button>
              );
            })}
          </div>
          {!productionScale && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)", marginTop: 6 }}>Select your production scale above</p>
          )}
        </div>

        <textarea
          required
          rows={4}
          value={productList}
          onChange={(e) => setProductList(e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="List products / services to be certified (one per line or comma-separated) *"
        />
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Additional notes (optional)"
        />

        {error && <p style={{ color: "#f87171", fontSize: 13, fontFamily: "var(--font-body)" }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting || !productionScale}
          className="btn-primary"
          style={{ opacity: submitting || !productionScale ? 0.6 : 1, cursor: submitting || !productionScale ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </GlowingCard>
  );
}
