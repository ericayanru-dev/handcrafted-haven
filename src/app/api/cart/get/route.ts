import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cartService } from "@/back-end/services/cart-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * GET /api/cart
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const result = await cartService.getCart(authResult.payload.userId);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
