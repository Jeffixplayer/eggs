import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const where = (session as any).user.role === "EMPLOYEE" ? { userId: (session as any).user.id } : {};
  const list = await prisma.vacationRequest.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { startDate, endDate, reason } = body ?? {};
  if (!startDate || !endDate) return NextResponse.json({ error: "Hiányzó dátum" }, { status: 400 });
  const created = await prisma.vacationRequest.create({ data: { userId: (session as any).user.id, startDate: new Date(startDate), endDate: new Date(endDate), reason } });
  return NextResponse.json(created);
}