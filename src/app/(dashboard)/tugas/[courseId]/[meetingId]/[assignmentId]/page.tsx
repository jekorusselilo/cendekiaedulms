"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Submission = {
  id: string;
  userId: string;
  filePath: string;
  submittedAt: string;
  nilai: number | null;
  feedback: string | null;
  user: { id: string; nama: string; nim: string };
};

type Assignment = {
  id: string;
  judul: string;
  deskripsi: string | null;
  deadline: string | null;
};

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.courseId as string;
  const meetingId = params.meetingId as string;
  const assignmentId = params.assignmentId as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  const [openGrade, setOpenGrade] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ nilai: "", feedback: "" });
  const [gradeError, setGradeError] = useState("");
  const [grading, setGrading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const subRes = await fetch(
        `/api/assignments/${assignmentId}/submissions`
      );
      if (!subRes.ok) {
        router.push(`/tugas/${courseId}/${meetingId}`);
        return;
      }
      const subData = await subRes.json();
      setSubmissions(subData.submissions || []);

      const meetRes = await fetch(`/api/meetings/${meetingId}`);
      if (meetRes.ok) {
        const meetData = await meetRes.json();
        const found = meetData.meeting.assignments.find(
          (a: Assignment) => a.id === assignmentId
        );
        setAssignment(found || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, meetingId, courseId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGrade = async (e: React.FormEvent, submissionId: string) => {
    e.preventDefault();
    setGradeError("");
    setGrading(true);

    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nilai: gradeForm.nilai,
          feedback: gradeForm.feedback,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGradeError(data.error || "Gagal memberi nilai");
        setGrading(false);
        return;
      }

      setGradeForm({ nilai: "", feedback: "" });
      setOpenGrade(null);
      setGrading(false);
      fetchData();
    } catch {
      setGradeError("Terjadi kesalahan");
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isDosen = session?.user?.role === "DOSEN";

  if (!isDosen) {
    router.push(`/tugas/${courseId}/${meetingId}`);
    return null;
  }

  const sudahDinilai = submissions.filter((s) => s.nilai !== null).length;
  const belumDinilai = submissions.length - sudahDinilai;
  const rataRata =
    sudahDinilai > 0
      ? Math.round(
          submissions
            .filter((s) => s.nilai !== null)
            .reduce((sum, s) => sum + (s.nilai || 0), 0) / sudahDinilai
        )
      : 0;

  return (
    <div className="space-y-6">
      <Link
        href={`/tugas/${courseId}/${meetingId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Pertemuan
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <Award className="w-4 h-4" />
          Penilaian Tugas
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          {assignment?.judul || "Submission Tugas"}
        </h1>
        <p className="text-purple-100 mt-1">
          {submissions.length} mahasiswa sudah mengumpulkan
        </p>

        {submissions.length > 0 && (
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
            <div>
              <p className="text-purple-200 text-xs">Sudah Dinilai</p>
              <p className="text-2xl font-bold">{sudahDinilai}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs">Belum Dinilai</p>
              <p className="text-2xl font-bold">{belumDinilai}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs">Rata-rata</p>
              <p className="text-2xl font-bold">{rataRata}</p>
            </div>
          </div>
        )}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 mx-auto flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">
              Belum ada pengumpulan
            </p>
            <p className="text-sm text-slate-500">
              Belum ada mahasiswa yang mengumpulkan tugas ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const sudahDinilaiItem = sub.nilai !== null;
            return (
              <Card
                key={sub.id}
                className={`hover:shadow-md transition ${
                  sudahDinilaiItem ? "border-green-200" : "border-amber-200"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {sub.user.nama}
                        {sudahDinilaiItem && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Sudah dinilai
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        NIM: {sub.user.nim} · Dikumpulkan:{" "}
                        {new Date(sub.submittedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <a
                      href={sub.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Jawaban
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  {sudahDinilaiItem ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Award className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-xs text-green-700">Nilai</p>
                          <p className="text-2xl font-bold text-green-700">
                            {sub.nilai}
                          </p>
                        </div>
                      </div>
                      {sub.feedback && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">
                            Feedback
                          </p>
                          <p className="text-sm text-slate-700">
                            {sub.feedback}
                          </p>
                        </div>
                      )}
                      <Dialog
                        open={openGrade === sub.id}
                        onOpenChange={(v) => {
                          setOpenGrade(v ? sub.id : null);
                          if (v)
                            setGradeForm({
                              nilai: sub.nilai?.toString() || "",
                              feedback: sub.feedback || "",
                            });
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Ubah Nilai
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={(e) => handleGrade(e, sub.id)}>
                            <DialogHeader>
                              <DialogTitle>Ubah Nilai</DialogTitle>
                              <DialogDescription>
                                Nilai untuk {sub.user.nama}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {gradeError && (
                                <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                  {gradeError}
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label>Nilai (0-100)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={gradeForm.nilai}
                                  onChange={(e) =>
                                    setGradeForm({
                                      ...gradeForm,
                                      nilai: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Feedback (opsional)</Label>
                                <Input
                                  placeholder="Catatan untuk mahasiswa"
                                  value={gradeForm.feedback}
                                  onChange={(e) =>
                                    setGradeForm({
                                      ...gradeForm,
                                      feedback: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                disabled={grading}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {grading ? "Menyimpan..." : "Simpan Nilai"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">
                          Belum dinilai
                        </span>
                      </div>
                      <Dialog
                        open={openGrade === sub.id}
                        onOpenChange={(v) => {
                          setOpenGrade(v ? sub.id : null);
                          if (v) setGradeForm({ nilai: "", feedback: "" });
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Beri Nilai
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={(e) => handleGrade(e, sub.id)}>
                            <DialogHeader>
                              <DialogTitle>Beri Nilai</DialogTitle>
                              <DialogDescription>
                                Nilai untuk {sub.user.nama} (NIM:{" "}
                                {sub.user.nim})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {gradeError && (
                                <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                  {gradeError}
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label>Nilai (0-100)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={gradeForm.nilai}
                                  onChange={(e) =>
                                    setGradeForm({
                                      ...gradeForm,
                                      nilai: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Feedback (opsional)</Label>
                                <Input
                                  placeholder="Catatan untuk mahasiswa"
                                  value={gradeForm.feedback}
                                  onChange={(e) =>
                                    setGradeForm({
                                      ...gradeForm,
                                      feedback: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                disabled={grading}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {grading ? "Menyimpan..." : "Simpan Nilai"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
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