import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    if (session.user.role !== "DOSEN") {
      return NextResponse.json(
        { error: "Hanya dosen yang bisa membuat pertemuan" },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const { judul, tanggal } = await req.json();

    if (!judul) {
      return NextResponse.json(
        { error: "Judul pertemuan harus diisi" },
        { status: 400 }
      );
    }

    // Cek course ada
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json(
        { error: "Mata kuliah tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung pertemuanKe otomatis
    const lastMeeting = await prisma.meeting.findFirst({
      where: { courseId },
      orderBy: { pertemuanKe: "desc" },
    });
    const pertemuanKe = (lastMeeting?.pertemuanKe || 0) + 1;

    const meeting = await prisma.meeting.create({
      data: {
        courseId,
        pertemuanKe,
        judul,
        tanggal: tanggal ? new Date(tanggal) : null,
        isOpen: true,
      },
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}