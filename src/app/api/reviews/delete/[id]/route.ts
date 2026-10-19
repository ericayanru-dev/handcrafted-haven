import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reviewService } from "@/back-end/services/review-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * DELETE /api/reviews/[id]
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const result = await reviewService.delete(id, authResult.payload.userId);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[DELETE /api/reviews/[id]]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
