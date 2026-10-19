import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reviewService } from "@/back-end/services/review-service";

/**
 * GET /api/reviews/product/[productId]
 * Public — anyone can read reviews
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const result = await reviewService.getByProductId(productId);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/reviews/product/[productId]]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
