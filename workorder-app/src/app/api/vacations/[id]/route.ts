import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session as any).user.role !== "ADMIN" && (session as any).user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop() as string;
  const body = await req.json();
  const status = body?.status as "APPROVED" | "REJECTED" | undefined;
  if (!status) return NextResponse.json({ error: "Hiányzó státusz" }, { status: 400 });
  const updated = await prisma.vacationRequest.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}