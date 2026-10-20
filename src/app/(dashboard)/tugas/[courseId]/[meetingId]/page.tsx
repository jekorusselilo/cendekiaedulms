"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Calendar,
  CalendarCheck,
  Upload,
  Plus,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
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

type Material = {
  id: string;
  judul: string;
  filePath: string;
  createdAt: string;
};

type Submission = {
  id: string;
  userId: string;
  filePath: string;
  submittedAt: string;
  nilai: number | null;
  feedback: string | null;
  user?: { id: string; nama: string; nim: string };
};

type Assignment = {
  id: string;
  judul: string;
  deskripsi: string | null;
  deadline: string | null;
  submissions: Submission[];
};

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
    dosen: { nama: string };
  };
  materials: Material[];
  assignments: Assignment[];
};

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.courseId as string;
  const meetingId = params.meetingId as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  const [openUpload, setOpenUpload] = useState(false);
  const [uploadJudul, setUploadJudul] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openAssignment, setOpenAssignment] = useState(false);
  const [assignForm, setAssignForm] = useState({
    judul: "",
    deskripsi: "",
    deadline: "",
  });
  const [assignError, setAssignError] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [openSubmit, setOpenSubmit] = useState<string | null>(null);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);
  const submitFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) {
          router.push(`/tugas/${courseId}`);
          return;
        }
        const data = await res.json();
        setMeeting(data.meeting);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [meetingId, courseId, router]);

  const refetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMeeting(data.meeting);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");

    if (!uploadFile) {
      setUploadError("Pilih file PDF terlebih dahulu");
      return;
    }
    if (!uploadJudul.trim()) {
      setUploadError("Judul materi harus diisi");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("judul", uploadJudul);

      const res = await fetch(`/api/meetings/${meetingId}/materials`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Gagal upload materi");
        setUploading(false);
        return;
      }

      setUploadJudul("");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setOpenUpload(false);
      setUploading(false);
      refetchMeeting();
    } catch {
      setUploadError("Terjadi kesalahan");
      setUploading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError("");
    setAssignSubmitting(true);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: assignForm.judul,
          deskripsi: assignForm.deskripsi || null,
          deadline: assignForm.deadline || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAssignError(data.error || "Gagal membuat tugas");
        setAssignSubmitting(false);
        return;
      }

      setAssignForm({ judul: "", deskripsi: "", deadline: "" });
      setOpenAssignment(false);
      setAssignSubmitting(false);
      refetchMeeting();
    } catch {
      setAssignError("Terjadi kesalahan");
      setAssignSubmitting(false);
    }
  };

  const handleSubmitTask = async (
    e: React.FormEvent,
    assignmentId: string
  ) => {
    e.preventDefault();
    setSubmitError("");

    if (!submitFile) {
      setSubmitError("Pilih file jawaban terlebih dahulu");
      return;
    }

    setSubmittingTask(true);
    try {
      const formData = new FormData();
      formData.append("file", submitFile);

      const res = await fetch(
        `/api/assignments/${assignmentId}/submissions`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Gagal submit tugas");
        setSubmittingTask(false);
        return;
      }

      setSubmitFile(null);
      if (submitFileInputRef.current) submitFileInputRef.current.value = "";
      setOpenSubmit(null);
      setSubmittingTask(false);
      refetchMeeting();
    } catch {
      setSubmitError("Terjadi kesalahan");
      setSubmittingTask(false);
    }
  };

  if (loading) return <p className="text-slate-500">Memuat...</p>;
  if (!meeting)
    return <p className="text-slate-500">Pertemuan tidak ditemukan.</p>;

  const isDosen = session?.user?.role === "DOSEN";
  const isMahasiswa = session?.user?.role === "MAHASISWA";
  const myUserId = session?.user?.id;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/tugas/${courseId}`}
          className="inline-flex items-center text-sm text-slate-500 hover:text-purple-600 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke {meeting.course.nama}
        </Link>
        <h2 className="text-2xl font-bold">
          Pertemuan {meeting.pertemuanKe}: {meeting.judul}
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          {meeting.course.kode} · {meeting.course.dosen.nama}
        </p>
        {meeting.tanggal && (
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(meeting.tanggal).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Section Kehadiran (khusus dosen) */}
        {isDosen && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-purple-600" />
                    Kehadiran
                  </CardTitle>
                  <CardDescription>
                    Input kehadiran mahasiswa untuk pertemuan ini
                  </CardDescription>
                </div>
                <Link href={`/tugas/${courseId}/${meetingId}/kehadiran`}>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Input Kehadiran
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Section Materi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Materi
                </CardTitle>
                <CardDescription>
                  {isDosen
                    ? "Upload materi PDF untuk mahasiswa"
                    : "Materi yang bisa Anda unduh"}
                </CardDescription>
              </div>

              {isDosen && (
                <Dialog open={openUpload} onOpenChange={setOpenUpload}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Materi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleUpload}>
                      <DialogHeader>
                        <DialogTitle>Upload Materi PDF</DialogTitle>
                        <DialogDescription>
                          File maksimal 5 MB, berformat PDF.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        {uploadError && (
                          <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {uploadError}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="judul">Judul Materi</Label>
                          <Input
                            id="judul"
                            placeholder="contoh: Slide Pengenalan HTML"
                            value={uploadJudul}
                            onChange={(e) => setUploadJudul(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="file">File PDF</Label>
                          <Input
                            id="file"
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={(e) =>
                              setUploadFile(e.target.files?.[0] || null)
                            }
                            required
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={uploading}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {uploading ? "Mengunggah..." : "Upload"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {meeting.materials.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                Belum ada materi untuk pertemuan ini.
              </p>
            ) : (
              <ul className="space-y-2">
                {meeting.materials.map((material) => (
                  <li
                    key={material.id}
                    className="flex items-center justify-between border rounded-lg p-3 hover:border-purple-200 hover:bg-purple-50/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">{material.judul}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(material.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <a
                      href={material.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Lihat PDF
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Section Tugas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  Tugas
                </CardTitle>
                <CardDescription>
                  {isDosen
                    ? "Buat tugas & lihat pengumpulan mahasiswa"
                    : "Tugas yang harus Anda kerjakan"}
                </CardDescription>
              </div>

              {isDosen && (
                <Dialog open={openAssignment} onOpenChange={setOpenAssignment}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Tugas
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleCreateAssignment}>
                      <DialogHeader>
                        <DialogTitle>Buat Tugas Baru</DialogTitle>
                        <DialogDescription>
                          Isi detail tugas di bawah ini.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        {assignError && (
                          <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {assignError}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="assign-judul">Judul Tugas</Label>
                          <Input
                            id="assign-judul"
                            placeholder="contoh: Tugas Latihan HTML"
                            value={assignForm.judul}
                            onChange={(e) =>
                              setAssignForm({
                                ...assignForm,
                                judul: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="assign-deskripsi">
                            Deskripsi (opsional)
                          </Label>
                          <Input
                            id="assign-deskripsi"
                            placeholder="Deskripsi tugas"
                            value={assignForm.deskripsi}
                            onChange={(e) =>
                              setAssignForm({
                                ...assignForm,
                                deskripsi: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="assign-deadline">
                            Deadline (opsional)
                          </Label>
                          <Input
                            id="assign-deadline"
                            type="datetime-local"
                            value={assignForm.deadline}
                            onChange={(e) =>
                              setAssignForm({
                                ...assignForm,
                                deadline: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-slate-500">
                            Setelah deadline lewat, pengumpulan otomatis
                            ditutup.
                          </p>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={assignSubmitting}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {assignSubmitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {meeting.assignments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                Belum ada tugas untuk pertemuan ini.
              </p>
            ) : (
              <ul className="space-y-3">
                {meeting.assignments.map((assignment) => {
                  const mySubmission = isMahasiswa
                    ? assignment.submissions.find(
                        (s) => s.userId === myUserId
                      )
                    : null;
                  const submissionCount = assignment.submissions.length;

                  // Hitung status deadline
                  const deadline = assignment.deadline
                    ? new Date(assignment.deadline)
                    : null;
                  const isClosed = deadline && new Date() > deadline;

                  return (
                    <li
                      key={assignment.id}
                      className="border rounded-lg p-4 space-y-3 hover:border-purple-200 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-medium">{assignment.judul}</p>
                          {deadline && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                                isClosed
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isClosed ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  Ditutup
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" />
                                  Terbuka
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        {assignment.deskripsi && (
                          <p className="text-sm text-slate-600 mt-1">
                            {assignment.deskripsi}
                          </p>
                        )}
                        {deadline && (
                          <p
                            className={`text-xs mt-2 flex items-center gap-1 font-medium ${
                              isClosed ? "text-red-600" : "text-slate-500"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {isClosed ? "Ditutup" : "Deadline"}:{" "}
                            {deadline.toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>

                      {/* ==================== MAHASISWA ==================== */}
                      {isMahasiswa && (
                        <div className="pt-2 border-t">
                          {mySubmission ? (
                            <div className="space-y-2">
                              <p className="text-sm text-green-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Sudah dikumpulkan pada{" "}
                                {new Date(
                                  mySubmission.submittedAt
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {mySubmission.nilai !== null && (
                                <p className="text-sm">
                                  <span className="font-medium">Nilai:</span>{" "}
                                  <span className="text-purple-600 font-bold">
                                    {mySubmission.nilai}
                                  </span>
                                </p>
                              )}
                              {mySubmission.feedback && (
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Feedback:</span>{" "}
                                  {mySubmission.feedback}
                                </p>
                              )}
                              <div className="flex gap-3 text-sm">
                                <a
                                  href={mySubmission.filePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline"
                                >
                                  Lihat jawaban saya
                                </a>
                                {!isClosed && (
                                  <Dialog
                                    open={openSubmit === assignment.id}
                                    onOpenChange={(v) =>
                                      setOpenSubmit(v ? assignment.id : null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <button className="text-amber-600 hover:underline">
                                        Ganti jawaban
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <form
                                        onSubmit={(e) =>
                                          handleSubmitTask(e, assignment.id)
                                        }
                                      >
                                        <DialogHeader>
                                          <DialogTitle>
                                            Ganti Jawaban
                                          </DialogTitle>
                                          <DialogDescription>
                                            Upload ulang file jawaban Anda
                                            (akan menimpa yang lama).
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          {submitError && (
                                            <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                                              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                              {submitError}
                                            </div>
                                          )}
                                          <div className="space-y-2">
                                            <Label>File PDF</Label>
                                            <Input
                                              type="file"
                                              accept="application/pdf"
                                              ref={submitFileInputRef}
                                              onChange={(e) =>
                                                setSubmitFile(
                                                  e.target.files?.[0] || null
                                                )
                                              }
                                              required
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button
                                            type="submit"
                                            disabled={submittingTask}
                                            className="bg-purple-600 hover:bg-purple-700"
                                          >
                                            {submittingTask
                                              ? "Mengunggah..."
                                              : "Upload"}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          ) : isClosed ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Pengumpulan Ditutup
                              </p>
                              <p className="text-xs text-red-600 mt-1">
                                Deadline telah lewat. Hubungi dosen untuk
                                perpanjangan.
                              </p>
                            </div>
                          ) : (
                            <Dialog
                              open={openSubmit === assignment.id}
                              onOpenChange={(v) =>
                                setOpenSubmit(v ? assignment.id : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Kumpulkan Tugas
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <form
                                  onSubmit={(e) =>
                                    handleSubmitTask(e, assignment.id)
                                  }
                                >
                                  <DialogHeader>
                                    <DialogTitle>Kumpulkan Tugas</DialogTitle>
                                    <DialogDescription>
                                      Upload jawaban Anda dalam format PDF
                                      (maks 5 MB).
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    {submitError && (
                                      <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        {submitError}
                                      </div>
                                    )}
                                    <div className="space-y-2">
                                      <Label>File PDF</Label>
                                      <Input
                                        type="file"
                                        accept="application/pdf"
                                        ref={submitFileInputRef}
                                        onChange={(e) =>
                                          setSubmitFile(
                                            e.target.files?.[0] || null
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      type="submit"
                                      disabled={submittingTask}
                                      className="bg-purple-600 hover:bg-purple-700"
                                    >
                                      {submittingTask
                                        ? "Mengunggah..."
                                        : "Upload"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}

                      {/* ==================== DOSEN ==================== */}
                      {isDosen && (
                        <div className="pt-2 border-t space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="text-sm text-slate-600">
                              {submissionCount} mahasiswa sudah mengumpulkan
                            </p>
                            <Link
                              href={`/tugas/${courseId}/${meetingId}/${assignment.id}`}
                              className="text-sm text-purple-600 hover:underline"
                            >
                              Lihat & Nilai
                            </Link>
                          </div>

                          {deadline && (
                            <div
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded text-xs ${
                                isClosed
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-green-50 text-green-700 border border-green-200"
                              }`}
                            >
                              <span className="font-medium flex items-center gap-1">
                                {isClosed ? (
                                  <Lock className="w-3 h-3" />
                                ) : (
                                  <Unlock className="w-3 h-3" />
                                )}
                                {isClosed ? "Ditutup" : "Terbuka"} ·{" "}
                                {deadline.toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <BukaKembaliButton
                                assignmentId={assignment.id}
                                onSuccess={refetchMeeting}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== KOMPONEN BUKA KEMBALI ====================
function BukaKembaliButton({
  assignmentId,
  onSuccess,
}: {
  assignmentId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deadlineBaru, setDeadlineBaru] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadline: deadlineBaru }),
    });

    const data = await res.json();
    if (res.ok) {
      setOpen(false);
      setDeadlineBaru("");
      onSuccess();
    } else {
      setError(data.error || "Gagal update deadline");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="underline font-medium hover:no-underline">
          Perpanjang
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Perpanjang Deadline</DialogTitle>
            <DialogDescription>
              Berikan tambahan waktu pengumpulan untuk mahasiswa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="deadlineBaru">Deadline Baru</Label>
              <Input
                id="deadlineBaru"
                type="datetime-local"
                value={deadlineBaru}
                onChange={(e) => setDeadlineBaru(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500">
                Pilih tanggal & waktu baru. Pastikan lebih dari waktu sekarang.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Menyimpan..." : "Perpanjang"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}