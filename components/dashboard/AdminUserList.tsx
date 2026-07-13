"use client";
import { useMemo, useState } from "react";
import { Search, Trash2, Loader2 } from "lucide-react";
import { CERTIFICATION_SECTORS } from "@/lib/sectors";

type Role = "USER" | "REVIEWER" | "INSPECTOR" | "ADMIN";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessName: string | null;
  sector: string | null;
  createdAt: string | Date;
};

const ROLE_META: Record<Role, { label: string; color: string; bg: string; border: string }> = {
  USER:      { label: "User",      color: "rgba(10,21,53,0.5)",  bg: "rgba(10,21,53,0.05)",      border: "rgba(10,21,53,0.1)" },
  REVIEWER:  { label: "Reviewer",  color: "#2563EB",             bg: "rgba(37,99,235,0.08)",      border: "rgba(37,99,235,0.25)" },
  INSPECTOR: { label: "Inspector", color: "#0891B2",             bg: "rgba(8,145,178,0.08)",      border: "rgba(8,145,178,0.25)" },
  ADMIN:     { label: "Admin",     color: "#9a7810",             bg: "rgba(201,162,39,0.12)",     border: "rgba(201,162,39,0.3)" },
};

const ctrlStyle: React.CSSProperties = {
  padding: "9px 14px", background: "#fafafa",
  border: "1px solid rgba(10,21,53,0.12)", borderRadius: 8,
  fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535",
  outline: "none", cursor: "pointer",
};

export default function AdminUserList({ users: initialUsers }: { users: AdminUser[] }) {
  const [users, setUsers]               = useState(initialUsers);
  const [query, setQuery]               = useState("");
  const [roleFilter, setRoleFilter]     = useState<"ALL" | Role>("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [updatingId, setUpdatingId]     = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const sectorsInUse = useMemo(() => {
    const fromUsers = new Set(users.map((u) => u.sector).filter((s): s is string => !!s));
    return Array.from(new Set([...CERTIFICATION_SECTORS, ...fromUsers])).sort();
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (sectorFilter !== "ALL" && u.sector !== sectorFilter) return false;
      return true;
    });
  }, [users, query, roleFilter, sectorFilter]);

  const changeRole = async (user: AdminUser, newRole: Role) => {
    if (newRole === user.role) return;
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Permanently delete ${user.name} (${user.email})? This cannot be undone.`)) return;
    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Role explanation banner */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([role, m]) => (
          <div key={role} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", background: m.bg, border: `1px solid ${m.border}`, borderRadius: 8 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: m.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.5)" }}>
              {role === "USER" && "— standard account, course access only"}
              {role === "REVIEWER" && "— can review and process applications"}
              {role === "INSPECTOR" && "— can conduct and submit audit reports"}
              {role === "ADMIN" && "— full platform access"}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 0, background: "#fafafa", border: "1px solid rgba(10,21,53,0.12)", borderRadius: 8, overflow: "hidden", maxWidth: 320, flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}><Search size={15} color="rgba(10,21,53,0.4)" /></div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535", padding: "10px 0" }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} style={ctrlStyle}>
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="REVIEWER">Reviewer</option>
          <option value="INSPECTOR">Inspector</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} style={ctrlStyle}>
          <option value="ALL">All Sectors</option>
          {sectorsInUse.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.45)", marginBottom: 12 }}>
        Showing {filtered.length} of {users.length} users
      </p>

      <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", overflow: "hidden", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(10,21,53,0.08)", background: "#fafafa" }}>
              {["Name", "Email", "Business", "Sector", "Role", "Joined", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 10.5, color: "rgba(10,21,53,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const m = ROLE_META[u.role] ?? ROLE_META.USER;
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(10,21,53,0.05)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535", fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.6)" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.6)" }}>{u.businessName || "—"}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.6)" }}>{u.sector || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: m.color, background: m.bg, border: `1px solid ${m.border}`, padding: "2px 8px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {m.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {updatingId === u.id ? (
                        <Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite", color: "#C9A227" }} />
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as Role)}
                          style={{ ...ctrlStyle, fontSize: 12, padding: "5px 8px" }}
                        >
                          <option value="USER">User</option>
                          <option value="REVIEWER">Reviewer</option>
                          <option value="INSPECTOR">Inspector</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                      <button
                        onClick={() => deleteUser(u)}
                        disabled={deletingId === u.id}
                        style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#ef4444", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 500, opacity: deletingId === u.id ? 0.6 : 1 }}
                      >
                        {deletingId === u.id ? <Loader2 size={12} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <><Trash2 size={12} /> Delete</>}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.45)" }}>
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
