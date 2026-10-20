import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    if (session.user.role !== "DOSEN") {
      return NextResponse.json(
        { error: "Hanya dosen yang bisa membuat tugas" },
        { status: 403 }
      );
    }

    const { meetingId } = await params;
    const { judul, deskripsi, deadline } = await req.json();

    if (!judul) {
      return NextResponse.json(
        { error: "Judul tugas harus diisi" },
        { status: 400 }
      );
    }

    // Cek meeting ada
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting) {
      return NextResponse.json(
        { error: "Pertemuan tidak ditemukan" },
        { status: 404 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        meetingId,
        judul,
        deskripsi: deskripsi || null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}