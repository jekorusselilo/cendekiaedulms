# 🎓 CendekiaEdu

**Platform Pembelajaran Online** — LMS (Learning Management System) berbasis web untuk perkuliahan. Menghubungkan mahasiswa, dosen, dan admin dalam satu ekosistem digital.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📖 Tentang Proyek

**CendekiaEdu** adalah platform pembelajaran online yang memungkinkan interaksi antara mahasiswa, dosen, dan admin dalam satu sistem terintegrasi.

### Untuk Siapa?
- 🎓 **Mahasiswa** — Belajar, kumpulkan tugas, lihat nilai & kehadiran
- 👨‍🏫 **Dosen** — Kelola matkul, materi, tugas, penilaian, kehadiran
- 🛡️ **Admin** — Kelola user & monitoring platform

---

## ✨ Fitur Utama

### 🎓 Untuk Mahasiswa
| Fitur | Deskripsi |
|---|---|
| Registrasi & Login | Daftar dengan NIM, login dengan password aman (bcrypt) |
| Enroll Mata Kuliah | Daftar matkul dari katalog |
| Akses Materi | Download PDF materi per pertemuan |
| Pengumpulan Tugas | Upload PDF, deadline otomatis |
| Lihat Nilai | Nilai & feedback dari dosen |
| Rekap Kehadiran | Persentase kehadiran per matkul |
| Reset Password | Lupa password pakai pertanyaan keamanan |

### 👨‍🏫 Untuk Dosen
| Fitur | Deskripsi |
|---|---|
| Dashboard Statistik | Matkul diampu, mahasiswa, pertemuan, belum dinilai |
| Kelola Mata Kuliah | Buat & edit mata kuliah |
| Kelola Pertemuan | Buat pertemuan per matkul |
| Upload Materi | Upload PDF materi |
| Buat Tugas | Dengan deadline & deskripsi |
| Penilaian | Nilai submission + feedback |
| Perpanjang Deadline | Buka kembali pengumpulan yang sudah ditutup |
| Input Kehadiran | Tandai kehadiran per pertemuan |

### 🛡️ Untuk Admin
| Fitur | Deskripsi |
|---|---|
| Kelola User | Lihat, ubah role, hapus user |
| Kelola Mata Kuliah | Lihat & hapus matkul |
| Monitoring Pertemuan | Lihat semua pertemuan platform |
| Log Aktivitas | Feed aktivitas terbaru |
| Statistik Platform | Total user, matkul, submission, dll |

### 🤖 Fitur Tambahan
- **AI Chat Assistant** — Floating button powered by **Google Gemini**
- 🎨 **Tema Ungu** — Konsisten di semua halaman
- 📱 **Responsive** — Desktop & mobile friendly
- ⏱️ **Session Timeout** — 5 menit idle + habis saat tab ditutup
- 🔒 **Validasi Password** — Min 8 karakter, huruf & angka (server-side)
- ⚡ **Turbopack** — Development super cepat

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Radix + Vega) |
| **Icons** | Lucide React |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma 7 |
| **Auth** | NextAuth v5 (Auth.js) |
| **Password Hashing** | bcryptjs |
| **AI** | Google Gemini API |
| **Deployment** | Vercel (opsional) |

---

## 🚀 Cara Install

### 📋 Prasyarat
- ✅ Node.js 20+ — [Download](https://nodejs.org)
- ✅ Git — [Download](https://git-scm.com)
- ✅ Akun Supabase (gratis) — [Daftar](https://supabase.com)
- ✅ Google AI Studio API Key (gratis) — [Daftar](https://aistudio.google.com/apikey)

### 📥 Step 1 — Clone & Install

```bash
git clone <repo-url>
cd nextjs
npm install