import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const where: any = {
    AND: [
      q ? { OR: [
        { title: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ] } : {},
    ],
  };
  if ((session as any).user.role === "EMPLOYEE") {
    where.technicianId = (session as any).user.id;
  }
  const data = await prisma.workOrder.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, date, customerName, description } = body ?? {};
  if (!title || !date || !customerName) {
    return NextResponse.json({ error: "Hiányzó mezők" }, { status: 400 });
  }
  const created = await prisma.workOrder.create({
    data: {
      title,
      date: new Date(date),
      customerName,
      description,
      technicianId: (session as any).user.id,
      createdById: (session as any).user.id,
    },
  });
  await prisma.workOrderVersion.create({ data: { workOrderId: created.id, versionNumber: 1, data: created as any } });
  return NextResponse.json({ id: created.id });
}