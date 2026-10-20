"use client";

import { useSession } from "next-auth/react";

const roleColor: Record<string, string> = {
  MAHASISWA: "bg-blue-100 text-blue-700",
  DOSEN: "bg-green-100 text-green-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

const roleLabel: Record<string, string> = {
  MAHASISWA: "Mahasiswa",
  DOSEN: "Dosen",
  ADMIN: "Admin",
};

export function UserHeader({ nama, role }: { nama: string; role: string }) {
  const { data: session } = useSession();

  // Ambil data terbaru dari session (kalau ada update nama)
  const displayNama = session?.user?.nama || nama;
  const displayRole = session?.user?.role || role;

  const inisial = displayNama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Role Badge */}
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          roleColor[displayRole] || "bg-slate-100 text-slate-700"
        }`}
      >
        {roleLabel[displayRole] || displayRole}
      </span>

      {/* Nama + Avatar */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium hidden sm:block">
          {displayNama}
        </span>
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          {inisial}
        </div>
      </div>
    </div>
  );
}