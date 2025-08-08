import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop() as string;
  const order = await prisma.workOrder.findUnique({ where: { id }, include: { signatures: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((session as any).user.role === "EMPLOYEE" && order.technicianId !== (session as any).user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop() as string;
  const order = await prisma.workOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((session as any).user.role === "EMPLOYEE" && order.technicianId !== (session as any).user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.signature) {
    await prisma.signature.create({ data: { workOrderId: id, signer: body.signature.signer, imageData: body.signature.imageData } });
    return NextResponse.json({ ok: true });
  }
  const updated = await prisma.workOrder.update({
    where: { id },
    data: {
      title: body.title ?? order.title,
      date: body.date ? new Date(body.date) : order.date,
      customerName: body.customerName ?? order.customerName,
      description: body.description ?? order.description,
      internalNote: body.internalNote ?? order.internalNote,
      status: body.status ?? order.status,
      autoSavedAt: new Date(),
    },
  });
  const latestVersion = await prisma.workOrderVersion.findFirst({ where: { workOrderId: id }, orderBy: { versionNumber: "desc" } });
  await prisma.workOrderVersion.create({ data: { workOrderId: id, versionNumber: (latestVersion?.versionNumber ?? 0) + 1, data: updated as any } });
  return NextResponse.json(updated);
}