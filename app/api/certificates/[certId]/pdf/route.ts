import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { SCHEME_CODES } from "@/lib/sectors";

const REFERENCE_STANDARDS = "MS 1500:2019 · OIC/SMIIC 1:2019 · ISO/IEC 17065:2012";

type Params = { params: Promise<{ certId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role   = (session.user as { role?: string }).role;
  const { certId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certId },
    include: {
      course:      { select: { title: true } },
      application: { select: { businessName: true, sector: true, schemeCode: true, productList: true } },
      user:        { select: { name: true, businessName: true } },
    },
  });
  if (!certificate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (certificate.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Generate QR code pointing to the public verify page
  const verifyUrl = `https://daralhalalcertification.com/verify?serial=${certificate.serial}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin:          1,
    width:           200,
    color:           { dark: "#3D2B7A", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  }).catch(() => null);

  const scopeLabel = SCHEME_CODES.find(s => s.code === certificate.application?.schemeCode)?.label
    ?? certificate.application?.sector
    ?? "General Halal Compliance";
  const productList = certificate.application?.productList?.trim() || "";
  const productItems = productList.split(/[,\n]/).map(s => s.trim()).filter(Boolean);

  const pdf = await generateCertificatePdf({
    serial:      certificate.serial,
    tier:        certificate.tier,
    issuedAt:    certificate.issuedAt,
    expiresAt:   certificate.expiresAt,
    holderName:  certificate.application?.businessName
                   || certificate.user.businessName
                   || certificate.user.name,
    courseTitle: certificate.course?.title,
    sector:      certificate.application?.sector,
    qrDataUrl,
    referenceStandards: REFERENCE_STANDARDS,
    scopeOfCertification: scopeLabel,
    productCategory: certificate.application?.sector ?? scopeLabel,
    product: productItems.length ? productItems.join(", ") : "As per approved product schedule",
    productDescription: productItems.length
      ? `${productItems.slice(0, 3).join(", ")}${productItems.length > 3 ? `, and ${productItems.length - 3} more` : ""} — manufactured and processed under Halal-compliant conditions within the approved ${scopeLabel} scope.`
      : `Products manufactured and processed under Halal-compliant conditions within the approved ${scopeLabel} scope.`,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `inline; filename="${certificate.serial}.pdf"`,
    },
  });
}
