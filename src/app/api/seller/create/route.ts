import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sellerProfileService } from "@/back-end/services/seller-profile-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * POST /api/seller-profile
 * Create a seller profile (authenticated user)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);

    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;

    const body = await req.json();
    const result = await sellerProfileService.create(payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/seller-profile]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
