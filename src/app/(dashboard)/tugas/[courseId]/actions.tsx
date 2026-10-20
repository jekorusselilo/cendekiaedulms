"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateMeetingInput = {
  courseId: string;
  pertemuanKe: number;
  judul: string;
  tanggal: string | null;
};

export async function createMeeting(input: CreateMeetingInput) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Belum login" };
  }

  if (session.user.role !== "DOSEN") {
    return { error: "Hanya dosen yang bisa membuat pertemuan" };
  }

  if (!input.pertemuanKe || input.pertemuanKe < 1) {
    return { error: "Pertemuan ke- harus diisi minimal 1" };
  }

  if (!input.judul || !input.judul.trim()) {
    return { error: "Judul pertemuan harus diisi" };
  }

  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { id: true, dosenId: true, nama: true },
  });

  if (!course) {
    return { error: "Mata kuliah tidak ditemukan" };
  }

  if (course.dosenId !== session.user.id) {
    return { error: "Anda bukan pemilik mata kuliah ini" };
  }

  const existing = await prisma.meeting.findUnique({
    where: {
      courseId_pertemuanKe: {
        courseId: input.courseId,
        pertemuanKe: input.pertemuanKe,
      },
    },
  });

  if (existing) {
    return {
      error: `Pertemuan ke-${input.pertemuanKe} sudah ada di mata kuliah ini`,
    };
  }

  try {
    await prisma.meeting.create({
      data: {
        courseId: input.courseId,
        pertemuanKe: input.pertemuanKe,
        judul: input.judul.trim(),
        tanggal: input.tanggal ? new Date(input.tanggal) : null,
        isOpen: true,
      },
    });

    revalidatePath(`/tugas/${input.courseId}`);

    return { success: true };
  } catch (err) {
    console.error("Create meeting error:", err);
    return { error: "Gagal membuat pertemuan" };
  }
}