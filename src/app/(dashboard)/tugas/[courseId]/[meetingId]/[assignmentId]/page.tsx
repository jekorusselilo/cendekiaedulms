"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // <-- B kapital
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createMeeting } from "./actions"; // <-- Import yang tadi hilang

export function CreateMeetingButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    pertemuanKe: "",
    judul: "",
    tanggal: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await createMeeting({
      courseId,
      pertemuanKe: parseInt(form.pertemuanKe),
      judul: form.judul,
      tanggal: form.tanggal || null,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setForm({ pertemuanKe: "", judul: "", tanggal: "" });
    setOpen(false);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition text-sm font-medium shadow-md">
          <Plus className="w-4 h-4" />
          Pertemuan Baru
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat Pertemuan Baru</DialogTitle>
            <DialogDescription>
              Isi informasi pertemuan di bawah ini.
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
              <Label htmlFor="pertemuanKe">Pertemuan Ke-</Label>
              <Input
                id="pertemuanKe"
                type="number"
                min="1"
                placeholder="contoh: 1"
                value={form.pertemuanKe}
                onChange={(e) =>
                  setForm({ ...form, pertemuanKe: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judul">Judul Pertemuan</Label>
              <Input
                id="judul"
                placeholder="contoh: Pengenalan HTML"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal (opsional)</Label>
              <Input
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}