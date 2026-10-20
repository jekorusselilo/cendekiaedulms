"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const statusOptions = ["HADIR", "IZIN", "SAKIT", "ALPA"] as const;
type StatusKehadiran = (typeof statusOptions)[number];

const statusColor: Record<StatusKehadiran, string> = {
  HADIR: "bg-green-100 text-green-700 border-green-300",
  IZIN: "bg-yellow-100 text-yellow-700 border-yellow-300",
  SAKIT: "bg-blue-100 text-blue-700 border-blue-300",
  ALPA: "bg-red-100 text-red-700 border-red-300",
};

type Student = {
  id: string;
  nama: string;
  nim: string;
};

type EnrollmentResponse = {
  user: Student;
};

type AttendanceResponse = {
  userId: string;
  status: StatusKehadiran;
};

export default function InputKehadiranPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const meetingId = params.meetingId as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, StatusKehadiran>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [enrollRes, attRes] = await Promise.all([
        fetch(`/api/enrollments?courseId=${courseId}`),
        fetch(`/api/attendances?meetingId=${meetingId}`),
      ]);

      const enrollData: EnrollmentResponse[] = await enrollRes.json();
      const attData: AttendanceResponse[] = await attRes.json();

      const studentList: Student[] = enrollData.map((e) => e.user);
      setStudents(studentList);

      const map: Record<string, StatusKehadiran> = {};
      attData.forEach((a) => {
        map[a.userId] = a.status;
      });
      setAttendance(map);
      setLoading(false);
    }
    fetchData();
  }, [courseId, meetingId]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const payload = students.map((s) => ({
      userId: s.id,
      status: attendance[s.id] || "ALPA",
    }));

    const res = await fetch("/api/attendances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, attendances: payload }),
    });

    if (res.ok) {
      setMessage("Kehadiran berhasil disimpan!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Gagal menyimpan kehadiran.");
    }
    setSaving(false);
  }

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="space-y-6">
      <Link
        href={`/tugas/${courseId}/${meetingId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Pertemuan
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Input Kehadiran</h1>
        <p className="text-slate-600">Tandai kehadiran mahasiswa</p>
      </div>

      {message && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded">{message}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mahasiswa ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-slate-500 text-center py-4">
              Belum ada mahasiswa yang terdaftar di mata kuliah ini.
            </p>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{s.nama}</div>
                    <div className="text-sm text-slate-500">{s.nim}</div>
                  </div>
                  <div className="flex gap-1">
                    {statusOptions.map((status) => {
                      const active = (attendance[s.id] || "ALPA") === status;
                      return (
                        <button
                          key={status}
                          onClick={() =>
                            setAttendance({ ...attendance, [s.id]: status })
                          }
                          className={`px-3 py-1 text-xs rounded border transition ${
                            active
                              ? statusColor[status]
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Kehadiran"}
          </Button>
        </div>
      )}
    </div>
  );
}