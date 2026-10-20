import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/lib/auth";
import { UserHeader } from "@/components/user-header";
import { Footer } from "@/components/footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="font-semibold">Dashboard</h1>
            </div>
            {session?.user && (
              <UserHeader
                nama={session.user.nama || "User"}
                role={session.user.role || "MAHASISWA"}
              />
            )}
          </header>

          {/* Konten — padding bottom biar tidak ketutup footer */}
          <main
            className="flex-1 p-6"
            style={{ paddingBottom: "calc(var(--footer-height, 73px) + 24px)" }}
          >
            {children}
          </main>
        </div>
      </SidebarProvider>

      {/* Footer — fixed di bawah */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 bg-white"
        style={{ height: "var(--footer-height, 73px)" }}
      >
        <Footer />
      </div>
    </div>
  );
}