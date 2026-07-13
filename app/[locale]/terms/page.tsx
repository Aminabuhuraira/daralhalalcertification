import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  const sections = [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing or using the Dar Al-Halal Certification platform (the \"Platform\"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Platform.",
    },
    {
      title: "2. Services",
      body: "Dar Al-Halal Certification provides online halal compliance training, certification applications, and certificate issuance services. We reserve the right to modify or discontinue any service at any time.",
    },
    {
      title: "3. User Accounts",
      body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to notify us immediately of any unauthorised use of your account.",
    },
    {
      title: "4. Certification Process",
      body: "Certification decisions are made at our sole discretion based on submitted documentation and compliance with applicable halal standards. Approval is not guaranteed. Fees paid for applications are non-refundable unless we are unable to process your application.",
    },
    {
      title: "5. Intellectual Property",
      body: "All course content, materials, certificates, and platform design are the intellectual property of Dar Al-Halal Certification. You may not reproduce, distribute, or create derivative works without prior written consent.",
    },
    {
      title: "6. Limitation of Liability",
      body: "The Platform is provided \"as is\" without warranties of any kind. Dar Al-Halal Certification shall not be liable for indirect, incidental, or consequential damages arising from your use of the Platform.",
    },
    {
      title: "7. Governing Law",
      body: "These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be submitted to the exclusive jurisdiction of the courts located in Abuja, Nigeria.",
    },
    {
      title: "8. Changes to Terms",
      body: "We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms. We will notify users of significant changes via email.",
    },
    {
      title: "9. Contact",
      body: "For questions about these Terms, contact us at legal@daralhalalcertification.com.",
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        <section style={{ paddingTop: 120, paddingBottom: 64, background: "#0A1535" }}>
          <div className="section-container">
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#C9A227", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Legal</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 600, color: "#ffffff", marginBottom: 12 }}>Terms of Service</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Last updated: January 2026</p>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#f8f7f4" }}>
          <div className="section-container" style={{ maxWidth: 720 }}>
            {sections.map((s) => (
              <div key={s.title} style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "#0A1535", marginBottom: 10 }}>{s.title}</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(10,21,53,0.65)", lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
