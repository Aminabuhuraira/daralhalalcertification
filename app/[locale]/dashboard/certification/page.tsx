import { redirect } from "next/navigation";
import { Award, Download, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import CertificationApplicationForm from "@/components/dashboard/CertificationApplicationForm";
import ApplicationStages from "@/components/dashboard/ApplicationStages";
import GlowingCard from "@/components/ui/GlowingCard";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#F5C842",
  UNDER_REVIEW: "#60A5FA",
  APPROVED: "#22C55E",
  REJECTED: "#EF4444",
};

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

  const activeApplication = applications.find((a) => a.status !== "REJECTED") || applications[0] || null;
  const canApplyAgain = !activeApplication || activeApplication.status === "REJECTED";

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
          {applications.map((app) => (
            <GlowingCard key={app.id} style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "#0A1535", marginBottom: 4 }}>{app.businessName}</h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)" }}>{app.sector} · submitted {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                  color: STATUS_COLOR[app.status], padding: "4px 10px", borderRadius: 6,
                  border: `1px solid ${STATUS_COLOR[app.status]}40`, background: `${STATUS_COLOR[app.status]}15`,
                }}>
                  {app.status.replace("_", " ")}
                </span>
              </div>

              <div style={{ marginBottom: 14, padding: "14px 4px" }}>
                <ApplicationStages status={app.status} certificateIssued={!!app.certificate} />
              </div>

              {app.reviewNotes && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.65)", marginBottom: 10 }}>
                  <strong style={{ color: "#6D28D9" }}>Reviewer note:</strong> {app.reviewNotes}
                </p>
              )}
              {app.payments.length > 0 && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)", marginBottom: app.certificate ? 14 : 0 }}>
                  Fee quoted: {app.payments[0].currency} {(app.payments[0].amount / 100).toLocaleString()} — status {app.payments[0].status}.{" "}
                  <a href={`/${locale}/dashboard/billing`} style={{ color: "#6D28D9" }}>View in billing</a>
                </p>
              )}
              {app.certificate && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "14px 16px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Award size={18} color="#22C55E" />
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>You're certified!</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.5)" }}>Serial {app.certificate.serial} · Issued {new Date(app.certificate.issuedAt).toLocaleDateString()}</div>
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
          ))}
        </div>
      )}

      {canApplyAgain ? (
        <CertificationApplicationForm />
      ) : (
        <GlowingCard style={{ padding: "24px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.6)" }}>
            Your application is being processed. Our team will reach out via your registered email once screening is complete.
          </p>
        </GlowingCard>
      )}
    </div>
  );
}
