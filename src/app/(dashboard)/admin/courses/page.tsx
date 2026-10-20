import { prisma } from "@/lib/prisma";
import { School } from "lucide-react";
import { CourseTable } from "./course-table";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      dosen: { select: { id: true, nama: true, nim: true } },
      _count: {
        select: { enrollments: true, meetings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalMahasiswa = await prisma.user.count({
    where: { role: "MAHASISWA" },
  });
  const totalDosen = await prisma.user.count({ where: { role: "DOSEN" } });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <School className="w-4 h-4" />
          Admin Panel
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Kelola Mata Kuliah
        </h1>
        <p className="text-purple-100 mt-1">
          Lihat dan kelola semua mata kuliah di platform
        </p>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Total Matkul</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Total Dosen</p>
            <p className="text-2xl font-bold">{totalDosen}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Total Mahasiswa</p>
            <p className="text-2xl font-bold">{totalMahasiswa}</p>
          </div>
        </div>
      </div>

      {/* Tabel Course */}
      <CourseTable initialCourses={courses} />
    </div>
  );
}