"use client";
import { useState } from "react";
import { Award, ShieldCheck } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";
import ApplicationStages from "@/components/dashboard/ApplicationStages";

type Payment = { id: string; amount: number; currency: string; status: string };
type Certificate = { id: string; serial: string; issuedAt: string | Date };
const SCALE_LABEL: Record<string, string> = {
  LARGE: "Large Scale", MEDIUM: "Medium Scale", SMALL: "Small Scale",
};

type Application = {
  id: string;
  businessName: string;
  sector: string;
  productionScale: string | null;
  productList: string;
  notes: string | null;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  certIssueMode: "ON_APPROVAL" | "ON_PAYMENT" | "MANUAL";
  reviewNotes: string | null;
  createdAt: string | Date;
  user: { name: string; email: string };
  payments: Payment[];
  certificate: Certificate | null;
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:      "#F5C842",
  UNDER_REVIEW: "#60A5FA",
  APPROVED:     "#22C55E",
  REJECTED:     "#EF4444",
};

const ISSUE_MODE_LABEL: Record<string, string> = {
  ON_APPROVAL: "Issue on Approval",
  ON_PAYMENT:  "Issue on Payment",
  MANUAL:      "Issue Manually",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "#fafafa",
  border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 6,
  fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535",
  outline: "none",
};

function ApplicationRow({ app: initialApp }: { app: Application }) {
  const [app, setApp]               = useState(initialApp);
  const [status, setStatus]         = useState(app.status);
  const [certIssueMode, setCertIssueMode] = useState(app.certIssueMode);
  const [reviewNotes, setReviewNotes]     = useState(app.reviewNotes || "");
  const [feeAmount, setFeeAmount]   = useState("");
  const [saving, setSaving]         = useState(false);
  const [message, setMessage]       = useState("");

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Something went wrong."); return; }
      setApp((prev) => ({
        ...prev,
        status: data.application.status,
        certIssueMode: data.application.certIssueMode,
        reviewNotes: data.application.reviewNotes,
        certificate: data.certificate || prev.certificate,
      }));
      setFeeAmount("");
      setMessage("Saved.");
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    const body: Record<string, unknown> = { status, certIssueMode, reviewNotes };
    if (feeAmount) {
      body.feeAmountNgn = Number(feeAmount);
      body.feeDescription = `Certification fee — ${app.businessName}`;
    }
    patch(body);
  };

  const issueNow = () => patch({ status: "APPROVED", certIssueMode, issueCertificate: true });

  return (
    <GlowingCard style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#0A1535", marginBottom: 2 }}>{app.businessName}</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>
            {app.user.name} · {app.user.email} · {app.sector}
            {app.productionScale && (
              <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 4, background: "rgba(201,162,39,0.1)", color: "#9a7810", fontWeight: 700, fontSize: 11 }}>
                {SCALE_LABEL[app.productionScale] ?? app.productionScale}
              </span>
            )}
          </p>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: STATUS_COLOR[app.status], padding: "4px 10px", borderRadius: 6, border: `1px solid ${STATUS_COLOR[app.status]}40`, background: `${STATUS_COLOR[app.status]}15`, height: "fit-content" }}>
          {app.status.replace("_", " ")}
        </span>
      </div>

      <div style={{ marginBottom: 16, padding: "14px 4px" }}>
        <ApplicationStages status={app.status} certificateIssued={!!app.certificate} />
      </div>

      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.65)", marginBottom: 14, whiteSpace: "pre-wrap" }}>{app.productList}</p>
      {app.notes && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.45)", marginBottom: 14 }}>Notes: {app.notes}</p>}

      {app.payments.length > 0 && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)", marginBottom: 14 }}>
          Invoices: {app.payments.map((p) => `${p.currency} ${(p.amount / 100).toLocaleString()} (${p.status})`).join(", ")}
        </p>
      )}

      {app.certificate ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <Award size={16} color="#22C55E" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#22C55E" }}>
            Certificate issued — {app.certificate.serial}
          </span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 140px", gap: 10, marginBottom: 10 }}>
          <select value={certIssueMode} onChange={(e) => setCertIssueMode(e.target.value as Application["certIssueMode"])} style={{ ...inputStyle, cursor: "pointer" }}>
            {(["MANUAL", "ON_APPROVAL", "ON_PAYMENT"] as const).map((m) => <option key={m} value={m}>{ISSUE_MODE_LABEL[m]}</option>)}
          </select>
          <input value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder="Quote fee (NGN)" type="number" min="0" style={inputStyle} />
          <button onClick={issueNow} disabled={saving} className="btn-ghost" style={{ fontSize: 12.5, padding: "8px 10px", opacity: saving ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ShieldCheck size={13} /> Issue Now
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, marginBottom: 10 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value as Application["status"])} style={{ ...inputStyle, cursor: "pointer" }}>
          {["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <input value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Review notes" style={inputStyle} />
      </div>

      {message && <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: message === "Saved." ? "#22c55e" : "#ef4444", marginBottom: 10 }}>{message}</p>}

      <button onClick={save} disabled={saving} className="btn-primary" style={{ fontSize: 13, padding: "8px 16px", opacity: saving ? 0.6 : 1 }}>
        {saving ? "Saving…" : "Save"}
      </button>
    </GlowingCard>
  );
}

export default function AdminApplicationList({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <GlowingCard style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.55)" }}>No applications yet.</p>
      </GlowingCard>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {applications.map((app) => <ApplicationRow key={app.id} app={app} />)}
    </div>
  );
}
