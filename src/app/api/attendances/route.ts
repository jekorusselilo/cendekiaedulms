import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@/generated/prisma/client";

// GET: ambil kehadiran (filter by meetingId atau courseId)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("meetingId");
  const courseId = searchParams.get("courseId");
  const userId = searchParams.get("userId");

  const where: Prisma.AttendanceWhereInput = {};
  if (meetingId) where.meetingId = meetingId;
  if (userId) where.userId = userId;
  if (courseId) where.meeting = { courseId };

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      user: { select: { id: true, nama: true, nim: true } },
      meeting: { select: { id: true, pertemuanKe: true, judul: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(attendances);
}

// POST: input kehadiran massal (dosen)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: {
    meetingId: string;
    attendances: { userId: string; status: Status }[];
  } = await req.json();

  const { meetingId, attendances } = body;

  if (!meetingId || !Array.isArray(attendances)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const results = await Promise.all(
    attendances.map((a: { userId: string; status: Status }) =>
      prisma.attendance.upsert({
        where: {
          meetingId_userId: { meetingId, userId: a.userId },
        },
        update: { status: a.status },
        create: {
          meetingId,
          userId: a.userId,
          status: a.status,
        },
      })
    )
  );

  return NextResponse.json({ success: true, count: results.length });
}