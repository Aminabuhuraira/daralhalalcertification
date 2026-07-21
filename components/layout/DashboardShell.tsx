"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Award, CreditCard, Users, BookOpen,
  ClipboardCheck, ShieldCheck, LogOut, ArrowLeftRight, FileText,
  Settings, Mail, Eye, Activity, ClipboardList,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
  variant: "user" | "admin" | "reviewer" | "inspector";
  userName: string;
  userRole: string;
};

const USER_NAV = [
  { label: "Overview",      href: "/dashboard",               icon: LayoutDashboard },
  { label: "Courses",       href: "/dashboard/courses",       icon: BookOpen },
  { label: "Certification", href: "/dashboard/certification", icon: FileText },
  { label: "Certificates",  href: "/dashboard/certificates",  icon: Award },
  { label: "Billing",       href: "/dashboard/billing",       icon: CreditCard },
  { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
];

const ADMIN_NAV = [
  { label: "Overview",     href: "/admin",              icon: LayoutDashboard },
  { label: "Users",        href: "/admin/users",        icon: Users },
  { label: "Courses",      href: "/admin/courses",      icon: BookOpen },
  { label: "Applications", href: "/admin/applications", icon: ClipboardCheck },
  { label: "Contacts",     href: "/admin/contacts",     icon: Mail },
  { label: "Settings",     href: "/admin/settings",     icon: Settings },
];

const REVIEWER_NAV = [
  { label: "Review Queue",  href: "/reviewer",           icon: ClipboardCheck },
  { label: "My Profile",    href: "/dashboard/settings", icon: Settings },
];

const INSPECTOR_NAV = [
  { label: "Audit Queue",   href: "/inspector",          icon: ClipboardList },
  { label: "My Profile",    href: "/dashboard/settings", icon: Settings },
];

export default function DashboardShell({ children, variant, userName, userRole }: Props) {
  const params  = useParams();
  const pathname = usePathname();
  const locale  = (params?.locale as string) || "en";
  const navItems =
    variant === "admin"     ? ADMIN_NAV     :
    variant === "reviewer"  ? REVIEWER_NAV  :
    variant === "inspector" ? INSPECTOR_NAV :
    USER_NAV;
  const lh = (href: string) => `/${locale}${href}`;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, position: "sticky", top: 0, height: "100vh",
        background: "#ffffff",
        borderRight: "1px solid rgba(10,21,53,0.08)",
        display: "flex", flexDirection: "column",
        padding: "28px 16px",
      }}>
        {/* Logo */}
        <Link href={lh("/")} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, padding: "0 8px", textDecoration: "none" }}>
          <div className="icon-badge-sm"><ShieldCheck size={18} color="#0A1535" /></div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "#0A1535" }}>Dar Al Halal</span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {navItems.map((item) => {
            const href   = lh(item.href);
            const active = pathname === href ||
              (item.href !== "/dashboard" && item.href !== "/admin" && pathname?.startsWith(href));
            return (
              <Link
                key={item.href}
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 14px",
                  borderRadius: 8, textDecoration: "none",
                  background: active ? "rgba(201,162,39,0.08)" : "transparent",
                  color: active ? "#9a7810" : "rgba(10,21,53,0.55)",
                  fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: active ? 700 : 500,
                  transition: "all 0.15s",
                  border: active ? "1px solid rgba(201,162,39,0.3)" : "1px solid transparent",
                }}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}

          {/* Cross-portal links */}
          {variant === "user" && userRole === "ADMIN" && (
            <Link href={lh("/admin")} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 8, textDecoration: "none", color: "#9a7810", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, marginTop: 10, border: "1px dashed rgba(201,162,39,0.4)" }}>
              <ShieldCheck size={15} /> Admin Panel
            </Link>
          )}
          {variant === "admin" && (
            <Link href={lh("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 8, textDecoration: "none", color: "rgba(10,21,53,0.55)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, marginTop: 10, border: "1px dashed rgba(10,21,53,0.15)" }}>
              <ArrowLeftRight size={15} /> User Dashboard
            </Link>
          )}
          {variant === "reviewer" && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Role</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.55)" }}>Certification Review Officer</p>
            </div>
          )}
          {variant === "inspector" && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(8,145,178,0.05)", border: "1px solid rgba(8,145,178,0.15)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#0891B2", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Role</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.55)" }}>Audit Inspector</p>
            </div>
          )}
        </nav>

        {/* Bottom user info + sign out */}
        <div style={{ borderTop: "1px solid rgba(10,21,53,0.08)", paddingTop: 16, marginTop: 16 }}>
          <div style={{ padding: "0 8px", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#0A1535", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{userRole}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 14px", borderRadius: 8, background: "transparent",
              border: "1px solid rgba(10,21,53,0.15)", color: "rgba(10,21,53,0.55)",
              fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,21,53,0.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, minWidth: 0, padding: "40px clamp(28px, 4vw, 72px)", overflowX: "hidden" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
