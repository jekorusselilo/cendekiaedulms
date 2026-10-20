"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  GraduationCap,
  UserCog,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  nama: string;
  nim: string;
  role: string;
  createdAt: string | Date;
};

const roleBadge: Record<
  string,
  { label: string; color: string; icon: typeof Shield }
> = {
  MAHASISWA: {
    label: "Mahasiswa",
    color: "bg-blue-100 text-blue-700",
    icon: GraduationCap,
  },
  DOSEN: { label: "Dosen", color: "bg-green-100 text-green-700", icon: Shield },
  ADMIN: {
    label: "Admin",
    color: "bg-purple-100 text-purple-700",
    icon: UserCog,
  },
};

export function UserTable({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<"role" | "delete" | null>(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.nim.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "ALL" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  async function handleUpdateRole() {
    if (!selectedUser || !newRole) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    const data = await res.json();
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      );
      setSelectedUser(null);
      setAction(null);
      router.refresh();
    } else {
      setError(data.error || "Gagal update role");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!selectedUser) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
      setAction(null);
      router.refresh();
    } else {
      setError(data.error || "Gagal hapus user");
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari nama atau NIM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "MAHASISWA", "DOSEN", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterRole === r
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r === "ALL" ? "Semua" : roleBadge[r]?.label || r}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">
                Tidak ada user yang cocok dengan filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-purple-100">
                    <th className="text-left p-3 font-semibold text-slate-700">
                      Nama
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700">
                      NIM
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700">
                      Role
                    </th>
                    <th className="text-right p-3 font-semibold text-slate-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => {
                    const badge = roleBadge[u.role] || roleBadge.MAHASISWA;
                    const Icon = badge.icon;
                    return (
                      <tr
                        key={u.id}
                        className={`border-b border-slate-100 hover:bg-purple-50/50 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="p-3 font-medium">{u.nama}</td>
                        <td className="p-3 text-slate-600">{u.nim}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                          >
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setNewRole(u.role);
                                setAction("role");
                                setError("");
                              }}
                              className="text-xs text-purple-600 hover:underline font-medium"
                            >
                              Ubah Role
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setAction("delete");
                                setError("");
                              }}
                              className="text-xs text-red-600 hover:underline font-medium"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Menampilkan {filtered.length} dari {users.length} user
          </p>
        </CardContent>
      </Card>

      {/* Dialog Ubah Role */}
      <Dialog
        open={action === "role"}
        onOpenChange={(v) => !v && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role User</DialogTitle>
            <DialogDescription>
              Ubah role untuk <strong>{selectedUser?.nama}</strong>
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
              <label className="text-sm font-medium">Role Baru</label>
              <div className="grid grid-cols-3 gap-2">
                {["MAHASISWA", "DOSEN", "ADMIN"].map((r) => {
                  const badge = roleBadge[r];
                  const Icon = badge.icon;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                        newRole === r
                          ? "border-purple-500 bg-purple-50"
                          : "border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-medium">{badge.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={loading || newRole === selectedUser?.role}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus */}
      <Dialog
        open={action === "delete"}
        onOpenChange={(v) => !v && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <strong>{selectedUser?.nama}</strong> (
              {selectedUser?.nim})? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}