"use client";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

type Props = {
  initialQ: string;
  initialScheme: string;
  schemeLabels: Record<string, string>;
};

export default function RegistrySearch({ initialQ, initialScheme, schemeLabels }: Props) {
  const [q,      setQ]      = useState(initialQ);
  const [scheme, setScheme] = useState(initialScheme);
  const [, startTransition] = useTransition();
  const router   = useRouter();
  const pathname = usePathname();

  function apply(newQ: string, newScheme: string) {
    const p = new URLSearchParams();
    if (newQ)      p.set("q",      newQ);
    if (newScheme) p.set("scheme", newScheme);
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  }

  function clear() { setQ(""); setScheme(""); apply("", ""); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} color="rgba(10,21,53,0.4)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={q}
            onChange={e => { setQ(e.target.value); apply(e.target.value, scheme); }}
            placeholder="Search by company name, sector, or reference…"
            style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 36px", borderRadius: 8, border: "1.5px solid rgba(10,21,53,0.15)", fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", background: "white", outline: "none" }}
          />
        </div>
        <select
          value={scheme}
          onChange={e => { setScheme(e.target.value); apply(q, e.target.value); }}
          style={{ padding: "11px 14px", borderRadius: 8, border: "1.5px solid rgba(10,21,53,0.15)", fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", background: "white", outline: "none", cursor: "pointer", minWidth: 180 }}
        >
          <option value="">All Schemes</option>
          {Object.entries(schemeLabels).map(([code, label]) => (
            <option key={code} value={code}>{code} — {label}</option>
          ))}
        </select>
        {(q || scheme) && (
          <button onClick={clear} style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(10,21,53,0.15)", background: "white", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.5)", cursor: "pointer" }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
