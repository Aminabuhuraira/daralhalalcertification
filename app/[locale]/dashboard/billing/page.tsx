import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import BillingList from "@/components/dashboard/BillingList";

const PRICING_LABELS: Record<string, string> = {
  price_application_basic:    "Application Fee — Basic",
  price_application_standard: "Application Fee — Standard",
  price_application_premium:  "Application Fee — Premium",
  price_renewal:              "Annual Renewal Fee",
  price_inspection:           "Onsite Inspection Fee",
  price_surveillance:         "Surveillance Audit Fee",
};

function fmt(ngn: string) {
  const n = parseInt(ngn, 10);
  if (!n || isNaN(n)) return "Contact us";
  return `₦${n.toLocaleString("en-NG")}`;
}

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const userId = (session.user as { id: string }).id;

  const [payments, settings] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      include: { application: { select: { businessName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.platformSetting.findMany({
      where: { key: { startsWith: "price_" } },
    }),
  ]);

  const priceMap: Record<string, string> = {};
  for (const s of settings) priceMap[s.key] = s.value;

  const hasPrices = Object.values(priceMap).some(v => v && parseInt(v, 10) > 0);
  const isPaystackLive = !!(process.env.PAYSTACK_SECRET_KEY);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
        Billing
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        Certification fees and payment history.
      </p>

      {/* Pricing table */}
      {hasPrices && (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "24px 28px", marginBottom: 28, boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "#0A1535", marginBottom: 18 }}>
            Certification Fee Schedule
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {Object.entries(PRICING_LABELS).map(([key, label], i, arr) => {
              const val = priceMap[key];
              if (!val || parseInt(val, 10) === 0) return null;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(10,21,53,0.06)" : "none",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.7)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#0A1535" }}>{fmt(val)}</span>
                </div>
              );
            })}
          </div>
          {!isPaystackLive && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.4)", marginTop: 16, padding: "10px 14px", background: "rgba(10,21,53,0.03)", borderRadius: 8 }}>
              Online payment will be available shortly. To pay, contact our team at{" "}
              <a href="mailto:info@daralhalalcertification.com" style={{ color: "#C9A227" }}>info@daralhalalcertification.com</a>.
            </p>
          )}
        </div>
      )}

      {/* Payment history */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "#0A1535", marginBottom: 16 }}>
        Payment History
      </h2>
      {payments.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "40px 32px", textAlign: "center", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.45)" }}>
            No payment history yet. Once your application is processed, invoices will appear here.
          </p>
        </div>
      ) : (
        <Suspense fallback={null}>
          <BillingList payments={payments} locale={locale} />
        </Suspense>
      )}
    </div>
  );
}
