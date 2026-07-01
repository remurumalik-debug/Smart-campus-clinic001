import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/admin/login"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/departments", "/api/doctors", "/api/seed"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
  const isStaticFile = /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff2?)$/.test(pathname);
  const isNextInternal = pathname.startsWith("/_next");

  if (isPublicApi || isStaticFile || isNextInternal) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (req.auth) {
      const role = (req.auth?.user as any)?.role;
      if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (role === "clinic_staff") return NextResponse.redirect(new URL("/clinic-staff/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;
  if (!isLoggedIn) {
    const dest = pathname.startsWith("/admin") || pathname.startsWith("/clinic-staff")
      ? "/admin/login"
      : "/login";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  const role = (req.auth?.user as any)?.role as string | undefined;

  const isAdminRoute = pathname.startsWith("/admin");
  const isStaffRoute = pathname.startsWith("/clinic-staff");
  const isStudentRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/chat");

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isStaffRoute && role !== "clinic_staff") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isStudentRoute && role !== "student") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
