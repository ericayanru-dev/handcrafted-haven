// src/app/api/auth/logout/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { tokenRepo } from "@/back-end/models/token-model";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // Revoke refresh token if it exists
    if (refreshToken) {
      await tokenRepo.revokeRefreshToken(refreshToken);
    }

    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear cookies properly
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    // Even on error, clear cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out",
    });

    response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });

    return response;
  }
}
