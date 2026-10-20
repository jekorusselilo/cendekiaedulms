import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        course: {
          select: {
            id: true,
            nama: true,
            kode: true,
            dosen: { select: { nama: true } },
          },
        },
        materials: {
          orderBy: { createdAt: "asc" },
        },
        assignments: {
          orderBy: { createdAt: "asc" },
          include: {
            submissions: {
              include: {
                user: { select: { id: true, nama: true, nim: true } },
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Pertemuan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error("Get meeting detail error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
} 