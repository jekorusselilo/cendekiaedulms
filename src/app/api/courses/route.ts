import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: list semua mata kuliah
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        dosen: { select: { nama: true } },
        _count: { select: { meetings: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Get courses error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

// POST: bikin mata kuliah baru (hanya DOSEN)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    if (session.user.role !== "DOSEN") {
      return NextResponse.json(
        { error: "Hanya dosen yang bisa membuat mata kuliah" },
        { status: 403 }
      );
    }

    const { nama, kode, deskripsi } = await req.json();

    if (!nama || !kode) {
      return NextResponse.json(
        { error: "Nama & kode mata kuliah harus diisi" },
        { status: 400 }
      );
    }

    // Cek kode duplikat
    const existing = await prisma.course.findUnique({ where: { kode } });
    if (existing) {
      return NextResponse.json(
        { error: "Kode mata kuliah sudah dipakai" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        nama,
        kode,
        deskripsi: deskripsi || null,
        dosenId: session.user.id,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}