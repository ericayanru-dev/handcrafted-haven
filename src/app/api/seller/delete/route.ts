import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sellerProfileService } from "@/back-end/services/seller-profile-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * DELETE /api/seller-profile/[id]
 */
export async function DELETE(req: NextRequest) {
  try {

    const authResult = await authMiddleware(req);

    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;

    const result = await sellerProfileService.delete(payload.userId);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[DELETE /api/seller-profile/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
