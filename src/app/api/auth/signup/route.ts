// src/app/api/auth/signup/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authService } from "@/back-end/services/auth-services";
import type { SignupRequest } from "@/back-end/types/auth-types";

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();

    const result = await authService.signup(body);

    if (result.success) {
      // Create response
      const response = NextResponse.json(result, { status: 201 });

      return response;
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
