"use client";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";
import type { StatusCount, SectorCount, MonthCount, CategoryCount } from "@/lib/application-stats";

// ── colour palettes ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED:            "#6366F1",
  SCREENING:            "#3B82F6",
  DEFICIENCY_NOTICE:    "#F59E0B",
  ELIGIBILITY_REVIEW:   "#8B5CF6",
  TRC_ESCALATION:       "#7C3AED",
  AWAITING_PAYMENT:     "#0EA5E9",
  PENDING_AUDIT:        "#14B8A6",
  AUDITING:             "#0891B2",
  ACTION_REQUIRED_NCR:  "#F97316",
  VERIFYING_NCR:        "#FB923C",
  BOARD_REVIEW:         "#84CC16",
  CERTIFIED:            "#22C55E",
  REJECTED:             "#EF4444",
  CLOSED_INCOMPLETE:    "#6B7280",
  // Legacy
  PENDING:              "#D97706",
  UNDER_REVIEW:         "#2563EB",
  APPROVED:             "#22C55E",
};
const STATUS_LABEL: Record<string, string> = {
  SUBMITTED:            "Submitted",
  SCREENING:            "Screening",
  DEFICIENCY_NOTICE:    "Action Required",
  ELIGIBILITY_REVIEW:   "Eligibility Review",
  TRC_ESCALATION:       "TRC / Shariah Review",
  AWAITING_PAYMENT:     "Awaiting Payment",
  PENDING_AUDIT:        "Audit Scheduled",
  AUDITING:             "Auditing",
  ACTION_REQUIRED_NCR:  "NCR Issued",
  VERIFYING_NCR:        "Verifying NCR",
  BOARD_REVIEW:         "Board Review",
  CERTIFIED:            "Certified",
  REJECTED:             "Rejected",
  CLOSED_INCOMPLETE:    "Closed",
  // Legacy
  PENDING:              "Pending",
  UNDER_REVIEW:         "Under Review",
  APPROVED:             "Approved",
};

// Distinct, professional multi-series palette
const MULTI_PALETTE = [
  "#0A1535", "#C9A227", "#2563EB", "#16A34A",
  "#DC2626", "#0891B2", "#9333EA", "#EA580C",
];

// ── shared tooltip ─────────────────────────────────────────────────────────────

const tooltipStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  color: "#0A1535",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  padding: "8px 12px",
};

// ── axis tick style ────────────────────────────────────────────────────────────

const tickStyle = { fontFamily: "var(--font-body)", fontSize: 11.5, fill: "rgba(10,21,53,0.45)" };

// ── section header ─────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children, span = false }: {
  title: string; subtitle?: string; children: React.ReactNode; span?: boolean;
}) {
  return (
    <div style={{
      background: "#ffffff", borderRadius: 14,
      border: "1px solid rgba(10,21,53,0.08)",
      padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(10,21,53,0.05)",
      gridColumn: span ? "1 / -1" : undefined,
    }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#0A1535", marginBottom: 2 }}>{title}</p>
      {subtitle && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.64)", marginBottom: 16 }}>{subtitle}</p>}
      {!subtitle && <div style={{ marginBottom: 16 }} />}
      {children}
    </div>
  );
}

// ── custom donut centre label ──────────────────────────────────────────────────

function DonutCenter({ total, label }: { total: number; label: string }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-8" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, fill: "#0A1535" }}>
        {total}
      </tspan>
      <tspan x="50%" dy="22" style={{ fontFamily: "var(--font-body)", fontSize: 11, fill: "rgba(10,21,53,0.4)", textTransform: "uppercase" }}>
        {label}
      </tspan>
    </text>
  );
}

// ── custom legend ──────────────────────────────────────────────────────────────

function SimpleLegend({ items }: { items: { label: string; color: string; value: number }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 14 }}>
      {items.map(i => (
        <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: i.color, flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.72)" }}>
            {i.label} <strong style={{ color: "#0A1535" }}>{i.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function ApplicationCharts({
  statusCounts,
  sectorCounts,
  monthlyCounts,
  categoryCounts,
  total,
}: {
  statusCounts:   StatusCount[];
  sectorCounts:   SectorCount[];
  monthlyCounts:  MonthCount[];
  categoryCounts: CategoryCount[];
  total: number;
}) {
  const totalEnrollments = categoryCounts.reduce((s, c) => s + c.count, 0);
  const pieData = statusCounts.filter(s => s.count > 0);
  const catData = categoryCounts.filter(c => c.count > 0);

  if (total === 0 && totalEnrollments === 0) {
    return (
      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "40px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.64)" }}>
          Charts will populate as applications and enrolments come in.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Row 1: Trend line (full width) ── */}
      {total > 0 && (
        <ChartCard title="Application Submissions" subtitle="Monthly volume over the last 6 months" span>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyCounts} margin={{ left: -16, right: 8 }}>
              <defs>
                <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A227" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 0" stroke="rgba(10,21,53,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(10,21,53,0.08)", strokeWidth: 1 }} />
              <Area
                type="monotone" dataKey="count" name="Applications"
                stroke="#C9A227" strokeWidth={2.5}
                fill="url(#areaGold)"
                dot={{ r: 4, fill: "#C9A227", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#C9A227", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Row 2: Status donut + Sector bar ── */}
      {total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
          {/* Status donut */}
          <ChartCard title="By Status" subtitle={`${total} total application${total !== 1 ? "s" : ""}`}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData} dataKey="count" nameKey="status"
                  innerRadius={68} outerRadius={100}
                  paddingAngle={3} startAngle={90} endAngle={-270}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.status} fill={STATUS_COLOR[entry.status] ?? "#94a3b8"} />
                  ))}
                  <DonutCenter total={total} label="total" />
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val, name) => [val, STATUS_LABEL[String(name)] ?? String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
            <SimpleLegend
              items={pieData.map(s => ({ label: STATUS_LABEL[s.status] ?? s.status, color: STATUS_COLOR[s.status] ?? "#94a3b8", value: s.count }))}
            />
          </ChartCard>

          {/* Sector horizontal bar */}
          <ChartCard title="Applications by Sector" subtitle="Top sectors applying for certification">
            <ResponsiveContainer width="100%" height={sectorCounts.length > 0 ? Math.max(240, sectorCounts.length * 36) : 240}>
              <BarChart data={sectorCounts} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="4 0" stroke="rgba(10,21,53,0.05)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="sector" tick={{ ...tickStyle, fontSize: 12 }} axisLine={false} tickLine={false} width={148} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(10,21,53,0.03)" }} />
                <Bar dataKey="count" name="Applications" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {sectorCounts.map((_, i) => (
                    <Cell key={i} fill={MULTI_PALETTE[i % MULTI_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── Row 3: Category enrolments donut (full width when alone, half when with sectors) ── */}
      {catData.length > 0 && (
        <ChartCard title="Enrolments by Course Category" subtitle={`${totalEnrollments} total enrolment${totalEnrollments !== 1 ? "s" : ""} across all courses`}>
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 8, alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={catData} dataKey="count" nameKey="category"
                  innerRadius={58} outerRadius={88}
                  paddingAngle={3} startAngle={90} endAngle={-270}
                >
                  {catData.map((_, i) => (
                    <Cell key={i} fill={MULTI_PALETTE[i % MULTI_PALETTE.length]} />
                  ))}
                  <DonutCenter total={totalEnrollments} label="enrolled" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* inline legend as a table-like list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {catData.map((c, i) => {
                const pct = totalEnrollments > 0 ? Math.round((c.count / totalEnrollments) * 100) : 0;
                return (
                  <div key={c.category} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: MULTI_PALETTE[i % MULTI_PALETTE.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535" }}>{c.category}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)", minWidth: 28, textAlign: "right" }}>{pct}%</span>
                    <div style={{ width: 80, height: 5, background: "rgba(10,21,53,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: MULTI_PALETTE[i % MULTI_PALETTE.length], borderRadius: 3 }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.64)", minWidth: 20, textAlign: "right" }}>{c.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
