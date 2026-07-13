import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function AdminLayout({
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
  if (user.role !== "ADMIN") redirect(`/${locale}/dashboard`);

  return (
    <DashboardShell variant="admin" userName={user.name || "Admin"} userRole={user.role || "ADMIN"}>
      {children}
    </DashboardShell>
  );
}
