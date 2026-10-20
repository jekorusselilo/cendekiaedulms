import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: ambil data user yang sedang login
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nama: true,
      nim: true,
      role: true,
      pertanyaanKeamanan: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

// PATCH: update profil & password
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: {
    nama?: string;
    passwordLama?: string;
    passwordBaru?: string;
    pertanyaanKeamanan?: string;
    jawabanKeamanan?: string;
  } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const updateData: {
    nama?: string;
    password?: string;
    pertanyaanKeamanan?: string;
    jawabanKeamanan?: string;
  } = {};

  // Update nama (kalau ada)
  if (body.nama && body.nama.trim()) {
    updateData.nama = body.nama.trim();
  }

  // Update password (kalau ada)
  if (body.passwordBaru) {
    if (!body.passwordLama) {
      return NextResponse.json(
        { error: "Password lama wajib diisi" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(body.passwordLama, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password lama salah" },
        { status: 400 }
      );
    }

    // Validasi: minimal 8 karakter
    if (body.passwordBaru.length < 8) {
      return NextResponse.json(
        { error: "Password baru minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Validasi: harus ada huruf
    if (!/[a-zA-Z]/.test(body.passwordBaru)) {
      return NextResponse.json(
        { error: "Password harus mengandung huruf" },
        { status: 400 }
      );
    }

    // Validasi: harus ada angka
    if (!/[0-9]/.test(body.passwordBaru)) {
      return NextResponse.json(
        { error: "Password harus mengandung angka" },
        { status: 400 }
      );
    }

    updateData.password = await bcrypt.hash(body.passwordBaru, 10);
  }

  // Update pertanyaan keamanan (kalau ada)
  if (body.pertanyaanKeamanan && body.jawabanKeamanan) {
    updateData.pertanyaanKeamanan = body.pertanyaanKeamanan;
    updateData.jawabanKeamanan = await bcrypt.hash(
      body.jawabanKeamanan.toLowerCase().trim(),
      10
    );
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada yang diubah" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}