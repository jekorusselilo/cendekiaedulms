import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: update role user (khusus admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body: { role?: string } = await req.json();

  if (!body.role || !["MAHASISWA", "DOSEN", "ADMIN"].includes(body.role)) {
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  }

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Tidak bisa mengubah role diri sendiri" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: body.role as "MAHASISWA" | "DOSEN" | "ADMIN" },
  });

  return NextResponse.json({ success: true, user: updated });
}

// DELETE: hapus user (khusus admin)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus user (mungkin masih punya data terkait)" },
      { status: 400 }
    );
  }
}