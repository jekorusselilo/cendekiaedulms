import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  Lock,
  Unlock,
} from "lucide-react";
import { CreateMeetingButton } from "./create-meeting-button"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isDosen = session.user.role === "DOSEN";

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      dosen: { select: { nama: true } },
      meetings: {
        orderBy: { pertemuanKe: "asc" },
        include: {
          _count: { select: { materials: true, assignments: true } },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/tugas"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Mata Kuliah
      </Link>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <BookOpen className="w-4 h-4" />
              {course.kode}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              {course.nama}
            </h1>
            <p className="text-purple-100 mt-1">Dosen: {course.dosen.nama}</p>
            {course.deskripsi && (
              <p className="text-purple-100 text-sm mt-1 max-w-2xl">
                {course.deskripsi}
              </p>
            )}
          </div>

          {isDosen && <CreateMeetingButton courseId={courseId} />}
        </div>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Total Pertemuan</p>
            <p className="text-2xl font-bold">{course.meetings.length}</p>
          </div>
        </div>
      </div>

      {/* List Pertemuan */}
      {course.meetings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 mx-auto flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">
              Belum ada pertemuan
            </p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {isDosen
                ? "Mulai dengan membuat pertemuan pertama."
                : "Dosen belum membuat pertemuan untuk mata kuliah ini."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {course.meetings.map((m) => (
            <Link key={m.id} href={`/tugas/${courseId}/${m.id}`}>
              <Card className="hover:shadow-lg hover:border-purple-300 transition group h-full cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {m.pertemuanKe}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        m.isOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.isOpen ? (
                        <>
                          <Unlock className="w-3 h-3" />
                          Terbuka
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Ditutup
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-purple-700 transition">
                    {m.judul}
                  </h3>

                  {m.tanggal && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(m.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t">
                    <span>{m._count.materials} materi</span>
                    <span>·</span>
                    <span>{m._count.assignments} tugas</span>
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