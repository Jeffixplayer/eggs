import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [events, vacations] = await Promise.all([
    prisma.calendarEvent.findMany(),
    prisma.vacationRequest.findMany({ where: { status: "APPROVED" }, include: { user: true } }),
  ]);
  const vacEvents = vacations.map((v) => ({ id: v.id, title: `Szabadság: ${v.user.email}`, start: v.startDate, end: v.endDate, backgroundColor: "#fde68a" }));
  const formatted = events.map((e) => ({ id: e.id, title: e.title, start: e.start, end: e.end }));
  return NextResponse.json([...formatted, ...vacEvents]);
}