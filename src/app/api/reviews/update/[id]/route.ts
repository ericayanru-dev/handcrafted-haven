import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reviewService } from "@/back-end/services/review-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * PATCH /api/reviews/[id]
 * Body: { rating?, comment? }
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const body = await req.json();
    const result = await reviewService.update(id, authResult.payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[PATCH /api/reviews/[id]]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
