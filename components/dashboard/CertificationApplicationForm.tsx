"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";
import { SCHEME_CODES } from "@/lib/sectors";

type Product = { name: string; brand: string };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px",
  background: "white",
  border: "1px solid rgba(10,21,53,0.15)",
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
  const [schemeCode,      setSchemeCode]      = useState("");
  const [productionScale, setProductionScale] = useState("");
  const [products,        setProducts]        = useState<Product[]>([{ name: "", brand: "" }]);
  const [notes,           setNotes]           = useState("");
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState("");

  const selectedScheme = SCHEME_CODES.find(s => s.code === schemeCode);

  const addProduct = () => setProducts(prev => [...prev, { name: "", brand: "" }]);
  const removeProduct = (i: number) => setProducts(prev => prev.filter((_, idx) => idx !== i));
  const updateProduct = (i: number, field: keyof Product, value: string) =>
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeCode || !productionScale || !products.some(p => p.name.trim())) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/certification-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          sector: selectedScheme?.label ?? schemeCode,
          schemeCode,
          productionScale,
          productList: JSON.stringify(products.filter(p => p.name.trim())),
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlowingCard style={{ padding: "28px 30px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 6 }}>
        Submit New Application
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.68)", marginBottom: 20 }}>
        Fill in your business details. Our team will review and respond within 3 working days.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={inputStyle} placeholder="Business / Brand Name *" />

        {/* Certification Scheme (DAHC scheme codes) */}
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "rgba(10,21,53,0.68)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Certification Scheme *
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {SCHEME_CODES.map(s => {
              const selected = schemeCode === s.code;
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setSchemeCode(s.code)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: selected ? "2px solid #C9A227" : "2px solid rgba(10,21,53,0.12)",
                    background: selected ? "rgba(201,162,39,0.06)" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: selected ? "#9a7810" : "#0A1535", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>
                    {s.code}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: selected ? "#0A1535" : "rgba(10,21,53,0.6)", lineHeight: 1.3, display: "block" }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
          {!schemeCode && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.64)", marginTop: 6 }}>Select your certification scheme above</p>
          )}
        </div>

        {/* Production Scale */}
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "rgba(10,21,53,0.68)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                    border: selected ? "2px solid #C9A227" : "2px solid rgba(10,21,53,0.12)",
                    background: selected ? "rgba(201,162,39,0.06)" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: selected ? "#C9A227" : "#0A1535", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.66)", lineHeight: 1.4 }}>
                    {s.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products / Services */}
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "rgba(10,21,53,0.68)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Products / Services to be Certified *
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={p.name}
                  onChange={e => updateProduct(i, "name", e.target.value)}
                  style={{ ...inputStyle, flex: 1.4, padding: "10px 14px", fontSize: 13.5 }}
                  placeholder="Product / service name"
                />
                <input
                  value={p.brand}
                  onChange={e => updateProduct(i, "brand", e.target.value)}
                  style={{ ...inputStyle, flex: 1, padding: "10px 14px", fontSize: 13.5 }}
                  placeholder="Brand (if different)"
                />
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.6)", padding: 6 }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addProduct}
            style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#9a7810", background: "none", border: "1px dashed rgba(201,162,39,0.4)", borderRadius: 6, padding: "7px 14px", cursor: "pointer" }}
          >
            <Plus size={13} /> Add Product
          </button>
        </div>
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
          disabled={submitting || !schemeCode || !productionScale || !products.some(p => p.name.trim())}
          className="btn-primary"
          style={{ opacity: submitting || !schemeCode || !productionScale || !products.some(p => p.name.trim()) ? 0.6 : 1, cursor: submitting || !schemeCode || !productionScale || !products.some(p => p.name.trim()) ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </GlowingCard>
  );
}
