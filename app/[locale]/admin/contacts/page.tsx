import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Mail, Clock, ExternalLink } from "lucide-react";

type Params = { params: Promise<{ locale: string }> };

export default async function AdminContactsPage({ params }: Params) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") redirect(`/${locale}/auth/login`);

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#0A1535", marginBottom: 4 }}>
          Contact Inbox
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.5)" }}>
          {messages.length} message{messages.length !== 1 ? "s" : ""} received from the public contact form.
        </p>
      </div>

      {messages.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid rgba(10,21,53,0.08)", padding: "48px 32px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Mail size={20} color="#C9A227" />
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.45)" }}>
            No contact messages yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{ background: "#ffffff", borderRadius: 12, border: "1px solid rgba(10,21,53,0.08)", padding: "20px 24px", boxShadow: "0 1px 4px rgba(10,21,53,0.04)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "#0A1535", marginBottom: 2 }}>
                    {msg.name}
                  </p>
                  <a
                    href={`mailto:${msg.email}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 13, color: "#C9A227", textDecoration: "none" }}
                  >
                    <Mail size={12} /> {msg.email} <ExternalLink size={11} />
                  </a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)" }}>
                    <Clock size={11} />
                    {new Date(msg.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {msg.inquiry && (
                    <span style={{ padding: "2px 8px", background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "#9a7810" }}>
                      {msg.inquiry}
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.7)", lineHeight: 1.65, background: "rgba(10,21,53,0.02)", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(10,21,53,0.05)", margin: 0 }}>
                {msg.message}
              </p>
              <div style={{ marginTop: 14 }}>
                <a
                  href={`mailto:${msg.email}?subject=Re: Your enquiry to Dar Al-Halal Certification`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 6, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#9a7810", textDecoration: "none" }}
                >
                  <Mail size={12} /> Reply via Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
