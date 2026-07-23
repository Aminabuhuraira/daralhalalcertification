import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import UserSettings from "@/components/dashboard/UserSettings";

type Params = { params: Promise<{ locale: string }> };

export default async function UserSettingsPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const userId = (session.user as { id: string }).id;
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, businessName: true, sector: true, phone: true },
  }).catch(() => null);
  const user = dbUser ?? {
    name: (session.user as { name?: string | null }).name ?? "",
    email: session.user.email ?? "",
    businessName: null,
    sector: null,
    phone: null,
  };

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
        Settings
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.68)", marginBottom: 32 }}>
        Manage your account details, password, and preferences.
      </p>
      <UserSettings user={user} locale={locale} />
    </div>
  );
}
