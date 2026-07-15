import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureDb } from "@/lib/db";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function ReviewerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;

  const allowedRoles = ["ADMIN", "REVIEWER", "INSPECTOR"];
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    redirect(`/${locale}/auth/login`);
  }
  await ensureDb();

  return (
    <DashboardShell variant="reviewer" userName={user.name || ""} userRole={user.role}>
      {children}
    </DashboardShell>
  );
}
