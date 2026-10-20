import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  // Halaman yang butuh login
  const protectedPaths = [
    "/",
    "/kehadiran",
    "/tugas",
    "/pengaturan",
    "/mata-kuliah",
    "/admin",
  ];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Halaman auth
  const authPaths = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // Belum login & akses halaman protected → redirect ke login
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Sudah login & akses halaman auth → redirect ke dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Khusus /admin/* → hanya ADMIN
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};