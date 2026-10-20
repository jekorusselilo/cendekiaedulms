import { prisma } from "@/lib/prisma";
import { Activity } from "lucide-react";
import { ActivityFeed } from "./activity-feed";

export default async function AdminLogsPage() {
  // Ambil semua aktivitas paralel
  const [
    recentSubmissions,
    recentMaterials,
    recentAssignments,
    recentUsers,
    recentMeetings,
  ] = await Promise.all([
    prisma.submission.findMany({
      take: 10,
      orderBy: { submittedAt: "desc" },
      include: {
        user: { select: { nama: true, nim: true } },
        assignment: {
          include: {
            meeting: {
              include: { course: { select: { nama: true, kode: true } } },
            },
          },
        },
      },
    }),
    prisma.material.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        uploader: { select: { nama: true, nim: true } },
        meeting: {
          include: { course: { select: { nama: true, kode: true } } },
        },
      },
    }),
    prisma.assignment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        meeting: {
          include: {
            course: {
              select: {
                nama: true,
                kode: true,
                dosen: { select: { nama: true } },
              },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, nama: true, nim: true, role: true, createdAt: true },
    }),
    prisma.meeting.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          select: {
            nama: true,
            kode: true,
            dosen: { select: { nama: true } },
          },
        },
      },
    }),
  ]);

  // Gabung jadi 1 array aktivitas
  type Activity = {
    id: string;
    type: "submission" | "material" | "assignment" | "user" | "meeting";
    title: string;
    description: string;
    timestamp: string;
    actor: string;
  };

  const activities: Activity[] = [
    ...recentSubmissions.map((s) => ({
      id: `sub-${s.id}`,
      type: "submission" as const,
      title: `${s.user.nama} mengumpulkan tugas`,
      description: `${s.assignment.judul} · ${s.assignment.meeting.course.nama}`,
      timestamp: s.submittedAt.toISOString(),
      actor: s.user.nim,
    })),
    ...recentMaterials.map((m) => ({
      id: `mat-${m.id}`,
      type: "material" as const,
      title: `${m.uploader.nama} mengunggah materi`,
      description: `${m.judul} · ${m.meeting.course.nama}`,
      timestamp: m.createdAt.toISOString(),
      actor: m.uploader.nim,
    })),
    ...recentAssignments.map((a) => ({
      id: `asg-${a.id}`,
      type: "assignment" as const,
      title: `Tugas baru dibuat`,
      description: `${a.judul} · ${a.meeting.course.nama}`,
      timestamp: a.createdAt.toISOString(),
      actor: a.meeting.course.dosen.nama,
    })),
    ...recentUsers.map((u) => ({
      id: `usr-${u.id}`,
      type: "user" as const,
      title: `User baru terdaftar`,
      description: `${u.nama} · ${u.role}`,
      timestamp: u.createdAt.toISOString(),
      actor: u.nim,
    })),
    ...recentMeetings.map((mt) => ({
      id: `mtg-${mt.id}`,
      type: "meeting" as const,
      title: `Pertemuan baru dibuat`,
      description: `Pertemuan ${mt.pertemuanKe}: ${mt.judul} · ${mt.course.nama}`,
      timestamp: mt.createdAt.toISOString(),
      actor: mt.course.dosen.nama,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 30);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <Activity className="w-4 h-4" />
          Admin Panel
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Aktivitas Platform
        </h1>
        <p className="text-purple-100 mt-1">
          Monitoring aktivitas terbaru dari seluruh platform
        </p>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Total Aktivitas</p>
            <p className="text-2xl font-bold">{activities.length}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Submission</p>
            <p className="text-2xl font-bold">{recentSubmissions.length}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">User Baru</p>
            <p className="text-2xl font-bold">{recentUsers.length}</p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={activities} />
    </div>
  );
}