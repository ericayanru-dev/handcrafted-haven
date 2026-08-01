import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sellerProfileService } from "@/back-end/services/seller-profile-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * GET /api/seller-profile/user/[userId]
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);

    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;
    const result = await sellerProfileService.getByUserId(payload.userId);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/seller-profile/user/[userId]]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
