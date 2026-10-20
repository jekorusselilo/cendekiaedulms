import { GraduationCap, BookOpen, Sparkles, Users } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Kiri — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white p-12 flex-col justify-between overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              CendekiaEdu
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Selamat Datang di
            <br />
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              CendekiaEdu
            </span>
          </h1>

          <p className="text-purple-100 text-lg max-w-md leading-relaxed">
            Platform pembelajaran online yang menghubungkan mahasiswa dan
            dosen dalam satu ekosistem digital. Kelola materi, tugas, dan
            kehadiran dengan mudah.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-purple-100">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-white">Materi & Tugas Terpusat</p>
              <p className="text-sm text-purple-200">
                Akses semua materi kuliah dalam satu tempat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-purple-100">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-white">Kolaborasi Mahasiswa & Dosen</p>
              <p className="text-sm text-purple-200">
                Interaksi langsung dalam pembelajaran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-purple-100">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-white">Didukung Asisten AI</p>
              <p className="text-sm text-purple-200">
                Bantuan belajar kapan saja
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-purple-200">
          © 2026 CendekiaEdu. Platform Pembelajaran Digital.
        </p>
      </div>

      {/* Kanan — Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 overflow-y-auto">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}