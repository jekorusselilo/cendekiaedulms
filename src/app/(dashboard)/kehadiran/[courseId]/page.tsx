import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  Heart,
  Users,
  CalendarDays,
} from "lucide-react";

const statusConfig = {
  HADIR: {
    label: "Hadir",
    color: "bg-green-100 text-green-700 border-green-200",
    short: "H",
  },
  IZIN: {
    label: "Izin",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    short: "I",
  },
  SAKIT: {
    label: "Sakit",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    short: "S",
  },
  ALPA: {
    label: "Alpa",
    color: "bg-red-100 text-red-700 border-red-200",
    short: "A",
  },
};

export default async function DetailKehadiranPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;
  const userId = session.user.id;

  // ==================== VERSI DOSEN ====================
  if (role === "DOSEN") {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        meetings: { orderBy: { pertemuanKe: "asc" } },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                nama: true,
                nim: true,
                attendances: {
                  select: { meetingId: true, status: true },
                },
              },
            },
          },
        },
      },
    });

    if (!course) notFound();

    return (
      <div className="space-y-6">
        <Link
          href="/kehadiran"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold">{course.nama}</h1>
          <p className="text-purple-100 mt-1">Kode: {course.kode}</p>

          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-200" />
              <span className="text-sm">
                <span className="font-bold">{course.enrollments.length}</span>{" "}
                Mahasiswa
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-200" />
              <span className="text-sm">
                <span className="font-bold">{course.meetings.length}</span>{" "}
                Pertemuan
              </span>
            </div>
          </div>
        </div>

        {/* Matriks */}
        <Card>
          <CardHeader>
            <CardTitle>Matriks Kehadiran</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {course.enrollments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-slate-500">
                  Belum ada mahasiswa yang terdaftar.
                </p>
              </div>
            ) : course.meetings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-slate-500">
                  Belum ada pertemuan yang dibuat.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-purple-100">
                    <th className="text-left p-3 sticky left-0 bg-white z-10 font-semibold text-slate-700">
                      Mahasiswa
                    </th>
                    {course.meetings.map((m) => (
                      <th
                        key={m.id}
                        className="p-3 text-center min-w-10 font-semibold text-purple-700"
                      >
                        P{m.pertemuanKe}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {course.enrollments.map((e, idx) => (
                    <tr
                      key={e.id}
                      className={`border-b border-slate-100 hover:bg-purple-50/50 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="p-3 sticky left-0 bg-inherit z-10">
                        <div className="font-medium text-slate-800">
                          {e.user.nama}
                        </div>
                        <div className="text-xs text-slate-500">
                          {e.user.nim}
                        </div>
                      </td>
                      {course.meetings.map((m) => {
                        const att = e.user.attendances.find(
                          (a) => a.meetingId === m.id
                        );
                        const status = att?.status;
                        const cfg = status
                          ? statusConfig[status as keyof typeof statusConfig]
                          : null;
                        return (
                          <td key={m.id} className="p-3 text-center">
                            {cfg ? (
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${cfg.color}`}
                                title={cfg.label}
                              >
                                {cfg.short}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs text-slate-400 bg-slate-100 border border-slate-200">
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-purple-50/50 border-purple-100">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Keterangan:
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <LegendItem color="bg-green-100 text-green-700 border-green-200" label="H = Hadir" />
              <LegendItem color="bg-yellow-100 text-yellow-700 border-yellow-200" label="I = Izin" />
              <LegendItem color="bg-blue-100 text-blue-700 border-blue-200" label="S = Sakit" />
              <LegendItem color="bg-red-100 text-red-700 border-red-200" label="A = Alpa" />
              <LegendItem color="bg-slate-100 text-slate-500 border-slate-200" label="- = Belum diinput" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== VERSI MAHASISWA ====================
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      meetings: {
        orderBy: { pertemuanKe: "asc" },
        include: {
          attendances: { where: { userId } },
        },
      },
    },
  });

  if (!course) notFound();

  const sudahDiinput = course.meetings.filter(
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

  return (
    <div className="space-y-6">
      <Link
        href="/kehadiran"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">{course.nama}</h1>
        <p className="text-purple-100 mt-1">Kode: {course.kode}</p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{persen}%</p>
            <p className="text-xs text-purple-600 mt-1">Persentase</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{hadir}</p>
            <p className="text-xs text-green-600 mt-1">Hadir</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-700">{izin}</p>
            <p className="text-xs text-yellow-600 mt-1">Izin</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{sakit}</p>
            <p className="text-xs text-blue-600 mt-1">Sakit</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{alpa}</p>
            <p className="text-xs text-red-600 mt-1">Alpa</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail per pertemuan */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Kehadiran per Pertemuan</CardTitle>
        </CardHeader>
        <CardContent>
          {course.meetings.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Belum ada pertemuan.
            </p>
          ) : (
            <div className="space-y-2">
              {course.meetings.map((m) => {
                const att = m.attendances[0];
                const status = att?.status;
                const cfg = status
                  ? statusConfig[status as keyof typeof statusConfig]
                  : null;
                const Icon = cfg
                  ? cfg.short === "H"
                    ? Check
                    : cfg.short === "I"
                    ? Clock
                    : cfg.short === "S"
                    ? Heart
                    : X
                  : null;

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">
                        Pertemuan {m.pertemuanKe}: {m.judul}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {m.tanggal
                          ? new Date(m.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Tanggal belum ditentukan"}
                      </div>
                    </div>
                    {cfg && Icon ? (
                      <span
                        className={`shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${cfg.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    ) : (
                      <span className="shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Belum diinput
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== KOMPONEN LEGEND ====================
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border ${color}`}
      >
        {label.charAt(0)}
      </span>
      <span className="text-slate-600">{label}</span>
    </div>
  );
}