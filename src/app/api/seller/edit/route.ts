import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sellerProfileService } from "@/back-end/services/seller-profile-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);

    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;

    const body = await req.json();
    const result = await sellerProfileService.update(payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[PATCH /api/seller-profile/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
