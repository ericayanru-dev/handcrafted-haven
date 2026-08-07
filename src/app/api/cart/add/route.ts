import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cartService } from "@/back-end/services/cart-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * POST /api/cart/add
 * Body: { productId, quantity? }
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const body = await req.json();
    const result = await cartService.addToCart(authResult.payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/cart/add]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
