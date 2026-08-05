import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cartService } from "@/back-end/services/cart-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * PATCH /api/cart/update
 * Body: { productId, quantity }
 */
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const body = await req.json();
    const result = await cartService.updateItem(authResult.payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[PATCH /api/cart/update]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
