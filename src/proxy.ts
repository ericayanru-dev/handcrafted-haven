// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenService } from "./back-end/lib/utils/jwt";
import { tokenRepo } from "@/back-end/models/token-model";
import { userRepo } from "@/back-end/models/auth-model";
import { AUTH_CONFIG } from "@/back-end/config/auth";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/login", "/register", "/forgot-password", "/auth/verify-email"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // ====================== PROTECTED ROUTES ======================
  if (isProtectedRoute) {
    // If user has neither token → definitely send to login
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Try Access Token First
    if (accessToken) {
      try {
        await TokenService.verifyToken(accessToken);
        return NextResponse.next(); // Access token is valid
      } catch {
        // Access token expired/invalid → continue to refresh logic
      }
    }

    // Try Refresh Token
    if (refreshToken) {
      try {
        const tokenRecord = await tokenRepo.findRefreshToken(refreshToken);

        if (!tokenRecord || tokenRecord.revoked) {
          return NextResponse.redirect(new URL("/login", request.url));
        }

        if (new Date(tokenRecord.expiresAt) < new Date()) {
          await tokenRepo.revokeRefreshToken(refreshToken);
          return NextResponse.redirect(new URL("/login", request.url));
        }

        const user = await userRepo.findById(tokenRecord.userId);

        if (user) {
          const newAccessToken = await TokenService.signAccessToken({
            userId: user.id,
            name: user.name,
            email: user.email,
            type: "ACCESS",
          });

          const newRefreshToken = await TokenService.signRefreshToken({
            userId: user.id,
            email: user.email,
            type: "REFRESH",
          });

          await tokenRepo.revokeRefreshToken(refreshToken);

          await tokenRepo.createRefreshToken(
            user.id,
            newRefreshToken,
            new Date(Date.now() + AUTH_CONFIG.JWT_REFRESH_EXPIRES_IN_MS),
          );

          const response = NextResponse.next();

          response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: AUTH_CONFIG.JWT_ACCESS_EXPIRES_IN_SECONDS,
            path: "/",
          });

          response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: AUTH_CONFIG.JWT_REFRESH_EXPIRES_IN_SECONDS,
            path: "/",
          });

          return response;
        }
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // If we reach here, refresh also failed
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ====================== PUBLIC ROUTES ======================
  if (isPublicRoute && accessToken) {
    try {
      await TokenService.verifyToken(accessToken);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      // Invalid token, allow access to auth pages
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Matcher
export const matcherConfig = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/login",
    "/register",
    "/forgot-password",
    "/auth/verify-email",
  ],
};
