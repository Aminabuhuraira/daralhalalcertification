import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureDb } from "@/lib/db";
import DashboardShell from "@/components/layout/DashboardShell";

// Map each staff role to its dedicated portal
const STAFF_REDIRECT: Record<string, string> = {
  REVIEWER:           "/reviewer",
  OPERATIONS_MANAGER: "/ops",
  INSPECTOR:          "/inspector",
  TECHNICAL:          "/technical",
  SHARIA_PANEL:       "/sharia",
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  await ensureDb();

  const user = session.user as { name?: string | null; role?: string };

  // Staff roles have dedicated portals — redirect immediately
  const staffPortal = STAFF_REDIRECT[user.role ?? ""];
  if (staffPortal) redirect(`/${locale}${staffPortal}`);

  return (
    <DashboardShell variant="user" userName={user.name || "User"} userRole={user.role || "USER"}>
      {children}
    </DashboardShell>
  );
}
