import { redirect } from "next/navigation";
import { Award, Download, ShieldCheck, Info, FileWarning, ExternalLink, Users, CalendarCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ApplicationStages from "@/components/dashboard/ApplicationStages";
import GlowingCard from "@/components/ui/GlowingCard";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import DraftApplicationEditor from "@/components/dashboard/DraftApplicationEditor";
import CertificationApplicationForm from "@/components/dashboard/CertificationApplicationForm";
import PaymentCTA from "@/components/dashboard/PaymentCTA";
import TrustmarkDownload from "@/components/dashboard/TrustmarkDownload";
import CARResponseForm from "@/components/dashboard/CARResponseForm";
import AuditRescheduleControl from "@/components/dashboard/AuditRescheduleControl";

// Spec-defined dashboard status block messages
const STATUS_MESSAGE: Record<string, { title: string; body: string; color: string }> = {
  DRAFT: {
    title: "Draft Application",
    body: "Please complete listing your products and upload all required documents to submit your application.",
    color: "#6B7280",
  },
  SUBMITTED: {
    title: "Application Received",
    body: "Your application has been received. Our team will verify completeness within 3 working days.",
    color: "#6366F1",
  },
  SCREENING: {
    title: "Administrative Screening",
    body: "Our Admin team is currently screening your documents for administrative completeness.",
    color: "#3B82F6",
  },
  DEFICIENCY_NOTICE: {
    title: "Action Required — Incomplete Documents",
    body: "Your application has missing or incomplete documents. Please upload the requested files within 14 working days to avoid closure.",
    color: "#F59E0B",
  },
  ELIGIBILITY_REVIEW: {
    title: "Eligibility Evaluation",
    body: "Your documents are complete. A Certification Officer is now conducting a technical eligibility review.",
    color: "#8B5CF6",
  },
  TRC_ESCALATION: {
    title: "Shariah & Technical Review",
    body: "Your application has been escalated to our Technical Review Committee & Shariah Advisor for deep-dive validation.",
    color: "#7C3AED",
  },
  AWAITING_PAYMENT: {
    title: "Approved — Awaiting Payment",
    body: "Your application is approved for registration! Please complete payment to schedule your audit slot.",
    color: "#0EA5E9",
  },
  PENDING_AUDIT: {
    title: "Audit Scheduled",
    body: "Payment verified! DAHC has scheduled your audit. Please prepare your facilities for the on-site visit.",
    color: "#14B8A6",
  },
  AUDITING: {
    title: "Audit in Progress",
    body: "The on-site audit of your facilities is currently underway.",
    color: "#0891B2",
  },
  ACTION_REQUIRED_NCR: {
    title: "Action Required — Non-Conformance Report",
    body: "Audit completed. Non-conformances were flagged. Please view the NCR and upload corrective evidence.",
    color: "#F97316",
  },
  VERIFYING_NCR: {
    title: "Verifying Corrective Evidence",
    body: "Your corrective action evidence has been submitted and is currently being verified. You will receive a notification shortly.",
    color: "#FB923C",
  },
  BOARD_REVIEW: {
    title: "Under Board Review",
    body: "Your complete audit file has been submitted to the Dar Al Halal Certification Board for final approval.",
    color: "#84CC16",
  },
  CERTIFIED: {
    title: "Congratulations — Certified!",
    body: "Your Halal Certificate has been issued and is ready for download. You may also download the authorised DAHC trustmark.",
    color: "#22C55E",
  },
  REJECTED: {
    title: "Application Not Approved",
    body: "Your application was not approved. Please review the formal decision letter for further details. You may submit a new application.",
    color: "#EF4444",
  },
  CLOSED_INCOMPLETE: {
    title: "Application Closed — Incomplete",
    body: "Your application has been closed due to inactivity or failure to resolve document deficiencies.",
    color: "#6B7280",
  },
};

const TERMINAL_STATES = ["REJECTED", "CLOSED_INCOMPLETE"];

export default async function CertificationApplicationPage({
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
    include: { payments: true, certificate: true },
  }).catch(() => []);

  const activeApplication = applications.find(a => !TERMINAL_STATES.includes(a.status)) || null;
  const hasDraft = activeApplication?.status === "DRAFT";
  const canApplyAgain = !activeApplication;

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Certification Application
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)", marginBottom: 32 }}>
        Apply for halal certification of your products or services.
      </p>

      {/* Existing applications */}
      {applications.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
          {applications.map((app) => {
            const msg      = STATUS_MESSAGE[app.status];
            const msgColor = msg?.color ?? "#6B7280";
            const isDraft  = app.status === "DRAFT";
            const isNCR    = app.status === "ACTION_REQUIRED_NCR";
            const isPendingAudit = app.status === "PENDING_AUDIT";
            const isAwaitingPayment = app.status === "AWAITING_PAYMENT";
            const isCertified = app.status === "CERTIFIED";
            const isRejected  = app.status === "REJECTED";
            const isClosed    = app.status === "CLOSED_INCOMPLETE";

            return (
              <GlowingCard key={app.id} style={{ padding: "20px 22px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#0A1535", marginBottom: 6 }}>{app.businessName}</h3>
                    {/* Number badges row */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      {(app as { applicationNumber?: string | null }).applicationNumber && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#C9A227", padding: "3px 9px", borderRadius: 5, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)" }}>
                          # {(app as { applicationNumber: string }).applicationNumber}
                        </span>
                      )}
                      {app.referenceNumber && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#6D28D9", padding: "3px 9px", borderRadius: 5, background: "rgba(109,40,217,0.07)", border: "1px solid rgba(109,40,217,0.2)" }}>
                          {app.referenceNumber}
                        </span>
                      )}
                      {app.certificate && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#16A34A", padding: "3px 9px", borderRadius: 5, background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)" }}>
                          CERT: {app.certificate.serial}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)" }}>
                      {app.sector}
                      {app.schemeCode && (
                        <span style={{ marginLeft: 8, fontWeight: 700, color: "#6D28D9" }}>{app.schemeCode}</span>
                      )}
                      {" · "}
                      {isDraft ? "started " : "submitted "}
                      {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                    color: msgColor, padding: "4px 10px", borderRadius: 6,
                    border: `1px solid ${msgColor}40`, background: `${msgColor}12`,
                    flexShrink: 0,
                  }}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Progress stages (not shown for DRAFT) */}
                {!isDraft && (
                  <div style={{ marginBottom: 14, padding: "10px 4px" }}>
                    <ApplicationStages status={app.status} certificateIssued={!!app.certificate} />
                  </div>
                )}

                {/* Status block message */}
                {msg && !isCertified && !isDraft && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 8, background: `${msgColor}10`, border: `1px solid ${msgColor}30`, marginBottom: 12 }}>
                    <Info size={15} color={msgColor} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: msgColor, marginBottom: 2 }}>{msg.title}</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.75)", lineHeight: 1.5 }}>{msg.body}</p>
                    </div>
                  </div>
                )}

                {/* ── DRAFT: show full editor ── */}
                {isDraft && (
                  <DraftApplicationEditor app={{
                    id: app.id,
                    businessName: app.businessName,
                    sector: app.sector,
                    schemeCode: app.schemeCode,
                    productionScale: app.productionScale,
                    productList: app.productList,
                    notes: app.notes,
                    documents: app.documents,
                    businessRegNo:      (app as { businessRegNo?: string | null }).businessRegNo ?? null,
                    entityType:         (app as { entityType?: string | null }).entityType ?? null,
                    headOfficeAddress:  (app as { headOfficeAddress?: string | null }).headOfficeAddress ?? null,
                    factoryAddress:     (app as { factoryAddress?: string | null }).factoryAddress ?? null,
                    telephone:          (app as { telephone?: string | null }).telephone ?? null,
                    website:            (app as { website?: string | null }).website ?? null,
                    picName:            (app as { picName?: string | null }).picName ?? null,
                    picDesignation:     (app as { picDesignation?: string | null }).picDesignation ?? null,
                    picPhone:           (app as { picPhone?: string | null }).picPhone ?? null,
                    picEmail:           (app as { picEmail?: string | null }).picEmail ?? null,
                    ingredientList:     (app as { ingredientList?: string | null }).ingredientList ?? null,
                    otherCertifications:(app as { otherCertifications?: string | null }).otherCertifications ?? null,
                    declarationAccepted:(app as { declarationAccepted?: boolean }).declarationAccepted ?? false,
                  }} />
                )}

                {/* ── DEFICIENCY_NOTICE: show admin note + specific missing items + upload ── */}
                {app.status === "DEFICIENCY_NOTICE" && (
                  <>
                    {app.deficiencyNotes && (
                      <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.3)", marginBottom: 12 }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#D97706", marginBottom: 8 }}>
                          <FileWarning size={13} style={{ display: "inline", marginRight: 5 }} />
                          Documents Required by DAHC:
                        </p>
                        {/* Show specific named missing items */}
                        {(app as { deficiencyItems?: string | null }).deficiencyItems && (() => {
                          try {
                            const items = JSON.parse((app as { deficiencyItems?: string }).deficiencyItems!) as { id: string; label: string }[];
                            return (
                              <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
                                {items.map(item => (
                                  <li key={item.id} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.82)", marginBottom: 4, lineHeight: 1.5 }}>
                                    <strong style={{ color: "#D97706" }}>{item.id}:</strong> {item.label}
                                  </li>
                                ))}
                              </ul>
                            );
                          } catch { return null; }
                        })()}
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.75)", whiteSpace: "pre-wrap", lineHeight: 1.6, borderTop: "1px solid rgba(245,158,11,0.2)", paddingTop: 8, marginTop: 4 }}>{app.deficiencyNotes}</p>
                      </div>
                    )}
                    <div style={{ padding: "14px 16px", borderRadius: 10, marginBottom: 12, background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <DocumentUpload
                        appId={app.id}
                        initialDocs={app.documents ? JSON.parse(app.documents) : []}
                        label="Upload Required Documents"
                      />
                    </div>
                  </>
                )}

                {/* ── Supporting documents (all non-terminal, non-DRAFT, non-DEFICIENCY) ── */}
                {!isDraft && !["CERTIFIED", "REJECTED", "CLOSED_INCOMPLETE", "DEFICIENCY_NOTICE"].includes(app.status) && (
                  <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 12, background: "rgba(10,21,53,0.02)", border: "1px solid rgba(10,21,53,0.07)" }}>
                    <DocumentUpload
                      appId={app.id}
                      initialDocs={app.documents ? JSON.parse(app.documents) : []}
                      label="Supporting Documents"
                    />
                  </div>
                )}

                {/* ── AWAITING_PAYMENT: payment CTA ── */}
                {isAwaitingPayment && (
                  <PaymentCTA
                    appId={app.id}
                    payments={app.payments as { id: string; amount: number; currency: string; status: string; description: string }[]}
                    locale={locale}
                  />
                )}

                {/* ── PENDING_AUDIT: audit date + team ── */}
                {isPendingAudit && (
                  <div style={{ padding: "14px 16px", borderRadius: 10, marginBottom: 12, background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.2)" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#0D9488", marginBottom: 8 }}>
                      <CalendarCheck size={13} style={{ display: "inline", marginRight: 5 }} />
                      Audit Schedule
                    </p>
                    {app.auditDate ? (
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.78)", marginBottom: 8 }}>
                        Your on-site audit is scheduled for{" "}
                        <strong>{new Date(app.auditDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>.
                        Please ensure your facilities are ready for the DAHC inspection team.
                      </p>
                    ) : (
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.68)", marginBottom: 8 }}>
                        Our team will contact you shortly to confirm the audit date and logistics.
                      </p>
                    )}
                    {(app as { auditTeam?: string | null }).auditTeam && (
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                        <Users size={13} color="#0D9488" />
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#0D9488" }}>
                          <strong>Assigned Inspection Team:</strong> {(app as { auditTeam?: string }).auditTeam}
                        </p>
                      </div>
                    )}
                    {app.auditDate && <AuditRescheduleControl appId={app.id} auditDate={app.auditDate} />}
                  </div>
                )}

                {/* ── ACTION_REQUIRED_NCR: CAR form ── */}
                {isNCR && (
                  <>
                    {app.reviewNotes && (
                      <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 10, background: "rgba(10,21,53,0.03)", border: "1px solid rgba(10,21,53,0.08)" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.75)" }}>
                          <strong>Auditor note:</strong> {app.reviewNotes}
                        </p>
                      </div>
                    )}
                    <div style={{ padding: "14px 16px", borderRadius: 10, marginBottom: 12, background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.15)" }}>
                      <DocumentUpload
                        appId={app.id}
                        initialDocs={app.documents ? JSON.parse(app.documents) : []}
                        label="Upload Corrective Evidence (photos, updated procedures, certificates)"
                      />
                    </div>
                    <CARResponseForm
                      appId={app.id}
                      ncrReport={app.ncrReport}
                      ncSeverity={(app as { ncSeverity?: string | null }).ncSeverity ?? null}
                      existingCarResponse={(app as { carResponse?: string | null }).carResponse ?? null}
                    />
                  </>
                )}

                {/* ── General reviewer note ── */}
                {app.reviewNotes && !isNCR && !isRejected && !isCertified && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.75)", marginBottom: 12 }}>
                    <strong style={{ color: "#6D28D9" }}>Reviewer note:</strong> {app.reviewNotes}
                  </p>
                )}

                {/* ── CERTIFIED: certificate + trustmark + public registry ── */}
                {isCertified && (
                  <>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 12 }}>
                      <Info size={15} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#22C55E", marginBottom: 2 }}>{msg?.title}</p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.75)", lineHeight: 1.5 }}>{msg?.body}</p>
                      </div>
                    </div>

                    {app.certificate && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "16px 18px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Award size={20} color="#22C55E" />
                          <div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>Halal Certificate</div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.68)" }}>
                              Serial {app.certificate.serial} · Issued {new Date(app.certificate.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              {app.certificate.expiresAt && (
                                <> · Expires {new Date(app.certificate.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
                              )}
                              {!(app.certificate.expiresAt) && (app as unknown as { certExpiryDate?: string | null }).certExpiryDate && (
                                <> · Valid until {new Date((app as unknown as { certExpiryDate: string }).certExpiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <a href={`/api/certificates/${app.certificate.id}/pdf`} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: 12.5, padding: "8px 14px" }}>
                            <Download size={13} /> Download Certificate
                          </a>
                          <a href={`/${locale}/verify?serial=${app.certificate.serial}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, padding: "8px 14px", borderRadius: 6, border: "1px solid rgba(34,197,94,0.3)", color: "#16A34A", textDecoration: "none", background: "rgba(34,197,94,0.06)" }}>
                            <ShieldCheck size={13} /> Verify Online
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Trustmark */}
                    <TrustmarkDownload
                      businessName={app.businessName}
                      referenceNumber={app.referenceNumber}
                      schemeCode={app.schemeCode}
                    />

                    {/* Public registry link */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(109,40,217,0.04)", border: "1px solid rgba(109,40,217,0.12)", marginTop: 8 }}>
                      <ExternalLink size={13} color="#6D28D9" />
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.72)" }}>
                        Your business is listed in the{" "}
                        <a href={`/${locale}/registry`} style={{ color: "#6D28D9", textDecoration: "underline" }}>DAHC Public Halal Registry</a>.
                      </p>
                    </div>
                  </>
                )}

                {/* ── REJECTED: reason + re-apply link ── */}
                {isRejected && (
                  <>
                    {app.reviewNotes && (
                      <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 12 }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#DC2626", marginBottom: 4 }}>Formal Decision:</p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.78)", lineHeight: 1.6 }}>{app.reviewNotes}</p>
                      </div>
                    )}
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.7)", lineHeight: 1.5 }}>
                      Once you have addressed the issues above, you may{" "}
                      <a href={`/${locale}/dashboard/certification`} onClick={() => undefined} style={{ color: "#6D28D9", fontWeight: 600 }}>
                        submit a new application
                      </a>
                      . Contact <a href="mailto:info@daralhalalcertification.com" style={{ color: "#6D28D9" }}>info@daralhalalcertification.com</a> for guidance.
                    </p>
                  </>
                )}

                {/* ── CLOSED_INCOMPLETE ── */}
                {isClosed && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.7)", lineHeight: 1.5 }}>
                    You may start a{" "}
                    <a href={`/${locale}/dashboard/certification`} style={{ color: "#6D28D9", fontWeight: 600 }}>
                      new application
                    </a>{" "}
                    at any time. Contact <a href="mailto:info@daralhalalcertification.com" style={{ color: "#6D28D9" }}>info@daralhalalcertification.com</a> for assistance.
                  </p>
                )}

                {/* ── Payment info line (all states except terminal + AWAITING_PAYMENT) ── */}
                {app.payments.length > 0 && !isAwaitingPayment && !isCertified && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.64)", marginTop: 10 }}>
                    Fee: {app.payments[0].currency} {(app.payments[0].amount / 100).toLocaleString()} — {app.payments[0].status}.{" "}
                    <a href={`/${locale}/dashboard/billing`} style={{ color: "#6D28D9" }}>View in billing</a>
                  </p>
                )}
              </GlowingCard>
            );
          })}
        </div>
      )}

      {/* New application form — covers both first-time applicants (no application yet)
          and re-applicants (every prior application rejected/closed), since canApplyAgain
          is true in both cases. */}
      {canApplyAgain && !hasDraft ? (
        <CertificationApplicationForm />
      ) : !hasDraft && !canApplyAgain ? (
        <GlowingCard style={{ padding: "24px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.72)" }}>
            Your application is being processed. Our team will contact you via email at each stage.
          </p>
        </GlowingCard>
      ) : null}
    </div>
  );
}

