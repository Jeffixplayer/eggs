import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Irányítópult</h1>
      <p className="text-sm text-gray-600">Szerepkör: {(session as any)?.user?.role}</p>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/workorders" className="border rounded p-4 hover:bg-gray-50">Munkalapok</Link>
        <Link href="/calendar" className="border rounded p-4 hover:bg-gray-50">Naptár</Link>
        <Link href="/admin" className="border rounded p-4 hover:bg-gray-50">Admin</Link>
      </div>
    </div>
  );
}