"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PERTANYAAN_KEAMANAN = "Apa Hobi Anda?";

export function PertanyaanKeamananForm({
  pertanyaanAwal,
}: {
  pertanyaanAwal: string;
}) {
  const router = useRouter();
  const [jawaban, setJawaban] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pertanyaanKeamanan: PERTANYAAN_KEAMANAN,
        jawabanKeamanan: jawaban,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ type: "ok", text: "Jawaban berhasil disimpan" });
      setJawaban("");
      router.refresh();
    } else {
      setMessage({ type: "err", text: data.error || "Gagal menyimpan" });
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

      {/* Pertanyaan: read-only, SELALU "Apa Hobi Anda?" */}
      <div className="space-y-2">
        <Label>Pertanyaan Keamanan</Label>
        <Input
          value={PERTANYAAN_KEAMANAN}
          disabled
          readOnly
        />
        <p className="text-xs text-slate-500">
          Pertanyaan tidak dapat diubah
        </p>
      </div>

      {/* Jawaban: bisa diisi */}
      <div className="space-y-2">
        <Label htmlFor="jawaban">Jawaban Baru</Label>
        <Input
          id="jawaban"
          type="password"
          value={jawaban}
          onChange={(e) => setJawaban(e.target.value)}
          placeholder="Masukkan jawaban hobi Anda"
          required
        />
        <p className="text-xs text-slate-500">
          Jawaban tidak case-sensitive (huruf besar/kecil dianggap sama)
        </p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Jawaban"}
      </Button>
    </form>
  );
}