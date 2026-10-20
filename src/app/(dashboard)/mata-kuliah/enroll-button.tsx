"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Plus, AlertCircle } from "lucide-react";

export function EnrollButton({
  courseId,
  isEnrolled,
  role,
}: {
  courseId: string;
  isEnrolled: boolean;
  role: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [error, setError] = useState("");

  if (role !== "MAHASISWA") {
    return (
      <p className="text-xs text-slate-400 italic">
        Hanya mahasiswa yang bisa mendaftar
      </p>
    );
  }

  async function handleEnroll() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (res.ok) {
      setEnrolled(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Gagal mendaftar");
    }
    setLoading(false);
  }

  if (enrolled) {
    return (
      <Button
        disabled
        variant="outline"
        className="w-full border-green-200 text-green-700 bg-green-50"
      >
        <Check className="w-4 h-4 mr-2" />
        Sudah Terdaftar
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </div>
      )}
      <Button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        {loading ? "Mendaftar..." : "Daftar Mata Kuliah"}
      </Button>
    </div>
  );
}