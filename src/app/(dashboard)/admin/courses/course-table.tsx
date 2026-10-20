"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  School,
  Users,
  CalendarDays,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Course = {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string | null;
  dosen: { id: string; nama: string; nim: string };
  _count: { enrollments: number; meetings: number };
};

export function CourseTable({ initialCourses }: { initialCourses: Course[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [action, setAction] = useState<"delete" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return courses.filter(
      (c) =>
        c.nama.toLowerCase().includes(search.toLowerCase()) ||
        c.kode.toLowerCase().includes(search.toLowerCase()) ||
        c.dosen.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  async function handleDelete() {
    if (!selectedCourse) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
      setSelectedCourse(null);
      setAction(null);
      router.refresh();
    } else {
      setError(data.error || "Gagal hapus mata kuliah");
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari nama, kode, atau dosen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                {courses.length === 0
                  ? "Belum ada mata kuliah di platform."
                  : "Tidak ada mata kuliah yang cocok dengan pencarian."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-purple-100">
                    <th className="text-left p-3 font-semibold text-slate-700">
                      Mata Kuliah
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700">
                      Dosen
                    </th>
                    <th className="text-center p-3 font-semibold text-slate-700">
                      Mahasiswa
                    </th>
                    <th className="text-center p-3 font-semibold text-slate-700">
                      Pertemuan
                    </th>
                    <th className="text-right p-3 font-semibold text-slate-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`border-b border-slate-100 hover:bg-purple-50/50 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-medium">{c.nama}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.kode}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{c.dosen.nama}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.dosen.nim}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Users className="w-3 h-3" />
                          {c._count.enrollments}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                          <CalendarDays className="w-3 h-3" />
                          {c._count.meetings}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-3">
                          <Link
                            href={`/tugas/${c.id}`}
                            className="text-xs text-purple-600 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Lihat
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedCourse(c);
                              setAction("delete");
                              setError("");
                            }}
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Menampilkan {filtered.length} dari {courses.length} mata kuliah
          </p>
        </CardContent>
      </Card>

      {/* Dialog Hapus */}
      <Dialog
        open={action === "delete"}
        onOpenChange={(v) => !v && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Mata Kuliah</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <strong>{selectedCourse?.nama}</strong> (
              {selectedCourse?.kode})? Semua pertemuan, materi, tugas, dan
              submission terkait akan ikut terhapus. Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}