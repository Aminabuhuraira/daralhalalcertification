"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Award, CreditCard, Users, BookOpen,
  ClipboardCheck, ShieldCheck, LogOut, ArrowLeftRight, FileText,
  Settings, Mail, ClipboardList, FileSearch,
  Microscope, Moon, Briefcase, Archive, UserCircle,
} from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

type Variant = "user" | "admin" | "reviewer" | "ops" | "inspector" | "technical" | "sharia";

type Props = {
  children: React.ReactNode;
  variant: Variant;
  userName: string;
  userRole: string;
};

const USER_NAV = [
  { label: "Overview",       href: "/dashboard",               icon: LayoutDashboard },
  { label: "Courses",        href: "/dashboard/courses",       icon: BookOpen },
  { label: "Certification",  href: "/dashboard/certification", icon: FileText },
  { label: "Certificates",   href: "/dashboard/certificates",  icon: Award },
  { label: "Archive",        href: "/dashboard/archive",       icon: Archive },
  { label: "Billing",        href: "/dashboard/billing",       icon: CreditCard },
  { label: "Profile",        href: "/dashboard/profile",       icon: UserCircle },
  { label: "Settings",       href: "/dashboard/settings",      icon: Settings },
];

const ADMIN_NAV = [
  { label: "Overview",      href: "/admin",              icon: LayoutDashboard },
  { label: "Users",         href: "/admin/users",        icon: Users },
  { label: "Courses",       href: "/admin/courses",      icon: BookOpen },
  { label: "Applications",  href: "/admin/applications", icon: ClipboardCheck },
  { label: "Contacts",      href: "/admin/contacts",     icon: Mail },
  { label: "Settings",      href: "/admin/settings",     icon: Settings },
];

const REVIEWER_NAV = [
  { label: "Review Queue",  href: "/reviewer",           icon: ClipboardCheck },
  { label: "My Profile",    href: "/dashboard/settings", icon: Settings },
];

const OPS_NAV = [
  { label: "Eligibility Queue", href: "/ops",              icon: FileSearch },
  { label: "My Profile",        href: "/dashboard/settings", icon: Settings },
];

const INSPECTOR_NAV = [
  { label: "Audit Queue",   href: "/inspector",          icon: ClipboardList },
  { label: "My Profile",    href: "/dashboard/settings", icon: Settings },
];

const TECHNICAL_NAV = [
  { label: "Certification Prep", href: "/technical",          icon: Microscope },
  { label: "My Profile",         href: "/dashboard/settings", icon: Settings },
];

const SHARIA_NAV = [
  { label: "Shariah Review",  href: "/sharia",             icon: Moon },
  { label: "My Profile",      href: "/dashboard/settings", icon: Settings },
];

// Role badge config per variant
const ROLE_BADGE: Partial<Record<Variant, { label: string; sublabel: string; color: string; bg: string; border: string }>> = {
  reviewer: { label: "ROLE", sublabel: "Certification Review Officer", color: "#6366F1", bg: "rgba(99,102,241,0.05)", border: "rgba(99,102,241,0.15)" },
  ops:      { label: "ROLE", sublabel: "Operations Manager", color: "#8B5CF6", bg: "rgba(139,92,246,0.05)", border: "rgba(139,92,246,0.15)" },
  inspector:{ label: "ROLE", sublabel: "Audit Inspector",  color: "#0891B2", bg: "rgba(8,145,178,0.05)", border: "rgba(8,145,178,0.15)" },
  technical:{ label: "ROLE", sublabel: "Technical Review Team", color: "#6366F1", bg: "rgba(99,102,241,0.05)", border: "rgba(99,102,241,0.15)" },
  sharia:   { label: "ROLE", sublabel: "Shariah Panel Member", color: "#65A30D", bg: "rgba(101,163,13,0.05)", border: "rgba(101,163,13,0.15)" },
};

export default function DashboardShell({ children, variant, userName, userRole }: Props) {
  const params   = useParams();
  const pathname = usePathname();
  const locale   = (params?.locale as string) || "en";

  const navItems =
    variant === "admin"     ? ADMIN_NAV     :
    variant === "reviewer"  ? REVIEWER_NAV  :
    variant === "ops"       ? OPS_NAV       :
    variant === "inspector" ? INSPECTOR_NAV :
    variant === "technical" ? TECHNICAL_NAV :
    variant === "sharia"    ? SHARIA_NAV    :
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
              (item.href !== "/dashboard" && item.href !== "/admin" &&
               item.href !== "/reviewer"  && item.href !== "/ops" &&
               item.href !== "/inspector" && item.href !== "/technical" &&
               item.href !== "/sharia"    && pathname?.startsWith(href));
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
          {variant === "user" && (userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
            <Link href={lh("/admin")} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 8, textDecoration: "none", color: "#9a7810", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, marginTop: 10, border: "1px dashed rgba(201,162,39,0.4)" }}>
              <ShieldCheck size={15} /> Admin Panel
            </Link>
          )}
          {variant === "admin" && (
            <Link href={lh("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 8, textDecoration: "none", color: "rgba(10,21,53,0.55)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, marginTop: 10, border: "1px dashed rgba(10,21,53,0.15)" }}>
              <ArrowLeftRight size={15} /> User Dashboard
            </Link>
          )}

          {/* Role badge for staff portals */}
          {ROLE_BADGE[variant] && (() => {
            const badge = ROLE_BADGE[variant]!;
            return (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: badge.bg, border: `1px solid ${badge.border}` }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: badge.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{badge.label}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.55)" }}>{badge.sublabel}</p>
              </div>
            );
          })()}

          {/* Cross-portal access for SUPER_ADMIN/ADMIN who land on staff portals */}
          {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && variant !== "admin" && variant !== "user" && (
            <Link href={lh("/admin")} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 8, textDecoration: "none", color: "#9a7810", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, marginTop: 10, border: "1px dashed rgba(201,162,39,0.4)" }}>
              <Briefcase size={14} /> Admin Panel
            </Link>
          )}
        </nav>

        {/* Bottom user info + sign out */}
        <div style={{ borderTop: "1px solid rgba(10,21,53,0.08)", paddingTop: 16, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#0A1535", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{userRole.replace(/_/g, " ")}</div>
            </div>
            <NotificationBell locale={locale} />
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
