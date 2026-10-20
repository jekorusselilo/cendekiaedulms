import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarCheck,
  Users,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default async function KehadiranPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const role = session.user.role;

  // ==================== DOSEN ====================
  if (role === "DOSEN") {
    const courses = await prisma.course.findMany({
      where: { dosenId: userId },
      include: {
        enrollments: { select: { id: true } },
        meetings: { select: { id: true } },
      },
      orderBy: { nama: "asc" },
    });

    const totalMahasiswa = courses.reduce(
      (sum, c) => sum + c.enrollments.length,
      0
    );
    const totalPertemuan = courses.reduce(
      (sum, c) => sum + c.meetings.length,
      0
    );

    return (
      <div className="space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <CalendarCheck className="w-4 h-4" />
            Manajemen Kehadiran
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">
            Kehadiran Kelas
          </h1>
          <p className="text-purple-100 mt-1">
            Kelola kehadiran mahasiswa di mata kuliah yang Anda ampu
          </p>

          {/* Stat inline */}
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
            <div>
              <p className="text-purple-200 text-xs">Mata Kuliah</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs">Total Mahasiswa</p>
              <p className="text-2xl font-bold">{totalMahasiswa}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs">Total Pertemuan</p>
              <p className="text-2xl font-bold">{totalPertemuan}</p>
            </div>
          </div>
        </div>

        {/* List Matkul */}
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-slate-500">
                Anda belum mengampu mata kuliah apa pun.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => (
              <Card
                key={c.id}
                className="hover:shadow-lg hover:border-purple-300 transition group"
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg truncate">
                        {c.nama}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Kode: {c.kode}
                      </p>
                    </div>
                    <span className="shrink-0 ml-2 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {c.kode}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Mahasiswa</p>
                        <p className="font-bold text-purple-700">
                          {c.enrollments.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg">
                      <CalendarDays className="w-4 h-4 text-violet-600 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Pertemuan</p>
                        <p className="font-bold text-violet-700">
                          {c.meetings.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/kehadiran/${c.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm group-hover:shadow-md"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Lihat Detail Kehadiran
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==================== MAHASISWA ====================
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          meetings: {
            include: {
              attendances: { where: { userId } },
            },
          },
        },
      },
    },
  });

  const rekap = enrollments.map((e) => {
    const totalPertemuan = e.course.meetings.length;
    const sudahDiinput = e.course.meetings.filter(
      (m) => m.attendances.length > 0
    );
    const hadir = sudahDiinput.filter(
      (m) => m.attendances[0].status === "HADIR"
    ).length;
    const izin = sudahDiinput.filter(
      (m) => m.attendances[0].status === "IZIN"
    ).length;
    const sakit = sudahDiinput.filter(
      (m) => m.attendances[0].status === "SAKIT"
    ).length;
    const alpa = sudahDiinput.filter(
      (m) => m.attendances[0].status === "ALPA"
    ).length;
    const persen =
      sudahDiinput.length > 0
        ? Math.round((hadir / sudahDiinput.length) * 100)
        : 0;

    return {
      courseId: e.course.id,
      nama: e.course.nama,
      kode: e.course.kode,
      totalPertemuan,
      sudahDiinput: sudahDiinput.length,
      hadir,
      izin,
      sakit,
      alpa,
      persen,
    };
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <CalendarCheck className="w-4 h-4" />
          Rekap Kehadiran
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">Kehadiran Saya</h1>
        <p className="text-purple-100 mt-1">
          Rekap kehadiran Anda di semua mata kuliah
        </p>
      </div>

      {rekap.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-3">
              Belum ada mata kuliah yang Anda ikuti.
            </p>
            <Link
              href="/mata-kuliah"
              className="text-purple-600 hover:underline text-sm inline-flex items-center gap-1"
            >
              Daftar mata kuliah <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rekap.map((r) => (
            <Link key={r.courseId} href={`/kehadiran/${r.courseId}`}>
              <Card className="hover:shadow-lg hover:border-purple-300 transition cursor-pointer">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg truncate">
                        {r.nama}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {r.kode}
                      </p>
                    </div>
                    <div className="shrink-0 text-right ml-2">
                      <p className="text-3xl font-bold text-purple-600">
                        {r.persen}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.hadir}/{r.sudahDiinput}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
                      style={{ width: `${r.persen}%` }}
                    />
                  </div>

                  {/* Statistik */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="font-bold text-green-700 text-sm">
                        {r.hadir}
                      </p>
                      <p className="text-xs text-green-600">Hadir</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <p className="font-bold text-yellow-700 text-sm">
                        {r.izin}
                      </p>
                      <p className="text-xs text-yellow-600">Izin</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="font-bold text-blue-700 text-sm">
                        {r.sakit}
                      </p>
                      <p className="text-xs text-blue-600">Sakit</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="font-bold text-red-700 text-sm">
                        {r.alpa}
                      </p>
                      <p className="text-xs text-red-600">Alpa</p>
                    </div>
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