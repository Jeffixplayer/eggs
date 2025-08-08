import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [users, vacations] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.vacationRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { user: true } }),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin</h1>
      <section>
        <h2 className="font-medium mb-2">Felhasználók</h2>
        <ul className="divide-y">
          {users.map(u => (
            <li key={u.id} className="py-2 text-sm flex justify-between">
              <span>{u.email}</span>
              <span className="text-gray-600">{u.role}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium mb-2">Szabadság igények</h2>
        <ul className="divide-y">
          {vacations.map(v => (
            <li key={v.id} className="py-2 text-sm flex justify-between">
              <span>{v.user.email}: {new Date(v.startDate).toLocaleDateString()} → {new Date(v.endDate).toLocaleDateString()}</span>
              <span className="text-gray-600">{v.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}