import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  const sections = [
    {
      title: "1. Information We Collect",
      body: "We collect information you provide directly: name, email address, business name, industry sector, and phone number during registration. We also collect usage data including course progress, quiz results, and platform interactions.",
    },
    {
      title: "2. How We Use Your Information",
      body: "We use your information to: (a) provide and manage your account and certifications; (b) process certification applications; (c) communicate with you about your account or application status; (d) improve our platform and services; (e) comply with legal obligations.",
    },
    {
      title: "3. Data Sharing",
      body: "We do not sell your personal information. We may share data with third-party service providers who help us operate the Platform (e.g., payment processors) under confidentiality agreements. We may disclose information when required by law.",
    },
    {
      title: "4. Cookies",
      body: "We use session cookies for authentication purposes. These are strictly necessary and cannot be disabled. We do not use advertising or tracking cookies.",
    },
    {
      title: "5. Data Retention",
      body: "We retain your account and certification data for as long as your account is active and as required by applicable law. You may request deletion of your account at any time, subject to our retention obligations.",
    },
    {
      title: "6. Security",
      body: "We implement industry-standard security measures including encrypted password storage and HTTPS. However, no method of electronic transmission or storage is 100% secure.",
    },
    {
      title: "7. Your Rights",
      body: "Under the Nigeria Data Protection Regulation (NDPR), you have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@daralhalalcertification.com.",
    },
    {
      title: "8. Children's Privacy",
      body: "The Platform is not intended for users under 18 years of age. We do not knowingly collect personal information from minors.",
    },
    {
      title: "9. Changes to This Policy",
      body: "We may update this Privacy Policy periodically. We will notify you of material changes by email or by prominently posting a notice on the Platform.",
    },
    {
      title: "10. Contact Us",
      body: "For privacy-related inquiries, contact our Data Protection Officer at privacy@daralhalalcertification.com or write to us at our registered address in Abuja, Nigeria.",
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        <section style={{ paddingTop: 120, paddingBottom: 64, background: "#0A1535" }}>
          <div className="section-container">
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#C9A227", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Legal</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 600, color: "#ffffff", marginBottom: 12 }}>Privacy Policy</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Last updated: January 2026 — compliant with Nigeria Data Protection Regulation (NDPR)</p>
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
