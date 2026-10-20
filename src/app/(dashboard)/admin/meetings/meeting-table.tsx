"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CalendarDays,
  FileText,
  ClipboardList,
  Users,
  ExternalLink,
  Lock,
  Unlock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Meeting = {
  id: string;
  pertemuanKe: number;
  judul: string;
  tanggal: string | null;
  isOpen: boolean;
  course: {
    id: string;
    nama: string;
    kode: string;
    dosenNama: string;
  };
  _count: {
    materials: number;
    assignments: number;
    attendances: number;
  };
};

export function MeetingTable({
  initialMeetings,
}: {
  initialMeetings: Meeting[];
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "CLOSED">(
    "ALL"
  );

  const filtered = useMemo(() => {
    return initialMeetings.filter((m) => {
      const matchSearch =
        m.judul.toLowerCase().includes(search.toLowerCase()) ||
        m.course.nama.toLowerCase().includes(search.toLowerCase()) ||
        m.course.kode.toLowerCase().includes(search.toLowerCase()) ||
        m.course.dosenNama.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "ALL" ||
        (filterStatus === "OPEN" && m.isOpen) ||
        (filterStatus === "CLOSED" && !m.isOpen);

      return matchSearch && matchStatus;
    });
  }, [initialMeetings, search, filterStatus]);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari pertemuan, matkul, atau dosen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "OPEN", "CLOSED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterStatus === s
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "ALL" ? "Semua" : s === "OPEN" ? "Terbuka" : "Ditutup"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {initialMeetings.length === 0
                ? "Belum ada pertemuan di platform."
                : "Tidak ada pertemuan yang cocok dengan filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-purple-100">
                  <th className="text-left p-3 font-semibold text-slate-700">
                    Pertemuan
                  </th>
                  <th className="text-left p-3 font-semibold text-slate-700">
                    Mata Kuliah
                  </th>
                  <th className="text-left p-3 font-semibold text-slate-700">
                    Dosen
                  </th>
                  <th className="text-center p-3 font-semibold text-slate-700">
                    Konten
                  </th>
                  <th className="text-center p-3 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-right p-3 font-semibold text-slate-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={`border-b border-slate-100 hover:bg-purple-50/50 transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-medium flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {m.pertemuanKe}
                        </span>
                        <span className="truncate max-w-[200px]">
                          {m.judul}
                        </span>
                      </div>
                      {m.tanggal && (
                        <div className="text-xs text-slate-500 mt-1 ml-9">
                          {new Date(m.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{m.course.nama}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {m.course.kode}
                      </div>
                    </td>
                    <td className="p-3 text-sm">{m.course.dosenNama}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                          title="Materi"
                        >
                          <FileText className="w-3 h-3" />
                          {m._count.materials}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700"
                          title="Tugas"
                        >
                          <ClipboardList className="w-3 h-3" />
                          {m._count.assignments}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                          title="Kehadiran"
                        >
                          <Users className="w-3 h-3" />
                          {m._count.attendances}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {m.isOpen ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Unlock className="w-3 h-3" />
                          Terbuka
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Lock className="w-3 h-3" />
                          Ditutup
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/tugas/${m.course.id}/${m.id}`}
                        className="text-xs text-purple-600 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Menampilkan {filtered.length} dari {initialMeetings.length} pertemuan
        </p>
      </CardContent>
    </Card>
  );
}