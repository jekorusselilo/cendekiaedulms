import { prisma } from "@/lib/prisma";
import { CalendarDays } from "lucide-react";
import { MeetingTable } from "./meeting-table";

export default async function AdminMeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    include: {
      course: {
        select: {
          id: true,
          nama: true,
          kode: true,
          dosen: { select: { nama: true } },
        },
      },
      _count: {
        select: { materials: true, assignments: true, attendances: true },
      },
    },
    orderBy: [{ course: { nama: "asc" } }, { pertemuanKe: "asc" }],
  });

  const totalPertemuan = meetings.length;
  const totalMateri = meetings.reduce(
    (sum, m) => sum + m._count.materials,
    0
  );
  const totalTugas = meetings.reduce(
    (sum, m) => sum + m._count.assignments,
    0
  );

  // Serialize dates untuk client component
  const meetingsData = meetings.map((m) => ({
    id: m.id,
    pertemuanKe: m.pertemuanKe,
    judul: m.judul,
    tanggal: m.tanggal ? m.tanggal.toISOString() : null,
    isOpen: m.isOpen,
    course: {
      id: m.course.id,
      nama: m.course.nama,
      kode: m.course.kode,
      dosenNama: m.course.dosen.nama,
    },
    _count: m._count,
  }));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <CalendarDays className="w-4 h-4" />
          Admin Panel
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Monitoring Pertemuan
        </h1>
        <p className="text-purple-100 mt-1">
          Lihat semua pertemuan di platform Online Learning
        </p>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Total Pertemuan</p>
            <p className="text-2xl font-bold">{totalPertemuan}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Total Materi</p>
            <p className="text-2xl font-bold">{totalMateri}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Total Tugas</p>
            <p className="text-2xl font-bold">{totalTugas}</p>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <MeetingTable initialMeetings={meetingsData} />
    </div>
  );
}