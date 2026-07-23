import { prisma } from "@/lib/db";
import { ShieldCheck, Search, Award, Building2, Calendar } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegistrySearch from "@/components/registry/RegistrySearch";
import type { CertificationApplication, Certificate } from "@prisma/client";

type AppWithCert = CertificationApplication & { certificate: Certificate | null };

export const metadata = { title: "DAHC Public Halal Registry | Dar Al Halal Certification" };

export default async function RegistryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; scheme?: string }>;
}) {
  const { locale } = await params;
  const { q = "", scheme = "" } = await searchParams;

  const companies: AppWithCert[] = await prisma.certificationApplication.findMany({
    where: {
      status: "CERTIFIED",
      ...(q ? {
        OR: [
          { businessName:    { contains: q } },
          { referenceNumber: { contains: q } },
          { sector:          { contains: q } },
        ],
      } : {}),
      ...(scheme ? { schemeCode: scheme } : {}),
    },
    include: { certificate: true },
    orderBy: { updatedAt: "desc" },
  }).catch(() => [] as AppWithCert[]);

  const SCHEME_LABELS: Record<string, string> = {
    FB: "Food & Beverages", FP: "Food Premises", AQ: "Aquatic / Fish",
    SL: "Slaughterhouse / Meat", CS: "Cosmetics & Personal Care",
    PH: "Pharmaceuticals", CG: "Consumer Goods", LG: "Logistics",
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ background: "#0A1535", padding: "80px 24px 60px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 30, padding: "6px 18px", marginBottom: 24 }}>
            <ShieldCheck size={14} color="#C9A227" />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "#C9A227", letterSpacing: "0.06em", textTransform: "uppercase" }}>Verified & Trusted</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,48px)", fontWeight: 400, color: "#ffffff", marginBottom: 14 }}>
            DAHC Public Halal Registry
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
            All businesses listed here hold a valid Dar Al Halal Certification. Verify a company's halal status or search by name, sector, or scheme code.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#22C55E", margin: 0 }}>{companies.length}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Certified Businesses</p>
            </div>
          </div>
        </section>

        {/* Search + results */}
        <section style={{ background: "#f8f7f4", minHeight: "60vh", padding: "48px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <RegistrySearch initialQ={q} initialScheme={scheme} schemeLabels={SCHEME_LABELS} />

            {companies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <Search size={36} color="rgba(10,21,53,0.2)" style={{ margin: "0 auto 14px", display: "block" }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.64)" }}>
                  {q || scheme ? "No certified companies match your search." : "No certified companies found."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18, marginTop: 28 }}>
                {companies.map(app => (
                  <div key={app.id} style={{ background: "white", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", boxShadow: "0 2px 10px rgba(10,21,53,0.05)", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Building2 size={16} color="#C9A227" />
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#0A1535", margin: 0 }}>{app.businessName}</h3>
                      </div>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, color: "#22C55E", padding: "2px 8px", borderRadius: 4, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", flexShrink: 0 }}>
                        CERTIFIED
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {app.schemeCode && (
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#6D28D9", padding: "2px 8px", borderRadius: 4, background: "rgba(109,40,217,0.07)", border: "1px solid rgba(109,40,217,0.15)" }}>
                          {app.schemeCode}
                        </span>
                      )}
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.68)" }}>
                        {SCHEME_LABELS[app.schemeCode ?? ""] ?? app.sector}
                      </span>
                    </div>

                    {app.referenceNumber && (
                      <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(10,21,53,0.7)", margin: 0 }}>
                        Ref: <strong style={{ color: "#0A1535" }}>{app.referenceNumber}</strong>
                      </p>
                    )}

                    {app.certificate && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 10, borderTop: "1px solid rgba(10,21,53,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Award size={13} color="#22C55E" />
                          <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#16A34A", fontWeight: 700 }}>{app.certificate.serial}</span>
                        </div>
                        {app.certificate.expiresAt && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={11} color="rgba(10,21,53,0.35)" />
                            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.64)" }}>
                              Exp. {new Date(app.certificate.expiresAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <a
                      href={`/${locale}/verify?serial=${app.certificate?.serial ?? ""}`}
                      style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#0A1535", textDecoration: "none", borderTop: "1px solid rgba(10,21,53,0.06)", paddingTop: 10, marginTop: "auto" }}
                    >
                      <ShieldCheck size={13} color="#C9A227" /> Verify Certificate
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
