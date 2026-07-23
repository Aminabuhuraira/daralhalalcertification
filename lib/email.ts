import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "DAHC Portal <noreply@daralhalalcertification.com>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://daralhalalcertification.com";

async function send(to: string, subject: string, html: string) {
  if (!resend) return; // email not configured — fail silently
  await resend.emails.send({ from: FROM, to, subject, html }).catch(() => {});
}

function base(content: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8f7f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid rgba(10,21,53,0.08);overflow:hidden;">
<tr><td style="background:#0A1535;padding:28px 40px;text-align:center;">
<h1 style="margin:0;color:#C9A227;font-size:20px;font-weight:600;letter-spacing:0.05em;">DAR AL HALAL CERTIFICATION</h1>
<p style="margin:6px 0 0;color:rgba(255,255,255,0.55);font-size:12px;">Official Halal Certification Authority</p>
</td></tr>
<tr><td style="padding:36px 40px;">${content}</td></tr>
<tr><td style="background:#f0ede8;padding:20px 40px;text-align:center;border-top:1px solid rgba(10,21,53,0.08);">
<p style="margin:0;color:rgba(10,21,53,0.4);font-size:11px;">Dar Al Halal Certification Authority · Nigeria<br>
<a href="${SITE}" style="color:#C9A227;text-decoration:none;">${SITE}</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#0A1535;color:#C9A227;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;letter-spacing:0.04em;">${label}</a>`;
}

function p(text: string) {
  return `<p style="margin:0 0 14px;color:rgba(10,21,53,0.7);font-size:14px;line-height:1.7;">${text}</p>`;
}

// ─── Transactional emails ─────────────────────────────────────────────────────

export async function emailApplicationReceived(to: string, name: string, appNum: string, bizName: string) {
  await send(to, "Application Received — Dar Al Halal Certification", base(`
    ${p(`Dear ${name},`)}
    ${p(`Thank you for submitting your Halal Certification application for <strong>${bizName}</strong>. We have received your application and our Administrative Screening team will verify completeness within <strong>3 working days</strong>.`)}
    <div style="background:rgba(201,162,39,0.08);border:1px solid rgba(201,162,39,0.2);border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:rgba(10,21,53,0.5);text-transform:uppercase;letter-spacing:0.06em;">Application Number</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#0A1535;font-family:monospace;">${appNum}</p>
    </div>
    ${p("Please keep this application number for your records. You will receive updates at each stage of the certification process.")}
    ${btn(`${SITE}/en/dashboard/certification`, "Track Your Application")}
  `));
}

export async function emailDeficiencyNotice(to: string, name: string, appNum: string, missingItems: string[]) {
  const itemList = missingItems.map(item => `<li style="margin-bottom:6px;color:rgba(10,21,53,0.7);font-size:14px;">${item}</li>`).join("");
  await send(to, "Action Required — Incomplete Documents", base(`
    ${p(`Dear ${name},`)}
    ${p(`Following our administrative review of your Halal Certification application <strong style="font-family:monospace;">${appNum}</strong>, we have identified the following required documents that are missing or incomplete:`)}
    <ul style="margin:0 0 20px;padding-left:20px;">${itemList}</ul>
    ${p(`Please upload the missing documents within <strong>14 working days</strong>. Failure to respond within this period may result in the closure of your application.`)}
    ${btn(`${SITE}/en/dashboard/certification`, "Upload Documents Now")}
  `));
}

export type InvoiceDetails = {
  invoiceNumber?: string;
  referenceNumber?: string;
  scopeLabel?: string;
  productionScale?: string;
  billingAddress?: string;
  billingEmail?: string;
};

function invoiceMetaRow(label: string, value: string) {
  return `<tr>
    <td style="padding:5px 0;font-size:12.5px;color:rgba(10,21,53,0.5);width:170px;">${label}</td>
    <td style="padding:5px 0;font-size:12.5px;color:#0A1535;font-weight:600;">${value}</td>
  </tr>`;
}

export async function emailEligibleAwaitingPayment(
  to: string, name: string, appNum: string, bizName: string, amountNgn?: number, invoice?: InvoiceDetails,
) {
  const scaleLabel: Record<string, string> = { LARGE: "Large Scale", MEDIUM: "Medium Scale", SMALL: "Small Scale" };
  const invoiceDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const lineDescription = `Halal Certification Fee — Initial Certification${invoice?.scopeLabel ? ` (${invoice.scopeLabel})` : ""}${invoice?.productionScale ? ` — ${scaleLabel[invoice.productionScale] ?? invoice.productionScale}` : ""}`;

  await send(to, invoice?.invoiceNumber ? `Invoice ${invoice.invoiceNumber} — Dar Al Halal Certification` : "Application Approved — Payment Required", base(`
    ${p(`Dear ${name},`)}
    ${p(`Congratulations! Your Halal Certification application for <strong>${bizName}</strong> has successfully passed the administrative and eligibility review stages. Please find your invoice below.`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(10,21,53,0.02);border:1px solid rgba(10,21,53,0.08);border-radius:10px;margin:20px 0;">
      <tr><td style="padding:18px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${invoice?.invoiceNumber ? invoiceMetaRow("Invoice Number", invoice.invoiceNumber) : ""}
          ${invoiceMetaRow("Invoice Date", invoiceDate)}
          ${invoiceMetaRow("Application Number", appNum)}
          ${invoice?.referenceNumber ? invoiceMetaRow("DAHC Reference", invoice.referenceNumber) : ""}
          ${invoiceMetaRow("Bill To", bizName)}
          ${invoice?.billingEmail ? invoiceMetaRow("Billing Email", invoice.billingEmail) : ""}
          ${invoice?.billingAddress ? invoiceMetaRow("Registered Address", invoice.billingAddress) : ""}
        </table>
      </td></tr>
    </table>

    ${amountNgn ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px;">
      <tr style="background:#0A1535;">
        <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#C9A227;text-transform:uppercase;letter-spacing:0.05em;">Description</td>
        <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#C9A227;text-transform:uppercase;letter-spacing:0.05em;text-align:right;">Amount</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(10,21,53,0.08);">
        <td style="padding:14px 16px;font-size:13.5px;color:#0A1535;">${lineDescription}</td>
        <td style="padding:14px 16px;font-size:13.5px;color:#0A1535;text-align:right;white-space:nowrap;">NGN ${amountNgn.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#0A1535;">Total Due</td>
        <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#0369A1;text-align:right;white-space:nowrap;">NGN ${amountNgn.toLocaleString()}</td>
      </tr>
    </table>` : ""}

    ${p(`Payment is required to proceed to audit scheduling. Fees are non-refundable once certification services have commenced, per your signed Halal Certification Agreement.`)}
    ${p(`To proceed, please complete payment via your portal dashboard or contact our Finance team at <a href="mailto:finance@daralhalalcertification.com" style="color:#C9A227;">finance@daralhalalcertification.com</a>.`)}
    ${btn(`${SITE}/en/dashboard/billing`, "Proceed to Payment")}
  `));
}

export async function emailAuditScheduled(to: string, name: string, appNum: string, auditDate?: string, auditTeam?: string) {
  await send(to, "Audit Scheduled — Dar Al Halal Certification", base(`
    ${p(`Dear ${name},`)}
    ${p(`Your Halal Certification application <strong style="font-family:monospace;">${appNum}</strong> has been approved for on-site audit. Please ensure your facility and all relevant personnel are available for the inspection.`)}
    ${auditDate ? `<div style="background:rgba(20,184,166,0.06);border:1px solid rgba(20,184,166,0.2);border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:rgba(10,21,53,0.5);">Scheduled Audit Date</p>
      <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#0D9488;">${new Date(auditDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      ${auditTeam ? `<p style="margin:6px 0 0;font-size:13px;color:rgba(10,21,53,0.55);">Inspection Team: ${auditTeam}</p>` : ""}
    </div>` : ""}
    ${p("If this date doesn't work, you can request a different one from your dashboard — self-service rescheduling is available up to <strong>3 days</strong> before the audit. Within 3 days of the audit, please contact our Inspection team directly at <a href='mailto:inspection@daralhalalcertification.com' style='color:#C9A227;'>inspection@daralhalalcertification.com</a>.")}
    ${btn(`${SITE}/en/dashboard/certification`, "View Application or Reschedule")}
  `));
}

export async function emailNcrIssued(to: string, name: string, appNum: string, severity: string, report: string) {
  const severityColor = severity === "SERIOUS" ? "#DC2626" : severity === "MAJOR" ? "#EA580C" : "#D97706";
  await send(to, "Action Required — Non-Conformance Report Issued", base(`
    ${p(`Dear ${name},`)}
    ${p(`Following the on-site audit of your facility, our inspection team has identified non-conformances that must be resolved before your application can proceed to board review.`)}
    <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:11px;color:rgba(10,21,53,0.4);text-transform:uppercase;letter-spacing:0.06em;">Severity Classification</p>
      <p style="margin:4px 0 10px;font-size:16px;font-weight:700;color:${severityColor};">${severity} NC</p>
      <p style="margin:0;font-size:13px;color:rgba(10,21,53,0.7);line-height:1.6;">${report.replace(/\n/g, "<br>")}</p>
    </div>
    ${p("Please log in to your portal to submit your Corrective Action Response (CAR) with root cause analysis and action plan.")}
    ${btn(`${SITE}/en/dashboard/certification`, "Submit Corrective Action")}
  `));
}

export async function emailCertified(to: string, name: string, bizName: string, certSerial: string, expiryDate?: string) {
  await send(to, "Congratulations — Halal Certificate Issued", base(`
    ${p(`Dear ${name},`)}
    ${p(`We are delighted to inform you that <strong>${bizName}</strong> has been officially certified by the Dar Al Halal Certification Authority. Your Halal Certificate has been issued and is ready for download.`)}
    <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:rgba(10,21,53,0.5);">Certificate Number</p>
      <p style="margin:6px 0 4px;font-size:20px;font-weight:700;color:#0A1535;font-family:monospace;">${certSerial}</p>
      ${expiryDate ? `<p style="margin:0;font-size:13px;color:rgba(10,21,53,0.5);">Valid until: <strong>${new Date(expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong></p>` : ""}
    </div>
    ${p("You may download your certificate and DAHC trustmark from your portal. Your certificate can be verified publicly at <a href='" + SITE + "/en/verify' style='color:#C9A227;'>" + SITE + "/en/verify</a>.")}
    ${btn(`${SITE}/en/dashboard/certificates`, "Download Certificate")}
  `));
}

export async function emailRejected(to: string, name: string, bizName: string, reason: string) {
  await send(to, "Application Decision — Dar Al Halal Certification", base(`
    ${p(`Dear ${name},`)}
    ${p(`After careful review, we regret to inform you that the Halal Certification application for <strong>${bizName}</strong> has not been approved at this time.`)}
    <div style="background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:11px;color:rgba(10,21,53,0.4);text-transform:uppercase;letter-spacing:0.06em;">Decision Reason</p>
      <p style="margin:6px 0 0;font-size:14px;color:rgba(10,21,53,0.7);line-height:1.6;">${reason || "Please contact us for further details."}</p>
    </div>
    ${p("You are welcome to address the concerns raised and submit a new application. For guidance, please contact our team at <a href='mailto:certification@daralhalalcertification.com' style='color:#C9A227;'>certification@daralhalalcertification.com</a>.")}
    ${btn(`${SITE}/en/certification`, "Learn About Our Process")}
  `));
}

export async function emailPasswordReset(to: string, name: string, resetUrl: string) {
  await send(to, "Password Reset Request — Dar Al Halal Certification", base(`
    ${p(`Dear ${name},`)}
    ${p("We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.")}
    ${btn(resetUrl, "Reset My Password")}
    ${p("If you did not request a password reset, you can safely ignore this email — your password has not been changed.")}
  `));
}

export async function emailWelcome(to: string, name: string, bizName?: string) {
  await send(to, "Welcome to Dar Al Halal Certification Portal", base(`
    ${p(`Dear ${name},`)}
    ${p(`Welcome to the Dar Al Halal Certification Authority portal. Your account has been successfully created${bizName ? ` for <strong>${bizName}</strong>` : ""}.`)}
    ${p("You can now apply for Halal certification, track your application status, access learning resources, and download your certificates — all from one place.")}
    ${btn(`${SITE}/en/dashboard`, "Go to My Dashboard")}
    ${p("<small style='color:rgba(10,21,53,0.4);'>Before applying, please review the <a href='" + SITE + "/en/certification-guide' style='color:#C9A227;'>Halal Certification Client Manual</a> to understand the process and required documentation.</small>")}
  `));
}
