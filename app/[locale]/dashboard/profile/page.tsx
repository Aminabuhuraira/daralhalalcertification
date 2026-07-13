import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, businessName: true, sector: true, phone: true },
  });
  if (!user) redirect(`/${locale}/auth/login`);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Profile Settings
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        Update your account details and password.
      </p>
      <ProfileForm user={user} />
    </div>
  );
}
