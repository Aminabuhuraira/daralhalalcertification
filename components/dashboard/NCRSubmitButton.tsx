"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function NCRSubmitButton({ appId }: { appId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/certification-applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submitNcrEvidence" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not submit. Please try again.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
        <CheckCircle2 size={15} color="#22C55E" />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#16A34A" }}>Corrective evidence submitted. Our team will review and respond shortly.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#DC2626", marginBottom: 8 }}>{error}</p>}
      <button
        onClick={submit}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
          padding: "10px 18px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
          background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.3)",
          color: "#C2410C", opacity: loading ? 0.6 : 1, transition: "all 0.15s",
        }}
      >
        <CheckCircle2 size={13} /> {loading ? "Submitting…" : "Submit Corrective Evidence for Review"}
      </button>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)", marginTop: 6 }}>
        Click only after uploading all required corrective evidence above.
      </p>
    </div>
  );
}
