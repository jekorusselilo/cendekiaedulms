import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AiChat } from "@/components/ai-chat";  // ← pastikan ada

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CendekiaEdu",
  description: "Platform pembelajaran online kampus CendekiaEdu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          {children}
          <AiChat />  {/* ← pastikan ada ini */}
        </Providers>
      </body>
    </html>
  );
}