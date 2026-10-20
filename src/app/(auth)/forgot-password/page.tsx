"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nim, setNim] = useState("");
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");

  // Validasi live password (untuk step 3)
  const validasi = {
    panjang: passwordBaru.length >= 8,
    huruf: /[a-zA-Z]/.test(passwordBaru),
    angka: /[0-9]/.test(passwordBaru),
    cocok: passwordBaru.length > 0 && passwordBaru === konfirmasi,
  };

  const semuaValid =
    validasi.panjang && validasi.huruf && validasi.angka && validasi.cocok;

  // STEP 1: cek NIM
  const handleCheckNim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }

      setPertanyaan(data.pertanyaan);
      setStep(2);
      setLoading(false);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  // STEP 2: isi jawaban
  const handleJawaban = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jawaban.trim()) {
      setError("Jawaban harus diisi");
      return;
    }
    setError("");
    setStep(3);
  };

  // STEP 3: reset password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!semuaValid) {
      setError("Password belum memenuhi semua syarat");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, jawabanKeamanan: jawaban, passwordBaru }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal reset password");
        setLoading(false);
        // Kalau jawaban salah, balik ke step 2
        if (data.error === "Jawaban keamanan salah") {
          setStep(2);
          setJawaban("");
        }
        return;
      }

      alert("Password berhasil diubah! Silakan login dengan password baru.");
      router.push("/login");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Lupa Password</CardTitle>
        <CardDescription>
          {step === 1 && "Masukkan NIM Anda untuk memulai"}
          {step === 2 && "Jawab pertanyaan keamanan Anda"}
          {step === 3 && "Buat password baru Anda"}
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-2 bg-red-100 text-red-700 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleCheckNim}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                placeholder="contoh: 2021001"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memeriksa..." : "Lanjut"}
            </Button>
            <p className="text-sm text-center text-slate-600">
              Ingat password Anda?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={handleJawaban}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pertanyaan Keamanan</Label>
              <p className="text-sm bg-slate-100 p-3 rounded">{pertanyaan}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jawaban">Jawaban Anda</Label>
              <Input
                id="jawaban"
                placeholder="Masukkan jawaban"
                value={jawaban}
                onChange={(e) => setJawaban(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Lanjut
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              Kembali
            </button>
          </CardFooter>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordBaru">Password Baru</Label>
              <Input
                id="passwordBaru"
                type="password"
                placeholder="Minimal 8 karakter"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                required
              />
              {/* Indikator syarat password */}
              <div className="space-y-1 pt-1">
                <Persyaratan label="Minimal 8 karakter" ok={validasi.panjang} />
                <Persyaratan label="Mengandung huruf" ok={validasi.huruf} />
                <Persyaratan label="Mengandung angka" ok={validasi.angka} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="konfirmasi">Konfirmasi Password Baru</Label>
              <Input
                id="konfirmasi"
                type="password"
                placeholder="Ulangi password baru"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                required
              />
              {konfirmasi.length > 0 && (
                <Persyaratan label="Password cocok" ok={validasi.cocok} />
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !semuaValid}
            >
              {loading ? "Menyimpan..." : "Ubah Password"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep(2);
                setError("");
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              Kembali
            </button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

function Persyaratan({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        ok ? "text-green-600" : "text-slate-400"
      }`}
    >
      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </div>
  );
}