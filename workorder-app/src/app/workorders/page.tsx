import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function WorkOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getServerSession(authOptions);
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const role = (session as any)?.user?.role as string | undefined;
  const userId = (session as any)?.user?.id as string | undefined;

  const where = {
    AND: [
      q ? { OR: [
        { title: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ] } : {},
      role === "EMPLOYEE" && userId ? { technicianId: userId } : {},
    ],
  } as any;

  const orders = await prisma.workOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Munkalapok</h1>
        <Link href="/workorders/new" className="px-3 py-2 rounded bg-black text-white">Új munkalap</Link>
      </div>

      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Keresés cím/ügyfél/leírás" className="border px-3 py-2 rounded w-full" />
        <button className="border px-3 py-2 rounded">Keresés</button>
      </form>

      <ul className="divide-y">
        {orders.map((o) => (
          <li key={o.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{o.title}</div>
              <div className="text-sm text-gray-600">{o.customerName} • {new Date(o.date).toLocaleDateString()} • {o.status === "IN_PROGRESS" ? "Folyamatban" : "Kész"}</div>
            </div>
            <Link className="text-blue-600" href={`/workorders/${o.id}`}>Megnyitás</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}