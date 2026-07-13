"use client";
import CountUp from "react-countup";

export default function StatTile({
  icon,
  label,
  value,
  suffix = "",
  accent = "#C9A227",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid rgba(10,21,53,0.08)",
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(10,21,53,0.05)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(10,21,53,0.1)")}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(10,21,53,0.05)")}
    >
      {/* left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent, borderRadius: "12px 0 0 12px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          {label}
        </p>
        <div style={{ color: "rgba(10,21,53,0.25)", lineHeight: 0 }}>{icon}</div>
      </div>

      <p style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "#0A1535", margin: 0, lineHeight: 1 }}>
        <CountUp end={value} duration={1.2} suffix={suffix} separator="," />
      </p>
    </div>
  );
}
