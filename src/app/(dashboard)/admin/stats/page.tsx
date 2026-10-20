import { prisma } from "@/lib/prisma";
import {
  BarChart3,
  Users,
  GraduationCap,
  School,
  CalendarDays,
  ClipboardList,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default async function AdminStatsPage() {
  // Ambil semua statistik paralel
  const [
    totalUsers,
    totalMahasiswa,
    totalDosen,
    totalAdmin,
    totalCourses,
    totalMeetings,
    totalAssignments,
    totalSubmissions,
    totalMaterials,
    totalAttendances,
    recentUsers,
    coursesWithStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "MAHASISWA" } }),
    prisma.user.count({ where: { role: "DOSEN" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.course.count(),
    prisma.meeting.count(),
    prisma.assignment.count(),
    prisma.submission.count(),
    prisma.material.count(),
    prisma.attendance.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, nama: true, nim: true, role: true, createdAt: true },
    }),
    prisma.course.findMany({
      include: {
        _count: {
          select: { enrollments: true, meetings: true },
        },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
  ]);

  // Hitung submission yang sudah dinilai
  const gradedSubmissions = await prisma.submission.count({
    where: { nilai: { not: null } },
  });

  const persenDinilai =
    totalSubmissions > 0
      ? Math.round((gradedSubmissions / totalSubmissions) * 100)
      : 0;

  // Hitung kehadiran
  const hadir = await prisma.attendance.count({
    where: { status: "HADIR" },
  });
  const persenHadir =
    totalAttendances > 0 ? Math.round((hadir / totalAttendances) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <BarChart3 className="w-4 h-4" />
          Admin Panel
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Statistik Platform
        </h1>
        <p className="text-purple-100 mt-1">
          Analitik & aktivitas platform Online Learning
        </p>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Total User</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Total Matkul</p>
            <p className="text-2xl font-bold">{totalCourses}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Total Submission</p>
            <p className="text-2xl font-bold">{totalSubmissions}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Kehadiran</p>
            <p className="text-2xl font-bold">{persenHadir}%</p>
          </div>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total User"
          value={totalUsers}
          sublabel={`${totalMahasiswa} Mhs · ${totalDosen} Dosen · ${totalAdmin} Admin`}
          color="purple"
        />
        <StatCard
          icon={School}
          label="Mata Kuliah"
          value={totalCourses}
          sublabel={`${totalMeetings} pertemuan`}
          color="violet"
        />
        <StatCard
          icon={ClipboardList}
          label="Tugas"
          value={totalAssignments}
          sublabel={`${totalSubmissions} pengumpulan`}
          color="fuchsia"
        />
        <StatCard
          icon={FileText}
          label="Materi"
          value={totalMaterials}
          sublabel={`${totalAttendances} kehadiran tercatat`}
          color="indigo"
        />
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Penilaian */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              Progress Penilaian
            </h3>
            <span className="text-2xl font-bold text-purple-600">
              {persenDinilai}%
            </span>
          </div>
          <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
              style={{ width: `${persenDinilai}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {gradedSubmissions} dari {totalSubmissions} submission sudah dinilai
          </p>
        </div>

        {/* Progress Kehadiran */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Rata-rata Kehadiran
            </h3>
            <span className="text-2xl font-bold text-purple-600">
              {persenHadir}%
            </span>
          </div>
          <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
              style={{ width: `${persenHadir}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {hadir} dari {totalAttendances} kehadiran berstatus &quot;Hadir&quot;
          </p>
        </div>
      </div>

      {/* Grid 2 kolom: User Terbaru & Matkul Populer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Terbaru */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            User Terbaru
          </h3>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Belum ada user.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentUsers.map((u) => {
                const roleColor: Record<string, string> = {
                  MAHASISWA: "bg-blue-100 text-blue-700",
                  DOSEN: "bg-green-100 text-green-700",
                  ADMIN: "bg-purple-100 text-purple-700",
                };
                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{u.nama}</p>
                      <p className="text-xs text-slate-500">{u.nim}</p>
                    </div>
                    <span
                      className={`shrink-0 ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        roleColor[u.role] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Matkul Populer */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Mata Kuliah Terpopuler
          </h3>
          {coursesWithStats.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Belum ada matkul.
            </p>
          ) : (
            <ul className="space-y-2">
              {coursesWithStats.map((c, idx) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{c.nama}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {c.kode}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2 text-right">
                    <p className="text-sm font-bold text-purple-600">
                      {c._count.enrollments}
                    </p>
                    <p className="text-xs text-slate-500">mahasiswa</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sublabel?: string;
  color: "purple" | "violet" | "fuchsia" | "indigo";
}) {
  const colors = {
    purple: "bg-purple-100 text-purple-600",
    violet: "bg-violet-100 text-violet-600",
    fuchsia: "bg-fuchsia-100 text-fuchsia-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs md:text-sm text-slate-500">{label}</p>
      <p className="text-xl md:text-2xl font-bold mt-1">{value}</p>
      {sublabel && (
        <p className="text-xs text-slate-400 mt-1 truncate">{sublabel}</p>
      )}
    </div>
  );
}