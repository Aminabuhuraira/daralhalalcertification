import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [userCount, enrollmentCount, certificateCount, pendingApplications, courseCount] = await Promise.all([
    prisma.user.count(),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.certificationApplication.count({ where: { status: { notIn: ["CERTIFIED", "REJECTED", "CLOSED_INCOMPLETE"] } } }),
    prisma.course.count(),
  ]);

  return NextResponse.json({
    userCount,
    enrollmentCount,
    certificateCount,
    pendingApplications,
    courseCount,
  });
}
