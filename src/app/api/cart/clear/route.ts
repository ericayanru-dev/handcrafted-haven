import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cartService } from "@/back-end/services/cart-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * DELETE /api/cart/clear
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const result = await cartService.clearCart(authResult.payload.userId);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[DELETE /api/cart/clear]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
