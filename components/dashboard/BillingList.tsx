"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  description: string;
  createdAt: string | Date;
  application: { businessName: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#F5C842",
  COMPLETED: "#22C55E",
  FAILED: "#EF4444",
  REFUNDED: "#60A5FA",
};

export default function BillingList({ payments, locale }: { payments: Payment[]; locale: string }) {
  const searchParams = useSearchParams();
  const callbackStatus = searchParams.get("payment");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const payNow = async (paymentId: string) => {
    setLoadingId(paymentId);
    setError("");
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start payment.");
        setLoadingId(null);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Network error. Please try again.");
      setLoadingId(null);
    }
  };

  return (
    <div>
      {callbackStatus && (
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 13, marginBottom: 20, padding: "10px 14px", borderRadius: 8,
          color: callbackStatus === "success" ? "#4ade80" : "#f87171",
          background: callbackStatus === "success" ? "rgba(34,197,94,0.08)" : "rgba(248,113,113,0.08)",
        }}>
          {callbackStatus === "success" ? "Payment successful. Thank you!" : "Payment was not completed. You can try again below."}
        </p>
      )}
      {error && <p style={{ color: "#f87171", fontSize: 13, fontFamily: "var(--font-body)", marginBottom: 16 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {payments.map((p) => (
          <GlowingCard key={p.id} style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", fontWeight: 600, marginBottom: 4 }}>{p.description}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>
                {p.application ? `${p.application.businessName} · ` : ""}{new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "#0A1535", fontWeight: 700 }}>
                  {p.currency} {(p.amount / 100).toLocaleString()}
                </div>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                  color: STATUS_COLOR[p.status],
                }}>{p.status}</span>
              </div>
              {p.status === "PENDING" && (
                <button onClick={() => payNow(p.id)} disabled={loadingId === p.id} className="btn-primary" style={{ fontSize: 13, padding: "9px 16px", opacity: loadingId === p.id ? 0.6 : 1 }}>
                  <CreditCard size={14} /> {loadingId === p.id ? "Redirecting..." : "Pay Now"}
                </button>
              )}
            </div>
          </GlowingCard>
        ))}
      </div>
    </div>
  );
}
