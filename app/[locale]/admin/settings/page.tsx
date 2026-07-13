import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import AdminSettings from "@/components/dashboard/AdminSettings";

type Params = { params: Promise<{ locale: string }> };

export default async function AdminSettingsPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect(`/${locale}/auth/login`);

  const [userCount, courseCount, pendingApplications, certificateCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.certificationApplication.count({ where: { status: "PENDING" } }),
    prisma.certificate.count(),
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
        Admin Settings
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        Create courses, view platform stats, and manage configuration.
      </p>
      <AdminSettings stats={{ userCount, courseCount, pendingApplications, certificateCount }} />
    </div>
  );
}
