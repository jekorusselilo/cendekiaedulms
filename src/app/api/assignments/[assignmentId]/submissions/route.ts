import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET: list semua submission untuk assignment ini
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { assignmentId } = await params;

    const where =
      session.user.role === "DOSEN"
        ? { assignmentId }
        : { assignmentId, userId: session.user.id };

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: { select: { id: true, nama: true, nim: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

// POST: mahasiswa submit tugas
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    if (session.user.role !== "MAHASISWA") {
      return NextResponse.json(
        { error: "Hanya mahasiswa yang bisa submit tugas" },
        { status: 403 }
      );
    }

    const { assignmentId } = await params;

    // Cek assignment ada
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    // ==================== VALIDASI DEADLINE ====================
    if (assignment.deadline && new Date() > assignment.deadline) {
      const deadlineStr = assignment.deadline.toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return NextResponse.json(
        {
          error: `Pengumpulan sudah ditutup. Deadline: ${deadlineStr}`,
        },
        { status: 403 }
      );
    }
    // ==========================================================

    // Cek apakah sudah pernah submit
    const existing = await prisma.submission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId: session.user.id,
        },
      },
    });

    // Ambil data form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File jawaban harus diupload" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File harus berformat PDF" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5 MB" },
        { status: 400 }
      );
    }

    // Simpan file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `submission_${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          filePath: `/uploads/${fileName}`,
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          userId: session.user.id,
          filePath: `/uploads/${fileName}`,
        },
      });
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("Submit assignment error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}