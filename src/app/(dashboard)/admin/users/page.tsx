import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { UserTable } from "./user-table";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nama: true,
      nim: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalMahasiswa = users.filter((u) => u.role === "MAHASISWA").length;
  const totalDosen = users.filter((u) => u.role === "DOSEN").length;
  const totalAdmin = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <Users className="w-4 h-4" />
          Admin Panel
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">Kelola User</h1>
        <p className="text-purple-100 mt-1">
          Lihat dan kelola semua akun terdaftar
        </p>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Total User</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Mahasiswa</p>
            <p className="text-2xl font-bold">{totalMahasiswa}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Dosen</p>
            <p className="text-2xl font-bold">{totalDosen}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Admin</p>
            <p className="text-2xl font-bold">{totalAdmin}</p>
          </div>
        </div>
      </div>

      {/* Tabel User */}
      <UserTable initialUsers={users} />
    </div>
  );
}