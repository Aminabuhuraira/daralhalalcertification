import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ serial: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { serial } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { serial },
    include: {
      course: { select: { title: true } },
      application: { select: { businessName: true, sector: true } },
      user: { select: { name: true, businessName: true } },
    },
  });
  if (!certificate) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }
  return NextResponse.json({
    valid: true,
    serial: certificate.serial,
    tier: certificate.tier,
    issuedAt: certificate.issuedAt,
    courseTitle: certificate.course?.title ?? null,
    sector: certificate.application?.sector ?? null,
    holderName: certificate.application?.businessName || certificate.user.businessName || certificate.user.name,
  });
}
