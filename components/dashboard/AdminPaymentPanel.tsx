"use client";
import { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import type { RenewalRow, RecentPayment } from "@/lib/admin-dashboard-stats";

function fmt(ngn: number, currency = "NGN") {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return symbol + (ngn / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "#fafafa",
  border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 8,
  fontFamily: "var(--font-body)",
  fontSize: 13,
  color: "#0A1535",
  outline: "none",
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "#16A34A",
  PENDING:   "#D97706",
  FAILED:    "#DC2626",
  REFUNDED:  "#6D28D9",
};

export default function AdminPaymentPanel({
  recentPayments,
  upcomingRenewals,
}: {
  recentPayments: RecentPayment[];
  upcomingRenewals: RenewalRow[];
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [totals, setTotals]       = useState<{ companyTotal: number; productTotal: number; overall: number } | null>(null);
  const [loading, setLoading]     = useState(false);

  const fetchTotals = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate);
    if (endDate)   params.set("end",   endDate);
    const res = await fetch(`/api/admin/payment-totals?${params}`);
    if (res.ok) setTotals(await res.json());
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Payment by Date ── */}
      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "22px 24px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Calendar size={16} color="#C9A227" />
          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#0A1535", margin: 0 }}>Payment By Date</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.64)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Start Date</p>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.64)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>End Date</p>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
          </div>
          <button
            onClick={fetchTotals}
            disabled={loading}
            style={{ padding: "9px 20px", background: "#0A1535", color: "white", border: "none", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Loading…" : "Apply"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Company Payments", value: totals?.companyTotal ?? 0, color: "#0A1535" },
            { label: "Product Payments", value: totals?.productTotal ?? 0, color: "#6D28D9" },
            { label: "Overall Total",    value: totals?.overall    ?? 0, color: "#C9A227" },
          ].map(t => (
            <div key={t.label} style={{ padding: "16px 18px", borderRadius: 10, background: "#F9FAFB", border: "1px solid rgba(10,21,53,0.07)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.64)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{t.label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: t.color, margin: 0 }}>
                {fmt(t.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Upcoming Renewals ── */}
      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "22px 24px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <TrendingUp size={16} color="#C9A227" />
          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#0A1535", margin: 0 }}>Upcoming Subscription Renewals</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)" }}>
            <thead>
              <tr>
                {["Company", "Product", "Type", "Subscribed On", "Expires On"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "rgba(10,21,53,0.64)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid rgba(10,21,53,0.07)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcomingRenewals.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "24px 12px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.62)" }}>No upcoming renewals.</td>
                </tr>
              ) : upcomingRenewals.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(10,21,53,0.05)" }}>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#0A1535", fontWeight: 500 }}>{r.businessName}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12.5, color: "rgba(10,21,53,0.72)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.productList.split(/[,\n]/)[0]?.trim() || "—"}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "rgba(10,21,53,0.68)" }}>{r.type}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "rgba(10,21,53,0.68)", whiteSpace: "nowrap" }}>{new Date(r.issuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12, whiteSpace: "nowrap" }}>
                    <span style={{ color: r.expiresAt && new Date(r.expiresAt) < new Date(Date.now() + 14 * 86400000) ? "#DC2626" : "#D97706", fontWeight: 600 }}>
                      {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Company Payments ── */}
      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "22px 24px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#0A1535", marginBottom: 18 }}>Recent Company Payments</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Company", "Description", "Type", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "rgba(10,21,53,0.64)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid rgba(10,21,53,0.07)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "24px 12px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.62)" }}>No payments yet.</td>
                </tr>
              ) : recentPayments.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(10,21,53,0.05)" }}>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#0A1535", fontWeight: 500 }}>{p.businessName ?? "—"}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12.5, color: "rgba(10,21,53,0.72)" }}>{p.description}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: p.paymentType === "PRODUCT" ? "rgba(109,40,217,0.08)" : "rgba(10,21,53,0.06)", color: p.paymentType === "PRODUCT" ? "#6D28D9" : "#0A1535" }}>
                      {p.paymentType}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#0A1535", fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(p.amount, p.currency)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: `${STATUS_COLOR[p.status] ?? "#94a3b8"}15`, color: STATUS_COLOR[p.status] ?? "#94a3b8" }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "rgba(10,21,53,0.66)", whiteSpace: "nowrap" }}>
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
