import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Users,
  TrendingUp,
  FileText,
  GraduationCap,
  School,
  ArrowRight,
  Sparkles,
  Clock,
  Award,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const role = session.user.role;
  const nama = session.user.nama;

  // ==================== MAHASISWA ====================
  if (role === "MAHASISWA") {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            dosen: { select: { nama: true } },
            meetings: { select: { id: true } },
          },
        },
      },
    });

    const totalMatkul = enrollments.length;
    const totalPertemuan = enrollments.reduce(
      (sum, e) => sum + e.course.meetings.length,
      0
    );

    const assignments = await prisma.assignment.findMany({
      where: { meeting: { course: { enrollments: { some: { userId } } } } },
      include: {
        submissions: { where: { userId } },
        meeting: {
          include: { course: { select: { nama: true, id: true } } },
        },
      },
      orderBy: { deadline: "asc" },
      take: 5,
    });

    const tugasBelumDikumpul = assignments.filter(
      (a) => a.submissions.length === 0
    );

    const attendances = await prisma.attendance.findMany({ where: { userId } });
    const hadir = attendances.filter((a) => a.status === "HADIR").length;
    const persenHadir =
      attendances.length > 0
        ? Math.round((hadir / attendances.length) * 100)
        : 0;

    return (
      <div className="space-y-6">
        {/* Hero Ungu */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <Sparkles className="w-4 h-4" />
            Dashboard Mahasiswa
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">
            Halo, {nama}! 
          </h1>
          <p className="text-purple-100 mt-1">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Mata Kuliah"
            value={totalMatkul}
            color="purple"
          />
          <StatCard
            icon={CalendarCheck}
            label="Pertemuan"
            value={totalPertemuan}
            color="violet"
          />
          <StatCard
            icon={ClipboardList}
            label="Tugas Aktif"
            value={tugasBelumDikumpul.length}
            color="fuchsia"
          />
          <StatCard
            icon={TrendingUp}
            label="Kehadiran"
            value={`${persenHadir}%`}
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Tugas Mendesak
              </CardTitle>
              <CardDescription>
                {tugasBelumDikumpul.length} tugas menunggu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tugasBelumDikumpul.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  🎉 Tidak ada tugas. Kerja bagus!
                </p>
              ) : (
                <ul className="space-y-2">
                  {tugasBelumDikumpul.slice(0, 4).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{a.judul}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {a.meeting.course.nama}
                        </p>
                      </div>
                      {a.deadline && (
                        <span className="text-xs text-red-600 font-medium ml-2 whitespace-nowrap">
                          {new Date(a.deadline).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Mata Kuliah Saya
              </CardTitle>
              <CardDescription>{totalMatkul} matkul diikuti</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-3">
                    Belum ikut mata kuliah
                  </p>
                  <Link
                    href="/mata-kuliah"
                    className="text-sm text-purple-600 hover:underline inline-flex items-center gap-1"
                  >
                    Daftar sekarang <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {enrollments.slice(0, 4).map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {e.course.nama}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {e.course.dosen.nama}
                        </p>
                      </div>
                      <Link
                        href={`/tugas/${e.course.id}`}
                        className="text-purple-600 text-xs hover:underline whitespace-nowrap ml-2"
                      >
                        Buka →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== DOSEN ====================
  if (role === "DOSEN") {
    const courses = await prisma.course.findMany({
      where: { dosenId: userId },
      include: {
        enrollments: { select: { id: true } },
        meetings: { select: { id: true } },
      },
    });

    const totalMahasiswa = courses.reduce(
      (sum, c) => sum + c.enrollments.length,
      0
    );
    const totalPertemuan = courses.reduce(
      (sum, c) => sum + c.meetings.length,
      0
    );

    const submissions = await prisma.submission.findMany({
      where: {
        assignment: { meeting: { course: { dosenId: userId } } },
        nilai: null,
      },
      include: {
        user: { select: { nama: true, nim: true } },
        assignment: {
          include: {
            meeting: { include: { course: { select: { nama: true, id: true } } } },
          },
        },
      },
      take: 5,
    });

    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <GraduationCap className="w-4 h-4" />
            Dashboard Dosen
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">
            Halo, {nama}! 
          </h1>
          <p className="text-purple-100 mt-1">
            {courses.length} mata kuliah · {totalMahasiswa} mahasiswa
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Matkul Diampu"
            value={courses.length}
            color="purple"
          />
          <StatCard
            icon={Users}
            label="Mahasiswa"
            value={totalMahasiswa}
            color="violet"
          />
          <StatCard
            icon={CalendarCheck}
            label="Pertemuan"
            value={totalPertemuan}
            color="fuchsia"
          />
          <StatCard
            icon={ClipboardList}
            label="Belum Dinilai"
            value={submissions.length}
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Perlu Dinilai
              </CardTitle>
              <CardDescription>
                {submissions.length} pengumpulan menunggu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  🎉 Semua sudah dinilai!
                </p>
              ) : (
                <ul className="space-y-2">
                  {submissions.slice(0, 4).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {s.user.nama}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {s.assignment.judul}
                        </p>
                      </div>
                      <Link
                        href={`/tugas/${s.assignment.meeting.course.id}/${s.assignment.meeting.id}/${s.assignment.id}`}
                        className="text-purple-600 text-xs hover:underline whitespace-nowrap ml-2"
                      >
                        Nilai →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5 text-purple-600" />
                Mata Kuliah Diampu
              </CardTitle>
              <CardDescription>
                {courses.length} mata kuliah aktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Belum ada mata kuliah
                </p>
              ) : (
                <ul className="space-y-2">
                  {courses.slice(0, 4).map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{c.nama}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {c.kode} · {c.enrollments.length} mahasiswa ·{" "}
                          {c.meetings.length} pertemuan
                        </p>
                      </div>
                      <Link
                        href={`/tugas/${c.id}`}
                        className="text-purple-600 text-xs hover:underline whitespace-nowrap ml-2"
                      >
                        Buka →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== ADMIN ====================
  const [
    totalUsers,
    totalCourses,
    totalMeetings,
    totalSubmissions,
    totalMahasiswa,
    totalDosen,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.meeting.count(),
    prisma.submission.count(),
    prisma.user.count({ where: { role: "MAHASISWA" } }),
    prisma.user.count({ where: { role: "DOSEN" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-purple-700 via-violet-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <Sparkles className="w-4 h-4" />
          Admin Control Panel
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Halo, {nama}! 
        </h1>
        <p className="text-purple-100 mt-1">
          Kelola platform Online Learning dari sini
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total User"
          value={totalUsers}
          color="purple"
        />
        <StatCard
          icon={School}
          label="Mata Kuliah"
          value={totalCourses}
          color="violet"
        />
        <StatCard
          icon={CalendarCheck}
          label="Pertemuan"
          value={totalMeetings}
          color="fuchsia"
        />
        <StatCard
          icon={FileText}
          label="Pengumpulan"
          value={totalSubmissions}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">
              {totalMahasiswa}
            </p>
            <p className="text-sm text-slate-500 mt-1">akun terdaftar</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Dosen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-violet-600">{totalDosen}</p>
            <p className="text-sm text-slate-500 mt-1">akun terdaftar</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Menu Admin</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MenuCard
            href="/admin/users"
            icon={Users}
            title="Kelola User"
            description="Lihat, tambah, ubah role user"
            color="purple"
          />
          <MenuCard
            href="/admin/courses"
            icon={School}
            title="Kelola Mata Kuliah"
            description="Tambah & atur mata kuliah"
            color="violet"
          />
          <MenuCard
            href="/admin/stats"
            icon={TrendingUp}
            title="Statistik"
            description="Lihat aktivitas platform"
            color="fuchsia"
          />
        </div>
      </div>
    </div>
  );
}

// ==================== KOMPONEN ====================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: "purple" | "violet" | "fuchsia" | "indigo";
}) {
  const colors = {
    purple: "bg-purple-100 text-purple-600",
    violet: "bg-violet-100 text-violet-600",
    fuchsia: "bg-fuchsia-100 text-fuchsia-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-xs md:text-sm text-slate-500">{label}</p>
        <p className="text-xl md:text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function MenuCard({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: "purple" | "violet" | "fuchsia";
}) {
  const colors = {
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    violet: "bg-violet-50 text-violet-600 hover:bg-violet-100",
    fuchsia: "bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100",
  };

  return (
    <Link
      href={href}
      className={`p-5 rounded-xl border transition block ${colors[color]}`}
    >
      <Icon className="w-8 h-8 mb-3" />
      <p className="font-semibold">{title}</p>
      <p className="text-xs mt-1 opacity-80">{description}</p>
    </Link>
  );
}