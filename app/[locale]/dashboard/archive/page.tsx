import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  Archive, FileText, FileImage, File, Download, Award,
  Calendar, Hash, Building2, ShieldCheck, FolderOpen,
} from "lucide-react";

type DocEntry = {
  name: string;
  fileName: string;
  size: number;
  uploadedAt: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return <FileText size={15} color="#EF4444" />;
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return <FileImage size={15} color="#3B82F6" />;
  if (["doc", "docx"].includes(ext)) return <FileText size={15} color="#2563EB" />;
  return <File size={15} color="#6B7280" />;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT:               "#6B7280",
  SUBMITTED:           "#6366F1",
  SCREENING:           "#3B82F6",
  DEFICIENCY_NOTICE:   "#F59E0B",
  ELIGIBILITY_REVIEW:  "#8B5CF6",
  TRC_ESCALATION:      "#7C3AED",
  AWAITING_PAYMENT:    "#0EA5E9",
  PENDING_AUDIT:       "#14B8A6",
  AUDITING:            "#0891B2",
  ACTION_REQUIRED_NCR: "#F97316",
  VERIFYING_NCR:       "#FB923C",
  BOARD_REVIEW:        "#84CC16",
  CERTIFIED:           "#22C55E",
  REJECTED:            "#EF4444",
  CLOSED_INCOMPLETE:   "#6B7280",
};

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const userId = (session.user as { id: string }).id;

  const applications = await prisma.certificationApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { certificate: true },
  }).catch(() => []);

  const totalDocs = applications.reduce((n, app) => {
    try { return n + (JSON.parse(app.documents ?? "[]") as DocEntry[]).length; } catch { return n; }
  }, 0);
  const certifiedCount = applications.filter(a => a.status === "CERTIFIED").length;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Archive size={22} color="#C9A227" />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "#0A1535" }}>
            Document Archive
          </h1>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "rgba(10,21,53,0.5)" }}>
          Complete record of all your certification applications, uploaded documents, and issued certificates.
        </p>

        {/* Summary strip */}
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { label: "Applications", value: applications.length, color: "#6366F1" },
            { label: "Documents Filed", value: totalDocs, color: "#C9A227" },
            { label: "Certificates Issued", value: certifiedCount, color: "#22C55E" },
          ].map(s => (
            <div key={s.label} style={{ padding: "12px 20px", borderRadius: 10, background: "white", border: "1px solid rgba(10,21,53,0.08)", boxShadow: "0 1px 4px rgba(10,21,53,0.06)", minWidth: 130 }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.45)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {applications.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", borderRadius: 12, background: "white", border: "1px solid rgba(10,21,53,0.08)" }}>
          <FolderOpen size={40} color="rgba(10,21,53,0.2)" style={{ margin: "0 auto 14px" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.4)" }}>No applications found. Start your certification application to build your archive.</p>
        </div>
      )}

      {/* Application cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {applications.map((app) => {
          const docs: DocEntry[] = (() => {
            try { return JSON.parse(app.documents ?? "[]"); } catch { return []; }
          })();
          const statusColor = STATUS_COLORS[app.status] ?? "#6B7280";
          const appNum = (app as { applicationNumber?: string | null }).applicationNumber;

          return (
            <div key={app.id} style={{ background: "white", borderRadius: 14, border: "1px solid rgba(10,21,53,0.09)", boxShadow: "0 2px 12px rgba(10,21,53,0.05)", overflow: "hidden" }}>

              {/* Application header bar */}
              <div style={{ padding: "16px 22px", background: "rgba(10,21,53,0.025)", borderBottom: "1px solid rgba(10,21,53,0.07)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <Building2 size={15} color="#C9A227" />
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#0A1535" }}>{app.businessName}</h2>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: statusColor, padding: "2px 9px", borderRadius: 5, border: `1px solid ${statusColor}40`, background: `${statusColor}12`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {/* Application Number */}
                    {appNum && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.55)" }}>
                        <Hash size={11} color="#C9A227" />
                        <strong style={{ color: "#0A1535" }}>{appNum}</strong>
                      </span>
                    )}
                    {/* DAHC Reference */}
                    {app.referenceNumber && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.55)" }}>
                        <ShieldCheck size={11} color="#6D28D9" />
                        <strong style={{ color: "#6D28D9" }}>{app.referenceNumber}</strong>
                      </span>
                    )}
                    {/* Scheme + sector */}
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.45)" }}>
                      {app.sector}{app.schemeCode ? ` · ${app.schemeCode}` : ""}
                    </span>
                    {/* Date */}
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.4)" }}>
                      <Calendar size={11} />
                      {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Certificate block */}
                {app.certificate && (
                  <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Award size={18} color="#22C55E" />
                      <div>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, color: "#16A34A" }}>Halal Certificate Issued</p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)", marginTop: 2 }}>
                          Certificate No: <strong style={{ color: "#0A1535", fontFamily: "monospace", fontSize: 12.5 }}>{app.certificate.serial}</strong>
                          {" · "}
                          Issued {new Date(app.certificate.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          {app.certificate.expiresAt && (
                            <> · Expires {new Date(app.certificate.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/api/certificates/${app.certificate.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, padding: "7px 14px", borderRadius: 6, background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)", color: "#16A34A", textDecoration: "none" }}
                    >
                      <Download size={13} /> Download Certificate PDF
                    </a>
                  </div>
                )}

                {/* Documents section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <FileText size={14} color="rgba(10,21,53,0.4)" />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "rgba(10,21,53,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Submitted Documents ({docs.length})
                    </p>
                  </div>

                  {docs.length === 0 ? (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.35)", padding: "12px 14px", borderRadius: 8, background: "rgba(10,21,53,0.025)", border: "1px dashed rgba(10,21,53,0.1)" }}>
                      No documents uploaded for this application.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {docs.map((doc, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(10,21,53,0.02)", border: "1px solid rgba(10,21,53,0.07)", transition: "background 0.1s" }}>
                          <div style={{ flexShrink: 0 }}>{fileIcon(doc.name)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#0A1535", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.4)", marginTop: 1 }}>
                              {formatBytes(doc.size)} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <a
                            href={`/api/uploads/${encodeURIComponent(doc.fileName)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 5, background: "rgba(10,21,53,0.04)", border: "1px solid rgba(10,21,53,0.12)", color: "rgba(10,21,53,0.6)", textDecoration: "none", flexShrink: 0 }}
                          >
                            <Download size={12} /> View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Application details mini-grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {[
                    { label: "Application No.", value: appNum ?? "—" },
                    { label: "DAHC Ref.", value: app.referenceNumber ?? "Pending" },
                    { label: "Certificate No.", value: app.certificate?.serial ?? "Not yet issued" },
                    { label: "Scheme", value: app.schemeCode ?? "—" },
                    { label: "Scale", value: app.productionScale ?? "—" },
                    { label: "Cert. Expiry", value: app.certificate?.expiresAt ? new Date(app.certificate.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : (app as { certExpiryDate?: string | null }).certExpiryDate ? new Date((app as { certExpiryDate: string }).certExpiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(10,21,53,0.025)", border: "1px solid rgba(10,21,53,0.07)" }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, color: "rgba(10,21,53,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</p>
                      <p style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: value === "Pending" || value === "—" || value === "Not yet issued" ? 400 : 600, color: value === "Not yet issued" || value === "Pending" || value === "—" ? "rgba(10,21,53,0.35)" : "#0A1535" }}>{value}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
