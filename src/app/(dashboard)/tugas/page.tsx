import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  CalendarDays,
  ClipboardList,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { CreateCourseButton } from "./create-course-button";

export default async function TugasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = session.user.role;
  const isDosen = role === "DOSEN";
  const isMahasiswa = role === "MAHASISWA";

  // ==================== QUERY DATABASE ====================
  let courses: Array<{
    id: string;
    nama: string;
    kode: string;
    deskripsi: string | null;
    dosen: { nama: string };
    _count: { meetings: number; enrollments: number };
  }> = [];

  if (isDosen) {
    // Dosen: matkul yang dia ampu
    const data = await prisma.course.findMany({
      where: { dosenId: userId },
      include: {
        dosen: { select: { nama: true } },
        _count: {
          select: { meetings: true, enrollments: true },
        },
      },
      orderBy: { nama: "asc" },
    });
    courses = data;
  } else if (isMahasiswa) {
    // Mahasiswa: matkul yang dia ikuti
    const data = await prisma.course.findMany({
      where: {
        enrollments: { some: { userId } },
      },
      include: {
        dosen: { select: { nama: true } },
        _count: {
          select: { meetings: true, enrollments: true },
        },
      },
      orderBy: { nama: "asc" },
    });
    courses = data;
  } else {
    // Admin: semua matkul
    const data = await prisma.course.findMany({
      include: {
        dosen: { select: { nama: true } },
        _count: {
          select: { meetings: true, enrollments: true },
        },
      },
      orderBy: { nama: "asc" },
    });
    courses = data;
  }

  // ==================== HITUNG STATISTIK ====================
  const totalMahasiswa = courses.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0
  );
  const totalPertemuan = courses.reduce(
    (sum, c) => sum + (c._count?.meetings || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              {isDosen ? (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Dashboard Dosen
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Mata Kuliah Saya
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              {isDosen ? "Mata Kuliah Saya" : "Mata Kuliah"}
            </h1>
            <p className="text-purple-100 mt-1">
              {isDosen
                ? "Kelola materi, tugas, dan pertemuan"
                : "Materi, tugas, dan pertemuan dari mata kuliah yang Anda ikuti"}
            </p>
          </div>

          {/* Tombol Buat Matkul (dosen) — client component */}
          {isDosen && <CreateCourseButton />}
        </div>

        {/* Stat inline */}
        {courses.length > 0 && (
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
            <div>
              <p className="text-purple-200 text-xs">Mata Kuliah</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
            {isDosen && (
              <>
                <div>
                  <p className="text-purple-200 text-xs">Total Mahasiswa</p>
                  <p className="text-2xl font-bold">{totalMahasiswa}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-xs">Total Pertemuan</p>
                  <p className="text-2xl font-bold">{totalPertemuan}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 mx-auto flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">
              Belum ada mata kuliah
            </p>
            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
              {isDosen
                ? "Mulai dengan membuat mata kuliah pertama Anda. Klik tombol di bawah untuk memulai."
                : "Anda belum terdaftar di mata kuliah mana pun. Silakan daftar terlebih dahulu."}
            </p>
            {isMahasiswa && (
              <Link
                href="/mata-kuliah"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
              >
                Daftar Mata Kuliah
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link key={course.id} href={`/tugas/${course.id}`}>
              <Card className="hover:shadow-lg hover:border-purple-300 transition group h-full cursor-pointer">
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 shrink-0 ml-2">
                      {course.kode}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-purple-700 transition">
                    {course.nama}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                    {isDosen
                      ? course.deskripsi || "Tidak ada deskripsi"
                      : course.dosen.nama}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <CalendarDays className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="font-bold text-sm text-purple-700">
                        {course._count?.meetings || 0}
                      </p>
                      <p className="text-xs text-slate-500">Pertemuan</p>
                    </div>
                    <div className="text-center p-2 bg-violet-50 rounded-lg">
                      {isDosen ? (
                        <>
                          <Users className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                          <p className="font-bold text-sm text-violet-700">
                            {course._count?.enrollments || 0}
                          </p>
                          <p className="text-xs text-slate-500">Mahasiswa</p>
                        </>
                      ) : (
                        <>
                          <ClipboardList className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                          <p className="font-bold text-sm text-violet-700">
                            Tugas
                          </p>
                          <p className="text-xs text-slate-500">
                            {course.dosen.nama.split(" ")[0]}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Buka matkul
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}