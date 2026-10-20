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

const PERTANYAAN_KEAMANAN = "Apa Hobi Anda?";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nama: "",
    nim: "",
    password: "",
    konfirmasi: "",
    jawabanKeamanan: "",
  });

  // Validasi live password
  const validasi = {
    panjang: form.password.length >= 8,
    huruf: /[a-zA-Z]/.test(form.password),
    angka: /[0-9]/.test(form.password),
    cocok: form.password.length > 0 && form.password === form.konfirmasi,
  };

  const semuaValid =
    validasi.panjang && validasi.huruf && validasi.angka && validasi.cocok;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!semuaValid) {
      setError("Password belum memenuhi semua syarat");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          nim: form.nim,
          password: form.password,
          pertanyaanKeamanan: PERTANYAAN_KEAMANAN,
          jawabanKeamanan: form.jawabanKeamanan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
        setLoading(false);
        return;
      }

      alert("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Daftar Akun</CardTitle>
        <CardDescription>
          Buat akun baru untuk mengakses platform pembelajaran
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input
              id="nama"
              placeholder="Nama Anda"
              value={form.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <Input
              id="nim"
              placeholder="contoh: 2021001"
              value={form.nim}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={handleChange}
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
            <Label htmlFor="konfirmasi">Konfirmasi Password</Label>
            <Input
              id="konfirmasi"
              type="password"
              placeholder="Ulangi password"
              value={form.konfirmasi}
              onChange={handleChange}
              required
            />
            {form.konfirmasi.length > 0 && (
              <Persyaratan label="Password cocok" ok={validasi.cocok} />
            )}
          </div>

          {/* Field Hobi langsung pakai label pertanyaannya */}
          <div className="space-y-2">
            <Label htmlFor="jawabanKeamanan">{PERTANYAAN_KEAMANAN}</Label>
            <Input
              id="jawabanKeamanan"
              placeholder="contoh: Membaca buku"
              value={form.jawabanKeamanan}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-slate-500">
              Digunakan untuk reset password jika Anda lupa
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !semuaValid}
          >
            {loading ? "Memproses..." : "Daftar"}
          </Button>
          <p className="text-sm text-center text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </form>
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