import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/certificate-pdf";

type Params = { params: Promise<{ certId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role = (session.user as { role?: string }).role;
  const { certId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certId },
    include: {
      course: { select: { title: true } },
      application: { select: { businessName: true, sector: true } },
      user: { select: { name: true, businessName: true } },
    },
  });
  if (!certificate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (certificate.userId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pdf = await generateCertificatePdf({
    serial: certificate.serial,
    tier: certificate.tier,
    issuedAt: certificate.issuedAt,
    holderName: certificate.application?.businessName || certificate.user.businessName || certificate.user.name,
    courseTitle: certificate.course?.title,
    sector: certificate.application?.sector,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${certificate.serial}.pdf"`,
    },
  });
}
