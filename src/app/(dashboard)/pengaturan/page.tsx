import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Settings, User, Lock, Shield, Calendar, Badge } from "lucide-react";
import { ProfilForm } from "./profil-form";
import { PasswordForm } from "./password-form";
import { PertanyaanKeamananForm } from "./pertanyaan-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PengaturanPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nama: true,
      nim: true,
      role: true,
      pertanyaanKeamanan: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  const inisial = user.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 text-purple-100 text-sm">
          <Settings className="w-4 h-4" />
          Pengaturan Akun
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Pengaturan
        </h1>
        <p className="text-purple-100 mt-1">
          Kelola akun dan keamanan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri */}
        <div className="space-y-6">
          {/* Info Akun */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Informasi Akun
              </CardTitle>
              <CardDescription>Data akun Anda (tidak bisa diubah)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-2xl font-bold">
                  {inisial}
                </div>
                <div>
                  <p className="font-medium text-lg">{user.nama}</p>
                  <p className="text-sm text-slate-500">{user.nim}</p>
                </div>
              </div>

              <div className="pt-3 border-t space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Badge className="w-4 h-4" />
                    Role
                  </span>
                  <span className="col-span-2 font-medium">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        roleColor[user.role] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {roleLabel[user.role] || user.role}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Terdaftar
                  </span>
                  <span className="col-span-2 font-medium">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubah Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                Ubah Password
              </CardTitle>
              <CardDescription>
                Minimal 8 karakter, harus ada huruf & angka
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-6">
          {/* Ubah Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Ubah Profil
              </CardTitle>
              <CardDescription>Ganti nama yang ditampilkan</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilForm namaAwal={user.nama} />
            </CardContent>
          </Card>

          {/* Pertanyaan Keamanan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Pertanyaan Keamanan
              </CardTitle>
              <CardDescription>
                Digunakan untuk reset password jika Anda lupa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PertanyaanKeamananForm pertanyaanAwal={user.pertanyaanKeamanan} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}