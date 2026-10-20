import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    // 1. Cek login & role
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    if (session.user.role !== "DOSEN") {
      return NextResponse.json(
        { error: "Hanya dosen yang bisa upload materi" },
        { status: 403 }
      );
    }

    const { meetingId } = await params;

    // 2. Cek meeting ada
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting) {
      return NextResponse.json(
        { error: "Pertemuan tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Ambil data form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const judul = formData.get("judul") as string | null;

    if (!file || !judul) {
      return NextResponse.json(
        { error: "File & judul harus diisi" },
        { status: 400 }
      );
    }

    // 4. Validasi tipe file
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File harus berformat PDF" },
        { status: 400 }
      );
    }

    // 5. Validasi ukuran (maks 5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5 MB" },
        { status: 400 }
      );
    }

    // 6. Simpan file ke public/uploads/
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // 7. Simpan record ke database
    const material = await prisma.material.create({
      data: {
        meetingId,
        judul,
        filePath: `/uploads/${fileName}`,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error("Upload material error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}