import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ application: null });
  const userId = (session.user as { id: string }).id;

  const applications = await prisma.certificationApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { certificate: { select: { id: true, serial: true } } },
  });
  if (applications.length === 0) return NextResponse.json({ application: null });

  const application = applications.find((a) => a.status !== "REJECTED") || applications[0];

  return NextResponse.json({
    application: {
      status: application.status,
      certificateIssued: !!application.certificate,
      businessName: application.businessName,
    },
  });
}
