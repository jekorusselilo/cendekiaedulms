import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `Anda adalah asisten AI untuk platform pembelajaran online kampus bernama "Online Learning".
Tugas Anda membantu mahasiswa dan dosen dengan pertanyaan seputar:
- Cara menggunakan platform (login, daftar mata kuliah, submit tugas, lihat kehadiran)
- Materi kuliah secara umum
- Tips belajar

Jawab dengan ramah, singkat, dan jelas dalam Bahasa Indonesia.
Kalau ada pertanyaan di luar topik pembelajaran/platform, arahkan kembali dengan sopan.`;

// Daftar model — coba satu per satu kalau error
const MODELS = ["gemini-3.8-flash", "gemini-3.0-flash", "gemini-flash-latest"];

async function cobaGemini(apiKey: string, message: string) {
  const ai = new GoogleGenAI({ apiKey });

  let lastError: unknown = null;

  for (const model of MODELS) {
    // Retry 2x per model
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI CHAT] Coba model=${model} attempt=${attempt}`);
        const response = await ai.models.generateContent({
          model,
          contents: message,
          config: { systemInstruction: SYSTEM_PROMPT },
        });
        return response.text;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[AI CHAT] ❌ Gagal: ${msg.substring(0, 100)}`);

        // Kalau 503 (overload), tunggu 1 detik, retry
        if (msg.includes("503") || msg.includes("UNAVAILABLE")) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        // Kalau 404 (model tidak ada), langsung pindah model lain
        break;
      }
    }
  }
  throw lastError;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: { message: string } = await req.json();
  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key belum diset" }, { status: 500 });
  }

  try {
    const text = await cobaGemini(apiKey, body.message);
    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("=== [AI CHAT] SEMUA MODEL GAGAL ===");
    console.error(error);
    const msg = error instanceof Error ? error.message : String(error);

    // Pesan ramah untuk user
    let friendlyMsg = "AI sedang sibuk. Coba lagi sebentar.";
    if (msg.includes("503") || msg.includes("UNAVAILABLE")) {
      friendlyMsg = "AI sedang sibuk (server Google overload). Coba lagi 5–10 detik.";
    } else if (msg.includes("429")) {
      friendlyMsg = "Kuota harian habis. Coba lagi besok.";
    }

    return NextResponse.json({ error: friendlyMsg }, { status: 500 });
  }
}