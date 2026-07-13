import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardShell from "@/components/layout/DashboardShell";

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

  const user = session.user as { name?: string | null; role?: string };

  return (
    <DashboardShell variant="user" userName={user.name || "User"} userRole={user.role || "USER"}>
      {children}
    </DashboardShell>
  );
}
