import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: dosen ubah deadline (perpanjang / buka kembali)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: { deadline?: string | null } = await req.json();

    // Cek assignment & pastikan dosen pemilik
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        meeting: {
          include: { course: { select: { dosenId: true } } },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    if (assignment.meeting.course.dosenId !== session.user.id) {
      return NextResponse.json(
        { error: "Anda bukan pemilik tugas ini" },
        { status: 403 }
      );
    }

    // Update deadline
    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    console.error("Update assignment error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}