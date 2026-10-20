"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setLoading(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleLogout}
        disabled={loading}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
      >
        {loading ? <Loader2 className="animate-spin" /> : <LogOut />}
        <span>{loading ? "Keluar..." : "Keluar"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}