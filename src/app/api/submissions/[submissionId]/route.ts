import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: dosen beri nilai & feedback
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    if (session.user.role !== "DOSEN") {
      return NextResponse.json(
        { error: "Hanya dosen yang bisa memberi nilai" },
        { status: 403 }
      );
    }

    const { submissionId } = await params;
    const { nilai, feedback } = await req.json();

    if (nilai === undefined || nilai === null) {
      return NextResponse.json(
        { error: "Nilai harus diisi" },
        { status: 400 }
      );
    }

    const nilaiNum = Number(nilai);
    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
      return NextResponse.json(
        { error: "Nilai harus antara 0-100" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      return NextResponse.json(
        { error: "Submission tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        nilai: nilaiNum,
        feedback: feedback || null,
      },
    });

    return NextResponse.json({ submission: updated });
  } catch (error) {
    console.error("Grade submission error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}