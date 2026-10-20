import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, nim, password, pertanyaanKeamanan, jawabanKeamanan } = body;

    // ==================== VALIDASI INPUT ====================
    if (!nama || !nim || !password || !pertanyaanKeamanan || !jawabanKeamanan) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Validasi NIM (minimal 3 karakter)
    if (nim.trim().length < 3) {
      return NextResponse.json(
        { error: "NIM minimal 3 karakter" },
        { status: 400 }
      );
    }

    // Validasi password — MINIMAL 8 KARAKTER
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Validasi password — HARUS ADA HURUF
    if (!/[a-zA-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password harus mengandung huruf" },
        { status: 400 }
      );
    }

    // Validasi password — HARUS ADA ANGKA
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password harus mengandung angka" },
        { status: 400 }
      );
    }

    // Validasi nama (minimal 2 karakter)
    if (nama.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama minimal 2 karakter" },
        { status: 400 }
      );
    }

    // ==================== CEK NIM DUPLIKAT ====================
    const existingUser = await prisma.user.findUnique({
      where: { nim },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "NIM sudah terdaftar" },
        { status: 400 }
      );
    }

    // ==================== HASH & SIMPAN ====================
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedJawaban = await bcrypt.hash(
      jawabanKeamanan.toLowerCase().trim(),
      10
    );

    const newUser = await prisma.user.create({
      data: {
        nama: nama.trim(),
        nim: nim.trim(),
        password: hashedPassword,
        pertanyaanKeamanan,
        jawabanKeamanan: hashedJawaban,
        role: "MAHASISWA",
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: newUser.id,
          nama: newUser.nama,
          nim: newUser.nim,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}