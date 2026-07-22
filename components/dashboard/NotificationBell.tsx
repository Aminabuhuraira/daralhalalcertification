"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Notification } from "@/app/api/notifications/route";

const SEVERITY_STYLE: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  urgent:  { color: "#DC2626", bg: "rgba(220,38,38,0.06)",  border: "rgba(220,38,38,0.2)",  Icon: AlertTriangle },
  warning: { color: "#D97706", bg: "rgba(217,119,6,0.06)",  border: "rgba(217,119,6,0.2)",  Icon: AlertCircle },
  info:    { color: "#2563EB", bg: "rgba(37,99,235,0.06)",  border: "rgba(37,99,235,0.2)",  Icon: Info },
  success: { color: "#16A34A", bg: "rgba(22,163,74,0.06)",  border: "rgba(22,163,74,0.2)",  Icon: CheckCircle2 },
};

export default function NotificationBell({ locale }: { locale: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const urgentCount = notifications.filter(n => n.severity === "urgent").length;
  const totalCount  = notifications.length;

  if (!loaded) return null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(10,21,53,0.12)",
          background: open ? "rgba(201,162,39,0.08)" : "white", cursor: "pointer",
          transition: "all 0.15s",
        }}
        title="Notifications"
      >
        <Bell size={15} color={open ? "#9a7810" : "rgba(10,21,53,0.55)"} />
        {totalCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 8, padding: "0 4px",
            background: urgentCount > 0 ? "#DC2626" : "#D97706",
            color: "white", fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-body)", border: "2px solid white",
          }}>
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          width: 320, background: "white", borderRadius: 14,
          border: "1px solid rgba(10,21,53,0.1)", boxShadow: "0 8px 32px rgba(10,21,53,0.12)",
          zIndex: 9999, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(10,21,53,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={14} color="#C9A227" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#0A1535" }}>Notifications</span>
              {totalCount > 0 && (
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "white", background: "#0A1535", padding: "1px 7px", borderRadius: 10 }}>
                  {totalCount}
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
              <X size={14} color="rgba(10,21,53,0.4)" />
            </button>
          </div>

          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center" }}>
                <CheckCircle2 size={28} color="rgba(10,21,53,0.15)" style={{ margin: "0 auto 10px", display: "block" }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.4)" }}>All clear — no pending actions</p>
              </div>
            ) : (
              notifications.map(n => {
                const s = SEVERITY_STYLE[n.severity] ?? SEVERITY_STYLE.info;
                const Icon = s.Icon;
                return (
                  <Link
                    key={n.id}
                    href={`/${locale}${n.href}`}
                    onClick={() => setOpen(false)}
                    style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: "1px solid rgba(10,21,53,0.05)", textDecoration: "none", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(10,21,53,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} color={s.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, color: "#0A1535", margin: "0 0 2px" }}>{n.title}</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.5)", margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
