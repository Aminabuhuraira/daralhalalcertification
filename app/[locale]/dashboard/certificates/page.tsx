import { redirect } from "next/navigation";
import { Award, Download, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import GlowingCard from "@/components/ui/GlowingCard";

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const userId = (session.user as { id: string }).id;

  const certificates = await prisma.certificate.findMany({
    where: { userId },
    include: { course: true, application: true },
    orderBy: { issuedAt: "desc" },
  }).catch(() => []);

  const TIER_LABEL: Record<string, string> = {
    DISTINCTION: "Certificate of Distinction",
    COMPLETION: "Certificate of Completion",
    BUSINESS: "Halal Certification",
  };

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        My Certificates
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        Download your certificates or share their serial number for public verification.
      </p>

      {certificates.length === 0 ? (
        <GlowingCard style={{ padding: "32px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.55)" }}>
            You haven't earned any certificates yet. Complete a course or pass its quiz to earn one.
          </p>
        </GlowingCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {certificates.map((cert) => (
            <GlowingCard key={cert.id} style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div className="icon-badge-sm"><Award size={16} color="#F5C842" /></div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--gold-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {TIER_LABEL[cert.tier]}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: "#0A1535" }}>{cert.course?.title || cert.application?.businessName}</h3>
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.5)", marginBottom: 16 }}>
                Serial {cert.serial} · Issued {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={`/api/certificates/${cert.id}/pdf`} target="_blank" rel="noreferrer" className="btn-solid-gold" style={{ fontSize: 13, padding: "9px 16px" }}>
                  <Download size={14} /> Download PDF
                </a>
                <a href={`/${locale}/verify?serial=${cert.serial}`} className="btn-ghost" style={{ fontSize: 13, padding: "9px 16px" }}>
                  <ShieldCheck size={14} /> Verify
                </a>
              </div>
            </GlowingCard>
          ))}
        </div>
      )}
    </div>
  );
}
