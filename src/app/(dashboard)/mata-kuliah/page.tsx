import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Users, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EnrollButton } from "./enroll-button";

export default async function MataKuliahPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const isMahasiswa = session.user.role === "MAHASISWA";

  const courses = await prisma.course.findMany({
    include: {
      dosen: { select: { nama: true } },
      enrollments: { select: { userId: true } },
      _count: { select: { enrollments: true, meetings: true } },
    },
    orderBy: { nama: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <BookOpen className="w-4 h-4" />
          Katalog Mata Kuliah
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Daftar Mata Kuliah
        </h1>
        <p className="text-purple-100 mt-1">
          Pilih mata kuliah yang ingin Anda ikuti
        </p>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Total Matkul</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>
        </div>
      </div>

      {/* List */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 mx-auto flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">
              Belum ada mata kuliah
            </p>
            <p className="text-sm text-slate-500">
              Belum ada mata kuliah yang tersedia saat ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => {
            const isEnrolled = c.enrollments.some((e) => e.userId === userId);
            return (
              <Card
                key={c.id}
                className="hover:shadow-lg hover:border-purple-300 transition h-full"
              >
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 shrink-0 ml-2">
                      {c.kode}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {c.nama}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                    {c.dosen.nama}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="font-bold text-sm text-purple-700">
                        {c._count.enrollments}
                      </p>
                      <p className="text-xs text-slate-500">Mahasiswa</p>
                    </div>
                    <div className="text-center p-2 bg-violet-50 rounded-lg">
                      <CalendarDays className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                      <p className="font-bold text-sm text-violet-700">
                        {c._count.meetings}
                      </p>
                      <p className="text-xs text-slate-500">Pertemuan</p>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  {isMahasiswa ? (
                    <EnrollButton
                      courseId={c.id}
                      isEnrolled={isEnrolled}
                      role="MAHASISWA"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center pt-3 border-t">
                      Hanya mahasiswa yang bisa mendaftar
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}