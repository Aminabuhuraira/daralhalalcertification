import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CheckCircle, AlertCircle, Clock, FileText, Shield, Phone, Mail } from "lucide-react";

type Params = { params: Promise<{ locale: string }> };

export const metadata = {
  title: "Halal Certification Manual — DAHC Client Guideline",
  description: "The official DAHC Halal Certification Manual (QMS/AP/HM/01) — eligibility criteria, certification process, documentation requirements, and post-certification obligations.",
};

export default async function CertificationGuidePage({ params }: Params) {
  const { locale } = await params;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 80, minHeight: "100vh", background: "#F9FAFB" }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #0A1535 0%, #1a2a5e 100%)", color: "white", padding: "56px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.35)", borderRadius: 20, marginBottom: 20 }}>
              <FileText size={13} color="#C9A227" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#C9A227", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                QMS/AP/HM/01 · Rev 01
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 400, marginBottom: 16, lineHeight: 1.2 }}>
              DAHC Halal Certification Manual<br />
              <span style={{ color: "#C9A227" }}>Client Guideline</span>
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.72)", maxWidth: 640, lineHeight: 1.7 }}>
              This manual provides a comprehensive guide to the Dar Al Halal Certification (DAHC) halal certification process, requirements, and obligations for applicant organisations. Read this document before submitting your application.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <Link href={`/${locale}/auth/register`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#C9A227", borderRadius: 8, color: "white", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 16px rgba(201,162,39,0.35)" }}>
                Apply for Certification
              </Link>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, color: "white", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>
                Contact DAHC
              </Link>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ background: "white", borderRadius: 12, border: "1px solid rgba(10,21,53,0.08)", padding: "24px 28px", boxShadow: "0 1px 4px rgba(10,21,53,0.05)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "rgba(10,21,53,0.64)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Table of Contents</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "6px 20px" }}>
              {[
                "1. Introduction & About DAHC",
                "2. Objectives of This Manual",
                "3. Normative References",
                "4. Eligibility Requirements",
                "5. Certification Process (10 Stages)",
                "6. Documentation Requirements",
                "7. Audit & Assessment",
                "8. Non-Conformance Classification",
                "9. Post-Certification Obligations",
                "10. Certificate Validity & Renewal",
                "11. Contact & Support",
              ].map((item, i) => (
                <a key={i} href={`#section-${i + 1}`} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#6D28D9", textDecoration: "none" }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Section 1: Introduction */}
          <Section id="section-1" number="1" title="Introduction & About DAHC">
            <p>
              Dar Al Halal Certification (DAHC) is an independent, accredited halal conformity assessment body established to provide credible and internationally recognised halal certification services in Nigeria and across West Africa. DAHC operates under a rigorous quality management system aligned with international halal standards, ensuring transparency, impartiality, and integrity throughout the certification process.
            </p>
            <p>
              Halal certification by DAHC attests that a product or service complies with the principles of Islamic law (Shariah) as they relate to permissible (halal) consumption, production, and handling. A DAHC certificate provides assurance to Muslim consumers, retailers, importers, and regulatory authorities that certified products meet the highest standards of halal compliance.
            </p>
            <p>
              This manual is intended for businesses, manufacturers, food premises operators, and service providers who wish to apply for DAHC halal certification. It outlines the application process, eligibility criteria, documentation requirements, audit procedures, and the obligations of certified companies.
            </p>
          </Section>

          {/* Section 2: Objectives */}
          <Section id="section-2" number="2" title="Objectives of This Manual">
            <p>This Client Guideline Manual has been developed to:</p>
            <ul>
              <li>Provide applicant organisations with a clear understanding of the DAHC certification process from application to certificate issuance;</li>
              <li>Explain the documentation and eligibility requirements that must be met before an audit can be scheduled;</li>
              <li>Describe the roles and responsibilities of both DAHC and the applicant organisation throughout the certification lifecycle;</li>
              <li>Outline the obligations of certified companies with respect to post-certification surveillance, change notifications, and proper use of the DAHC trustmark;</li>
              <li>Promote a smooth, transparent, and efficient certification experience that facilitates access to domestic and international halal markets.</li>
            </ul>
          </Section>

          {/* Section 3: Normative References */}
          <Section id="section-3" number="3" title="Normative References">
            <p>The DAHC halal certification programme is developed in accordance with the following standards and regulatory frameworks:</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr style={{ background: "#0A1535", color: "white" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>Standard / Reference</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["MS 1500:2019", "Malaysian Halal Food — Production, Preparation, Handling and Storage (General Guidelines)"],
                    ["HAS 23103", "LPPOM MUI — Halal Assurance System requirements for Halal Certification"],
                    ["ESMA 2055-1", "UAE Standard — Halal Products (Food)"],
                    ["ISO 17065:2012", "Conformity Assessment — Requirements for bodies certifying products, processes and services"],
                    ["GSO 993:2015", "Gulf Cooperation Council (GCC) — Halal food general requirements"],
                    ["NAFDAC Regulations", "National Agency for Food and Drug Administration and Control (Nigeria) product registration requirements"],
                    ["CAC Regulations", "Corporate Affairs Commission (Nigeria) — Business registration verification"],
                  ].map(([std, desc], i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(10,21,53,0.07)", background: i % 2 === 0 ? "white" : "#f9f9fb" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0A1535", whiteSpace: "nowrap" }}>{std}</td>
                      <td style={{ padding: "10px 14px", color: "rgba(10,21,53,0.78)" }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section 4: Eligibility */}
          <Section id="section-4" number="4" title="Eligibility Requirements">
            <p>To be eligible for DAHC halal certification, an applicant organisation must satisfy the following baseline criteria:</p>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {[
                ["Legal Registration", "The business must be legally registered with the Corporate Affairs Commission (CAC) of Nigeria or an equivalent registration authority in the country of operation."],
                ["Certifiable Products or Services", "The products or services for which certification is sought must be capable of halal compliance. Products containing categorically prohibited (haram) substances that cannot be substituted are not eligible."],
                ["Accessible Premises", "Manufacturing facilities, food premises, or operational sites must be accessible for on-site audit by DAHC-appointed inspectors. Remote or virtual-only operations require prior written approval from DAHC management."],
                ["No Prohibited Processes", "The production process must not involve any practices strictly prohibited under Islamic law, including the use of pork or pork derivatives, blood, alcohol as a product ingredient, or improperly slaughtered meat."],
                ["Responsible Person", "A designated Person-in-Charge (PIC) must be named and available for communication throughout the certification process."],
                ["Willingness to Comply", "The applicant must agree to maintain halal compliance, notify DAHC of any material changes, and cooperate fully with DAHC auditors and surveillance requirements."],
              ].map(([title, desc], i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", background: "rgba(10,21,53,0.02)", borderRadius: 8, border: "1px solid rgba(10,21,53,0.07)" }}>
                  <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#0A1535", marginBottom: 3 }}>{title}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.75)", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 5: Certification Process */}
          <Section id="section-5" number="5" title="Certification Process">
            <p>The DAHC halal certification process consists of ten (10) defined stages from initial application to certificate issuance. The typical end-to-end timeline is 8–14 weeks, subject to application completeness and audit availability.</p>
            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr style={{ background: "#0A1535", color: "white" }}>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, width: 60 }}>Stage</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>Description</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, whiteSpace: "nowrap" }}>Responsible</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "Application Submission", "Applicant completes the DAHC Application Form (QMS/AP/AF/01) and uploads all required supporting documents via the portal.", "Applicant"],
                    ["2", "Administrative Screening", "DAHC Certification Review Officer screens the application for document completeness within 3 working days.", "DAHC Reviewer"],
                    ["3", "Deficiency Notice (if applicable)", "If documents are incomplete, DAHC issues a formal Deficiency Notice. The applicant has 14 working days to respond.", "Both"],
                    ["4", "Eligibility Review", "A DAHC Certification Officer conducts a technical assessment of the applicant's eligibility, ingredients, and processes.", "DAHC Ops Manager"],
                    ["5", "TRC Escalation (if required)", "Complex or novel cases are escalated to the Technical Review Committee (TRC) and Shariah Advisor for specialist review.", "DAHC TRC"],
                    ["6", "Fee Invoice & Payment", "Upon approval, DAHC issues a certification fee invoice. The applicant completes payment to proceed to audit scheduling.", "Both"],
                    ["7", "Audit Scheduling", "DAHC appoints an inspection team and communicates the audit date, location, and preparation requirements to the applicant.", "DAHC Inspector"],
                    ["8", "Halal Audit", "DAHC-trained auditors conduct an on-site inspection of facilities, processes, ingredients, and documentation.", "DAHC Inspector"],
                    ["9", "NCR Resolution (if applicable)", "Any Non-Conformances (NCRs) identified during audit must be resolved within 30 days. The applicant submits a Corrective Action Response (CAR).", "Both"],
                    ["10", "Board Review & Decision", "The Certification Board reviews the complete audit file and issues a final approval or rejection decision.", "DAHC Board"],
                  ].map(([stage, name, desc, resp]) => (
                    <tr key={stage} style={{ borderBottom: "1px solid rgba(10,21,53,0.07)", verticalAlign: "top", background: parseInt(stage) % 2 === 0 ? "#f9f9fb" : "white" }}>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#C9A227", fontSize: 18 }}>{stage}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0A1535", whiteSpace: "nowrap" }}>{name}</td>
                      <td style={{ padding: "12px 14px", color: "rgba(10,21,53,0.78)", lineHeight: 1.6 }}>{desc}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center", color: resp === "Applicant" ? "#6D28D9" : resp === "Both" ? "#D97706" : "#0891B2", fontWeight: 600, whiteSpace: "nowrap" }}>{resp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section 6: Documentation Requirements */}
          <Section id="section-6" number="6" title="Documentation Requirements">
            <p>The following documents must be submitted as part of the DAHC application. Missing documents will trigger a Deficiency Notice and delay processing.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              {[
                { section: "A. Application Form", items: ["Completed & signed DAHC Application Form (QMS/AP/AF/01)", "Authorized signatory and company stamp"] },
                { section: "B. Legal & Corporate", items: ["Certificate of Business Registration (CAC or equivalent)", "Tax Identification Number (TIN)", "Memorandum & Articles of Association (Ltd companies)"] },
                { section: "C. Products & Ingredients", items: ["Complete product/service list", "Ingredient/recipe list with halal status", "Supplier certificates for all key ingredients"] },
                { section: "D. Production Process", items: ["Process / production flow chart", "HACCP or GMP documentation", "Equipment list and cleaning procedures"] },
                { section: "E. Facility", items: ["Factory or premises layout plan", "Water quality test report", "Pest control records"] },
                { section: "F. Packaging & Labelling", items: ["Packaging artwork or samples", "Product label samples showing ingredient list"] },
                { section: "G. Personnel", items: ["Designated Muslim Personnel Declaration", "Personnel list with halal training records"] },
                { section: "H. Other Certifications", items: ["NAFDAC registration (where applicable)", "Existing ISO / quality system certificates", "Prior halal certifications (if any)"] },
                { section: "I. Declaration & Agreement", items: ["Signed DAHC Certification Agreement", "Declaration of Impartiality (signed by PIC)"] },
              ].map(({ section, items }) => (
                <div key={section} style={{ background: "white", borderRadius: 8, border: "1px solid rgba(10,21,53,0.08)", padding: "16px 18px" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#C9A227", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{section}</p>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.78)", marginBottom: 4, lineHeight: 1.5 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 7: Audit & Assessment */}
          <Section id="section-7" number="7" title="Audit & Assessment">
            <p>
              The DAHC halal audit is a systematic, documented, and independent examination of your operations to verify compliance with applicable halal standards. DAHC auditors are trained, independent, and bound by a Declaration of Impartiality.
            </p>
            <p><strong>Audit Duration:</strong> Typically 1 day (Small Scale) to 3 days (Large Scale) depending on the complexity and scope of operations.</p>
            <p><strong>What Auditors Examine:</strong></p>
            <ul>
              <li>All incoming raw materials, ingredients, and additives — including certificates of halal compliance from suppliers</li>
              <li>Production and processing methods, including any shared lines with non-halal products</li>
              <li>Cleaning, sanitation, and cross-contamination prevention procedures</li>
              <li>Storage, segregation, and logistics protocols</li>
              <li>Personnel training records and Muslim personnel declaration</li>
              <li>Labelling and packaging accuracy</li>
              <li>All documentation reviewed during the screening stage</li>
            </ul>
            <p><strong>Audit Report:</strong> A formal audit report (QMS/AU/AR/01) is issued within 5 working days of the audit. Where Non-Conformances (NCRs) are identified, a separate NCR report is issued.</p>
          </Section>

          {/* Section 8: Non-Conformance Classification */}
          <Section id="section-8" number="8" title="Non-Conformance Classification">
            <p>
              Where the DAHC audit reveals areas of non-compliance, the findings are classified and documented in a Non-Conformance Report (NCR). The applicant is required to submit a Corrective Action Response (CAR) within the prescribed timeframe.
            </p>
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr style={{ background: "#0A1535", color: "white" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Classification</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Definition</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Response Timeframe</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Consequence if Unresolved</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(10,21,53,0.07)", verticalAlign: "top", background: "#fffbf0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", fontWeight: 700, color: "#D97706", fontSize: 12 }}>MINOR</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "rgba(10,21,53,0.78)", lineHeight: 1.6 }}>A minor shortcoming in documentation, procedure, or process control that does not immediately compromise halal integrity. Easily correctable.</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#D97706" }}>30 calendar days</td>
                    <td style={{ padding: "12px 16px", color: "rgba(10,21,53,0.72)" }}>Escalated to Major NC</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(10,21,53,0.07)", verticalAlign: "top", background: "#fff7f0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", fontWeight: 700, color: "#EA580C", fontSize: 12 }}>MAJOR</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "rgba(10,21,53,0.78)", lineHeight: 1.6 }}>A significant deviation from halal requirements that has the potential to affect halal status if not addressed. Corrective action and evidence required.</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#EA580C" }}>14 calendar days</td>
                    <td style={{ padding: "12px 16px", color: "rgba(10,21,53,0.72)" }}>Application suspended pending re-audit</td>
                  </tr>
                  <tr style={{ verticalAlign: "top", background: "#fff0f0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700, color: "#DC2626", fontSize: 12 }}>SERIOUS</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "rgba(10,21,53,0.78)", lineHeight: 1.6 }}>A critical failure that renders the product or service haram, or indicates deliberate misrepresentation. Includes detection of prohibited ingredients or processes.</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#DC2626" }}>Immediate</td>
                    <td style={{ padding: "12px 16px", color: "rgba(10,21,53,0.72)" }}>Application rejected; 12-month re-application ban</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section 9: Post-Certification Obligations */}
          <Section id="section-9" number="9" title="Post-Certification Obligations">
            <p>Upon receiving a DAHC Halal Certificate, the certified organisation assumes the following ongoing obligations:</p>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {[
                ["Annual Surveillance Audits", "DAHC will conduct surveillance audits at 12-month and 24-month intervals during the certificate validity period. These are mandatory and non-negotiable."],
                ["Change Notifications", "Any material change to product formulation, ingredients, suppliers, processes, facility layout, or ownership must be notified to DAHC in writing within 7 working days of the change taking effect."],
                ["Proper Use of DAHC Trustmark", "The DAHC halal trustmark may only be used on certified products and in accordance with the DAHC Trustmark Usage Guidelines. Misuse, alteration, or unauthorised extension of the trustmark is prohibited."],
                ["Maintenance of Records", "Certified organisations must maintain comprehensive halal control records for a minimum of 3 years and make them available to DAHC auditors upon request."],
                ["Annual Maintenance Fee", "An annual surveillance fee is payable at each surveillance audit interval. Failure to pay will result in suspension of the certificate."],
                ["Non-Compliance Reporting", "Any accidental halal contamination or breach of halal integrity must be reported to DAHC immediately. Failure to report may result in certificate revocation."],
              ].map(([title, desc], i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", background: "white", borderRadius: 8, border: "1px solid rgba(10,21,53,0.08)" }}>
                  <Shield size={18} color="#0A1535" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#0A1535", marginBottom: 3 }}>{title}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.75)", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 10: Validity & Renewal */}
          <Section id="section-10" number="10" title="Certificate Validity & Renewal">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { icon: "📅", label: "Certificate Validity", value: "3 Years", sub: "From date of issue" },
                { icon: "🔍", label: "Surveillance Audits", value: "Year 1 & 2", sub: "Annual compulsory audits" },
                { icon: "🔄", label: "Renewal Application", value: "3 Months Prior", sub: "Before expiry date" },
              ].map(({ icon, label, value, sub }) => (
                <div key={label} style={{ textAlign: "center", background: "white", borderRadius: 10, border: "1px solid rgba(10,21,53,0.08)", padding: "20px 16px" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "rgba(10,21,53,0.64)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "#C9A227", marginBottom: 4 }}>{value}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.68)" }}>{sub}</p>
                </div>
              ))}
            </div>
            <p>
              DAHC Halal Certificates are valid for a period of three (3) years from the date of issue, subject to satisfactory completion of annual surveillance audits and continued compliance with DAHC requirements.
            </p>
            <p>
              <strong>Certificate Suspension:</strong> A certificate may be suspended where the certified organisation fails a surveillance audit, fails to pay maintenance fees, or fails to notify DAHC of a material change. During suspension, the organisation must immediately cease using the DAHC trustmark.
            </p>
            <p>
              <strong>Certificate Revocation:</strong> A certificate will be revoked where a Serious Non-Conformance is confirmed, where the organisation is found to have misrepresented its operations to DAHC, or where suspension conditions are not rectified within the notified timeframe.
            </p>
            <p>
              <strong>Renewal:</strong> Applicants must submit a renewal application at least three (3) months before the certificate expiry date. Renewal applications are subject to the same documentary and audit requirements as initial certification.
            </p>
          </Section>

          {/* Section 11: Contact */}
          <Section id="section-11" number="11" title="Contact & Support">
            <p>For enquiries, guidance on the application process, or support with any aspect of your certification journey, please contact the DAHC Certification Office:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
              <ContactCard icon={<Mail size={20} color="#C9A227" />} label="Email" value="info@daralhalalcertification.com" href="mailto:info@daralhalalcertification.com" />
              <ContactCard icon={<Phone size={20} color="#C9A227" />} label="Phone / WhatsApp" value="+234 XXX XXX XXXX" href="tel:+234000000000" />
            </div>
            <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.78)", marginBottom: 8 }}>
                <strong style={{ color: "#9a7810" }}>Office Hours:</strong> Monday – Friday, 8:00 AM – 5:00 PM (WAT)
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.78)" }}>
                <strong style={{ color: "#9a7810" }}>Portal Support:</strong> Technical issues with the online portal may be reported via the Contact Us page on our website.
              </p>
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href={`/${locale}/auth/register`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "#C9A227", borderRadius: 8, color: "white", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 16px rgba(201,162,39,0.35)" }}>
                Start Your Application
              </Link>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", border: "1.5px solid rgba(10,21,53,0.18)", borderRadius: 8, color: "#0A1535", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>
                Contact DAHC
              </Link>
            </div>
          </Section>

          {/* Footer note */}
          <div style={{ marginTop: 24, padding: "14px 20px", borderRadius: 8, background: "rgba(10,21,53,0.03)", border: "1px solid rgba(10,21,53,0.07)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)", lineHeight: 1.6 }}>
              <strong>Document Reference:</strong> QMS/AP/HM/01 | <strong>Revision:</strong> 01 | <strong>Effective Date:</strong> January 2025 | <strong>Next Review:</strong> January 2026<br />
              This document is the property of Dar Al Halal Certification. © {new Date().getFullYear()} DAHC. All rights reserved.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 48, scrollMarginTop: 90 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 14, borderBottom: "2px solid #C9A227" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A1535", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#C9A227" }}>{number}</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "#0A1535", margin: 0 }}>{title}</h2>
      </div>
      <div style={{
        background: "white", borderRadius: 12, border: "1px solid rgba(10,21,53,0.08)",
        padding: "24px 28px", boxShadow: "0 1px 4px rgba(10,21,53,0.04)",
        fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.8)", lineHeight: 1.75,
      }}>
        {children}
      </div>
    </section>
  );
}

function ContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", background: "white", borderRadius: 10, border: "1px solid rgba(10,21,53,0.08)", textDecoration: "none", transition: "border-color 0.2s" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "rgba(10,21,53,0.64)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "#0A1535" }}>{value}</p>
      </div>
    </a>
  );
}
