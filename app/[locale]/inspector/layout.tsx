import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureDb } from "@/lib/db";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function InspectorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const user = session.user as { name?: string | null; role?: string };
  const inspectorAllowed = ["INSPECTOR", "ADMIN", "SUPER_ADMIN"];
  if (!user.role || !inspectorAllowed.includes(user.role)) {
    redirect(`/${locale}/dashboard`);
  }

  await ensureDb();

  return (
    <DashboardShell variant="inspector" userName={user.name || "Inspector"} userRole={user.role || "INSPECTOR"}>
      {children}
    </DashboardShell>
  );
}
