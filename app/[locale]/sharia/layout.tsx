import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureDb } from "@/lib/db";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function ShariaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { name?: string | null; role?: string } | undefined;

  const allowed = ["ADMIN", "SUPER_ADMIN", "SHARIA_PANEL"];
  if (!user?.role || !allowed.includes(user.role)) {
    redirect(`/${locale}/auth/login`);
  }
  await ensureDb();

  return (
    <DashboardShell variant="sharia" userName={user.name || "Sharia Panel"} userRole={user.role}>
      {children}
    </DashboardShell>
  );
}
