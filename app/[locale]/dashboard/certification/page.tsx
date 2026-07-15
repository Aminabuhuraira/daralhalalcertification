import { redirect } from "next/navigation";
import { Award, Download, ShieldCheck, Info } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import CertificationApplicationForm from "@/components/dashboard/CertificationApplicationForm";
import ApplicationStages from "@/components/dashboard/ApplicationStages";
import GlowingCard from "@/components/ui/GlowingCard";
import DocumentUpload from "@/components/dashboard/DocumentUpload";

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
    body: "Your Halal Certificate has been issued and is ready for download.",
    color: "#22C55E",
  },
  REJECTED: {
    title: "Application Not Approved",
    body: "Your application was not approved. Please review the formal decision letter for further details. You may reapply.",
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

  const activeApplication = applications.find(a => !TERMINAL_STATES.includes(a.status)) || applications[0] || null;
  const canApplyAgain = !activeApplication || TERMINAL_STATES.includes(activeApplication.status);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Certification Application
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        Apply for halal certification of your products or services.
      </p>

      {applications.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
          {applications.map((app) => {
            const msg     = STATUS_MESSAGE[app.status];
            const msgColor = msg?.color ?? "#6B7280";

            return (
              <GlowingCard key={app.id} style={{ padding: "20px 22px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#0A1535", marginBottom: 4 }}>{app.businessName}</h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>
                      {app.sector} · submitted {new Date(app.createdAt).toLocaleDateString()}
                      {app.referenceNumber && (
                        <span style={{ marginLeft: 10, fontWeight: 700, color: "#6D28D9" }}>{app.referenceNumber}</span>
                      )}
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

                {/* Progress stages */}
                <div style={{ marginBottom: 14, padding: "10px 4px" }}>
                  <ApplicationStages status={app.status} certificateIssued={!!app.certificate} />
                </div>

                {/* Status block message */}
                {msg && app.status !== "CERTIFIED" && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 8, background: `${msgColor}10`, border: `1px solid ${msgColor}30`, marginBottom: 12 }}>
                    <Info size={15} color={msgColor} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: msgColor, marginBottom: 2 }}>{msg.title}</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.65)", lineHeight: 1.5 }}>{msg.body}</p>
                    </div>
                  </div>
                )}

                {/* Deficiency notes from admin */}
                {app.status === "DEFICIENCY_NOTICE" && app.deficiencyNotes && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", marginBottom: 12 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#D97706", marginBottom: 4 }}>Documents Required:</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.7)", whiteSpace: "pre-wrap" }}>{app.deficiencyNotes}</p>
                  </div>
                )}

                {app.reviewNotes && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.65)", marginBottom: 10 }}>
                    <strong style={{ color: "#6D28D9" }}>Reviewer note:</strong> {app.reviewNotes}
                  </p>
                )}

                {/* Document upload — always visible; required action on DEFICIENCY_NOTICE */}
                {!["CERTIFIED", "REJECTED", "CLOSED_INCOMPLETE"].includes(app.status) && (
                  <div style={{
                    padding: "14px 16px", borderRadius: 10, marginBottom: 12,
                    background: app.status === "DEFICIENCY_NOTICE"
                      ? "rgba(245,158,11,0.05)" : "rgba(10,21,53,0.02)",
                    border: `1px solid ${app.status === "DEFICIENCY_NOTICE"
                      ? "rgba(245,158,11,0.25)" : "rgba(10,21,53,0.08)"}`,
                  }}>
                    <DocumentUpload
                      appId={app.id}
                      initialDocs={app.documents ? JSON.parse(app.documents) : []}
                      label={app.status === "DEFICIENCY_NOTICE" ? "Upload Required Documents" : "Supporting Documents"}
                    />
                  </div>
                )}

                {/* Fee / payment info */}
                {app.payments.length > 0 && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)", marginBottom: app.certificate ? 14 : 0 }}>
                    Fee: {app.payments[0].currency} {(app.payments[0].amount / 100).toLocaleString()} — {app.payments[0].status}.{" "}
                    <a href={`/${locale}/dashboard/billing`} style={{ color: "#6D28D9" }}>View in billing</a>
                  </p>
                )}

                {/* Certificate download */}
                {app.certificate && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "14px 16px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Award size={18} color="#22C55E" />
                      <div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>Congratulations — You're Certified!</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)" }}>
                          Serial {app.certificate.serial} · Issued {new Date(app.certificate.issuedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={`/api/certificates/${app.certificate.id}/pdf`} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: 12.5, padding: "8px 14px" }}>
                        <Download size={13} /> Download
                      </a>
                      <a href={`/${locale}/verify?serial=${app.certificate.serial}`} className="btn-ghost" style={{ fontSize: 12.5, padding: "8px 14px" }}>
                        <ShieldCheck size={13} /> Verify
                      </a>
                    </div>
                  </div>
                )}
              </GlowingCard>
            );
          })}
        </div>
      )}

      {canApplyAgain ? (
        <CertificationApplicationForm />
      ) : (
        <GlowingCard style={{ padding: "24px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.6)" }}>
            Your application is being processed. Our team will reach out via your registered email at each stage.
          </p>
        </GlowingCard>
      )}
    </div>
  );
}
