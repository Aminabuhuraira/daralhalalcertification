"use client";
import { useState, useEffect } from "react";
import { BookOpen, Users, Settings2, CheckCircle2, Loader2, Plus, DollarSign } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";
import { CERTIFICATION_SECTORS } from "@/lib/sectors";

type Stats = { userCount: number; courseCount: number; pendingApplications: number; certificateCount: number };

const TABS = [
  { id: "courses",  label: "Create Course", icon: BookOpen },
  { id: "pricing",  label: "Pricing",       icon: DollarSign },
  { id: "platform", label: "Platform",      icon: Settings2 },
] as const;
type Tab = typeof TABS[number]["id"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "#fafafa", border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", outline: "none",
};
const label: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)", marginBottom: 6, display: "block", fontWeight: 500,
};

const LEVELS   = ["Beginner", "Intermediate", "Advanced"] as const;
const DURATIONS = ["30 min", "1 hour", "2 hours", "3 hours", "4 hours", "Half day", "Full day", "Multi-day"] as const;

function CreateCourseForm() {
  const [title, setTitle]           = useState("");
  const [slug, setSlug]             = useState("");
  const [description, setDesc]      = useState("");
  const [category, setCategory]     = useState("");
  const [level, setLevel]           = useState<string>(LEVELS[0]);
  const [duration, setDuration]     = useState<string>(DURATIONS[0]);
  const [published, setPublished]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState<{ ok: boolean; text: string } | null>(null);

  const autoSlug = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = "#C9A227");
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = "rgba(10,21,53,0.12)");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !description.trim() || !category.trim()) {
      setMsg({ ok: false, text: "Please fill in all required fields." }); return;
    }
    setSaving(true); setMsg(null);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, description, category, level, durationLabel: duration, published }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg({ ok: true, text: `Course "${data.course.title}" created successfully.` });
      setTitle(""); setSlug(""); setDesc(""); setCategory(""); setLevel(LEVELS[0]); setDuration(DURATIONS[0]); setPublished(false);
    } else {
      setMsg({ ok: false, text: data.error || (data.issues?.[0]?.message) || "Failed to create course." });
    }
  };

  return (
    <GlowingCard style={{ padding: "28px 30px", maxWidth: 580 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 6 }}>New Course</h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)", marginBottom: 24 }}>
        Create a course shell. After saving, add modules, lessons and videos via Manage Content.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={label}>Course Title *</label>
          <input required value={title} onChange={e => { setTitle(e.target.value); if (!slug || slug === autoSlug(title)) setSlug(autoSlug(e.target.value)); }} style={inputStyle} placeholder="e.g. Halal Fundamentals" onFocus={focusBorder} onBlur={blurBorder} />
        </div>
        <div>
          <label style={label}>URL Slug * <span style={{ fontWeight: 400, color: "rgba(10,21,53,0.35)" }}>(used in the URL — lowercase, hyphens only)</span></label>
          <input required value={slug} onChange={e => setSlug(autoSlug(e.target.value))} style={inputStyle} placeholder="halal-fundamentals" onFocus={focusBorder} onBlur={blurBorder} />
        </div>
        <div>
          <label style={label}>Description *</label>
          <textarea required value={description} onChange={e => setDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.6 }} placeholder="Brief overview of what students will learn…" onFocus={focusBorder} onBlur={blurBorder} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={label}>Category / Sector *</label>
            <select required value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
              <option value="">Select category…</option>
              {CERTIFICATION_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="General">General</option>
              <option value="Compliance">Compliance</option>
              <option value="Auditing">Auditing</option>
            </select>
          </div>
          <div>
            <label style={label}>Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "end" }}>
          <div>
            <label style={label}>Estimated Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
              {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 2 }}>
            <input type="checkbox" id="pub" checked={published} onChange={e => setPublished(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#C9A227", cursor: "pointer" }} />
            <label htmlFor="pub" style={{ ...label, margin: 0, cursor: "pointer" }}>Publish immediately</label>
          </div>
        </div>

        {msg && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 8, background: msg.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${msg.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>
            <CheckCircle2 size={14} color={msg.ok ? "#22c55e" : "#ef4444"} />
            <span style={{ fontSize: 13, fontFamily: "var(--font-body)", color: msg.ok ? "#22c55e" : "#ef4444" }}>{msg.text}</span>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          {saving ? <Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <Plus size={14} />}
          {saving ? "Creating…" : "Create Course"}
        </button>
      </form>
    </GlowingCard>
  );
}

const SCALE_PRICING = [
  { key: "price_cert_large",  label: "Large Scale",  accent: "#0A1535", desc: "High-volume industrial or national distribution" },
  { key: "price_cert_medium", label: "Medium Scale", accent: "#6D28D9", desc: "Regional distribution, mid-tier production" },
  { key: "price_cert_small",  label: "Small Scale",  accent: "#C9A227", desc: "Local or startup business, limited production" },
] as const;

const OTHER_PRICING = [
  { key: "price_application",  label: "Application Fee",      desc: "Paid on submission of every new application" },
  { key: "price_renewal",      label: "Annual Renewal Fee",   desc: "Per-year renewal for active certificates" },
  { key: "price_inspection",   label: "Onsite Inspection Fee",desc: "Added for businesses requiring facility audit" },
  { key: "price_surveillance", label: "Surveillance Audit",   desc: "Periodic compliance surveillance visit" },
] as const;

function PriceInput({ label, desc, value, onChange, accent = "rgba(10,21,53,0.12)" }: {
  label: string; desc: string; value: string; onChange: (v: string) => void; accent?: string;
}) {
  return (
    <div>
      <label style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)", marginBottom: 4, display: "block", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
        {label}
      </label>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)", marginBottom: 7, margin: "0 0 7px" }}>{desc}</p>
      <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${accent}`, borderRadius: 8, overflow: "hidden", background: "#fafafa" }}>
        <span style={{ padding: "11px 14px", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "rgba(10,21,53,0.4)", borderRight: "1px solid rgba(10,21,53,0.08)", background: "#f0f0f0", flexShrink: 0 }}>₦</span>
        <input
          type="number" min="0" step="500"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{ flex: 1, border: "none", outline: "none", padding: "11px 14px", fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", background: "transparent" }}
        />
      </div>
    </div>
  );
}

function PricingPanel() {
  const [prices, setPrices]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/platform-settings")
      .then(r => r.json())
      .then(d => { setPrices(d.settings ?? {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: string, val: string) => setPrices(p => ({ ...p, [key]: val }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await fetch("/api/admin/platform-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prices),
    });
    setSaving(false);
    setMsg(res.ok ? { ok: true, text: "Pricing saved. Changes reflect immediately on the billing page." } : { ok: false, text: "Failed to save pricing." });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}><Loader2 size={20} style={{ animation: "rotateSeal 1s linear infinite", color: "#C9A227" }} /></div>;

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 10 }}>
        <DollarSign size={15} color="#C9A227" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#7a6010", margin: 0, lineHeight: 1.6 }}>
          Set prices in Nigerian Naira (NGN). These prices appear on the user billing page and in payment invoices.
        </p>
      </div>

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Certification fee by scale */}
        <GlowingCard style={{ padding: "24px 28px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "#0A1535", marginBottom: 6 }}>Certification Fee — By Production Scale</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.45)", marginBottom: 20 }}>
            The annual certification fee varies by company size. Applicants select their production scale when applying.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {SCALE_PRICING.map(f => (
              <PriceInput key={f.key} label={f.label} desc={f.desc} value={prices[f.key] ?? ""} onChange={v => set(f.key, v)} accent={f.accent} />
            ))}
          </div>
        </GlowingCard>

        {/* Other fees */}
        <GlowingCard style={{ padding: "24px 28px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "#0A1535", marginBottom: 20 }}>Other Fees</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {OTHER_PRICING.map(f => (
              <PriceInput key={f.key} label={f.label} desc={f.desc} value={prices[f.key] ?? ""} onChange={v => set(f.key, v)} />
            ))}
          </div>
        </GlowingCard>

        {msg && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "11px 14px", borderRadius: 8, background: msg.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${msg.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>
            <CheckCircle2 size={14} color={msg.ok ? "#22c55e" : "#ef4444"} />
            <span style={{ fontSize: 13, fontFamily: "var(--font-body)", color: msg.ok ? "#16a34a" : "#ef4444" }}>{msg.text}</span>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
          {saving ? <Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <CheckCircle2 size={14} />}
          {saving ? "Saving…" : "Save Pricing"}
        </button>
      </form>
    </div>
  );
}

function PlatformPanel({ stats }: { stats: Stats }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 580 }}>
      {/* Platform stats */}
      <GlowingCard style={{ padding: "24px 28px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 18 }}>Platform Summary</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { label: "Total Users",          value: stats.userCount,             icon: Users },
            { label: "Courses",              value: stats.courseCount,            icon: BookOpen },
            { label: "Pending Applications", value: stats.pendingApplications,   icon: Settings2 },
            { label: "Certificates Issued",  value: stats.certificateCount,      icon: CheckCircle2 },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fafafa", borderRadius: 10, border: "1px solid rgba(10,21,53,0.08)" }}>
              <s.icon size={16} color="#C9A227" />
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "#0A1535", margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.45)", margin: 0 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </GlowingCard>

      {/* Info */}
      <GlowingCard style={{ padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#0A1535", marginBottom: 10 }}>Platform Information</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { k: "Platform", v: "Dar Al-Halal Certification Portal" },
            { k: "Certificate Authority", v: "Dar Al-Halal International" },
            { k: "Payment Gateway", v: "Paystack (NGN)" },
            { k: "Support", v: "aminabuhuraira@gmail.com" },
          ].map(row => (
            <div key={row.k} style={{ display: "flex", gap: 16, borderBottom: "1px solid rgba(10,21,53,0.06)", paddingBottom: 10 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.45)", minWidth: 160 }}>{row.k}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535", fontWeight: 500 }}>{row.v}</span>
            </div>
          ))}
        </div>
      </GlowingCard>
    </div>
  );
}

export default function AdminSettings({ stats }: { stats: Stats }) {
  const [tab, setTab] = useState<Tab>("courses");

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(10,21,53,0.08)" }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 18px", background: "none", border: "none",
                cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: active ? 700 : 500,
                color: active ? "#9a7810" : "rgba(10,21,53,0.5)",
                borderBottom: active ? "2px solid #C9A227" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.15s",
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "courses"  && <CreateCourseForm />}
      {tab === "pricing"  && <PricingPanel />}
      {tab === "platform" && <PlatformPanel stats={stats} />}
    </div>
  );
}
