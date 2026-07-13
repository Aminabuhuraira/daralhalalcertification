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

export default function CertificationApplicationForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [sector, setSector] = useState("");
  const [productList, setProductList] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/certification-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, sector, productList, notes: notes || undefined }),
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
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 18 }}>
        Submit New Application
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={inputStyle} placeholder="Business / Brand Name" />
        <select required value={sector} onChange={(e) => setSector(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">Select Sector</option>
          {CERTIFICATION_SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <textarea required rows={4} value={productList} onChange={(e) => setProductList(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="List the products or services you want certified, including key ingredients or processes" />
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Additional notes (optional)" />
        {error && <p style={{ color: "#f87171", fontSize: 13, fontFamily: "var(--font-body)" }}>{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </GlowingCard>
  );
}
