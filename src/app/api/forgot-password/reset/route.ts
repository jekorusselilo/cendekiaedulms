import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { nim, jawabanKeamanan, passwordBaru } = await req.json();

    // ==================== VALIDASI INPUT ====================
    if (!nim || !jawabanKeamanan || !passwordBaru) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Validasi password — MINIMAL 8 KARAKTER
    if (passwordBaru.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Validasi password — HARUS ADA HURUF
    if (!/[a-zA-Z]/.test(passwordBaru)) {
      return NextResponse.json(
        { error: "Password harus mengandung huruf" },
        { status: 400 }
      );
    }

    // Validasi password — HARUS ADA ANGKA
    if (!/[0-9]/.test(passwordBaru)) {
      return NextResponse.json(
        { error: "Password harus mengandung angka" },
        { status: 400 }
      );
    }

    // ==================== CEK USER ====================
    const user = await prisma.user.findUnique({ where: { nim } });

    if (!user) {
      return NextResponse.json(
        { error: "NIM tidak ditemukan" },
        { status: 404 }
      );
    }

    // ==================== CEK JAWABAN KEAMANAN ====================
    const jawabanMatch = await bcrypt.compare(
      jawabanKeamanan.toLowerCase().trim(),
      user.jawabanKeamanan
    );

    if (!jawabanMatch) {
      return NextResponse.json(
        { error: "Jawaban keamanan salah" },
        { status: 400 }
      );
    }

    // ==================== HASH & UPDATE ====================
    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    await prisma.user.update({
      where: { nim },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}