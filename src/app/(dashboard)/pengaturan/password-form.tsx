"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

export function PasswordForm() {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  // Validasi live (untuk indikator)
  const validasi = {
    panjang: passwordBaru.length >= 8,
    huruf: /[a-zA-Z]/.test(passwordBaru),
    angka: /[0-9]/.test(passwordBaru),
    cocok: passwordBaru.length > 0 && passwordBaru === konfirmasi,
  };

  const semuaValid =
    validasi.panjang && validasi.huruf && validasi.angka && validasi.cocok;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (passwordBaru !== konfirmasi) {
      setMessage({ type: "err", text: "Konfirmasi password tidak cocok" });
      return;
    }

    if (!semuaValid) {
      setMessage({
        type: "err",
        text: "Password belum memenuhi semua syarat",
      });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passwordLama, passwordBaru }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ type: "ok", text: "Password berhasil diubah" });
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasi("");
    } else {
      setMessage({ type: "err", text: data.error || "Gagal ubah password" });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === "ok"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="passwordLama">Password Lama</Label>
        <Input
          id="passwordLama"
          type="password"
          value={passwordLama}
          onChange={(e) => setPasswordLama(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordBaru">Password Baru</Label>
        <Input
          id="passwordBaru"
          type="password"
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
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          required
        />
        {konfirmasi.length > 0 && (
          <Persyaratan label="Password cocok" ok={validasi.cocok} />
        )}
      </div>

      <Button type="submit" disabled={loading || !semuaValid}>
        {loading ? "Menyimpan..." : "Ubah Password"}
      </Button>
    </form>
  );
}

function Persyaratan({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        ok ? "text-green-600" : "text-slate-400"
      }`}
    >
      {ok ? (
        <Check className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      {label}
    </div>
  );
}