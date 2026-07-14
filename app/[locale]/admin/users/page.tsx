import { prisma } from "@/lib/db";
import AdminUserList from "@/components/dashboard/AdminUserList";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, businessName: true, sector: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#0A1535", marginBottom: 6 }}>
        Users
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)", marginBottom: 32 }}>
        {users.length} registered users.
      </p>
      <AdminUserList users={users} />
    </div>
  );
}
