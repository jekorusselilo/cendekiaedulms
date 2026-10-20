import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { nim } = await req.json();

    if (!nim) {
      return NextResponse.json({ error: "NIM harus diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { nim },
      select: { pertanyaanKeamanan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "NIM tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ pertanyaan: user.pertanyaanKeamanan });
  } catch (error) {
    console.error("Check NIM error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}