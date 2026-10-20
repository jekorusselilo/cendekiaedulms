"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  CalendarCheck,
  BookOpen,
  Settings,
  Users,
  School,
  BarChart3,
  LayoutDashboard,
  CalendarDays,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogoutButton } from "./logout-button";

type MenuItem = {
  title: string;
  url: string;
  icon: typeof Home;
};

const mainMenu: MenuItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Mata Kuliah", url: "/mata-kuliah", icon: BookOpen },
  { title: "Kehadiran", url: "/kehadiran", icon: CalendarCheck },
  { title: "Tugas", url: "/tugas", icon: BookOpen },
];

const adminMenu: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Kelola User", url: "/admin/users", icon: Users },
  { title: "Kelola Mata Kuliah", url: "/admin/courses", icon: School },
  { title: "Pertemuan", url: "/admin/meetings", icon: CalendarDays },
  { title: "Aktivitas", url: "/admin/logs", icon: Activity },
  { title: "Statistik", url: "/admin/stats", icon: BarChart3 },
];

const bottomMenu: MenuItem[] = [
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";

  // Pilih menu berdasarkan role
  const menuUtama = isAdmin ? adminMenu : mainMenu;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <h2 className="font-bold text-lg group-data-[collapsible=icon]:hidden">
          CendekiaEdu
        </h2>
        {isAdmin && (
          <p className="text-xs text-purple-600 font-medium group-data-[collapsible=icon]:hidden mt-1">
            Admin Panel
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {status === "loading" ? (
                // Loading state — biar tidak flicker
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <div className="w-4 h-4 rounded bg-slate-200 animate-pulse" />
                        <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                menuUtama.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomMenu.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <LogoutButton />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}