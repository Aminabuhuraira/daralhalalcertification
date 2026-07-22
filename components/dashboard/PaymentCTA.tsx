"use client";
import { useState } from "react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

type Payment = { id: string; amount: number; currency: string; status: string; description: string };

type Props = {
  appId:    string;
  payments: Payment[];
  locale:   string;
};

export default function PaymentCTA({ payments, locale }: Props) {
  const invoice = payments.find(p => p.status === "PENDING") ?? payments[0];
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handlePayNow() {
    if (!invoice) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: invoice.id, locale }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Payment initialization failed."); return; }
      window.location.href = data.authorizationUrl;
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const isPaid = invoice?.status === "COMPLETED";

  return (
    <div style={{ padding: "18px 20px", borderRadius: 12, background: isPaid ? "rgba(34,197,94,0.06)" : "rgba(14,165,233,0.06)", border: `1px solid ${isPaid ? "rgba(34,197,94,0.25)" : "rgba(14,165,233,0.25)"}`, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: isPaid ? "#16A34A" : "#0369A1", marginBottom: 4 }}>
            <CreditCard size={14} style={{ display: "inline", marginRight: 6 }} />
            {isPaid ? "Payment Received — Processing Audit Schedule" : "Payment Required to Proceed"}
          </p>

          {invoice ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.65)", lineHeight: 1.5 }}>
              {invoice.description}<br />
              <strong style={{ color: isPaid ? "#16A34A" : "#0369A1", fontSize: 15 }}>
                {invoice.currency} {(invoice.amount / 100).toLocaleString()}
              </strong>
              <span style={{
                marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 7px",
                borderRadius: 4,
                background: isPaid ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                color: isPaid ? "#16A34A" : "#D97706",
                border: `1px solid ${isPaid ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}>
                {invoice.status}
              </span>
            </p>
          ) : (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)" }}>
              An invoice will be sent to your registered email address. You can also view it in Billing.
            </p>
          )}

          {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#EF4444", marginTop: 6 }}>{error}</p>}

          {!isPaid && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.45)", marginTop: 6 }}>
              Pay securely via card or bank transfer. You will receive an email receipt upon completion.
            </p>
          )}
        </div>

        {!isPaid && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {invoice && (
              <button
                onClick={handlePayNow}
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                  padding: "10px 20px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
                  background: "#0A1535", border: "none", color: "#C9A227",
                  opacity: loading ? 0.7 : 1, transition: "all 0.15s",
                }}
              >
                {loading ? <Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <CreditCard size={14} />}
                {loading ? "Redirecting…" : "Pay Now — Paystack"}
              </button>
            )}
            <a
              href={`/${locale}/dashboard/billing`}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600,
                padding: "9px 16px", borderRadius: 8, textDecoration: "none",
                background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)",
                color: "#0369A1",
              }}
            >
              <ExternalLink size={12} /> View Invoice in Billing
            </a>
            <a
              href="mailto:finance@daralhalalcertification.com?subject=Payment%20for%20Halal%20Certification%20Application"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600,
                padding: "9px 16px", borderRadius: 8, textDecoration: "none",
                background: "transparent", border: "1px solid rgba(10,21,53,0.15)",
                color: "rgba(10,21,53,0.55)",
              }}
            >
              <CreditCard size={12} /> Contact Finance Team
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
