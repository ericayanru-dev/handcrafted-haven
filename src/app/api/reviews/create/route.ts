import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reviewService } from "@/back-end/services/review-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * POST /api/reviews
 * Body: { productId, rating, comment }
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const body = await req.json();
    const result = await reviewService.create(authResult.payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
