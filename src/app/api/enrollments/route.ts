import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: list enrollment
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const userId = searchParams.get("userId");

  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(userId ? { userId } : {}),
    },
    include: {
      user: { select: { id: true, nama: true, nim: true, role: true } },
      course: { select: { id: true, nama: true, kode: true } },
    },
  });

  return NextResponse.json(enrollments);
}

// POST: enroll mahasiswa ke matkul
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: { courseId: string; userId?: string } = await req.json();
  const { courseId, userId } = body;

  if (!courseId) {
    return NextResponse.json({ error: "courseId wajib" }, { status: 400 });
  }

  // Kalau dosen/admin, boleh enroll mahasiswa lain. Kalau mahasiswa, cuma dirinya.
  const targetUserId =
    session.user.role === "MAHASISWA" ? session.user.id : userId;

  if (!targetUserId) {
    return NextResponse.json({ error: "userId wajib" }, { status: 400 });
  }

  // Cek sudah enroll atau belum
  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: targetUserId, courseId },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Sudah terdaftar di mata kuliah ini" },
      { status: 400 }
    );
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId: targetUserId, courseId },
  });

  return NextResponse.json(enrollment);
}

// DELETE: unenroll
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role === "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id wajib" }, { status: 400 });
  }

  await prisma.enrollment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}