"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ScaleCount, StatusCount } from "@/lib/admin-dashboard-stats";

const SCALE_COLORS = ["#0A1535", "#C9A227", "#6D28D9"];
const STATUS_COLORS: Record<string, string> = {
  Verified:     "#16A34A",
  Pending:      "#D97706",
  "Under Review": "#2563EB",
  Rejected:     "#DC2626",
};

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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#ffffff", borderRadius: 14,
      border: "1px solid rgba(10,21,53,0.08)",
      padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(10,21,53,0.05)",
      flex: 1, minWidth: 0,
    }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#0A1535", marginBottom: 18 }}>{title}</p>
      {children}
    </div>
  );
}

function DonutCenter({ label }: { label: string }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" style={{ fontFamily: "var(--font-body)", fontSize: 12, fill: "rgba(10,21,53,0.4)" }}>
        {label}
      </tspan>
    </text>
  );
}

function PieWithLegend({
  data,
  getColor,
  centerLabel,
}: {
  data: { name: string; value: number }[];
  getColor: (name: string, i: number) => string;
  centerLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.64)", padding: "24px 0", textAlign: "center" }}>
        No data yet.
      </p>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ flexShrink: 0, width: 180, height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} dataKey="value" nameKey="name"
              innerRadius={52} outerRadius={80}
              paddingAngle={3} startAngle={90} endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={getColor(entry.name, i)} />
              ))}
              <DonutCenter label={centerLabel} />
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((entry, i) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(2) : "0";
          const color = getColor(entry.name, i);
          return (
            <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#0A1535" }}>{entry.name}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)", minWidth: 48, textAlign: "right" }}>{pct}%</span>
              <div style={{ width: 60, height: 5, background: "rgba(10,21,53,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOverviewCharts({
  scaleCounts,
  statusCounts,
}: {
  scaleCounts: ScaleCount[];
  statusCounts: StatusCount[];
}) {
  const scaleData = scaleCounts.map(s => ({ name: s.scale, value: s.count }));
  const statusData = statusCounts.map(s => ({ name: s.label, value: s.count }));

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard title="Production Scale">
        <PieWithLegend
          data={scaleData}
          getColor={(_, i) => SCALE_COLORS[i % SCALE_COLORS.length]}
          centerLabel="Scale"
        />
      </ChartCard>
      <ChartCard title="Company Status">
        <PieWithLegend
          data={statusData}
          getColor={(name) => STATUS_COLORS[name] ?? "#94a3b8"}
          centerLabel="Status"
        />
      </ChartCard>
    </div>
  );
}
